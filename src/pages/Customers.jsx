import { useMemo } from "react";

export default function Customers({ bookings }) {
  // Build customers from bookings data
  const customers = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.phone) return;
      if (!map[b.phone]) {
        map[b.phone] = {
          name: b.name,
          phone: b.phone,
          trips: 0,
          lastTrip: null,
          services: new Set(),
        };
      }
      map[b.phone].trips += 1;
      if (!map[b.phone].lastTrip || b.date > map[b.phone].lastTrip) {
        map[b.phone].lastTrip = b.date;
      }
      if (b.service) map[b.phone].services.add(b.service);
    });
    return Object.values(map).sort((a, b) => b.trips - a.trips);
  }, [bookings]);

  return (
    <div>
      <h1 className="font-playfair text-3xl text-white mb-1">Customers</h1>
      <p className="text-[#8B9BB4] text-sm mb-8">All customers derived from booking history</p>

      {customers.length === 0 ? (
        <div className="bg-white/3 border border-[#D4A853]/10 rounded-xl px-6 py-16 text-center text-[#8B9BB4] text-sm">
          No customers yet. They will appear here once bookings come in.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((c) => (
            <div key={c.phone} className="bg-white/3 border border-[#D4A853]/10 rounded-xl p-5 flex items-start gap-4">
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-[#D4A853]/15 flex items-center justify-center font-playfair text-lg text-[#D4A853] font-bold flex-shrink-0">
                {c.name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-white font-medium text-sm truncate">{c.name || "Unknown"}</div>
                  <span className="text-xs bg-[#D4A853]/10 text-[#D4A853] px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                    {c.trips} trip{c.trips !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-[#8B9BB4] text-xs mb-2">{c.phone}</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[...c.services].map((s) => (
                    <span key={s} className="text-[10px] bg-white/5 text-[#8B9BB4] px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                {c.lastTrip && (
                  <div className="text-[#8B9BB4] text-[11px]">Last trip: {c.lastTrip}</div>
                )}
              </div>
              <a
                href={`https://wa.me/${c.phone?.replace(/\D/g, "")}?text=Namaste%20${c.name || ""}%21%20NikloSafar%20here.`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 bg-[#25D366]/10 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-[#25D366]/20 transition-colors"
              >
                <svg width="16" height="16" fill="#25D366" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.122 1.528 5.85L0 24l6.336-1.5A11.931 11.931 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.661-.5-5.197-1.375L3 21.5l.9-3.697A9.977 9.977 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}