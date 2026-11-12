// Thống kê tính ở phía server bằng JS (đủ nhanh cho quy mô tiểu luận, chạy trên mọi bản MongoDB)
const TZ_OFFSET = 7 * 3600000; // Asia/Ho_Chi_Minh
export const dayKey = (d, group = 'day') => {
  const k = new Date(new Date(d).getTime() + TZ_OFFSET).toISOString().slice(0, 10);
  return group === 'month' ? k.slice(0, 7) : k;
};

export function parseRange(q) {
  const to = q.to ? new Date(q.to) : new Date();
  const from = q.from ? new Date(q.from) : new Date(to.getTime() - 30 * 86400000);
  if (q.to && String(q.to).length <= 10) to.setUTCHours(23, 59, 59, 999); // "2026-11-30" => hết ngày
  return { from, to, group: q.group === 'month' ? 'month' : 'day' };
}

export function summarize(orders, { from, to, group }, revenueOf) {
  const inRange = (d) => d && d >= from && d <= to;
  const byStatus = {};
  const series = {};
  const topMap = new Map();
  let revenue = 0;
  let completed = 0;
  for (const o of orders) {
    if (inRange(o.createdAt)) byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (o.status === 'hoan_tat' && inRange(o.completedAt)) {
      const rev = revenueOf(o);
      revenue += rev;
      completed++;
      const k = dayKey(o.completedAt, group);
      series[k] = series[k] || { date: k, revenue: 0, orders: 0 };
      series[k].revenue += rev;
      series[k].orders++;
      for (const it of o.items) {
        const t = topMap.get(String(it.product)) || { product: it.product, name: it.productName, quantity: 0, revenue: 0 };
        t.quantity += it.quantity;
        t.revenue += it.price * it.quantity;
        topMap.set(String(it.product), t);
      }
    }
  }
  return {
    range: { from, to, group },
    revenue,
    completedOrders: completed,
    avgOrderValue: completed ? Math.round(revenue / completed) : 0,
    ordersByStatus: byStatus,
    series: Object.values(series).sort((a, b) => a.date.localeCompare(b.date)),
    topProducts: [...topMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
  };
}
