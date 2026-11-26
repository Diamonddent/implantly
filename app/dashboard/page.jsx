"use client";

import {
  Package as PackageIcon,
  Calendar as CalendarIcon,
  ChartColumn as ChartColumnIcon,
  TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  Award as AwardIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SURGICAL_CATALOG } from "@/lib/surgical-catalog";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  let [e, r] = useState("all");
  let [p, g] = useState({});
  let [u, f] = useState(true);
  let b = Array.from(new Set(SURGICAL_CATALOG.map((e) => e.brand)));
  useEffect(() => {
    x();
  }, []);
  let x = async () => {
    f(true);
    try {
      let e = {};
      b.forEach((a) => {
        let t = SURGICAL_CATALOG.filter((e) => e.brand === a);
        e[a] = {
          brand: a,
          totalOrders: Math.floor(Math.random() * 500) + 100,
          totalRevenue: Math.floor(Math.random() * 100000) + 50000,
          popularProducts: t.slice(0, 3).map((e) => e.system),
          avgOrderValue: Math.floor(Math.random() * 2000) + 1000,
          growthRate: Math.floor(Math.random() * 40) - 10,
          systemsCount: t.length,
          recentOrders: Array.from(
            {
              length: 5,
            },
            (e, a) => ({
              orderId: `MD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              date: new Date(Date.now() - a * 86400000).toISOString(),
              amount: Math.floor(Math.random() * 5000) + 1000,
              items: Math.floor(Math.random() * 10) + 3,
            }),
          ),
        };
      });
      g(e);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      f(false);
    }
  };
  let y =
    e === "all"
      ? Object.values(p).reduce(
          (e, a) => ({
            brand: "All Brands",
            totalOrders: e.totalOrders + a.totalOrders,
            totalRevenue: e.totalRevenue + a.totalRevenue,
            popularProducts: [],
            avgOrderValue: 0,
            growthRate: 0,
            systemsCount: e.systemsCount + a.systemsCount,
            recentOrders: [],
          }),
          {
            brand: "All Brands",
            totalOrders: 0,
            totalRevenue: 0,
            popularProducts: [],
            avgOrderValue: 0,
            growthRate: 0,
            systemsCount: 0,
            recentOrders: [],
          },
        )
      : p[e];
  if (u) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 md:py-12">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
              Brand <span className="gradient-text">Analytics</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Comprehensive insights and performance metrics for each implant
              brand.
            </p>
          </div>
          <div className="mb-8">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => r("all")}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                  e === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                All Brands
              </button>
              {b.map((t) => (
                <button
                  onClick={() => r(t)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all",
                    e === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                  key={t}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl border-2 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950">
                  <PackageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {y?.totalOrders.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div className="p-6 rounded-2xl border-2 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950">
                  <DollarSignIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${y?.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="p-6 rounded-2xl border-2 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950">
                  <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {e !== "all" && p[e]?.growthRate > 0 ? "+" : ""}
                {e !== "all" ? p[e]?.growthRate : "—"}
                {e !== "all" && "%"}
              </div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
            </div>
            <div className="p-6 rounded-2xl border-2 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950">
                  <AwardIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{y?.systemsCount}</div>
              <div className="text-sm text-muted-foreground">
                Systems Available
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {e !== "all" && p[e] && (
              <div className="p-6 rounded-2xl border-2 bg-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ChartColumnIcon className="w-5 h-5 text-primary" />
                  Popular Systems
                </h3>
                <div className="space-y-3">
                  {p[e].popularProducts.map((t, r) => (
                    <div
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      key={r}
                    >
                      <div>
                        <div className="font-semibold text-sm">{t}</div>
                        <div className="text-xs text-muted-foreground">{e}</div>
                      </div>
                      <div className="text-sm font-mono font-bold text-primary">
                        #{r + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {e !== "all" && p[e] && (
              <div className="p-6 rounded-2xl border-2 bg-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Recent Orders
                </h3>
                <div className="space-y-3">
                  {p[e].recentOrders.map((e, t) => (
                    <div
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      key={t}
                    >
                      <div>
                        <div className="font-mono font-semibold text-sm">
                          {e.orderId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(e.date).toLocaleDateString()} · {e.items}{" "}
                          items
                        </div>
                      </div>
                      <div className="text-sm font-bold text-green-600">
                        ${e.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {e === "all" && (
              <div className="lg:col-span-2 p-6 rounded-2xl border-2 bg-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  Brand Comparison
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {b.map((e) => (
                    <div className="p-4 rounded-xl bg-secondary/50" key={e}>
                      <div className="font-bold mb-2 text-sm">{e}</div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>
                          Orders:{" "}
                          <span className="font-semibold text-foreground">
                            {p[e]?.totalOrders}
                          </span>
                        </div>
                        <div>
                          Revenue:{" "}
                          <span className="font-semibold text-foreground">
                            ${p[e]?.totalRevenue.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          Systems:{" "}
                          <span className="font-semibold text-foreground">
                            {p[e]?.systemsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {e !== "all" && (
            <div className="mt-6 p-6 rounded-2xl border-2 bg-card">
              <h3 className="text-lg font-bold mb-4">Available Systems</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SURGICAL_CATALOG.filter((a) => a.brand === e).map((e, t) => (
                  <div className="p-4 rounded-xl border bg-background" key={t}>
                    <div className="font-bold mb-2">{e.system}</div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Platforms: {Object.keys(e.platforms).length}</div>
                      <div>
                        Diameters:{" "}
                        {Object.values(e.platforms)
                          .map((e) => e.diameter)
                          .join(", ")}
                        mm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
