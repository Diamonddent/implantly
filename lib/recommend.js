import multiunit_abutments from "@/data/multiunit-abutments.json";
import prosthetic_workflows from "@/data/prosthetic-workflows.json";
import {
  SURGICAL_CATALOG,
  surgicalCatalogKey,
  resolveSurgicalCatalog,
} from "@/lib/surgical-catalog";
import multiunit_workflows from "@/data/multiunit-workflows.json";

let g = multiunit_abutments.astra_multiunit.platforms;
let m = prosthetic_workflows;
function s(e) {
  return m.find((t) => {
    let i = t.brand.toLowerCase();
    if (e === "astra") {
      return i.includes("astra");
    } else if (e === "straumann") {
      return i.includes("straumann");
    } else if (e === "nobel") {
      return i.includes("nobel");
    } else if (e === "megagen") {
      return i.includes("megagen");
    } else {
      return e === "roott" && i.includes("roott");
    }
  });
}
function l(e) {
  return Array.from(new Set(e)).sort((e, t) => e - t);
}
function r(e, t) {
  if (e === 0) {
    return 0;
  } else if (t) {
    return Object.values(t.platforms)
      .map((e) => e.diameter)
      .reduce((t, i) => (Math.abs(i - e) < Math.abs(t - e) ? i : t));
  } else {
    return l(
      SURGICAL_CATALOG.flatMap((e) =>
        Object.values(e.platforms).map((e) => e.diameter),
      ),
    ).reduce((t, i) => (Math.abs(i - e) < Math.abs(t - e) ? i : t));
  }
}
function u(e, t) {
  return (
    Object.entries(e.platforms).find(([, e]) => e.diameter === t)?.[0] ?? ""
  );
}
function o(e, t) {
  if (t) {
    let i = r(e, t);
    if (i === 0) {
      return "";
    } else {
      return u(t, i);
    }
  }
  let i = r(e);
  if (i === 0) {
    return "";
  }
  for (let e of SURGICAL_CATALOG) {
    let t = u(e, i);
    if (t) {
      return t;
    }
  }
  return "";
}
function h(e, t, i) {
  if (t === 0) {
    return 0;
  }
  let a = (function (e, t) {
    if (t) {
      let i = o(e, t);
      if (!i) {
        return [];
      }
      let a = t.implants.find((e) => e.platform === i);
      return a?.lengths || [];
    }
    let i = r(e);
    let a = new Set();
    for (let e of SURGICAL_CATALOG) {
      let t = u(e, i);
      if (!t) {
        continue;
      }
      let n = e.implants.find((e) => e.platform === t);
      n?.lengths.forEach((e) => a.add(e));
    }
    return l(Array.from(a));
  })(e, i);
  if (a.length) {
    return a.reduce((e, i) => (Math.abs(i - t) < Math.abs(e - t) ? i : e));
  } else {
    return t;
  }
}
function d(e) {
  let t = surgicalCatalogKey(SURGICAL_CATALOG[0]);
  let i = Infinity;
  for (let a of SURGICAL_CATALOG) {
    let g = r(e.diameter, a);
    let m = h(e.diameter, e.length, a);
    let s = Math.abs(e.diameter - g) + Math.abs(e.length - m);
    if (s < i) {
      i = s;
      t = surgicalCatalogKey(a);
    }
  }
  return t;
}
function _(e, t, i) {
  let a = t.platforms[i]?.diameter ?? 0;
  let n = h(e.diameter, e.length, t);
  return Math.abs(e.diameter - a) + Math.abs(e.length - n);
}
function p(e) {
  return (
    !!e &&
    e.diameter !== 0 &&
    e.length !== 0 &&
    e.stage !== "" &&
    (e.stage === "surgical" ||
      (e.stage === "prosthetic"
        ? !!e.prostheticBrand &&
          !!e.prostheticWorkflow &&
          (e.prostheticWorkflow === "digital" || !!e.prostheticConventionalType)
        : e.stage !== "multiunit" ||
          (!!e.multiunitBrand &&
            !!e.multiunitPlatform &&
            e.multiunitEngaging !== undefined &&
            !!e.multiunitGingivalHeight &&
            !!e.multiunitAngulation &&
            !!e.multiunitWorkflow &&
            (e.multiunitWorkflow === "digital" ||
              !!e.multiunitConventionalType))))
  );
}
export function createDefaultToothCase(e) {
  return {
    tooth: e,
    status: "",
    region: e >= 11 && e <= 28 ? "Upper" : "Lower",
    toothType: "",
    diameter: 4,
    length: 10,
    design: "",
    stage: "",
    notes: "",
  };
}
export function generateKit(e) {
  let t;
  if (!p(e)) {
    return [];
  }
  let a = (t = e.surgicalCatalogKey)
    ? resolveSurgicalCatalog(t)
    : resolveSurgicalCatalog(d(e));
  if (e.stage === "multiunit") {
    let t = [];
    let a = e.multiunitBrand;
    let n = e.multiunitPlatform;
    let g = e.multiunitEngaging;
    let m = e.multiunitGingivalHeight;
    let s = e.multiunitAngulation;
    if (!a || !n || g === undefined || !m || !s) {
      return t;
    }
    let l = multiunit_workflows.find((e) => {
      let t = e.brand.toLowerCase();
      if (a === "astra") {
        return t.includes("astra");
      } else if (a === "straumann") {
        return t.includes("straumann");
      } else if (a === "nobel") {
        return t.includes("nobel");
      } else if (a === "megagen") {
        return t.includes("megagen");
      } else {
        return a === "roott" && t.includes("roott");
      }
    });
    if (!l) {
      return t;
    }
    if (e.selectedSystemId && e.selectedSystemId.startsWith("mua-")) {
      let t = e.selectedSystemId.split("-");
      if (t.length >= 5) {
        let e = parseFloat(t[4]);
        if (!isNaN(e)) {
          m = e;
        }
      }
    }
    let r = l.multi_unit_abutments?.find((e) => e.platform === n);
    if (!r) {
      return t;
    }
    let u =
      r.angulations?.[
        s === "0" ? "straight" : s === "17" ? "17_degree" : "30_degree"
      ];
    if (!u) {
      return t;
    }
    let o = u.gingival_heights || [];
    let h = o.find((e) => e.height === m) ?? o[0];
    if (h) {
      t.push({
        id: `MUA-${a}-${n}-${s}-${m}-${g}`,
        category: "Multiunit Abutment",
        name: `${l.brand} Multi-Unit ${n} ${s}\xb0 GH${m}mm ${g ? "Engaging" : "Non-Engaging"}`,
        sku: h.sku,
        qty: 1,
        price: 195,
        editable: true,
      });
    }
    let d = e.multiunitWorkflow || (g ? "digital" : "conventional");
    let _ = e.multiunitConventionalType || (g ? undefined : "open");
    let p = l.workflow;
    let A = [];
    if (d === "digital") {
      A = p?.digital?.components || [];
    } else if (d === "conventional") {
      A =
        p?.conventional?.[_ === "closed" ? "closed_tray" : "open_tray"]
          ?.components || [];
    }
    A.forEach((e) => {
      let i = e.type
        .replace(/_/g, " ")
        .split(" ")
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
        .join(" ");
      t.push({
        id: `${e.type}-${a}`,
        category: i,
        name: e.name,
        sku: e.sku || e.skus?.[0] || "N/A",
        qty: 1,
        price:
          e.type === "bridge_screw"
            ? 25
            : e.type === "healing_cap"
              ? 35
              : e.type === "scan_body"
                ? 85
                : e.type === "printed_model_analog"
                  ? 45
                  : (e.type === "pickup" || e.type, 55),
      });
    });
    return t;
  }
  if (e.stage === "prosthetic") {
    let t = [];
    let i = e.prostheticBrand;
    let a = e.prostheticWorkflow;
    let n = e.prostheticConventionalType;
    if (!i || !a || (a === "conventional" && !n)) {
      return t;
    }
    let m = s(i);
    if (!m) {
      return t;
    }
    let l = r(e.diameter);
    let u = e.prostheticPlatform || "";
    if (!u) {
      let e = Object.entries(m.platforms || {});
      let t = e.find(([, e]) => Math.abs(e.diameter - l) < 0.5);
      u = t ? t[0] : e[0]?.[0] || "";
    }
    if (!u) {
      return t;
    }
    function g(e, t) {
      let i = e.find((e) => e.type === t);
      let a = i?.skus?.[u];
      if (a) {
        return {
          sku: a,
          name: i.name,
        };
      } else {
        return null;
      }
    }
    if (a === "digital") {
      let e = m.workflow?.digital?.components || [];
      let a = g(e, "scan_body");
      let n = g(e, "printed_model_analog");
      let s = g(e, "ti_base");
      if (a) {
        t.push({
          id: `scan-${i}`,
          category: "Scan Body",
          name: `${a.name} ${u}`,
          sku: a.sku,
          qty: 1,
          price: 85,
        });
      }
      if (s) {
        t.push({
          id: `ti-base-${i}`,
          category: "Ti-Base",
          name: `${s.name} ${u}`,
          sku: s.sku,
          qty: 1,
          price: 120,
        });
      }
      if (n) {
        t.push({
          id: `analog-dig-${i}`,
          category: "Analog",
          name: `${n.name} ${u}`,
          sku: n.sku,
          qty: 1,
          price: 45,
        });
      }
    } else {
      let e =
        m.workflow?.conventional?.[n === "closed" ? "closed_tray" : "open_tray"]
          ?.components || [];
      let a = g(e, n === "open" ? "pickup" : "transfer");
      let s = g(e, "analog");
      let l = g(e, "ti_base");
      if (a) {
        let e = `${n === "open" ? "Open Tray" : "Closed Tray"} ${a.name} ${u}`;
        t.push({
          id: `coping-${i}`,
          category: "Impression Coping",
          name: e,
          sku: a.sku,
          qty: 1,
          price: 55,
        });
      }
      if (s) {
        t.push({
          id: `analog-conv-${i}`,
          category: "Analog",
          name: `${s.name} ${u}`,
          sku: s.sku,
          qty: 1,
          price: 45,
        });
      }
      if (l) {
        t.push({
          id: `ti-design-${i}`,
          category: "Temporary Abutment",
          name: `${l.name} ${u}`,
          sku: l.sku,
          qty: 1,
          price: 65,
        });
      }
    }
    return t;
  }
  let m = o(e.diameter, a);
  if (e.selectedSystemId && e.selectedSystemId.includes("|")) {
    let t = e.selectedSystemId.split("|");
    if (t.length >= 2) {
      m = t[1];
    }
  }
  let l = a.platforms[m]?.diameter ?? r(e.diameter, a);
  let u = h(e.diameter, e.length, a);
  let _ = [];
  let A = a.implants.find((e) => e.platform === m);
  _.push({
    id: `IMP-${m}-${u}`,
    category: "Implant",
    name: `${a.brand} ${A?.type} \xd8${l}x${u}`,
    sku: `REF-${m}-${(A?.type ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")}-${u}`,
    qty: 1,
    price: 285,
  });
  let y = a.coverScrews.find((e) => e.platform === m);
  if (y) {
    _.push({
      id: `CS-${m}`,
      category: "Cover Screw",
      name: y.name,
      sku: y.sku,
      qty: 1,
      price: 45,
    });
  }
  let k = a.healingAbutments.find((e) => e.platform === m);
  if (k) {
    _.push({
      id: `HA-${m}`,
      category: "Healing Abutment",
      name: `Healing Abutment \xd8${k.headDiam} / H:${k.heights[0]}mm`,
      sku: `HA-${m}-${k.heights[0]}`,
      qty: 1,
      price: 55,
    });
  }
  return _;
}
export function getMultiunitUiPlatform(e) {
  let t = r(e);
  if (t === 0) {
    return "";
  }
  for (let e of SURGICAL_CATALOG) {
    let i = u(e, t);
    if (i && g[i]) {
      return i;
    }
  }
  return u(SURGICAL_CATALOG[0], t);
}
export { o as getPlatformByDiameter };
export { d as inferBestSurgicalCatalogKey };
export { p as isCaseReady };
export function recommendImplants(e) {
  if (!p(e)) {
    return [];
  }
  if (e.stage === "multiunit") {
    let t = [];
    let a = e.multiunitBrand;
    let n = e.multiunitPlatform;
    let g = e.multiunitEngaging;
    let m = e.multiunitGingivalHeight;
    let s = e.multiunitAngulation;
    if (!a || !n || g === undefined || !m || !s) {
      return t;
    }
    let l = multiunit_workflows.find((e) => {
      let t = e.brand.toLowerCase();
      if (a === "astra") {
        return t.includes("astra");
      } else if (a === "straumann") {
        return t.includes("straumann");
      } else if (a === "nobel") {
        return t.includes("nobel");
      } else if (a === "megagen") {
        return t.includes("megagen");
      } else {
        return a === "roott" && t.includes("roott");
      }
    });
    if (!l) {
      return t;
    }
    let u = l.multi_unit_abutments?.find((e) => e.platform === n);
    if (!u) {
      return t;
    }
    let o =
      u.angulations?.[
        s === "0" ? "straight" : s === "17" ? "17_degree" : "30_degree"
      ];
    if (!o) {
      return t;
    }
    let h = o.gingival_heights || [];
    let d = h.find((e) => e.height === m);
    let _ = h.find((e) => e.height !== m);
    if (d) {
      let i = g ? "Engaging" : "Non-Engaging";
      t.push({
        id: `mua-${a}-${n}-${s}-${m}-${g}-primary`,
        name: `${l.brand} Multi-Unit ${n} ${s}\xb0 GH${m}mm ${i}`,
        brand: `${l.brand} — ${l.system}`,
        matchScore: 100,
        matchDeltaMm: 0,
        features: [
          `Platform: ${n} (\xd8${r(e.diameter)}mm)`,
          `Type: ${i}`,
          `Angulation: ${s}\xb0`,
          `Gingival Height: ${m}mm`,
          `SKU: ${d.sku}`,
        ],
      });
    }
    if (_) {
      let i = Math.abs(_.height - m);
      let u = Math.max(0, Math.round(95 - i * 18));
      let o = g ? "Engaging" : "Non-Engaging";
      t.push({
        id: `mua-${a}-${n}-${s}-alt-${g}`,
        name: `${l.brand} Multi-Unit ${n} ${s}\xb0 GH${_.height}mm ${o}`,
        brand: `${l.brand} — ${l.system}`,
        matchScore: u,
        matchDeltaMm: i,
        features: [
          `Platform: ${n} (\xd8${r(e.diameter)}mm)`,
          `Type: ${o}`,
          `Angulation: ${s}\xb0`,
          `Gingival Height: ${_.height}mm (alternative)`,
          `SKU: ${_.sku}`,
        ],
      });
    }
    return t;
  }
  if (e.stage === "prosthetic") {
    let i = [];
    let a = e.prostheticBrand;
    let n = e.prostheticWorkflow;
    let g = e.prostheticConventionalType;
    if (!a || !n || (n === "conventional" && !g)) {
      return i;
    }
    let m = s(a);
    if (!m) {
      return i;
    }
    let l = e.prostheticPlatform || Object.keys(m.platforms || {})[0] || "";
    let r = m.platforms?.[l];
    let u = r ? `\xd8${r.diameter}mm` : "";
    function t(e, t, i) {
      let a = (t?.components || []).find((t) => t.type === e);
      let n = a?.skus?.[l];
      if (n) {
        return `${i}: ${a.name} (SKU ${n})`;
      } else {
        return `${i}: ${a?.name || "—"} (no SKU)`;
      }
    }
    let o = [
      `Brand: ${m.brand} — ${m.system || ""}`,
      `Workflow: ${n === "digital" ? "Digital" : `Conventional (${g === "open" ? "Open Tray" : "Closed Tray"})`}`,
      `Platform: ${l} ${u}`,
    ];
    if (n === "digital") {
      let e = m.workflow?.digital;
      o.push(t("scan_body", e, "Scan Body"));
      o.push(t("printed_model_analog", e, "Printed Analog"));
      o.push(t("ti_base", e, "Ti-Base"));
    } else {
      let e =
        m.workflow?.conventional?.[
          g === "closed" ? "closed_tray" : "open_tray"
        ];
      o.push(t(g === "open" ? "pickup" : "transfer", e, "Coping"));
      o.push(t("analog", e, "Analog"));
      o.push(t("ti_base", e, "Ti-Base"));
    }
    i.push({
      id: `prosth-${a}-${n}${g ? `-${g}` : ""}`,
      name: `${m.brand} ${n === "digital" ? "Digital" : "Conventional"} Prosthetic — ${l}`,
      brand: m.brand,
      matchScore: 100,
      matchDeltaMm: 0,
      features: o,
    });
    return i;
  }
  let a = (t, i, a, g) => {
    let m;
    let s = t.implants.find((e) => e.platform === i);
    let l = t.coverScrews.find((e) => e.platform === i);
    let r = t.healingAbutments.find((e) => e.platform === i);
    let u = t.platforms[i].diameter;
    let o = h(e.diameter, e.length, t);
    let d = Math.round(Math.max(0, 1 - Math.min(g, 4) / 4) * 100);
    return {
      id: ((m = a || "primary"), `${surgicalCatalogKey(t)}|${i}|${m}`),
      name: `${s?.type || "Implant"}${a ? ` (${a})` : ""}`,
      brand: `${t.brand} — ${t.system}`,
      surgicalCatalogKey: surgicalCatalogKey(t),
      matchScore: d,
      matchDeltaMm: Math.round(g * 10) / 10,
      coverScrewName: l?.name,
      healingAbutmentName: r
        ? `${r.name} ${i} \xd8${r.headDiam} / H:${r.heights[0]}mm`
        : undefined,
      features: [
        `Offered: \xd8${u}mm \xd7 ${o}mm`,
        `System: ${t.brand} ${t.system} — ${s?.type}`,
        `Cover screw: ${l?.name ?? "—"}`,
        `Healing abutment: \xd8${r?.headDiam ?? "—"} / H:${r?.heights[0] ?? "—"}mm`,
      ],
    };
  };
  let g = (t) => {
    let i = e.design;
    let a = t.system.toLowerCase();
    let n = t.brand.toLowerCase();
    if (i === "tapered") {
      return (
        a.includes("blx") ||
        a.includes("prime taper") ||
        a.includes("nobelactive") ||
        a.includes("tapered") ||
        n.includes("megagen") ||
        n.includes("roott")
      );
    } else if (i === "parallel") {
      return (
        a.includes("nobelparallel") ||
        a.includes("parallel") ||
        a.includes("astra ev")
      );
    } else {
      return (
        i !== "mixed" || a.includes("blt") || a.includes("bone level tapered")
      );
    }
  };
  let m = [];
  for (let t of SURGICAL_CATALOG) {
    if (!g(t)) {
      continue;
    }
    let i = o(e.diameter, t);
    if (!i) {
      continue;
    }
    let n = Object.keys(t.platforms);
    let s = n.indexOf(i);
    let l = s > 0 ? n[s - 1] : null;
    let r = _(e, t, i);
    m.push({
      sys: a(t, i, "", r),
      score: r,
    });
    if (l) {
      let i = _(e, t, l);
      m.push({
        sys: a(t, l, "smaller connection", i),
        score: i,
      });
    }
  }
  m.sort((e, t) => e.score - t.score);
  return m.slice(0, 3).map((e) => e.sys);
}
export { r as snapDiameter };
