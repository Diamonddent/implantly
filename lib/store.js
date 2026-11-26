import { readAdmin } from "@/lib/admin-store";

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

function shortId(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
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

export function saveOrder({ caseId, brands = [], items = [], coupon = null }) {
  const db = read();
  const order = {
    orderId: shortId("MD"),
    caseId: caseId ?? "local",
    brands,
    items,
    coupon,
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  write(db);
  return order;
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
