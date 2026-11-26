// Currency + language preferences (per device). Prices are stored in USD base;
// SAR is shown at the official peg 1 USD = 3.75 SAR.
import { readAdmin } from "@/lib/admin-store";

export const RATES = { SAR: 3.75, USD: 1 };
const CUR_KEY = "implantly_currency";
const LANG_KEY = "implantly_lang";

const ls = (k, d) => {
  try {
    return (typeof window !== "undefined" && localStorage.getItem(k)) || d;
  } catch {
    return d;
  }
};

export const getCurrency = () => (ls(CUR_KEY, "SAR") === "USD" ? "USD" : "SAR");
export const getLang = () => (ls(LANG_KEY, "en") === "ar" ? "ar" : "en");

export function setCurrency(c) {
  localStorage.setItem(CUR_KEY, c);
  location.reload();
}
export function setLang(l) {
  localStorage.setItem(LANG_KEY, l);
  location.reload();
}

const r2 = (n) => Math.round(Number(n || 0) * 100) / 100;
export const toDisplay = (n) => r2(Number(n || 0) * RATES[getCurrency()]);
export const fromDisplay = (n) => Number(n) / RATES[getCurrency()];

export function money(n, cur = getCurrency()) {
  const v = r2(Number(n || 0) * RATES[cur]);
  const s = v.toLocaleString("en-US", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
  if (cur === "USD") return `$${s}`;
  return getLang() === "ar" ? `${s} ر.س` : `SAR ${s}`;
}

export function vatRate() {
  const v = readAdmin().settings?.vat;
  return v === undefined || v === "" ? 15 : Number(v);
}

// subtotal, discount in USD base -> { subtotal, discount, net, vatRate, vat, total }
export function totals(subtotal, discount = 0, rate = vatRate()) {
  const net = Math.max(0, r2(subtotal - discount));
  const vat = r2((net * rate) / 100);
  return { subtotal: r2(subtotal), discount: r2(discount), net, vatRate: rate, vat, total: r2(net + vat) };
}

export const PAYMENT_METHODS = ["Bank transfer", "Cash on delivery", "Credit (monthly account)"];
