import { FormatMode } from '../catalog/catalog-formatter';
import { InteractiveMessage } from '../whatsapp/whatsapp-client';
import { WA_ACTION } from '../whatsapp/whatsapp-menu.builder';

export interface AiChatFooter {
  telegramKeyboard?: any;        // InlineKeyboard from grammy
  whatsAppButtons?: InteractiveMessage;
}

export function buildAiChatFooter(
  storeSlug: string,
  storeName: string,
  platform: 'telegram' | 'whatsapp',
  cartCount: number = 0,
): AiChatFooter {

  const cartLabel = cartCount > 0
    ? `🛒 View Cart (${cartCount})`
    : `🛒 View Cart`;

  if (platform === 'telegram') {
    return {
      telegramKeyboard: {
        inline_keyboard: [
          [
            { text: cartLabel,         callback_data: `cart:${storeSlug}` },
            { text: '🏪 Back to Store', callback_data: `bk:${storeSlug}` },
          ]
        ]
      }
    };
  }

  // WhatsApp
  return {
    whatsAppButtons: {
      type: 'button',
      body: { text: `_🤖 AI Assistant · ${storeName}_ — Type your question, or:` },
      action: {
        buttons: [
          { type: 'reply', reply: { id: `${WA_ACTION.CART_VIEW}:${storeSlug}`,   title: cartLabel.slice(0, 20) } },
          { type: 'reply', reply: { id: `${WA_ACTION.STORE_SELECT}:${storeSlug}`,  title: '🏪 Back to Store'     } },
        ]
      }
    }
  };
}

