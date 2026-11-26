import { readAdmin, applyPricing } from "@/lib/admin-store";
import { totals } from "@/lib/locale";

// On-device store for cases and orders (localStorage).
// The app is a static, installable web app (GitHub Pages), so there is no server:
// each device keeps its own cases and orders. Swap these functions for a real
// database (e.g. Supabase) to share orders between devices.
const KEY = "implantly_db";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { cases: [], orders: [] };
  } catch {
    return { cases: [], orders: [] };
  }
}

function write(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

// Collision-checked IDs (crypto random, 31^6 ≈ 887M combinations).
function shortId(prefix, taken = []) {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    const r = new Uint32Array(6);
    (globalThis.crypto || window.crypto).getRandomValues(r);
    const id = prefix + "-" + Array.from(r, (x) => A[x % A.length]).join("");
    if (!taken.includes(id)) return id;
  }
}

export function saveCase(data) {
  const db = read();
  const record = { id: shortId("CASE"), ...data, createdAt: new Date().toISOString() };
  db.cases.push(record);
  write(db);
  return record;
}

export function listCases() {
  return read().cases;
}

export function saveOrder({ caseId, brands = [], items = [], coupon = null, clinic = null, ...extra }) {
  const db = read();
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (i.qty || 1), 0);
  const order = {
    orderId: shortId("MD", db.orders.map((o) => o.orderId)),
    caseId: caseId ?? "local",
    brands,
    items,
    coupon,
    clinic,
    payment: extra.payment || "",
    caseRef: extra.caseRef || "",
    note: extra.note || "",
    totals: totals(subtotal, coupon ? coupon.discount : 0),
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  write(db);
  return order;
}

export function getOrder(id) {
  return read().orders.find((o) => o.orderId.toLowerCase() === String(id).trim().toLowerCase()) || null;
}

// Same items at today's prices.
export function reorder(id) {
  const o = getOrder(id);
  if (!o) return null;
  const items = applyPricing(o.items.map(({ originalPrice, offer, ...i }) => i));
  return saveOrder({ caseId: o.caseId, brands: o.brands, items, clinic: o.clinic, payment: o.payment, caseRef: o.caseRef });
}

// Older orders saved before totals existed.
export function orderTotals(o) {
  if (o.totals) return o.totals;
  const sub = o.items.reduce((s, i) => s + (Number(i.price) || 0) * (i.qty || 1), 0);
  return totals(sub, o.coupon?.discount || 0);
}

export function listOrders() {
  return read().orders;
}

const DESCRIPTIONS = {
  Pending: "Order received and awaiting confirmation",
  Confirmed: "Order confirmed by Implantly",
  Processing: "Surgical kit is being picked and packed",
  Shipped: "Kit handed to courier",
  Delivered: "Kit delivered to the clinic",
  Cancelled: "Order cancelled",
};

// Status comes from the admin panel (Admin -> Orders). New orders start as Pending.
export function getOrderTracking(orderId) {
  const order = read().orders.find(
    (o) => o.orderId.toLowerCase() === String(orderId).trim().toLowerCase()
  );
  if (!order) return null;
  const admin = readAdmin().orderStatus[order.orderId] || {};
  const history = admin.history?.length
    ? admin.history
    : [{ status: "Pending", at: order.createdAt }];
  const current = history[history.length - 1].status;
  const qty = order.items.reduce((sum, i) => sum + (i.qty || 1), 0);
  return {
    orderId: order.orderId,
    status: current.toLowerCase(),
    createdAt: order.createdAt,
    estimatedDelivery: admin.eta || new Date(new Date(order.createdAt).getTime() + 72 * 3600 * 1000).toISOString(),
    items: qty,
    brands: order.brands,
    trackingNumber: admin.tracking ? `${admin.courier ? admin.courier + " " : ""}${admin.tracking}` : null,
    timeline: history
      .map((h) => ({
        status: h.status,
        description: h.note || DESCRIPTIONS[h.status] || "",
        location: h.status === "Delivered" ? "Clinic" : h.status === "Shipped" ? admin.courier || "Courier" : "Implantly",
        timestamp: h.at,
      }))
      .reverse(),
  };
}
