interface TickerItem {
  tag: string;
  text: string;
}

export default function Ticker({ items }: { items: TickerItem[] }) {
  if (!items || !items.length) return null;

  const content = items.map((item, i) => (
    <span key={i}>
      {item.tag && <strong className="text-white/85">{item.tag} </strong>}
      <span className="text-white/45">{item.text}</span>
      <span className="mx-7 opacity-20">|</span>
    </span>
  ));

  return (
    <div className="bg-navy py-1.5 overflow-hidden whitespace-nowrap w-full">
      <div className="inline-block animate-scroll text-[10px] tracking-[0.09em]">
        {content}{content}
      </div>
    </div>
  );
}
