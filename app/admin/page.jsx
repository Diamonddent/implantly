"use client";

import {
  Activity as ActivityIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Package as PackageIcon,
  Tag as TagIcon,
  Percent as PercentIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Lock as LockIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { listOrders, orderTotals } from "@/lib/store";
import { money, toDisplay, fromDisplay, getCurrency } from "@/lib/locale";
import { orderMessage, waLink } from "@/lib/notify";
import { OrderActions } from "@/components/OrderActions";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import {
  readAdmin,
  updateAdmin,
  offerIsLive,
  DEFAULT_CATEGORY_PRICES,
  BRANDS,
  ORDER_STATUSES,
} from "@/lib/admin-store";

const SESSION = "implantly_admin_session";
const input =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary";
const btn =
  "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity";
const btnGhost =
  "px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold";
const label = "text-[11px] font-mono uppercase tracking-widest text-muted-foreground";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboardIcon },
  { id: "orders", label: "Orders", icon: PackageIcon },
  { id: "clinics", label: "Clinics", icon: UsersIcon },
  { id: "prices", label: "Prices", icon: TagIcon },
  { id: "offers", label: "Offers & Coupons", icon: PercentIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const orderTotal = (o) => orderTotals(o).total;
const fromD = (v) => (v === "" ? "" : Math.round(fromDisplay(v) * 10000) / 10000);

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("overview");
  const [db, setDb] = useState(null);
  const [orders, setOrders] = useState([]);

  const refresh = () => {
    setDb(readAdmin());
    setOrders(listOrders().slice().reverse());
  };

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION) === "1");
    refresh();
    setReady(true);
    window.addEventListener("adminUpdated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("adminUpdated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!ready || !db) return <div className="min-h-screen bg-background" />;
  if (!authed) return <Login onOk={() => { sessionStorage.setItem(SESSION, "1"); setAuthed(true); }} />;

  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-glow opacity-60" />
      <header className="relative border-b border-border/60 backdrop-blur-xl bg-background/40 sticky top-0 z-30">
        <div className="container flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <ActivityIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Implantly</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Admin Panel
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
          <LocaleSwitch />
          <button
            onClick={() => { sessionStorage.removeItem(SESSION); setAuthed(false); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOutIcon className="w-4 h-4" /> Sign out
          </button>
          </div>
        </div>
      </header>

      <main className="container relative pt-6 pb-8 md:pb-12">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground bg-secondary/40 border border-border/40",
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview orders={orders} db={db} />}
        {tab === "orders" && <Orders orders={orders} db={db} />}
        {tab === "clinics" && <Clinics db={db} orders={orders} />}
        {tab === "prices" && <Prices db={db} />}
        {tab === "offers" && <Offers db={db} />}
        {tab === "settings" && <Settings db={db} />}
      </main>
    </div>
  );
}

function Login({ onOk }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const go = () => {
    if (pw === readAdmin().password) onOk();
    else toast.error("Wrong password");
  };
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-gradient-glow opacity-60" />
      <div className="surface-card p-8 w-full max-w-lg relative animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <LockIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">
              Implantly <span className="gradient-text">Admin</span>
            </div>
            <div className="text-xs text-muted-foreground">Staff only</div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className={label}>Email</div>
            <input className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" />
          </div>
          <div>
            <div className={label}>Password</div>
            <input
              className={input}
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
          </div>
          <button onClick={go} className={cn(btn, "w-full py-3")}>Sign in</button>
          <Link href="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Back to Case Builder
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="surface-card p-5">
      <div className={label}>{title}</div>
      <div className="text-2xl font-mono font-semibold mt-2">{value}</div>
    </div>
  );
}

function statusOf(db, o) {
  const h = db.orderStatus[o.orderId]?.history;
  return h?.length ? h[h.length - 1].status : "Pending";
}

function StatusPill({ s }) {
  const c = {
    Pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
    Confirmed: "text-blue-600 bg-blue-50 border-blue-200",
    Processing: "text-blue-600 bg-blue-50 border-blue-200",
    Shipped: "text-purple-600 bg-purple-50 border-purple-200",
    Delivered: "text-green-600 bg-green-50 border-green-200",
    Cancelled: "text-gray-600 bg-gray-50 border-gray-200",
  }[s];
  return <span className={cn("px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase", c)}>{s}</span>;
}

function Overview({ orders, db }) {
  const live = orders.filter((o) => statusOf(db, o) !== "Cancelled");
  const revenue = live.reduce((s, o) => s + orderTotal(o), 0);
  const pending = orders.filter((o) => ["Pending", "Confirmed"].includes(statusOf(db, o))).length;
  const byBrand = {};
  live.forEach((o) => (o.brands || []).forEach((b) => (byBrand[b] = (byBrand[b] || 0) + orderTotal(o) / Math.max(1, o.brands.length))));
  const max = Math.max(1, ...Object.values(byBrand));
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-2">
          Business <span className="gradient-text">Overview</span>
        </h1>
        <p className="text-muted-foreground text-sm">Real numbers from orders placed in the Case Builder.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Orders" value={orders.length} />
        <Stat title="Revenue" value={money(revenue)} />
        <Stat title="Average order" value={money(live.length ? revenue / live.length : 0)} />
        <Stat title="Waiting to ship" value={pending} />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="surface-card p-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Revenue by brand</h3>
          {Object.keys(byBrand).length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
          <div className="space-y-3">
            {Object.entries(byBrand).sort((a, b) => b[1] - a[1]).map(([b, v]) => (
              <div key={b}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{b}</span>
                  <span className="font-mono">{money(v)}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary/40">
                  <div className="h-2 rounded-full bg-gradient-primary" style={{ width: `${(v / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card p-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Live offers</h3>
          {db.offers.filter(offerIsLive).length === 0 && <p className="text-sm text-muted-foreground">No live offers.</p>}
          <div className="space-y-2">
            {db.offers.filter(offerIsLive).map((o) => (
              <div key={o.id} className="flex justify-between text-sm p-3 rounded-lg bg-secondary/40 border border-border/40">
                <span>{o.name}</span>
                <span className="font-mono text-primary">{o.type === "percent" ? `${o.value}%` : money(o.value)}{o.code ? ` · ${o.code}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Orders({ orders, db }) {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(null);
  const setLot = (o, k, lot) => {
    const raw = JSON.parse(localStorage.getItem("implantly_db") || "{}");
    const ord = (raw.orders || []).find((x) => x.orderId === o.orderId);
    if (!ord) return;
    ord.items[k].lot = lot.trim();
    localStorage.setItem("implantly_db", JSON.stringify(raw));
  };
  const list = orders.filter((o) => !filter || statusOf(db, o) === filter);

  const setStatus = (o, status, extra = {}) => {
    updateAdmin((d) => {
      const cur = d.orderStatus[o.orderId] || { history: [{ status: "Pending", at: o.createdAt }] };
      cur.history = [...(cur.history || []), { status, at: new Date().toISOString() }];
      Object.assign(cur, extra);
      d.orderStatus[o.orderId] = cur;
    });
    toast.success(`${o.orderId} → ${status}`);
    const cl = (readAdmin().clinics || []).find((c) => c.id === o.clinic?.id);
    if (cl?.phone && window.confirm(`Send this update to ${cl.name} on WhatsApp?`)) {
      window.open(waLink(cl.phone, orderMessage(o.orderId, "update").body), "_blank");
    }
  };
  const exportCsv = () => {
    const rows = [["Order", "Date", "Clinic", "Case", "Status", "Payment", "Subtotal", "Discount", "VAT", "Total", "Currency"]];
    orders.forEach((o) => {
      const t = orderTotals(o);
      rows.push([o.orderId, o.createdAt.slice(0, 10), o.clinic?.name || "", o.caseRef || "", statusOf(db, o), o.payment || "", toDisplay(t.subtotal), toDisplay(t.discount), toDisplay(t.vat), toDisplay(t.total), getCurrency()]);
    });
    const csv = "\ufeff" + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `implantly-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          <span className="gradient-text">Orders</span>
        </h1>
        <div className="flex gap-2 items-center">
        <button className={btnGhost} onClick={exportCsv}><DownloadIcon className="w-3.5 h-3.5 inline" /> Export Excel (CSV)</button>
        <select className={input} style={{ width: "auto" }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        </div>
      </div>
      {list.length === 0 && (
        <div className="surface-card p-8 text-center text-muted-foreground text-sm">
          No orders yet. Orders placed in the Case Builder appear here.
        </div>
      )}
      <div className="space-y-3">
        {list.map((o) => {
          const st = statusOf(db, o);
          const meta = db.orderStatus[o.orderId] || {};
          const isOpen = open === o.orderId;
          return (
            <div key={o.orderId} className="surface-card p-5">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-bold">{o.orderId}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.clinic?.name ? `${o.clinic.name} · ` : ""}{new Date(o.createdAt).toLocaleString()} · {(o.brands || []).join(", ")} · {o.items.length} items
                    {meta.tracking ? ` · ${meta.courier || ""} ${meta.tracking}` : ""}
                    {o.payment ? ` · ${o.payment}` : ""}{o.caseRef ? ` · ${o.caseRef}` : ""}
                  </div>
                </div>
                <div className="font-mono font-semibold">{money(orderTotal(o))}</div>
                <StatusPill s={st} />
                <select
                  className={input}
                  style={{ width: "auto" }}
                  value={st}
                  onChange={(e) => {
                    const s = e.target.value;
                    if (s === "Shipped") {
                      const courier = window.prompt("Courier (e.g. SMSA, Aramex, Own delivery)", meta.courier || "SMSA");
                      if (courier === null) return;
                      const tracking = window.prompt("Tracking number", meta.tracking || "") || "";
                      setStatus(o, s, { courier, tracking });
                    } else setStatus(o, s);
                  }}
                >
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button className={btnGhost} onClick={() => setOpen(isOpen ? null : o.orderId)}>
                  {isOpen ? "Hide" : "Items"}
                </button>
              </div>
              {isOpen && (
                <div className="mt-4 space-y-2">
                  {o.items.map((i, k) => (
                    <div key={k} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/40">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{i.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{i.category} · {i.sku}</div>
                      </div>
                      <input
                        className={cn(input, "font-mono")}
                        style={{ maxWidth: 120 }}
                        placeholder="Lot / batch"
                        defaultValue={i.lot || ""}
                        onBlur={(e) => setLot(o, k, e.target.value)}
                      />
                      <div className="font-mono text-sm">×{i.qty || 1}</div>
                      <div className="font-mono text-sm text-right" style={{ minWidth: 72 }}>{money(i.price)}</div>
                    </div>
                  ))}
                  {o.coupon && (
                    <div className="text-xs text-muted-foreground text-right">
                      Coupon {o.coupon.code}: −{money(o.coupon.discount)}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground text-right">
                    VAT {orderTotals(o).vatRate}%: {money(orderTotals(o).vat)} · Total {money(orderTotal(o))}
                  </div>
                  {o.note && <div className="text-xs text-muted-foreground">Note: {o.note}</div>}
                  <OrderActions orderId={o.orderId} who="admin" className="justify-end" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Prices({ db }) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState(null);
  const [newSku, setNewSku] = useState("");
  const [newSkuPrice, setNewSkuPrice] = useState("");

  const setCat = (c, v) => updateAdmin((d) => { if (v === "") delete d.categoryPrices[c]; else d.categoryPrices[c] = fromD(v); });
  const setBrand = (b, v) => updateAdmin((d) => { if (v === "") delete d.brandImplantPrices[b]; else d.brandImplantPrices[b] = fromD(v); });

  const parse = (text) => {
    const rows = text
      .split(/\r?\n/)
      .map((l) => l.split(/[,;\t]/).map((x) => x.trim().replace(/^"|"$/g, "")))
      .filter((a) => a[0] && a.length >= 2 && !isNaN(parseFloat(a[a.length - 1])))
      .map((a) => ({ sku: a[0], price: fromD(parseFloat(a[a.length - 1])), old: db.skuPrices[a[0]] }));
    if (!rows.length) toast.error("No SKU,price lines found");
    setPreview(rows);
  };
  const apply = () => {
    updateAdmin((d) => preview.forEach((r) => (d.skuPrices[r.sku] = r.price)));
    toast.success(`${preview.length} prices updated`);
    setPreview(null);
    setCsv("");
  };
  const download = () => {
    const lines = ["Type,Key,Price"];
    Object.keys(DEFAULT_CATEGORY_PRICES).forEach((c) => lines.push(`Category,"${c}",${toDisplay(db.categoryPrices[c] ?? DEFAULT_CATEGORY_PRICES[c])}`));
    BRANDS.forEach((b) => db.brandImplantPrices[b] != null && lines.push(`Brand implant,"${b}",${toDisplay(db.brandImplantPrices[b])}`));
    Object.entries(db.skuPrices).forEach(([s, p]) => lines.push(`SKU,"${s}",${toDisplay(p)}`));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" }));
    a.download = "implantly-prices.csv";
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-2">
            <span className="gradient-text">Prices</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            SKU price wins over brand price, brand price wins over category price. Changes show in the Case Builder at once. Prices are entered in {getCurrency()}, excluding VAT.
          </p>
        </div>
        <button onClick={download} className={cn(btnGhost, "flex items-center gap-2")}>
          <DownloadIcon className="w-4 h-4" /> Download price list
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="surface-card p-6">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Price by category</h3>
          <div className="space-y-2">
            {Object.entries(DEFAULT_CATEGORY_PRICES).map(([c, def]) => (
              <div key={c} className="flex items-center gap-3">
                <span className="flex-1 text-sm">{c}</span>
                <input
                  className={cn(input, "font-mono")}
                  style={{ width: 112 }}
                  type="number"
                  defaultValue={toDisplay(db.categoryPrices[c] ?? def)}
                  onBlur={(e) => { setCat(c, e.target.value); toast.success(`${c} saved`); }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Implant price by brand</h3>
            <div className="space-y-2">
              {BRANDS.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <span className="flex-1 text-sm">{b}</span>
                  <input
                    className={cn(input, "font-mono")}
                    type="number"
                    placeholder="category"
                    defaultValue={db.brandImplantPrices[b] != null ? toDisplay(db.brandImplantPrices[b]) : ""}
                    onBlur={(e) => { setBrand(b, e.target.value); toast.success(`${b} saved`); }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">Upload price list (Excel → CSV)</h3>
            <label className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground cursor-pointer hover:border-primary">
              <UploadIcon className="w-4 h-4" /> Choose CSV file (SKU,price)
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => { setCsv(String(r.result)); parse(String(r.result)); };
                  r.readAsText(f);
                }}
              />
            </label>
            <textarea
              className={cn(input, "mt-3 font-mono")}
              rows={4}
              placeholder={"Or paste lines:\nAANCSF3508,48\n68010001,50"}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
            />
            <button onClick={() => parse(csv)} className={cn(btnGhost, "mt-3")}>Preview</button>
            {preview && preview.length > 0 && (
              <div className="mt-4 space-y-2">
                {preview.map((r) => (
                  <div key={r.sku} className="flex justify-between text-sm p-2 rounded-lg bg-secondary/40 border border-border/40 font-mono">
                    <span>{r.sku}</span>
                    <span>
                      {r.old != null ? `${money(r.old)} → ` : "new → "}
                      <span className="text-primary">{money(r.price)}</span>
                    </span>
                  </div>
                ))}
                <button onClick={apply} className={cn(btn, "w-full")}>Apply {preview.length} prices</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="surface-card p-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">SKU prices</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <input className={cn(input, "font-mono")} placeholder="SKU" style={{ maxWidth: 200 }} value={newSku} onChange={(e) => setNewSku(e.target.value)} />
          <input className={cn(input, "font-mono")} type="number" placeholder="Price" style={{ maxWidth: 120 }} value={newSkuPrice} onChange={(e) => setNewSkuPrice(e.target.value)} />
          <button
            className={cn(btn, "flex items-center gap-1")}
            onClick={() => {
              if (!newSku.trim() || newSkuPrice === "") return toast.error("Enter SKU and price");
              updateAdmin((d) => (d.skuPrices[newSku.trim()] = fromD(newSkuPrice)));
              setNewSku(""); setNewSkuPrice("");
              toast.success("SKU price saved");
            }}
          >
            <PlusIcon className="w-4 h-4" /> Add
          </button>
        </div>
        {Object.keys(db.skuPrices).length === 0 && <p className="text-sm text-muted-foreground">No SKU-specific prices yet.</p>}
        <div className="space-y-2">
          {Object.entries(db.skuPrices).map(([s, p]) => (
            <div key={s} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/40 border border-border/40">
              <span className="flex-1 font-mono text-sm">{s}</span>
              <span className="font-mono text-sm">{money(p)}</span>
              <button onClick={() => updateAdmin((d) => delete d.skuPrices[s])} className="text-muted-foreground hover:text-foreground">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <StockBox db={db} />
    </div>
  );
}

function StockBox({ db }) {
  const [sku, setSku] = useState("");
  const list = Object.keys(db.outOfStock || {});
  return (
    <div className="surface-card p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">Stock</h3>
      <p className="text-xs text-muted-foreground mb-4">SKUs marked out of stock show an Out of stock warning in the doctor&apos;s kit.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        <input className={cn(input, "font-mono")} placeholder="SKU" style={{ maxWidth: 220 }} value={sku} onChange={(e) => setSku(e.target.value)} />
        <button
          className={btn}
          onClick={() => {
            if (!sku.trim()) return;
            updateAdmin((d) => ((d.outOfStock = d.outOfStock || {})[sku.trim()] = true));
            setSku("");
            toast.success("Marked out of stock");
          }}
        >
          Mark out of stock
        </button>
      </div>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Everything is in stock.</p>}
      <div className="space-y-2">
        {list.map((s) => (
          <div key={s} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/40 border border-border/40">
            <span className="flex-1 font-mono text-sm">{s}</span>
            <button className={btnGhost} onClick={() => updateAdmin((d) => delete d.outOfStock[s])}>Back in stock</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const blankOffer = { name: "", type: "percent", value: 10, scope: "brand", target: BRANDS[0], code: "", min: 0, start: "", end: "", active: true };

function Offers({ db }) {
  const [f, setF] = useState(blankOffer);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const targets = useMemo(
    () => (f.scope === "brand" ? BRANDS : f.scope === "category" ? Object.keys(DEFAULT_CATEGORY_PRICES) : []),
    [f.scope],
  );
  const save = () => {
    if (!f.name.trim()) return toast.error("Give the offer a name");
    if (f.scope === "order" && !f.code.trim()) return toast.error("Whole-order discounts need a coupon code");
    updateAdmin((d) => d.offers.push({ ...f, id: Date.now(), value: f.type === "percent" ? Number(f.value) : fromD(f.value), min: fromD(Number(f.min) || 0) || 0, code: f.code.trim().toUpperCase() }));
    setF(blankOffer);
    toast.success("Offer created");
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-2">
          Offers & <span className="gradient-text">Coupons</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Offers without a code apply automatically to matching items. Offers with a code apply when the doctor enters it in the Order Summary.
        </p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="surface-card p-6 space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">New offer</h3>
          <div><div className={label}>Name</div><input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. MegaGen Week" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className={label}>Type</div>
              <select className={input} value={f.type} onChange={(e) => set("type", e.target.value)}>
                <option value="percent">Percent %</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div><div className={label}>Value</div><input className={cn(input, "font-mono")} type="number" value={f.value} onChange={(e) => set("value", e.target.value)} /></div>
          </div>
          <div>
            <div className={label}>Applies to</div>
            <select
              className={input}
              value={f.scope}
              onChange={(e) => {
                const s = e.target.value;
                setF((x) => ({ ...x, scope: s, target: s === "brand" ? BRANDS[0] : s === "category" ? "Implant" : "" }));
              }}
            >
              <option value="brand">Brand</option>
              <option value="category">Category</option>
              <option value="sku">One SKU</option>
              <option value="all">Every item</option>
              <option value="order">Whole order (coupon)</option>
            </select>
          </div>
          {targets.length > 0 && (
            <select className={input} value={f.target} onChange={(e) => set("target", e.target.value)}>
              {targets.map((t) => <option key={t}>{t}</option>)}
            </select>
          )}
          {f.scope === "sku" && <input className={cn(input, "font-mono")} placeholder="SKU" value={f.target} onChange={(e) => set("target", e.target.value)} />}
          <div className="grid grid-cols-2 gap-2">
            <div><div className={label}>Start</div><input className={input} type="date" value={f.start} onChange={(e) => set("start", e.target.value)} /></div>
            <div><div className={label}>End</div><input className={input} type="date" value={f.end} onChange={(e) => set("end", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><div className={label}>Coupon code</div><input className={cn(input, "font-mono")} value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="optional" /></div>
            <div><div className={label}>Min. order</div><input className={cn(input, "font-mono")} type="number" value={f.min} onChange={(e) => set("min", e.target.value)} /></div>
          </div>
          <button onClick={save} className={cn(btn, "w-full")}>Create offer</button>
        </div>

        <div className="lg:col-span-2 space-y-3">
          {db.offers.length === 0 && <div className="surface-card p-8 text-center text-sm text-muted-foreground">No offers yet.</div>}
          {db.offers.map((o) => (
            <div key={o.id} className="surface-card p-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{o.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {o.type === "percent" ? `${o.value}%` : money(o.value)} off ·{" "}
                  {o.scope === "all" ? "every item" : o.scope === "order" ? "whole order" : `${o.scope}: ${o.target}`}
                  {o.code ? ` · code ${o.code}` : ""}
                  {o.min ? ` · min ${money(o.min)}` : ""}
                  {o.start || o.end ? ` · ${o.start || "…"} → ${o.end || "…"}` : ""}
                </div>
              </div>
              <span className={cn("text-[11px] font-mono uppercase", offerIsLive(o) ? "text-primary" : "text-muted-foreground")}>
                {offerIsLive(o) ? "Live" : o.active ? "Scheduled / ended" : "Off"}
              </span>
              <button className={btnGhost} onClick={() => updateAdmin((d) => { const x = d.offers.find((y) => y.id === o.id); x.active = !x.active; })}>
                {o.active ? "Turn off" : "Turn on"}
              </button>
              <button onClick={() => updateAdmin((d) => (d.offers = d.offers.filter((y) => y.id !== o.id)))} className="text-muted-foreground hover:text-foreground">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Settings({ db }) {
  const [s, setS] = useState(db.settings);
  const [pw1, setPw1] = useState("");
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
        <span className="gradient-text">Settings</span>
      </h1>
      <div className="surface-card p-6 space-y-3">
        <div><div className={label}>Company name</div><input className={input} value={s.company} onChange={(e) => setS({ ...s, company: e.target.value })} /></div>
        <div><div className={label}>Order notification email</div><input className={input} value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} /></div>
        <div><div className={label}>WhatsApp number (with country code, e.g. 9665…)</div><input className={input} value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><div className={label}>VAT %</div><input className={input} type="number" value={s.vat} onChange={(e) => setS({ ...s, vat: e.target.value })} /></div>
          <div><div className={label}>VAT number</div><input className={input} value={s.vatNo} onChange={(e) => setS({ ...s, vatNo: e.target.value })} /></div>
          <div><div className={label}>CR number</div><input className={input} value={s.cr} onChange={(e) => setS({ ...s, cr: e.target.value })} /></div>
          <div><div className={label}>IBAN (for bank transfer)</div><input className={input} value={s.iban} onChange={(e) => setS({ ...s, iban: e.target.value })} /></div>
        </div>
        <div><div className={label}>Address (on invoice)</div><input className={input} value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></div>
        <button className={btn} onClick={() => { updateAdmin((d) => (d.settings = s)); toast.success("Saved"); }}>Save</button>
      </div>
      <div className="surface-card p-6 space-y-3">
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">Change admin password</h3>
        <input className={input} type="password" placeholder="New password (min 6)" value={pw1} onChange={(e) => setPw1(e.target.value)} />
        <button
          className={btn}
          onClick={() => {
            if (pw1.length < 6) return toast.error("At least 6 characters");
            updateAdmin((d) => (d.password = pw1));
            setPw1("");
            toast.success("Password changed");
          }}
        >
          Update password
        </button>
      </div>
    </div>
  );
}

function genPassword() {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

function Clinics({ db, orders }) {
  const blank = { name: "", contact: "", phone: "", email: "", discount: "", username: "", password: genPassword() };
  const [f, setF] = useState(blank);
  const [shown, setShown] = useState(null);
  const clinics = db.clinics || [];
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const create = () => {
    if (!f.name.trim() || !f.username.trim() || f.password.length < 6)
      return toast.error("Name, user ID and a 6+ character password are required");
    if (clinics.some((c) => c.username.toLowerCase() === f.username.trim().toLowerCase()))
      return toast.error("That user ID is taken");
    updateAdmin((d) => {
      d.clinics = d.clinics || [];
      d.clinics.push({ ...f, username: f.username.trim(), id: Date.now(), active: true, createdAt: new Date().toISOString() });
    });
    setShown({ name: f.name, username: f.username.trim(), password: f.password });
    setF({ ...blank, password: genPassword() });
  };
  const edit = (id, fn) => updateAdmin((d) => fn(d.clinics.find((c) => c.id === id)));
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-2">
          Clinic <span className="gradient-text">Accounts</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Doctors and companies can build cases freely, but must sign in with an account you create here before sending an order.
        </p>
      </div>
      {shown && (
        <div className="surface-card p-5 border border-primary/40">
          <div className="text-sm font-semibold mb-2">Account created for {shown.name}. Send these details to the clinic:</div>
          <div className="font-mono text-sm p-3 rounded-lg bg-secondary/40 border border-border/40">
            User ID: {shown.username}<br />Password: {shown.password}
          </div>
          <button
            className={cn(btnGhost, "mt-3")}
            onClick={() => {
              navigator.clipboard?.writeText(`Implantly login\nUser ID: ${shown.username}\nPassword: ${shown.password}\n${location.origin}${location.pathname.replace(/admin\/?$/, "")}`);
              toast.success("Copied");
            }}
          >
            Copy login message
          </button>
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="surface-card p-6 space-y-3">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">New clinic / company</h3>
          <div><div className={label}>Clinic or company name</div><input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><div className={label}>Doctor / contact person</div><input className={input} value={f.contact} onChange={(e) => set("contact", e.target.value)} /></div>
          <div><div className={label}>Phone / WhatsApp</div><input className={input} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><div className={label}>Email</div><input className={input} value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><div className={label}>Special discount % (this clinic)</div><input className={input} type="number" value={f.discount} onChange={(e) => set("discount", e.target.value)} /></div>
          <div><div className={label}>User ID</div><input className={cn(input, "font-mono")} value={f.username} onChange={(e) => set("username", e.target.value)} autoCapitalize="none" /></div>
          <div>
            <div className={label}>Password</div>
            <div className="flex gap-2">
              <input className={cn(input, "font-mono")} value={f.password} onChange={(e) => set("password", e.target.value)} />
              <button className={btnGhost} onClick={() => set("password", genPassword())}>New</button>
            </div>
          </div>
          <button onClick={create} className={cn(btn, "w-full")}>Create account</button>
        </div>
        <div className="lg:col-span-2 space-y-3">
          {clinics.length === 0 && <div className="surface-card p-8 text-center text-sm text-muted-foreground">No clinic accounts yet.</div>}
          {clinics.map((c) => (
            <div key={c.id} className="surface-card p-5 flex flex-wrap items-center gap-4" style={{ opacity: c.active ? 1 : 0.55 }}>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {c.username}{c.contact ? ` · ${c.contact}` : ""}{c.phone ? ` · ${c.phone}` : ""} · {orders.filter((o) => o.clinic?.id === c.id).length} orders
                </div>
              </div>
              <button
                className={btnGhost}
                onClick={() => {
                  const v = window.prompt(`Special discount % for ${c.name}`, c.discount || "0");
                  if (v !== null) edit(c.id, (x) => (x.discount = Number(v) || 0));
                }}
              >
                Discount {c.discount ? `${c.discount}%` : "0%"}
              </button>
              <button
                className={btnGhost}
                onClick={() => {
                  const pw = genPassword();
                  edit(c.id, (x) => (x.password = pw));
                  setShown({ name: c.name, username: c.username, password: pw });
                }}
              >
                Reset password
              </button>
              <button className={btnGhost} onClick={() => edit(c.id, (x) => (x.active = !x.active))}>
                {c.active ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
