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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { listOrders } from "@/lib/store";
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
  { id: "prices", label: "Prices", icon: TagIcon },
  { id: "offers", label: "Offers & Coupons", icon: PercentIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const money = (n) => `$${(Math.round(Number(n || 0) * 100) / 100).toLocaleString("en-US")}`;
const orderTotal = (o) =>
  Math.max(0, o.items.reduce((s, i) => s + (Number(i.price) || 0) * (i.qty || 1), 0) - (o.coupon?.discount || 0));

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
          <button
            onClick={() => { sessionStorage.removeItem(SESSION); setAuthed(false); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOutIcon className="w-4 h-4" /> Sign out
          </button>
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
  const list = orders.filter((o) => !filter || statusOf(db, o) === filter);

  const setStatus = (o, status, extra = {}) => {
    updateAdmin((d) => {
      const cur = d.orderStatus[o.orderId] || { history: [{ status: "Pending", at: o.createdAt }] };
      cur.history = [...(cur.history || []), { status, at: new Date().toISOString() }];
      Object.assign(cur, extra);
      d.orderStatus[o.orderId] = cur;
    });
    toast.success(`${o.orderId} → ${status}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          <span className="gradient-text">Orders</span>
        </h1>
        <select className={cn(input, "w-auto")} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
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
                    {new Date(o.createdAt).toLocaleString()} · {(o.brands || []).join(", ")} · {o.items.length} items
                    {meta.tracking ? ` · ${meta.courier || ""} ${meta.tracking}` : ""}
                  </div>
                </div>
                <div className="font-mono font-semibold">{money(orderTotal(o))}</div>
                <StatusPill s={st} />
                <select
                  className={cn(input, "w-auto")}
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
                      <div className="font-mono text-sm">×{i.qty || 1}</div>
                      <div className="font-mono text-sm w-16 text-right">{money(i.price)}</div>
                    </div>
                  ))}
                  {o.coupon && (
                    <div className="text-xs text-muted-foreground text-right">
                      Coupon {o.coupon.code}: −{money(o.coupon.discount)}
                    </div>
                  )}
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

  const setCat = (c, v) => updateAdmin((d) => { if (v === "") delete d.categoryPrices[c]; else d.categoryPrices[c] = Number(v); });
  const setBrand = (b, v) => updateAdmin((d) => { if (v === "") delete d.brandImplantPrices[b]; else d.brandImplantPrices[b] = Number(v); });

  const parse = (text) => {
    const rows = text
      .split(/\r?\n/)
      .map((l) => l.split(/[,;\t]/).map((x) => x.trim().replace(/^"|"$/g, "")))
      .filter((a) => a[0] && a.length >= 2 && !isNaN(parseFloat(a[a.length - 1])))
      .map((a) => ({ sku: a[0], price: parseFloat(a[a.length - 1]), old: db.skuPrices[a[0]] }));
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
    Object.keys(DEFAULT_CATEGORY_PRICES).forEach((c) => lines.push(`Category,"${c}",${db.categoryPrices[c] ?? DEFAULT_CATEGORY_PRICES[c]}`));
    BRANDS.forEach((b) => db.brandImplantPrices[b] != null && lines.push(`Brand implant,"${b}",${db.brandImplantPrices[b]}`));
    Object.entries(db.skuPrices).forEach(([s, p]) => lines.push(`SKU,"${s}",${p}`));
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
            SKU price wins over brand price, brand price wins over category price. Changes show in the Case Builder at once.
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
                  defaultValue={db.categoryPrices[c] ?? def}
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
                    defaultValue={db.brandImplantPrices[b] ?? ""}
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
              updateAdmin((d) => (d.skuPrices[newSku.trim()] = Number(newSkuPrice)));
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
    updateAdmin((d) => d.offers.push({ ...f, id: Date.now(), value: Number(f.value), min: Number(f.min) || 0, code: f.code.trim().toUpperCase() }));
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
        <div><div className={label}>WhatsApp number</div><input className={input} value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></div>
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
