"use client";

import { useEffect, useState } from "react";
import { getCurrency, getLang, setCurrency, setLang } from "@/lib/locale";

const pill = "px-2 py-1 rounded-md text-[11px] font-mono font-semibold transition-all";

export function LocaleSwitch() {
  const [cur, setCur] = useState("SAR");
  const [lang, setL] = useState("en");
  useEffect(() => {
    setCur(getCurrency());
    setL(getLang());
  }, []);
  const on = "bg-primary/15 text-primary";
  const off = "text-muted-foreground hover:text-foreground";
  return (
    <div className="flex items-center gap-1" data-notr="1">
      <div className="flex items-center rounded-lg border border-border/60 p-0.5">
        <button className={`${pill} ${lang === "en" ? on : off}`} onClick={() => lang !== "en" && setLang("en")}>EN</button>
        <button className={`${pill} ${lang === "ar" ? on : off}`} onClick={() => lang !== "ar" && setLang("ar")}>ع</button>
      </div>
      <div className="flex items-center rounded-lg border border-border/60 p-0.5">
        <button className={`${pill} ${cur === "SAR" ? on : off}`} onClick={() => cur !== "SAR" && setCurrency("SAR")}>SAR</button>
        <button className={`${pill} ${cur === "USD" ? on : off}`} onClick={() => cur !== "USD" && setCurrency("USD")}>$</button>
      </div>
    </div>
  );
}
