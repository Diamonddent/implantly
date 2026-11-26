// Admin settings kept on this device (localStorage key "implantly_admin").
// Prices, offers, coupons and order statuses set here are read by the case builder,
// the cart and tracking. Swap for a database (e.g. Supabase) to share across devices.
const KEY = "implantly_admin";

export const DEFAULT_CATEGORY_PRICES = {
  "Implant": 285,
  "Cover Screw": 45,
  "Healing Abutment": 55,
  "Multiunit Abutment": 195,
  "Bridge Screw": 25,
  "Healing Cap": 35,
  "Scan Body": 85,
  "Printed Model Analog": 45,
  "Pickup": 55,
  "Transfer": 55,
  "Analog": 45,
  "Ti-Base": 120,
  "Impression Coping": 55,
  "Temporary Abutment": 65,
};

export const BRANDS = ["Astra Tech", "Nobel Biocare", "Straumann", "MegaGen", "ROOTT"];
export const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

function empty() {
  return {
    password: "admin123",
    categoryPrices: {},
    brandImplantPrices: {},
    skuPrices: {},
    offers: [],
    orderStatus: {},
    settings: { company: "", phone: "", email: "", currency: "$" },
  };
}

export function readAdmin() {
  if (typeof window === "undefined") return empty();
  try {
    return { ...empty(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
  } catch {
    return empty();
  }
}

export function writeAdmin(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new Event("adminUpdated"));
}

export function updateAdmin(fn) {
  const db = readAdmin();
  fn(db);
  writeAdmin(db);
  return db;
}

const today = () => new Date().toISOString().slice(0, 10);

export function offerIsLive(o) {
  const d = today();
  return o.active && (!o.start || o.start <= d) && (!o.end || o.end >= d);
}

function brandOf(item) {
  const n = (item.name || "").toLowerCase();
  return BRANDS.find((b) => n.includes(b.toLowerCase()) || n.includes(b.split(" ")[0].toLowerCase())) || "";
}

function offerMatches(o, item, brand) {
  if (o.scope === "all") return true;
  if (o.scope === "brand") return brand === o.target;
  if (o.scope === "category") return item.category === o.target;
  if (o.scope === "sku") return String(item.sku).toLowerCase() === String(o.target).toLowerCase();
  return false;
}

// Base list price for an item: SKU price > brand implant price > category price > built-in default.
export function listPrice(item, db = readAdmin(), kitBrand = "") {
  if (db.skuPrices[item.sku] != null) return Number(db.skuPrices[item.sku]);
  const brand = kitBrand || brandOf(item);
  if (item.category === "Implant" && brand && db.brandImplantPrices[brand] != null)
    return Number(db.brandImplantPrices[brand]);
  if (db.categoryPrices[item.category] != null) return Number(db.categoryPrices[item.category]);
  return item.price;
}

// Applies admin prices and automatic (non-coupon) offers to generated kit items.
export function applyPricing(items, kitBrand = "") {
  if (typeof window === "undefined" || !Array.isArray(items)) return items;
  const db = readAdmin();
  return items.map((item) => {
    const brand = kitBrand || brandOf(item);
    const base = listPrice(item, db, brand);
    let best = 0;
    let offer = null;
    db.offers
      .filter((o) => offerIsLive(o) && !o.code && o.type !== "fixedOrder" && offerMatches(o, item, brand))
      .forEach((o) => {
        const d = o.type === "percent" ? (base * o.value) / 100 : Math.min(o.value, base);
        if (d > best) { best = d; offer = o.name; }
      });
    const price = Math.round((base - best) * 100) / 100;
    return { ...item, price, ...(best ? { originalPrice: base, offer } : {}) };
  });
}

// Coupon lookup for the cart. Returns { ok, discount, name } for a subtotal.
export function checkCoupon(code, subtotal) {
  const db = readAdmin();
  const o = db.offers.find((o) => o.code && o.code.toUpperCase() === String(code).trim().toUpperCase() && offerIsLive(o));
  if (!o) return { ok: false, reason: "Invalid or expired code" };
  if (o.min && subtotal < o.min) return { ok: false, reason: `Minimum order ${o.min}` };
  const discount = o.type === "percent" ? (subtotal * o.value) / 100 : Math.min(o.value, subtotal);
  return { ok: true, discount: Math.round(discount * 100) / 100, name: o.name };
}
