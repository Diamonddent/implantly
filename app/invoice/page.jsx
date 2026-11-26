"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { readAdmin } from "@/lib/admin-store";
import { getOrder, orderTotals } from "@/lib/store";
import { money } from "@/lib/locale";

// ZATCA phase-1 style QR: TLV (seller, VAT no, time, total, VAT) in base64.
function zatcaTlv(fields) {
  const enc = new TextEncoder();
  const parts = [];
  fields.forEach((v, i) => {
    const b = enc.encode(String(v));
    parts.push(i + 1, b.length, ...b);
  });
  return btoa(String.fromCharCode(...parts));
}

function Invoice() {
  const id = useSearchParams().get("id") || "";
  const [qr, setQr] = useState("");
  const [o, setO] = useState(undefined);
  const s = readAdmin().settings;
  useEffect(() => setO(getOrder(id)), [id]);
  const t = o ? orderTotals(o) : null;
  useEffect(() => {
    if (!o) return;
    const sar = (n) => (Math.round(n * 3.75 * 100) / 100).toFixed(2);
    QRCode.toDataURL(zatcaTlv([s.company || "Implantly", s.vatNo || "", o.createdAt, sar(t.total), sar(t.vat)]), { margin: 1, width: 140 }).then(setQr).catch(() => {});
  }, [o]);
  if (o === undefined) return null;
  if (!o)
    return <div className="container py-16 text-center text-muted-foreground">Order not found</div>;
  return (
    <div className="container py-8 md:py-12 max-w-3xl">
      <div className="flex justify-end mb-4 print:hidden">
        <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          Print / Save PDF
        </button>
      </div>
      <div className="surface-card p-8" id="invoice">
        <div className="flex flex-wrap justify-between gap-6 mb-8">
          <div>
            <div className="text-2xl font-semibold">{s.company || "Implantly"}</div>
            {s.address && <div className="text-sm text-muted-foreground">{s.address}</div>}
            {s.vatNo && <div className="text-sm text-muted-foreground">VAT No. {s.vatNo}</div>}
            {s.cr && <div className="text-sm text-muted-foreground">CR {s.cr}</div>}
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold gradient-text">Tax Invoice</div>
            <div className="font-mono text-sm">{o.orderId}</div>
            <div className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB")}</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Bill to</div>
            <div>{o.clinic?.name || "—"}</div>
            {o.caseRef && <div className="text-muted-foreground">Case: {o.caseRef}</div>}
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Payment</div>
            <div>{o.payment || "—"}</div>
            {s.iban && o.payment === "Bank transfer" && <div className="text-muted-foreground font-mono">IBAN {s.iban}</div>}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2">Item</th>
              <th className="py-2">Lot</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((i, k) => (
              <tr key={k} className="border-b border-border/40">
                <td className="py-2">
                  {i.name}
                  <div className="text-[11px] font-mono text-muted-foreground">{i.sku}</div>
                </td>
                <td className="py-2 font-mono text-xs">{i.lot || "—"}</td>
                <td className="py-2 text-right font-mono">{i.qty || 1}</td>
                <td className="py-2 text-right font-mono">{money(i.price)}</td>
                <td className="py-2 text-right font-mono">{money((i.price || 0) * (i.qty || 1))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap justify-between items-end gap-6 mt-6">
          {qr ? <img src={qr} alt="ZATCA QR" width={140} height={140} className="rounded-lg bg-white p-1" /> : <div />}
          <dl className="text-sm space-y-1" style={{ minWidth: 220 }}>
            <div className="flex justify-between gap-6"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-mono">{money(t.subtotal)}</dd></div>
            {t.discount > 0 && <div className="flex justify-between gap-6"><dt className="text-muted-foreground">Discount</dt><dd className="font-mono">−{money(t.discount)}</dd></div>}
            <div className="flex justify-between gap-6"><dt className="text-muted-foreground">VAT {t.vatRate}%</dt><dd className="font-mono">{money(t.vat)}</dd></div>
            <div className="flex justify-between gap-6 text-base font-semibold border-t border-border pt-2"><dt>Total</dt><dd className="font-mono gradient-text">{money(t.total)}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={null}>
      <Invoice />
    </Suspense>
  );
}
