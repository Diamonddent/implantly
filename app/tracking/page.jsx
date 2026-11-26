"use client";

import {
  Package as PackageIcon,
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  Search as SearchIcon,
  Clock as ClockIcon,
  CircleCheckBig as CircleCheckBigIcon,
  MapPin as MapPinIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getOrderTracking, listOrders, reorder, orderTotals } from "@/lib/store";
import { currentClinic, clinicLogout } from "@/lib/admin-store";
import { money } from "@/lib/locale";
import { OrderActions } from "@/components/OrderActions";

export default function TrackingPage() {
  let [e, s] = useState("");
  let [x, u] = useState(null);
  let [h, p] = useState(false);
  let [b, g] = useState("");
  let [me, setMe] = useState(null);
  let [mine, setMine] = useState([]);
  let loadMine = () => {
    let c = currentClinic();
    setMe(c);
    setMine(c ? listOrders().filter((o) => o.clinic?.id === c.id).reverse() : []);
  };
  useEffect(() => {
    loadMine();
    let id = new URLSearchParams(location.search).get("id");
    if (id) {
      s(id);
      let t = getOrderTracking(id);
      if (t) u(t);
    }
  }, []);
  let v = async () => {
    if (!e.trim()) {
      g("Please enter an order ID");
      return;
    }
    p(true);
    g("");
    try {
      let t = getOrderTracking(e);
      if (!t) {
        throw Error("Order not found");
      }
      u(t);
    } catch (e) {
      g("Order not found. Please check your order ID and try again.");
      u(null);
    } finally {
      p(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 md:py-12">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Track Your <span className="gradient-text">Order</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Enter your order ID to track the status of your surgical kit
            delivery.
          </p>
        </div>
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Order ID (e.g., MD-ABC123)"
              value={e}
              onChange={(e) => {
                s(e.target.value);
                g("");
              }}
              onKeyPress={(e) => e.key === "Enter" && v()}
              className="w-full px-6 py-4 pr-32 rounded-2xl border-2 border-border bg-background text-lg focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={v}
              disabled={h}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <SearchIcon className="w-4 h-4" />
              {h ? "Searching..." : "Track"}
            </button>
          </div>
          {b && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {b}
            </div>
          )}
        </div>
        {x && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8 p-6 rounded-2xl border-2 bg-card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Order ID
                  </div>
                  <div className="text-2xl font-bold font-mono">
                    {x.orderId}
                  </div>
                </div>
                <div
                  className={cn(
                    "px-4 py-2 rounded-full border-2 font-bold uppercase text-sm flex items-center gap-2",
                    ((e) => {
                      switch (e.toLowerCase()) {
                        case "pending":
                          return "text-yellow-600 bg-yellow-50 border-yellow-200";
                        case "processing":
                          return "text-blue-600 bg-blue-50 border-blue-200";
                        case "shipped":
                          return "text-purple-600 bg-purple-50 border-purple-200";
                        case "delivered":
                          return "text-green-600 bg-green-50 border-green-200";
                        default:
                          return "text-gray-600 bg-gray-50 border-gray-200";
                      }
                    })(x.status),
                  )}
                >
                  {((e) => {
                    switch (e.toLowerCase()) {
                      case "pending":
                        return <ClockIcon className="w-5 h-5" />;
                      case "processing":
                      default:
                        return <PackageIcon className="w-5 h-5" />;
                      case "shipped":
                        return <TruckIcon className="w-5 h-5" />;
                      case "delivered":
                        return <CircleCheckBigIcon className="w-5 h-5" />;
                    }
                  })(x.status)}
                  {x.status}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Order Date
                  </div>
                  <div className="font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    {new Date(x.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Items
                  </div>
                  <div className="font-semibold flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-muted-foreground" />
                    {x.items} items
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Brands
                  </div>
                  <div className="font-semibold">{x.brands.join(", ")}</div>
                </div>
              </div>
              {x.trackingNumber && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Tracking Number
                  </div>
                  <div className="font-mono font-bold text-lg">
                    {x.trackingNumber}
                  </div>
                </div>
              )}
              {x.estimatedDelivery && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Estimated Delivery
                  </div>
                  <div className="font-semibold text-primary">
                    {new Date(x.estimatedDelivery).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 rounded-2xl border-2 bg-card">
              <h3 className="text-xl font-bold mb-6">Order Timeline</h3>
              <div className="relative">
                <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {x.timeline.map((e, t) => (
                    <div className="relative flex gap-4" key={t}>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 bg-background flex items-center justify-center shrink-0 z-10",
                          t === 0 ? "border-primary" : "border-border",
                        )}
                      >
                        {t === 0 && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-bold">{e.status}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(e.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {e.location && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                            <MapPinIcon className="w-3 h-3" />
                            {e.location}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {e.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {!x && !h && (
          <div className="max-w-2xl mx-auto text-center mt-12">
            <div className="p-8 rounded-2xl border-2 border-dashed bg-secondary/20">
              <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-bold mb-2">No Order Selected</h3>
              <p className="text-sm text-muted-foreground">
                Enter an order ID above to track your surgical kit delivery
                status.
              </p>
            </div>
          </div>
        )}
        {me && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                My <span className="gradient-text">Orders</span> · {me.name}
              </h2>
              <button
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  clinicLogout();
                  loadMine();
                }}
              >
                Sign out
              </button>
            </div>
            {mine.length === 0 && <div className="surface-card p-6 text-sm text-muted-foreground text-center">No orders yet.</div>}
            <div className="space-y-3">
              {mine.map((o) => {
                let t = getOrderTracking(o.orderId);
                return (
                  <div key={o.orderId} className="surface-card p-5 flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold">{o.orderId}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("en-GB")} · {o.items.length} items{o.caseRef ? ` · ${o.caseRef}` : ""} · <span className="capitalize">{t?.status}</span>
                      </div>
                    </div>
                    <div className="font-mono font-semibold">{money(orderTotals(o).total)}</div>
                    <button
                      className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-secondary"
                      onClick={() => {
                        s(o.orderId);
                        u(t);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Track
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                      onClick={() => {
                        if (!window.confirm("Place the same order again at today's prices?")) return;
                        let n = reorder(o.orderId);
                        if (n) {
                          toast.success(`Reordered as ${n.orderId}`);
                          loadMine();
                        }
                      }}
                    >
                      Reorder
                    </button>
                    <OrderActions orderId={o.orderId} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
