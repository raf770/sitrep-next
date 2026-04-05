"use client";
import { useEffect, useState } from "react";

export default function TopBar() {
  const [date, setDate] = useState("");
  useEffect(() => {
    const j = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
    const m = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
    const d = new Date();
    setDate(`${j[d.getDay()]} ${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`);
  }, []);
  return (
    <div className="bg-navy h-9 px-4 md:px-9 flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <span className="hidden sm:block text-[10px] tracking-wide text-white/45">{date}</span>
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#e05a5a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e05a5a] animate-pulse" />Live
        </span>
      </div>
      <button className="text-[10px] font-bold tracking-wide uppercase text-white bg-accent px-3.5 py-1 rounded-sm">
        S'abonner
      </button>
    </div>
  );
}
