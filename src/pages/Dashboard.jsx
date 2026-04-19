import { useMemo } from "react";

const STATUS_COLORS = {
  pending:   { bg: "bg-amber-500/10",  text: "text-amber-400",  dot: "bg-amber-400"  },
  confirmed: { bg: "bg-green-500/10",  text: "text-green-400",  dot: "bg-green-400"  },
  completed: { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-400"   },
  cancelled: { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-400"    },
};

export default function Dashboard({ bookings }) {
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    // This month
    const now = new Date();
    const thisMonth = bookings.filter((b) => {
      const d = b.createdAt?.toDate?.();
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, pending, confirmed, completed, cancelled, thisMonth };
  }, [bookings]);

  const recent = bookings.slice(0, 5);

  const statCards = [
    { label: "Total Bookings", value: stats.total, icon: "📋", color: "border-[#D4A853]/30" },
    { label: "Pending", value: stats.pending, icon: "⏳", color: "border-amber-500/30" },
    { label: "Confirmed", value: stats.confirmed, icon: "✅", color: "border-green-500/30" },
    { label: "Completed", value: stats.completed, icon: "🏁", color: "border-blue-500/30" },
    { label: "Cancelled", value: stats.cancelled, icon: "❌", color: "border-red-500/30" },
    { label: "This Month", value: stats.thisMonth, icon: "📅", color: "border-purple-500/30" },
  ];

  return (
    <div>
      <h1 className="font-playfair text-3xl text-white mb-1">Dashboard</h1>
      <p className="text-[#8B9BB4] text-sm mb-8">Overview of all bookings and activity</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-white/3 border ${s.color} rounded-xl p-5`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-playfair text-3xl text-white font-bold">{s.value}</div>
            <div className="text-[#8B9BB4] text-xs mt-1 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white/3 border border-[#D4A853]/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="font-playfair text-lg text-white">Recent Bookings</h2>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-[#8B9BB4] text-sm">
            No bookings yet. They will appear here once customers book.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recent.map((b) => {
              const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
              return (
                <div key={b.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-white text-sm font-medium">{b.name || "—"}</div>
                    <div className="text-[#8B9BB4] text-xs mt-0.5">{b.route || "—"} · {b.service || "—"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-[#8B9BB4] text-xs">{b.date || "—"}</div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {b.status || "pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}