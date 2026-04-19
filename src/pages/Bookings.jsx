import { useState } from "react";

const STATUS_COLORS = {
  pending:   { bg: "bg-amber-500/10",  text: "text-amber-400",  dot: "bg-amber-400"  },
  confirmed: { bg: "bg-green-500/10",  text: "text-green-400",  dot: "bg-green-400"  },
  completed: { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-400"   },
  cancelled: { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-400"    },
};

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export default function Bookings({ bookings, updateStatus, addNote, deleteBooking }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = bookings.filter((b) => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch =
      !search ||
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      b.route?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const openDetail = (b) => {
    setSelected(b);
    setNoteText(b.note || "");
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    await addNote(selected.id, noteText);
    setSelected((prev) => ({ ...prev, note: noteText }));
  };

  const handleDelete = async (id) => {
    await deleteBooking(id);
    setConfirmDelete(null);
    if (selected?.id === id) setSelected(null);
  };

  const whatsappLink = (b) => {
    const msg = `Namaste ${b.name || ""}! Your booking with NikloSafar for ${b.service || ""} on ${b.date || ""} has been confirmed. Please contact us for any queries.`;
    return `https://wa.me/${b.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div>
      <h1 className="font-playfair text-3xl text-white mb-1">Bookings</h1>
      <p className="text-[#8B9BB4] text-sm mb-6">Manage and update all booking requests</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, route..."
          className="bg-white/6 border border-[#D4A853]/20 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-[#D4A853] placeholder-[#8B9BB4]/50 flex-1 min-w-[200px]"
        />
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border-none
                ${filter === s ? "bg-[#D4A853] text-[#1A1A2E]" : "bg-white/5 text-[#8B9BB4] hover:bg-white/10"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-[#D4A853]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Customer", "Service", "Route", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[#8B9BB4] text-xs uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-[#8B9BB4] text-sm">No bookings found</td></tr>
              ) : (
                filtered.map((b) => {
                  const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={b.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-white font-medium">{b.name || "—"}</div>
                        <div className="text-[#8B9BB4] text-xs">{b.phone || "—"}</div>
                      </td>
                      <td className="px-5 py-4 text-[#8B9BB4] text-xs">{b.service || "—"}</td>
                      <td className="px-5 py-4 text-[#8B9BB4] text-xs">{b.route || "—"}</td>
                      <td className="px-5 py-4 text-[#8B9BB4] text-xs">{b.date || "—"}</td>
                      <td className="px-5 py-4">
                        <select
                          value={b.status || "pending"}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${sc.bg} ${sc.text}`}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetail(b)}
                            className="text-[#D4A853] hover:text-[#F0C878] text-xs font-medium cursor-pointer bg-transparent border-none"
                          >
                            View
                          </button>
                          <a
                            href={whatsappLink(b)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-400 hover:text-green-300 text-xs font-medium no-underline"
                          >
                            WA
                          </a>
                          <button
                            onClick={() => setConfirmDelete(b.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium cursor-pointer bg-transparent border-none"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-[#1A1A2E] border border-[#D4A853]/20 rounded-2xl p-7 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <h3 className="font-playfair text-xl text-white">Booking Detail</h3>
              <button onClick={() => setSelected(null)} className="text-[#8B9BB4] hover:text-white cursor-pointer bg-transparent border-none text-xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ["Name", selected.name],
                ["Phone", selected.phone],
                ["Service", selected.service],
                ["Date", selected.date],
                ["Time", selected.time],
                ["Route", selected.route],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/4 rounded-lg px-4 py-3">
                  <div className="text-[#8B9BB4] text-xs uppercase tracking-wide mb-1">{k}</div>
                  <div className="text-white text-sm">{v || "—"}</div>
                </div>
              ))}
            </div>
            {selected.message && (
              <div className="bg-white/4 rounded-lg px-4 py-3 mb-4">
                <div className="text-[#8B9BB4] text-xs uppercase tracking-wide mb-1">Customer Message</div>
                <div className="text-white text-sm">{selected.message}</div>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs text-[#8B9BB4] uppercase tracking-wide mb-1.5">Admin Note</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                placeholder="Add internal note..."
                className="w-full bg-white/6 border border-[#D4A853]/20 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4A853] placeholder-[#8B9BB4]/50 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveNote}
                className="flex-1 bg-[#D4A853] text-[#1A1A2E] py-2.5 rounded-lg text-sm font-bold cursor-pointer border-none hover:bg-[#F0C878] transition-colors"
              >
                Save Note
              </button>
              <a
                href={whatsappLink(selected)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#25D366] text-white py-2.5 rounded-lg text-sm font-bold no-underline text-center hover:bg-[#1ebe5a] transition-colors"
              >
                WhatsApp Customer
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A2E] border border-red-500/30 rounded-2xl p-7 w-full max-w-sm text-center">
            <div className="text-4xl mb-4">🗑️</div>
            <h3 className="font-playfair text-xl text-white mb-2">Delete Booking?</h3>
            <p className="text-[#8B9BB4] text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-white/5 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-bold cursor-pointer border-none hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}