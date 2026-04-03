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
      // 1. Sync Orders (Payments)
      const orderIds = orders.map((o: any) => o.id);
      const existingPayments = await tx.payment.findMany({
        where: { storeSlug: slug, orderId: { in: orderIds } }
      });
      const existingMap = new Map(existingPayments.map(p => [p.orderId, p]));

      for (const o of orders) {
        const existing = existingMap.get(o.id);

        if (existing) {
          const statusChanged = existing.orderStatus !== o.status;
          
          await tx.payment.update({
            where: { id: existing.id },
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
            // Fire-and-forget notification
            this.telegram.notifyOrderStatusChange({
              chatId:              existing.buyerRef,
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

      // 2. Sync Notes — reuse existingMap (already keyed by orderId) to avoid N+1
      for (const n of orderNotes) {
        const payment = existingMap.get(n.order_id);
        if (!payment) continue;

        await tx.orderNote.upsert({
          where: { id: n.id }, // Assuming IDs are stable or we need a composite key
          create: {
            id:        n.id,
            paymentId: payment.id,
            note:      n.note,
            createdBy: n.created_by,
            createdAt: new Date(n.created_at),
            deletedAt: n.deleted_at ? new Date(n.deleted_at) : null,
            deletedBy: n.deleted_by,
          },
          update: {
            note:      n.note,
            deletedAt: n.deleted_at ? new Date(n.deleted_at) : null,
            deletedBy: n.deleted_by,
          }
        });
      }

      // 3. Sync Files — reuse existingMap to avoid N+1
      for (const f of orderFiles) {
        const payment = existingMap.get(f.order_id);
        if (!payment) continue;

        await tx.orderFile.upsert({
          where: { id: f.id },
          create: {
            id:           f.id,
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
          },
          update: {
            deletedAt:    f.deleted_at ? new Date(f.deleted_at) : null,
            deletedBy:    f.deleted_by,
          }
        });
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

    const [orders, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          orderNotes: { orderBy: { createdAt: 'desc' } },
          orderFiles: { orderBy: { uploadedAt: 'desc' } },
        }
      }),
      this.prisma.payment.count({ where }),
    ]);

    // Calculate some basic stats for the dashboard
    const stats = {
      byStatus: await this.prisma.payment.groupBy({
        by: ['orderStatus'],
        _count: true,
        where: store ? { storeSlug: store } : {},
      }),
      avgFulfillmentHours: 0,
    };

    // Calculate avg fulfillment time for terminal orders
    const terminalOrders = await this.prisma.payment.findMany({
      where: {
        ...(store ? { storeSlug: store } : {}),
        orderStatus: { in: ['delivered', 'picked_up'] },
        orderCreatedAt: { not: null },
        terminalStatusAt: { not: null },
      },
      select: { orderCreatedAt: true, terminalStatusAt: true },
    });

    if (terminalOrders.length > 0) {
      const totalHours = terminalOrders.reduce((sum, o) => {
        const diff = o.terminalStatusAt!.getTime() - o.orderCreatedAt!.getTime();
        return sum + (diff / (1000 * 60 * 60));
      }, 0);
      stats.avgFulfillmentHours = totalHours / terminalOrders.length;
    }

    return {
      orders,
      total,
      stats,
    };
  }
}
