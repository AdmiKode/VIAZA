export function splitBill(params: { total: number; people: number; tipPct: number }) {
  const { total, people, tipPct } = params;
  if (!Number.isFinite(total) || total < 0) return 0;
  const p = Math.max(1, Math.floor(people));
  const tip = total * (Math.max(0, tipPct) / 100);
  const grand = total + tip;
  return grand / p;
}

