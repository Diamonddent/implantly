"use client";

import {
  Check as CheckIcon,
  ArrowRight as ArrowRightIcon,
  Package as PackageIcon,
  FlaskConical as FlaskConicalIcon,
  Link2 as Link2Icon,
  ShoppingCart as ShoppingCartIcon,
  ArrowLeft as ArrowLeftIcon,
  Layers as LayersIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
} from "lucide-react";
import multiunit_abutments from "@/data/multiunit-abutments.json";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, Suspense } from "react";
import {
  SURGICAL_CATALOG,
  resolveSurgicalCatalog,
  surgicalCatalogKey,
} from "@/lib/surgical-catalog";
import { snapDiameter, getPlatformByDiameter } from "@/lib/recommend";
import multiunit_workflows from "@/data/multiunit-workflows.json";
import { toast } from "sonner";
import Link from "next/link";
import prosthetic_workflows from "@/data/prosthetic-workflows.json";

let v = {
  XS: {
    hex: "#a78bfa",
    label: "Lilac",
  },
  S: {
    hex: "#60a5fa",
    label: "Blue",
  },
  M: {
    hex: "#34d399",
    label: "Green",
  },
  L: {
    hex: "#fb923c",
    label: "Orange",
  },
  XL: {
    hex: "#f87171",
    label: "Red",
  },
  "3.0": {
    hex: "#c084fc",
    label: "3.0",
  },
  NP: {
    hex: "#38bdf8",
    label: "Narrow",
  },
  RP: {
    hex: "#4ade80",
    label: "Regular",
  },
  WP: {
    hex: "#fb923c",
    label: "Wide",
  },
};
function N(e) {
  return e.implants.flatMap((t) =>
    t.lengths.map((r) => {
      let l = e.platforms[t.platform]?.diameter ?? 0;
      return {
        sku: `REF-${t.platform}-${t.type.toLowerCase().replace(/[^a-z0-9]/g, "")}-${r}`,
        platform: t.platform,
        diameter: l,
        length: r,
        type: t.type,
        name: `${t.type} \xd8${l} \xd7 ${r}mm`,
      };
    }),
  );
}
function k(e) {
  return e.coverScrews.map((t) => ({
    ...t,
    diameter: e.platforms[t.platform]?.diameter ?? 0,
  }));
}
function w(e) {
  return e.healingAbutments.flatMap((t) => {
    let r = e.platforms[t.platform]?.diameter ?? 0;
    return t.heights.map((e) => ({
      sku: `HA-${t.platform}-${e}`,
      platform: t.platform,
      diameter: r,
      height: e,
      headDiam: t.headDiam,
      name: `${t.name} ${t.platform} \xd8${t.headDiam} / H:${e}mm`,
    }));
  });
}
let C = Object.entries(multiunit_abutments.astra_multiunit.platforms).flatMap(
  ([e, t]) => {
    let r = t.diameter_mm;
    return Object.entries(t.abutments ?? {}).flatMap(([t, l]) => {
      let s = t === "straight" ? 0 : t === "angled_17" ? 17 : 30;
      return l.map((t) => ({
        sku: t.sku,
        name: t.name,
        platform: e,
        diameter: r,
        angle: s,
        height: t.gingival_height_mm,
        engaging: t.engaging,
        qty: t.qty,
        source: "Astra Dentsply",
        sub: `Platform ${e} \xb7 ${s}\xb0 \xb7 H${t.gingival_height_mm}mm${t.engaging !== undefined ? (t.engaging ? " · Eng" : " · Non-Eng") : ""}`,
      }));
    });
  },
);
let S = multiunit_abutments.astra_multiunit.temporary_cylinder
  ? [
      {
        sku: multiunit_abutments.astra_multiunit.temporary_cylinder.sku,
        name: multiunit_abutments.astra_multiunit.temporary_cylinder.name,
        platform: "ALL",
        diameter: null,
        angle: null,
        height: null,
        engaging: null,
        qty: multiunit_abutments.astra_multiunit.temporary_cylinder.qty,
        source: "Astra Dentsply",
        sub: "Universal — all platforms",
      },
    ]
  : [];
let A = Object.entries(
  multiunit_abutments.ipd_multiunit.items_by_compatible_system,
).flatMap(([e, t]) =>
  t.map((t) => ({
    sku: t.sku,
    name: t.name,
    platform: "IPD",
    diameter: t.diameter_mm ? parseFloat(t.diameter_mm) : null,
    angle: t.angle_deg ?? null,
    height: t.gingival_height_mm ?? null,
    engaging: t.engaging ?? null,
    qty: t.qty,
    source: e,
    sub: `${e} compatible \xb7 ${t.angle_deg ?? 0}\xb0${t.gingival_height_mm ? ` \xb7 H${t.gingival_height_mm}mm` : ""}`,
  })),
);
let $ = [...C, ...S, ...A];
function M({
  sku: e,
  name: r,
  sub: l,
  badge: s,
  isCurrent: a,
  isSelected: n,
  outOfStock: o,
  onSelect: d,
}) {
  return (
    <button
      onClick={d}
      className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all w-full ${o ? "opacity-50" : ""}`}
      style={{
        borderColor: n
          ? "hsl(var(--primary))"
          : a
            ? "hsl(var(--primary)/0.4)"
            : "hsl(var(--border))",
        backgroundColor: n ? "hsl(var(--primary)/0.08)" : "hsl(var(--card))",
      }}
    >
      {a && !n && (
        <span className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
          Current
        </span>
      )}
      {n && (
        <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-primary">
          <CheckIcon className="w-3 h-3" /> Selected
        </span>
      )}
      {s && !n && !a && (
        <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
          {s}
        </span>
      )}
      <div className="text-[10px] font-mono text-muted-foreground mb-1 mt-0.5">
        {e}
      </div>
      <div className="text-sm font-semibold leading-snug pr-16">{r}</div>
      <div className="text-xs text-muted-foreground mt-1">{l}</div>
      {o && (
        <div className="text-[9px] text-destructive/70 font-mono mt-1">
          Out of stock
        </div>
      )}
    </button>
  );
}
function _({ platform: e, entry: r }) {
  let l = r.platforms[e]?.diameter;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-3 bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs font-semibold">Platform {e}</span>
      </div>
      {l && (
        <span className="text-[10px] font-mono text-muted-foreground">
          Ø{l}mm
        </span>
      )}
    </div>
  );
}
function T({ diam: e, entry: r }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-3 bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="text-xs font-semibold">Ø{e}mm</span>
      </div>
    </div>
  );
}
function L({
  currentSku: e,
  currentName: r,
  newSku: l,
  newName: s,
  onConfirm: a,
  onCancel: n,
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="container py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
              Current
            </div>
            <div className="text-sm text-muted-foreground line-through truncate">
              {r}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/60">
              {e}
            </div>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono uppercase text-primary mb-1">
              Replacing with
            </div>
            <div className="text-sm font-semibold truncate">{s}</div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {l}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={n}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={a}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <CheckIcon className="w-4 h-4" /> Replace & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function B({
  tooth: e,
  itemId: s,
  category: n,
  currentSku: i,
  toothDiameter: d,
  catalogKey: m,
  stage: c,
  multiunitBrand: u,
  multiunitWorkflow: x,
  multiunitConventionalType: p,
}) {
  let g = useRouter();
  let [f, j] = useState("");
  let [v, S] = useState("");
  let [$, _] = useState(null);
  let P =
    c === "multiunit" ||
    n === "Multiunit Abutment" ||
    n.includes("Healing Cap") ||
    n.includes("Scan Body") ||
    n.includes("Multi Base") ||
    n.includes("Bridge Screw") ||
    n.includes("Analog") ||
    n.includes("Pickup") ||
    n.includes("Transfer") ||
    n.includes("Cylinder");
  let I = {
    "Astra Tech": ["Astra EV (Parallel)", "Prime Taper (Tapered)"],
    "Nobel Biocare": ["NobelParallel CC (Straight)", "NobelActive (Tapered)"],
    Straumann: ["BLX (Fully Tapered)", "BLT (Bone Level Tapered)"],
  };
  let R = Object.keys(I);
  let O = useMemo(
    () =>
      f && !v
        ? SURGICAL_CATALOG.find((e) => e.brand === f) ||
          resolveSurgicalCatalog(m)
        : (f &&
            v &&
            SURGICAL_CATALOG.find((e) => e.brand === f && e.system === v)) ||
          resolveSurgicalCatalog(m),
    [f, v, m],
  );
  let D = snapDiameter(d, O);
  let H = getPlatformByDiameter(d, O);
  let E = useMemo(() => N(O), [O]);
  let U = useMemo(() => k(O), [O]);
  let G = useMemo(() => w(O), [O]);
  let q = useMemo(
    () =>
      P && u && x
        ? (function (e, t, r) {
            let l = multiunit_workflows.find((t) => {
              let r = t.brand.toLowerCase();
              if (e === "astra") {
                return r.includes("astra");
              } else if (e === "straumann") {
                return r.includes("straumann");
              } else {
                return e === "nobel" && r.includes("nobel");
              }
            });
            if (!l) {
              return [];
            }
            let s = l.workflow;
            let a = [];
            if (t === "digital") {
              a = s?.digital?.components || [];
            } else if (t === "conventional") {
              if (r === "open") {
                a = s?.conventional?.open_tray?.components || [];
              } else if (r === "closed") {
                a = s?.conventional?.closed_tray?.components || [];
              }
            }
            return a.map((e) => ({
              sku: e.sku || e.skus?.[0] || "N/A",
              name: e.name,
              type: e.type,
              category: e.type
                .replace(/_/g, " ")
                .split(" ")
                .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
                .join(" "),
              brand: l.brand,
            }));
          })(u, x, p || undefined)
        : [],
    [P, u, x, p],
  );
  let X = useMemo(() => {
    if (P) {
      if (n === "Multiunit Abutment") {
        let e = C;
        let t = (u || "").toLowerCase();
        if (t === "straumann") {
          e = A.filter((e) => e.source.toLowerCase().includes("straumann"));
        } else if (t === "nobel") {
          e = A.filter((e) => e.source.toLowerCase().includes("nobel"));
        } else if (t === "astra") {
          e = C;
        }
        return e
          .filter((e) => e.diameter === D)
          .map((e) => ({
            sku: e.sku,
            name: e.name,
            sub: e.sub,
          }));
      }
      return q
        .filter((e) => {
          let t = n.toLowerCase().replace(/\s+/g, "_");
          let r = e.type.toLowerCase();
          return (
            r.includes(t) ||
            t.includes(r) ||
            e.category.toLowerCase() === n.toLowerCase()
          );
        })
        .map((e) => ({
          sku: e.sku,
          name: e.name,
          sub: `${e.brand} — ${x === "digital" ? "Digital" : p === "open" ? "Open Tray" : "Closed Tray"} workflow`,
        }));
    }
    if (n === "Implant") {
      return E.filter((e) => e.diameter === D).map((e) => ({
        sku: e.sku,
        name: e.name,
        sub: `${e.length}mm length \xb7 \xd8${e.diameter}mm`,
      }));
    } else if (n === "Cover Screw") {
      return U.filter((e) => e.diameter === D).map((e) => ({
        sku: e.sku,
        name: e.name,
        sub: `\xd8${e.diameter}mm connection`,
      }));
    } else if (n === "Healing Abutment") {
      return G.filter((e) => e.diameter === D).map((e) => ({
        sku: e.sku,
        name: e.name,
        sub: `H${e.height}mm \xb7 \xd8${e.headDiam}mm head`,
      }));
    } else {
      return [];
    }
  }, [n, P, D, E, U, G, q, u, x, p]);
  let z = X.find((e) => e.sku === $);
  let W = X.find((e) => e.sku === i) ?? {
    name: i,
    sku: i,
  };
  useEffect(() => {
    if (i && X.length > 0 && X.find((e) => e.sku === i) && !$) {
      _(i);
    }
  }, [i, X, $]);
  return (
    <div className="pb-32">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => g.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-xl font-semibold">Replace {n}</h1>
          <p className="text-sm text-muted-foreground">
            Tooth #{e}{" "}
            {P && u
              ? `— ${u.charAt(0).toUpperCase() + u.slice(1)} \xb7 ${x === "digital" ? "Digital" : p === "open" ? "Open Tray" : "Closed Tray"} workflow`
              : `— showing Platform ${H} (\xd8${D}mm) compatible items`}
          </p>
        </div>
      </div>
      {!P && (
        <div className="mb-6 p-4 rounded-xl border bg-card">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Select Brand
              </label>
              <select
                value={f}
                onChange={(e) => {
                  j(e.target.value);
                  S("");
                  _(null);
                }}
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">All Brands</option>
                {R.map((e) => (
                  <option value={e} key={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Select System
              </label>
              <select
                value={v}
                onChange={(e) => {
                  S(e.target.value);
                  _(null);
                }}
                disabled={!f}
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Systems</option>
                {f &&
                  I[f]?.map((e) => (
                    <option value={e} key={e}>
                      {e}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          {f && v && (
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              Showing:{" "}
              <span className="font-semibold text-primary">
                {f} — {v}
              </span>
            </div>
          )}
        </div>
      )}
      <T diam={D} entry={O} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {X.map((e) => (
          <M
            sku={e.sku}
            name={e.name}
            sub={e.sub}
            isCurrent={e.sku === i}
            isSelected={$ === e.sku}
            onSelect={() =>
              ((e) => {
                _($ === e ? null : e);
                if (e !== $ && e !== i) {
                  let t = X.find((t) => t.sku === e);
                  if (t) {
                    toast.success("Item selected for replacement", {
                      description: `${t.name} will replace the current ${n.toLowerCase()}`,
                      duration: 3000,
                    });
                  }
                }
              })(e.sku)
            }
            key={e.sku}
          />
        ))}
      </div>
      {$ && $ !== i && z && (
        <L
          currentSku={i}
          currentName={W.name}
          newSku={z.sku}
          newName={z.name}
          onConfirm={function () {
            if ($ && z) {
              toast.success("Item replaced", {
                description: `${z.name} has been added to your kit`,
                duration: 3000,
              });
              setTimeout(() => {
                let t = new URLSearchParams({
                  updated: "1",
                  tooth: e.toString(),
                  itemId: s,
                  newSku: z.sku,
                  newName: z.name,
                  newCategory: n,
                });
                g.push(`/?${t.toString()}`);
              }, 500);
            }
          }}
          onCancel={() => _(null)}
        />
      )}
    </div>
  );
}
function P() {
  let e;
  let [l, a] = useState(null);
  let [n, i] = useState("");
  let [d, b] = useState("");
  let [f, C] = useState("");
  let [S, A] = useState("");
  let [T, L] = useState("");
  let [B, P] = useState("");
  let [I, R] = useState(null);
  let [O, D] = useState(null);
  let [H, E] = useState(null);
  let [U, G] = useState(null);
  let [q, X] = useState(null);
  let z = {
    "Astra Tech": ["Astra EV (Parallel)", "Prime Taper (Tapered)"],
    "Nobel Biocare": ["NobelParallel CC (Straight)", "NobelActive (Tapered)"],
    Straumann: ["BLX (Fully Tapered)", "BLT (Bone Level Tapered)"],
  };
  let W = Object.keys(z);
  let F = useMemo(
    () =>
      n && !d
        ? SURGICAL_CATALOG.find((e) => e.brand === n) || SURGICAL_CATALOG[0]
        : (n &&
            d &&
            SURGICAL_CATALOG.find((e) => e.brand === n && e.system === d)) ||
          SURGICAL_CATALOG[0],
    [n, d],
  );
  surgicalCatalogKey(F);
  let [K, V] = useState("Implant");
  let [J, Q] = useState(null);
  let [Y, Z] = useState(null);
  let [ee, et] = useState(null);
  let [er, el] = useState(null);
  useEffect(() => {
    if (l === "multiunit") {
      V("Multiunit Abutment");
    } else if (l === "surgical") {
      V("Implant");
    }
    el(null);
    Q(null);
    i("");
    b("");
  }, [l]);
  let es = useMemo(() => N(F), [F]);
  let ea = useMemo(() => k(F), [F]);
  let en = useMemo(() => w(F), [F]);
  let eo = Object.keys(F.platforms);
  let ei = J ? es.filter((e) => e.platform === J) : es;
  let ed = J ? ea.filter((e) => e.platform === J) : ea;
  let em = J ? en.filter((e) => e.platform === J) : en;
  let ec = useMemo(() => {
    let e = [];
    (I ? [I] : ["astra", "straumann", "nobel"]).forEach((t) => {
      let r = multiunit_workflows.find((e) => {
        let r = e.brand.toLowerCase();
        if (t === "astra") {
          return r.includes("astra");
        } else if (t === "straumann") {
          return r.includes("straumann");
        } else {
          return t === "nobel" && r.includes("nobel");
        }
      });
      if (r) {
        (r.multi_unit_abutments || []).forEach((t) => {
          if (!O || t.platform === O) {
            Object.entries(t.angulations || {}).forEach(([l, s]) => {
              let a = l === "straight" ? "0" : l === "17_degree" ? "17" : "30";
              if (!q || a === q) {
                (s.gingival_heights || []).forEach((l) => {
                  if (U === null || l.height === U) {
                    (H !== null ? [H] : [true, false]).forEach((s) => {
                      e.push({
                        sku: l.sku,
                        brand: r.brand,
                        system: r.system,
                        platform: t.platform,
                        angle: a,
                        gingivalHeight: l.height,
                        engaging: s,
                        name: `${r.brand} Multi-Unit ${t.platform} ${a}\xb0 GH${l.height}mm ${s ? "Engaging" : "Non-Engaging"}`,
                        sub: `Platform ${t.platform} \xb7 ${a}\xb0 \xb7 GH${l.height}mm \xb7 ${s ? "Engaging" : "Non-Engaging"}`,
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    return e;
  }, [I, O, H, U, q]);
  let eu = useMemo(() => {
    let e = $;
    if (J) {
      e = e.filter(
        (e) => e.platform === J || e.platform === "IPD" || e.platform === "ALL",
      );
    }
    if (ee !== null) {
      e = e.filter((e) => e.angle === ee || e.angle === null);
    }
    if (Y) {
      e = e.filter((e) => e.source === Y);
    }
    return e;
  }, [J, ee, Y]);
  useMemo(() => Array.from(new Set($.map((e) => e.source))), []);
  let ex = useMemo(() => {
    if (!er || K !== "Implant") {
      return null;
    }
    let e = es.find((e) => e.sku === er);
    if (e) {
      return ea.find((t) => t.platform === e.platform) ?? null;
    } else {
      return null;
    }
  }, [er, K, es, ea]);
  let ep = useMemo(() => {
    if (!er || K !== "Implant") {
      return null;
    }
    let e = es.find((e) => e.sku === er);
    if (!e) {
      return null;
    }
    let t = en.filter((t) => t.platform === e.platform);
    return t[1] ?? t[0] ?? null;
  }, [er, K, es, en]);
  let eg = eo
    .map((e) => ({
      platform: e,
      items: ei.filter((t) => t.platform === e),
    }))
    .filter((e) => e.items.length);
  useMemo(() => {
    let e = eu.filter((e) => e.source === "Astra Dentsply");
    let t = eu.filter((e) => e.source !== "Astra Dentsply");
    return {
      astraByPlatform: ["XS", "S", "M", "L"]
        .map((t) => ({
          platform: t,
          items: e.filter((e) => e.platform === t || e.platform === "ALL"),
        }))
        .filter((e) => e.items.length),
      ipdBySrc: Array.from(new Set(t.map((e) => e.source)))
        .map((e) => ({
          src: e,
          items: t.filter((t) => t.source === e),
        }))
        .filter((e) => e.items.length),
    };
  }, [eu]);
  let eb = [
    {
      id: "Implant",
      icon: PackageIcon,
      label: "Implants",
    },
    {
      id: "Cover Screw",
      icon: LayersIcon,
      label: "Cover Screws",
    },
    {
      id: "Healing Abutment",
      icon: FlaskConicalIcon,
      label: "Healing Abutments",
    },
    {
      id: "Multiunit Abutment",
      icon: Link2Icon,
      label: "Multi-Unit",
    },
  ];
  if (!l) {
    return (
      <div className="pb-10">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Case
          </Link>
          <h1 className="text-2xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground text-sm">
            Browse and select components for your implant cases
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
          <button
            onClick={() => a("surgical")}
            className="group p-8 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FlaskConicalIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Surgical Kits</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Implants, cover screws, and healing abutments for surgical phase
              procedures
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Implants
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Cover Screws
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Healing Abutments
              </span>
            </div>
          </button>
          <button
            onClick={() => a("multiunit")}
            className="group p-8 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Link2Icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Multi-Unit Components</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Multi-unit abutments and workflow-specific components for
              full-arch restorations
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Multi-Unit Abutments
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Digital Components
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Conventional Components
              </span>
            </div>
          </button>
          <button
            onClick={() => a("prosthetic")}
            className="group p-8 rounded-2xl border-2 border-border hover:border-primary bg-card hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <PackageIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">Prosthetic Components</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Impression copings, analogs, scan bodies, and titanium bases for
              prosthetic phase
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Impression Copings
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Scan Bodies
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Ti-Bases
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                Analogs
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }
  let eh =
    l === "surgical"
      ? eb.filter((e) => e.id !== "Multiunit Abutment")
      : l === "multiunit"
        ? eb.filter((e) => e.id === "Multiunit Abutment")
        : [];
  return (
    <div className="pb-10">
      {l !== "prosthetic" && (
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => a(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to categories
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold capitalize">
              {l} Components
            </h1>
            <p className="text-sm text-muted-foreground">
              {l === "surgical"
                ? "Implants, cover screws, and healing abutments"
                : "Multi-unit abutments and workflow components"}
            </p>
          </div>
        </div>
      )}
      {l === "surgical" && (
        <div className="mb-6 p-4 rounded-xl border bg-card">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Select Brand
              </label>
              <select
                value={n}
                onChange={(e) => {
                  i(e.target.value);
                  b("");
                  Q(null);
                  el(null);
                }}
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">All Brands</option>
                {W.map((e) => (
                  <option value={e} key={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                Select System
              </label>
              <select
                value={d}
                onChange={(e) => {
                  b(e.target.value);
                  Q(null);
                  el(null);
                }}
                disabled={!n}
                className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Systems</option>
                {n &&
                  z[n]?.map((e) => (
                    <option value={e} key={e}>
                      {e}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          {n && d && (
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              Showing:{" "}
              <span className="font-semibold text-primary">
                {n} — {d}
              </span>
            </div>
          )}
        </div>
      )}
      {l === "surgical" && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-4 rounded-xl bg-secondary/30 border border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <SlidersHorizontalIcon className="w-3.5 h-3.5" /> Platform:
          </div>
          {eo.map((e) => {
            let r = v[e] ?? {
              hex: "hsl(var(--primary))",
              label: e,
            };
            let l = F.platforms[e]?.diameter;
            let s = J === e;
            return (
              <button
                onClick={() => Q(s ? null : e)}
                className="px-3 py-1.5 rounded-full text-xs font-mono border transition-all"
                style={{
                  borderColor: s ? r.hex : "transparent",
                  backgroundColor: s ? `${r.hex}20` : "hsl(var(--secondary))",
                  color: s ? r.hex : "hsl(var(--muted-foreground))",
                }}
                key={e}
              >
                {e} · Ø{l}
              </button>
            );
          })}
          {J && (
            <button
              onClick={() => Q(null)}
              className="text-xs text-muted-foreground hover:text-foreground ml-auto"
            >
              Clear ×
            </button>
          )}
        </div>
      )}
      {K === "Multiunit Abutment" && l === "multiunit" && (
        <div className="space-y-3 mb-6 p-4 rounded-xl bg-secondary/20 border border-border/50">
          <div>
            <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
              Brand
            </label>
            <div className="flex gap-2">
              {[
                {
                  v: null,
                  label: "All",
                },
                {
                  v: "astra",
                  label: "Astra Tech",
                },
                {
                  v: "straumann",
                  label: "Straumann",
                },
                {
                  v: "nobel",
                  label: "Nobel",
                },
              ].map(({ v: e, label: r }) => (
                <button
                  onClick={() => {
                    R(e);
                    D(null);
                    E(null);
                    G(null);
                    X(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${I === e ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                  key={String(e)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {I &&
            ((e = [
              {
                brand: "astra",
                platforms: ["XS", "S", "M", "L", "XL"],
              },
              {
                brand: "straumann",
                platforms: ["NC", "RC"],
              },
              {
                brand: "nobel",
                platforms: ["NP", "RP", "WP"],
              },
            ].find((e) => e.brand === I)) ? (
              <div>
                <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                  Platform
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      D(null);
                      E(null);
                      G(null);
                      X(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${O === null ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                  >
                    All
                  </button>
                  {e.platforms.map((e) => (
                    <button
                      onClick={() => {
                        D(e);
                        E(null);
                        G(null);
                        X(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${O === e ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                      key={e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ) : null)}
          {I && (
            <div>
              <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    E(null);
                    G(null);
                    X(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${H === null ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                >
                  All
                </button>
                {[
                  {
                    v: true,
                    label: "Engaging",
                  },
                  {
                    v: false,
                    label: "Non-Engaging",
                  },
                ].map(({ v: e, label: r }) => (
                  <button
                    onClick={() => {
                      E(e);
                      G(null);
                      X(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${H === e ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                    key={String(e)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          {I && (
            <div>
              <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                Gingival Height
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    G(null);
                    X(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${U === null ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                >
                  All
                </button>
                {[1.5, 2.5, 3.5].map((e) => (
                  <button
                    onClick={() => {
                      G(e);
                      X(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${U === e ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                    key={e}
                  >
                    {e}mm
                  </button>
                ))}
              </div>
            </div>
          )}
          {I && (
            <div>
              <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-2 block">
                Angulation
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => X(null)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${q === null ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                >
                  All
                </button>
                {["0", "17", "30"].map((e) => (
                  <button
                    onClick={() => X(e)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${q === e ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                    key={e}
                  >
                    {e}°
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {l !== "prosthetic" && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {eh.map(({ id: e, icon: _Component3, label: l }) => (
            <button
              onClick={() => {
                V(e);
                el(null);
              }}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor:
                  K === e ? "hsl(var(--primary))" : "hsl(var(--border))",
                backgroundColor:
                  K === e ? "hsl(var(--primary)/0.1)" : "transparent",
                color:
                  K === e
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
              }}
              key={e}
            >
              <_Component3 className="w-4 h-4" /> {l}
            </button>
          ))}
        </div>
      )}
      {l === "surgical" && K === "Implant" && (
        <div className="space-y-6">
          {eg.map(({ platform: e, items: r }) => (
            <div key={e}>
              <_ platform={e} entry={F} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {r.map((e) => (
                  <M
                    sku={e.sku}
                    name={`${e.type} \xd8${e.diameter}`}
                    sub={`${e.length}mm length`}
                    isCurrent={false}
                    isSelected={er === e.sku}
                    onSelect={() => el(er === e.sku ? null : e.sku)}
                    key={e.sku}
                  />
                ))}
              </div>
            </div>
          ))}
          {er && ex && ep && (
            <div className="mt-8 p-5 rounded-xl border border-primary/30 bg-primary/5">
              <p className="text-sm font-semibold mb-4">
                Recommended kit for this implant:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-[10px] font-mono text-muted-foreground mb-1">
                    Cover Screw (auto-matched)
                  </div>
                  <div className="text-sm font-medium">{ex.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-1">
                    {ex.sku}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <div className="text-[10px] font-mono text-muted-foreground mb-1">
                    Healing Abutment (auto-matched)
                  </div>
                  <div className="text-sm font-medium">{ep.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-1">
                    {ep.sku}
                  </div>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <ShoppingCartIcon className="w-4 h-4" /> Add this kit & go to
                case
              </Link>
            </div>
          )}
        </div>
      )}
      {l === "surgical" && K === "Cover Screw" && (
        <div className="space-y-4">
          {eo
            .filter((e) => !J || e === J)
            .map((e) => {
              let r = ed.filter((t) => t.platform === e);
              if (r.length) {
                return (
                  <div key={e}>
                    <_ platform={e} entry={F} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {r.map((e) => (
                        <M
                          sku={e.sku}
                          name={e.name}
                          sub={`\xd8${e.diameter}mm connection`}
                          isCurrent={false}
                          isSelected={er === e.sku}
                          onSelect={() => el(er === e.sku ? null : e.sku)}
                          key={e.sku}
                        />
                      ))}
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}
        </div>
      )}
      {l === "surgical" && K === "Healing Abutment" && (
        <div className="space-y-4">
          {eo
            .filter((e) => !J || e === J)
            .map((e) => {
              let r = em.filter((t) => t.platform === e);
              if (r.length) {
                return (
                  <div key={e}>
                    <_ platform={e} entry={F} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {r.map((e) => (
                        <M
                          sku={e.sku}
                          name={e.name}
                          sub={`H${e.height}mm \xb7 \xd8${e.headDiam}mm head`}
                          isCurrent={false}
                          isSelected={er === e.sku}
                          onSelect={() => el(er === e.sku ? null : e.sku)}
                          key={e.sku}
                        />
                      ))}
                    </div>
                  </div>
                );
              } else {
                return null;
              }
            })}
        </div>
      )}
      {K === "Multiunit Abutment" && l === "multiunit" && (
        <div className="space-y-8">
          {["Astra Tech", "Straumann", "Nobel Biocare"].map((e) => {
            let r = ec.filter((t) => t.brand === e);
            if (r.length === 0) {
              return null;
            }
            let l = Array.from(new Set(r.map((e) => e.platform))).map((e) => ({
              platform: e,
              items: r.filter((t) => t.platform === e),
            }));
            return (
              <div key={e}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h2 className="text-sm font-semibold font-mono uppercase tracking-wider text-primary">
                    {e}
                  </h2>
                  <span className="text-xs text-muted-foreground ml-2">
                    {r.length} items
                  </span>
                </div>
                <div className="space-y-4">
                  {l.map(({ platform: e, items: r }) => (
                    <div key={e}>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-3 bg-secondary/30 border border-border/50">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Platform {e}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground/50">
                          {r.length} items
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {r.map((e) => (
                          <M
                            sku={e.sku}
                            name={e.name}
                            sub={e.sub}
                            isSelected={er === `${e.sku}-${e.engaging}`}
                            onSelect={() =>
                              el(
                                er === `${e.sku}-${e.engaging}`
                                  ? null
                                  : `${e.sku}-${e.engaging}`,
                              )
                            }
                            key={`${e.sku}-${e.engaging}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {ec.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed rounded-2xl text-muted-foreground text-sm">
              No multi-unit abutments match the selected filters.
              <br />
              <span className="text-xs mt-2 block">
                Try adjusting your filter selections above.
              </span>
            </div>
          )}
        </div>
      )}
      {l === "prosthetic" && (
        <div className="space-y-6">
          <div className="mb-6 p-4 rounded-xl border bg-card">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                  Select Brand
                </label>
                <select
                  value={f}
                  onChange={(e) => {
                    C(e.target.value);
                    A("");
                    L("");
                    P("");
                  }}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">All Brands</option>
                  <option value="astra">Astra Tech EV</option>
                  <option value="nobel">Nobel Biocare CC</option>
                  <option value="straumann">Straumann BLX</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                  Select Workflow
                </label>
                <select
                  value={S}
                  onChange={(e) => {
                    A(e.target.value);
                    L("");
                    P("");
                  }}
                  disabled={!f}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Workflows</option>
                  <option value="digital">Digital</option>
                  <option value="conventional">Conventional</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                  Select Platform
                </label>
                <select
                  value={T}
                  onChange={(e) => {
                    L(e.target.value);
                    P("");
                  }}
                  disabled={!f}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Platforms</option>
                  {f === "astra" &&
                    ["XS", "S", "M", "L", "XL"].map((e) => (
                      <option value={e} key={e}>
                        {e}
                      </option>
                    ))}
                  {f === "nobel" &&
                    ["3.0", "NP", "RP", "WP"].map((e) => (
                      <option value={e} key={e}>
                        {e}
                      </option>
                    ))}
                  {f === "straumann" &&
                    ["RB", "WB"].map((e) => (
                      <option value={e} key={e}>
                        {e}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2 block">
                  Select Technique
                </label>
                <select
                  value={B}
                  onChange={(e) => P(e.target.value)}
                  disabled={S !== "conventional"}
                  className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">All Techniques</option>
                  <option value="open_tray">Open Tray</option>
                  <option value="closed_tray">Closed Tray</option>
                </select>
              </div>
            </div>
          </div>
          {(() => {
            let e = prosthetic_workflows.filter((e) => {
              if (f) {
                let t = e.brand.toLowerCase();
                if (
                  (f === "astra" && !t.includes("astra")) ||
                  (f === "nobel" && !t.includes("nobel")) ||
                  (f === "straumann" && !t.includes("straumann"))
                ) {
                  return false;
                }
              }
              return true;
            });
            if (e.length === 0) {
              return (
                <div className="py-12 text-center border-2 border-dashed rounded-2xl text-muted-foreground text-sm">
                  No prosthetic components match the selected filters.
                  <br />
                  <span className="text-xs mt-2 block">
                    Try adjusting your filter selections above.
                  </span>
                </div>
              );
            }
            function r(e, t) {
              let r = [];
              for (let l of e) {
                for (let e of l.platforms || []) {
                  if ((!t || e === t) && l.skus?.[e]) {
                    r.push({
                      sku: l.skus[e],
                      platform: e,
                      spec: l.note || "",
                      length: "",
                      componentType: l.type,
                    });
                  }
                }
              }
              return r;
            }
            return e.map((e) => {
              let l = [];
              let s = e.workflow;
              if (!s) {
                return (
                  <div
                    className="py-12 text-center text-muted-foreground text-sm"
                    key={e.brand}
                  >
                    No workflow data for {e.brand}
                  </div>
                );
              }
              if (!S || S === "digital") {
                let e = s.digital?.components || [];
                let t = r(
                  e.filter((e) => e.type === "scan_body"),
                  T,
                );
                let a = r(
                  e.filter((e) => e.type === "printed_model_analog"),
                  T,
                );
                let n = r(
                  e.filter((e) => e.type === "ti_base"),
                  T,
                );
                if (t.length > 0) {
                  l.push({
                    title: "Digital — Scan Components",
                    items: t,
                  });
                }
                if (a.length > 0) {
                  l.push({
                    title: "Digital — Printed Model Analogs",
                    items: a,
                  });
                }
                if (n.length > 0) {
                  l.push({
                    title: "Digital — Titanium Bases",
                    items: n,
                  });
                }
              }
              if (!S || S === "conventional") {
                let e = s.conventional;
                if (!B || B === "open_tray") {
                  let t = e?.open_tray?.components || [];
                  let s = r(
                    t.filter((e) => e.type === "pickup"),
                    T,
                  );
                  let a = r(
                    t.filter((e) => e.type === "analog"),
                    T,
                  );
                  let n = r(
                    t.filter((e) => e.type === "ti_base"),
                    T,
                  );
                  if (s.length > 0) {
                    l.push({
                      title: "Conventional — Open Tray Copings",
                      items: s,
                    });
                  }
                  if (a.length > 0) {
                    l.push({
                      title: "Conventional — Open Tray Analogs",
                      items: a,
                    });
                  }
                  if (n.length > 0) {
                    l.push({
                      title: "Conventional — Open Tray Ti-Bases",
                      items: n,
                    });
                  }
                }
                if (!B || B === "closed_tray") {
                  let t = e?.closed_tray?.components || [];
                  let s = r(
                    t.filter((e) => e.type === "transfer"),
                    T,
                  );
                  let a = r(
                    t.filter((e) => e.type === "analog"),
                    T,
                  );
                  let n = r(
                    t.filter((e) => e.type === "ti_base"),
                    T,
                  );
                  if (s.length > 0) {
                    l.push({
                      title: "Conventional — Closed Tray Copings",
                      items: s,
                    });
                  }
                  if (a.length > 0) {
                    l.push({
                      title: "Conventional — Closed Tray Analogs",
                      items: a,
                    });
                  }
                  if (n.length > 0) {
                    l.push({
                      title: "Conventional — Closed Tray Ti-Bases",
                      items: n,
                    });
                  }
                }
              }
              if (l.length === 0) {
                return null;
              } else {
                return (
                  <div key={e.brand}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <h2 className="text-sm font-semibold font-mono uppercase tracking-wider text-primary">
                        {e.brand}
                      </h2>
                    </div>
                    <div className="space-y-6">
                      {l.map((e) => (
                        <div key={e.title}>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg mb-3 bg-secondary/30 border border-border/50">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {e.title}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground/50">
                              {e.items.length} items
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {e.items.map((e) => (
                              <M
                                sku={e.sku}
                                name={`${e.platform}${e.spec ? ` — ${e.spec}` : ""}${e.length ? ` — ${e.length}` : ""}`}
                                sub={`SKU: ${e.sku}`}
                                isSelected={er === e.sku}
                                onSelect={() => el(er === e.sku ? null : e.sku)}
                                key={e.sku}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            });
          })()}
        </div>
      )}
    </div>
  );
}
function I() {
  let e = useSearchParams();
  let r = e.get("tooth");
  let s = e.get("itemId");
  let a = e.get("category");
  let n = e.get("sku");
  let o = e.get("diameter");
  let i = e.get("catalogKey");
  let d = e.get("stage");
  let m = e.get("brand");
  let c = e.get("workflow");
  let u = e.get("conventionalType");
  let x = !!r && !!s && !!a && !!n;
  return (
    <div className="min-h-screen">
      <div className="container py-8">
        {x ? (
          <B
            tooth={parseInt(r)}
            itemId={s}
            category={a}
            currentSku={n}
            toothDiameter={o ? parseFloat(o) : 4.2}
            catalogKey={i}
            stage={d}
            multiunitBrand={m}
            multiunitWorkflow={c}
            multiunitConventionalType={u}
          />
        ) : (
          <P />
        )}
      </div>
    </div>
  );
}
export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8 text-muted-foreground">Loading…</div>
      }
    >
      <I />
    </Suspense>
  );
}
