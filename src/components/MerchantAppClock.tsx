"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

function formatNow(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function MerchantAppClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="spice-card rounded-lg px-5 py-4">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#121212]">
        <Clock3 size={15} aria-hidden="true" />
        Current time
      </p>
      <p className="mt-2 text-lg font-black text-[#121212]">
        {now ? formatNow(now) : "Loading time..."}
      </p>
    </div>
  );
}



