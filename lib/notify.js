// Builds WhatsApp / email messages for orders. Without a server these open the
// user's WhatsApp or mail app with the message ready; automatic sending needs a
// backend (WhatsApp Business API + an email service).
import { readAdmin } from "@/lib/admin-store";
import { getOrder, orderTotals, getOrderTracking } from "@/lib/store";
import { money } from "@/lib/locale";

const base = () =>
  typeof window === "undefined" ? "" : location.origin + (process.env.NEXT_PUBLIC_BASE_PATH || "");

export function orderMessage(orderId, kind = "placed") {
  const o = getOrder(orderId);
  if (!o) return { subject: "", body: "" };
  const s = readAdmin().settings;
  const t = orderTotals(o);
  const tr = getOrderTracking(orderId);
  const status = tr ? tr.status[0].toUpperCase() + tr.status.slice(1) : "Pending";
  const lines =
    kind === "placed"
      ? [
          `New order ${o.orderId}`,
          o.clinic?.name ? `Clinic: ${o.clinic.name}` : "",
          o.caseRef ? `Case: ${o.caseRef}` : "",
          "",
          ...o.items.map((i) => `• ${i.name} (${i.sku}) ×${i.qty || 1} = ${money((i.price || 0) * (i.qty || 1))}`),
          "",
          t.discount ? `Discount: −${money(t.discount)}` : "",
          `VAT ${t.vatRate}%: ${money(t.vat)}`,
          `Total: ${money(t.total)}`,
          o.payment ? `Payment: ${o.payment}` : "",
          o.note ? `Note: ${o.note}` : "",
        ]
      : [
          `${s.company || "Implantly"}: order ${o.orderId} is now ${status}.`,
          tr?.trackingNumber ? `Tracking: ${tr.trackingNumber}` : "",
          `Total: ${money(t.total)}`,
        ];
  lines.push("", `Invoice: ${base()}/invoice/?id=${o.orderId}`, `Track: ${base()}/tracking/?id=${o.orderId}`);
  const subject = kind === "placed" ? `New order ${o.orderId}` : `Order ${o.orderId}: ${status}`;
  return { subject, body: lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n") };
}

export const waLink = (phone, text) =>
  `https://wa.me/${String(phone || "").replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
export const mailLink = (email, subject, body) =>
  `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
