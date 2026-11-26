"use client";

import { FileText as FileTextIcon, Mail as MailIcon, MessageCircle as MessageCircleIcon } from "lucide-react";
import Link from "next/link";
import { readAdmin } from "@/lib/admin-store";
import { orderMessage, waLink, mailLink } from "@/lib/notify";
import { getOrder } from "@/lib/store";
import { cn } from "@/lib/utils";

const b =
  "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-secondary transition-colors";

// who="clinic": send the order to Implantly. who="admin": send a status update to the clinic.
export function OrderActions({ orderId, who = "clinic", className = "" }) {
  if (!orderId) return null;
  const db = readAdmin();
  let phone = db.settings.phone;
  let email = db.settings.email;
  if (who === "admin") {
    const o = getOrder(orderId);
    const c = (db.clinics || []).find((c) => c.id === o?.clinic?.id);
    phone = c?.phone || "";
    email = c?.email || "";
  }
  const m = orderMessage(orderId, who === "admin" ? "update" : "placed");
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Link href={`/invoice?id=${orderId}`} className={b}>
        <FileTextIcon className="w-3.5 h-3.5" /> Invoice
      </Link>
      <a href={waLink(phone, m.body)} target="_blank" rel="noreferrer" className={b}>
        <MessageCircleIcon className="w-3.5 h-3.5" /> WhatsApp
      </a>
      <a href={mailLink(email, m.subject, m.body)} className={b}>
        <MailIcon className="w-3.5 h-3.5" /> Email
      </a>
    </div>
  );
}
