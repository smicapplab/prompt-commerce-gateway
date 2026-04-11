import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PRISMA } from '../prisma/prisma.module';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly telegram: TelegramService,
  ) {}

  async sync(slug: string, payload: any) {
    const { upsert } = payload;
    const { orders = [], orderNotes = [], orderFiles = [] } = upsert || {};

    const retailer = await this.prisma.retailer.findUnique({
      where: { slug }
    });
    if (!retailer) throw new Error(`Retailer ${slug} not found`);

    return this.prisma.$transaction(async (tx) => {
      // 1. Sync Orders (Mirror to Payment model)
      const orderIds = orders.map((o: any) => o.id);
      const existingPayments = await tx.payment.findMany({
        where: { storeSlug: slug, orderId: { in: orderIds } }
      });
      const existingMap = new Map(existingPayments.map(p => [p.orderId, p]));

      for (const o of orders) {
        let payment = existingMap.get(o.id);

        if (!payment) {
          // If the order exists in seller SQLite but not in gateway (e.g. manual entry),
          // we can create a placeholder payment record if we have a buyerRef (chatId).
          if (o.buyer_ref && /^\d+$/.test(o.buyer_ref)) {
            payment = await tx.payment.create({
              data: {
                referenceId: `manual-${slug}-${o.id}`,
                storeSlug:   slug,
                orderId:     o.id,
                buyerRef:    o.buyer_ref,
                amount:      o.total || 0,
                provider:    o.payment_provider || 'manual',
                status:      o.status === 'paid' ? 'paid' : 'pending',
                orderStatus: o.status,
              }
            });
            existingMap.set(o.id, payment);
          } else {
            continue; // Cannot mirror without a valid Telegram chatId
          }
        } else {
          const statusChanged = payment.orderStatus !== o.status;
          
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              orderStatus:         o.status,
              deliveryType:        o.delivery_type,
              trackingNumber:      o.tracking_number,
              courierName:         o.courier_name,
              trackingUrl:         o.tracking_url,
              cancellationReason:  o.cancellation_reason,
              paymentInstructions: o.payment_instructions,
              orderCreatedAt:      o.created_at ? new Date(o.created_at) : undefined,
              terminalStatusAt:    ['delivered', 'picked_up', 'cancelled', 'refunded'].includes(o.status) ? new Date() : undefined,
            }
          });

          if (statusChanged) {
            this.telegram.notifyOrderStatusChange({
              chatId:              payment.buyerRef,
              orderId:             o.id,
              storeName:           retailer.name,
              newStatus:           o.status,
              trackingNumber:      o.tracking_number,
              courierName:         o.courier_name,
              trackingUrl:         o.tracking_url,
              cancellationReason:  o.cancellation_reason,
              paymentInstructions: o.payment_instructions,
            }).catch(e => this.logger.error(`Failed to notify status change: ${e}`));
          }
        }
      }

      // 2. Sync Notes
      for (const n of orderNotes) {
        const payment = existingMap.get(n.order_id);
        if (!payment) continue;

        const noteWhere = { paymentId: payment.id, sellerId: Number(n.id) };
        const existingNote = await tx.orderNote.findFirst({ where: noteWhere });

        if (existingNote) {
          await tx.orderNote.update({
            where: { id: existingNote.id },
            data: {
              note:      n.note,
              deletedAt: n.deleted_at ? new Date(n.deleted_at) : null,
              deletedBy: n.deleted_by,
            }
          });
        } else {
          await tx.orderNote.create({
            data: {
              sellerId:  Number(n.id),
              paymentId: payment.id,
              note:      n.note,
              createdBy: n.created_by,
              createdAt: new Date(n.created_at),
              deletedAt: n.deleted_at ? new Date(n.deleted_at) : null,
              deletedBy: n.deleted_by,
            }
          });
        }
      }

      // 3. Sync Files
      for (const f of orderFiles) {
        const payment = existingMap.get(f.order_id);
        if (!payment) continue;

        const fileWhere = { paymentId: payment.id, sellerId: Number(f.id) };
        const existingFile = await tx.orderFile.findFirst({ where: fileWhere });

        if (existingFile) {
          await tx.orderFile.update({
            where: { id: existingFile.id },
            data: {
              deletedAt: f.deleted_at ? new Date(f.deleted_at) : null,
              deletedBy: f.deleted_by,
            }
          });
        } else {
          await tx.orderFile.create({
            data: {
              sellerId:     Number(f.id),
              paymentId:    payment.id,
              filename:     f.filename,
              originalName: f.original_name,
              fileUrl:      f.file_url,
              mimeType:     f.mime_type,
              sizeBytes:    f.size_bytes,
              uploadedBy:   f.uploaded_by,
              uploadedAt:   new Date(f.uploaded_at),
              deletedAt:    f.deleted_at ? new Date(f.deleted_at) : null,
              deletedBy:    f.deleted_by,
            }
          });
        }
      }

      return { success: true };
    });
  }


  async list(filters: {
    store?: string;
    status?: string;
    deliveryType?: string;
    page: number;
    limit: number;
  }) {
    const { store, status, deliveryType, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (store) where.storeSlug = store;
    if (status) where.orderStatus = status;
    if (deliveryType) where.deliveryType = deliveryType;

    // Use a transaction to ensure stats are consistent with the returned data page
    return this.prisma.$transaction(async (tx) => {
      const [orders, total] = await Promise.all([
        tx.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            orderNotes: { orderBy: { createdAt: 'desc' } },
            orderFiles: { orderBy: { uploadedAt: 'desc' } },
          }
        }),
        tx.payment.count({ where }),
      ]);

      const byStatus = await tx.payment.groupBy({
        by: ['orderStatus'],
        _count: true,
        where: store ? { storeSlug: store } : {},
      });

      // PERF: Instead of fetching every terminal order into memory and calculating in JS,
      // use SQL aggregation to calculate average fulfillment hours directly in the DB.
      // EXTRACT(EPOCH FROM ...) returns seconds; divide by 3600 for hours.
      const avgRes = await tx.$queryRaw<any[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (terminal_status_at - order_created_at))) / 3600 as "avgHours"
        FROM payments
        WHERE (${store}::text IS NULL OR store_slug = ${store})
          AND order_status IN ('delivered', 'picked_up')
          AND order_created_at IS NOT NULL
          AND terminal_status_at IS NOT NULL
      `;

      const avgFulfillmentHours = avgRes[0]?.avgHours ? Number(avgRes[0].avgHours) : 0;

      return {
        orders,
        total,
        stats: {
          byStatus,
          avgFulfillmentHours,
        },
      };
    });
  }
}
