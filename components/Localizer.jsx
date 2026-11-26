"use client";

import { useEffect } from "react";
import { getLang } from "@/lib/locale";
import { AR, AR_RULES } from "@/lib/i18n-ar";

function tr(s) {
  const t = s.trim();
  if (!t || !/[A-Za-z]/.test(t)) return null;
  if (AR[t]) return s.replace(t, AR[t]);
  for (const [re, rep] of AR_RULES) {
    if (re.test(t)) return s.replace(t, t.replace(re, rep));
  }
  return null;
}

const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "svg"]);

// Translates the rendered UI to Arabic without touching the original components.
export function Localizer() {
  useEffect(() => {
    if (getLang() !== "ar") return;
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    const done = new WeakMap();
    const skip = (el) => {
      for (let p = el; p && p !== document.body; p = p.parentElement) {
        if (SKIP.has(p.nodeName) || p.dataset?.notr) return true;
      }
      return false;
    };
    const text = (n) => {
      if (done.get(n) === n.nodeValue) return;
      if (n.parentElement && skip(n.parentElement)) return;
      const out = tr(n.nodeValue);
      if (out != null) n.nodeValue = out;
      done.set(n, n.nodeValue);
    };
    const attrs = (el) => {
      for (const a of ["placeholder", "title", "aria-label"]) {
        const v = el.getAttribute?.(a);
        if (v) {
          const out = tr(v);
          if (out != null) el.setAttribute(a, out);
        }
      }
    };
    const walk = (root) => {
      if (root.nodeType === 3) return text(root);
      if (root.nodeType !== 1 || skip(root)) return;
      attrs(root);
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      let n;
      while ((n = w.nextNode())) (n.nodeType === 3 ? text(n) : attrs(n));
    };
    walk(document.body);
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "characterData") text(m.target);
        else if (m.type === "attributes") attrs(m.target);
        else m.addedNodes.forEach(walk);
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label"] });
    return () => mo.disconnect();
  }, []);
  return null;
}
