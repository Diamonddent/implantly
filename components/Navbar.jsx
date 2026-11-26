"use client";

import {
  CircleDot as CircleDotIcon,
  Truck as TruckIcon,
  ShoppingCart as ShoppingCartIcon,
  X as XIcon,
  Activity as ActivityIcon,
  LayoutDashboard as LayoutDashboardIcon,
  Menu as MenuIcon,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LocaleSwitch } from "@/components/LocaleSwitch";

let m = [
  {
    href: "/",
    label: "Case Builder",
    icon: CircleDotIcon,
  },
  {
    href: "/tracking",
    label: "Tracking",
    icon: TruckIcon,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
];
export function Navbar() {
  let e = usePathname();
  let i = useSearchParams();
  let [s, l] = useState(false);
  let [c, p] = useState(0);
  useEffect(() => {
    try {
      let e = localStorage.getItem("implantly_cart");
      if (e) {
        let r = JSON.parse(e).reduce((e, r) => e + (r.qty || 1), 0);
        p(r);
      }
    } catch (e) {
      console.error("Error reading cart:", e);
    }
    let e = () => {
      try {
        let e = localStorage.getItem("implantly_cart");
        if (e) {
          let r = JSON.parse(e).reduce((e, r) => e + (r.qty || 1), 0);
          p(r);
        } else {
          p(0);
        }
      } catch (e) {
        p(0);
      }
    };
    window.addEventListener("storage", e);
    window.addEventListener("cartUpdated", e);
    return () => {
      window.removeEventListener("storage", e);
      window.removeEventListener("cartUpdated", e);
    };
  }, [e, i]);
  if (e?.startsWith("/admin")) return null;
  return (
    <header className="relative border-b border-border/60 backdrop-blur-xl bg-background/40 sticky top-0 z-30">
      <div className="container flex items-center justify-between py-4 gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <ActivityIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">Implantly</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Case → Kit → Cart
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {m.map((n) => {
            let _Component2 = n.icon;
            let o = e === n.href;
            return (
              <Link
                href={n.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  o
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                )}
                key={n.href}
              >
                <_Component2 className="w-4 h-4" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <LocaleSwitch />
          <Link
            href="/marketplace"
            className="relative p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
            aria-label="Cart"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            {c > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {c > 99 ? "99+" : c}
              </span>
            )}
          </Link>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary/60"
            onClick={() => l((e) => !e)}
            aria-label="Toggle menu"
          >
            {s ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      {s && (
        <div className="md:hidden border-t border-border/60 bg-background/80 backdrop-blur-xl">
          <nav className="container py-3 flex flex-col gap-1">
            {m.map((n) => {
              let _Component4 = n.icon;
              let o = e === n.href;
              return (
                <Link
                  href={n.href}
                  onClick={() => l(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    o
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                  )}
                  key={n.href}
                >
                  <_Component4 className="w-4 h-4" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
