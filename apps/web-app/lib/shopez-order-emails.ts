import { prisma } from "@buildez/db";
import { sendMail } from "@/lib/email/sendMail";
import { shopOrderConfirmationEmailContent, type ShopOrderEmailItem } from "@/lib/email/shopOrderConfirmationTemplate";
import { shopOrderAlertEmailContent } from "@/lib/email/shopOrderAlertTemplate";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.PLATFORM_DOMAIN || "getbuildezy.com"}`).replace(/\/$/, "");
}

type ShopOrderForEmail = {
  orderNumber: number;
  email: string;
  currency: string;
  subtotal: unknown;
  discount: unknown;
  shipping: unknown;
  tax: unknown;
  total: unknown;
  shippingAddress: unknown;
};

type ShopForEmail = {
  id: string;
  siteId: string;
  tenantId: string;
  name: string;
  supportEmail: string | null;
};

/** Sends both Shopez transactional emails (customer receipt + owner alert) for a
 * confirmed order. Shared by markShopOrderPaid (online-payment orders) and the
 * COD checkout path so neither duplicates template-building/sending logic.
 * Never throws — a mail or lookup failure must never break checkout or payment
 * verification, so callers can invoke this without awaiting or catching. */
export async function sendShopOrderEmails(order: ShopOrderForEmail, items: ShopOrderEmailItem[], shop: ShopForEmail) {
  try {
    const confirmation = shopOrderConfirmationEmailContent({ order, items, shopName: shop.name });
    sendMail({ to: order.email, subject: confirmation.subject, text: confirmation.text, html: confirmation.html }).catch((error) => {
      console.error("SHOP ORDER CONFIRMATION EMAIL FAILED:", error);
    });

    let ownerEmail = shop.supportEmail;
    if (!ownerEmail) {
      const tenant = await prisma.tenant.findUnique({ where: { id: shop.tenantId }, select: { owner: { select: { email: true } } } });
      ownerEmail = tenant?.owner?.email || null;
    }
    if (!ownerEmail) {
      console.warn(`Shopez: no owner email resolved for shop ${shop.id} — skipping new-order alert for order #${order.orderNumber}`);
      return;
    }

    const site = await prisma.site.findUnique({ where: { id: shop.siteId }, select: { slug: true } });
    const ordersUrl = `${appUrl()}${site?.slug ? `/app/${site.slug}/shopez?view=orders` : "/app"}`;
    const alert = shopOrderAlertEmailContent({ order, items, shopName: shop.name, ordersUrl });
    sendMail({ to: ownerEmail, subject: alert.subject, text: alert.text, html: alert.html }).catch((error) => {
      console.error("SHOP OWNER ORDER ALERT EMAIL FAILED:", error);
    });
  } catch (error) {
    console.error("SHOP ORDER EMAILS FAILED:", error);
  }
}
