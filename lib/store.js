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

export function saveOrder({ caseId, brands = [], items = [] }) {
  const db = read();
  const order = {
    orderId: shortId("MD"),
    caseId: caseId ?? "local",
    brands,
    items,
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  write(db);
  return order;
}

export function listOrders() {
  return read().orders;
}

const HOUR = 3600 * 1000;

// Status advances with the order's age: pending -> processing -> shipped -> delivered.
export function getOrderTracking(orderId) {
  const order = read().orders.find(
    (o) => o.orderId.toLowerCase() === String(orderId).trim().toLowerCase()
  );
  if (!order) return null;

  const created = new Date(order.createdAt).getTime();
  const age = Date.now() - created;
  const steps = [
    { status: "Pending", at: 0, description: "Order received and awaiting confirmation", location: "Implantly" },
    { status: "Processing", at: 1 * HOUR, description: "Surgical kit is being picked and packed", location: "Warehouse" },
    { status: "Shipped", at: 24 * HOUR, description: "Kit handed to courier", location: "Distribution center" },
    { status: "Delivered", at: 72 * HOUR, description: "Kit delivered to the clinic", location: "Clinic" },
  ];
  const reached = steps.filter((s) => age >= s.at);
  const current = reached[reached.length - 1];
  const qty = order.items.reduce((sum, i) => sum + (i.qty || 1), 0);

  return {
    orderId: order.orderId,
    status: current.status.toLowerCase(),
    createdAt: order.createdAt,
    estimatedDelivery: new Date(created + 72 * HOUR).toISOString(),
    items: qty,
    brands: order.brands,
    trackingNumber: age >= 24 * HOUR ? "TRK" + order.orderId.replace(/\W/g, "") : null,
    timeline: reached
      .map((s) => ({
        status: s.status,
        description: s.description,
        location: s.location,
        timestamp: new Date(created + s.at).toISOString(),
      }))
      .reverse(),
  };
}
