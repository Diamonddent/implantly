"use client";

import { Lock as LockIcon, X as XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { clinicLogin } from "@/lib/admin-store";

const input =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary";

export function ClinicLoginModal({ onClose, onSuccess }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const go = () => {
    const r = clinicLogin(u, p);
    if (!r.ok) return toast.error(r.reason);
    toast.success(`Welcome, ${r.clinic.name}`);
    onSuccess?.(r.clinic);
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl px-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="surface-card p-8 w-full max-w-lg relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <XIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <LockIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-xl font-semibold tracking-tight">
            Clinic <span className="gradient-text">Sign in</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Orders are for registered clinics and companies only. Don&apos;t have an account? Contact Implantly to get your user ID and password.
        </p>
        <div className="space-y-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">User ID</div>
            <input className={input} value={u} onChange={(e) => setU(e.target.value)} autoCapitalize="none" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Password</div>
            <input className={input} type="password" value={p} onChange={(e) => setP(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />
          </div>
          <button onClick={go} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            Sign in &amp; send order
          </button>
        </div>
      </div>
    </div>
  );
}
