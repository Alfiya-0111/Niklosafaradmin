import { useState } from "react";

export default function AddBooking({ addBooking }) {
  const [form, setForm] = useState({
    name: "", phone: "", date: "", time: "", service: "", route: "", message: "", passengers: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addBooking(form);
      setForm({ name: "", phone: "", date: "", time: "", service: "", route: "", message: "", passengers: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const inputClass =
    "w-full bg-white/6 border border-[#D4A853]/20 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-[#D4A853] transition-colors placeholder-[#8B9BB4]/50";

  return (
    <div>
      <h1 className="font-playfair text-3xl text-white mb-1">Add Booking</h1>
      <p className="text-[#8B9BB4] text-sm mb-8">Manually add a booking received via call or in-person</p>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-5 py-3.5 rounded-xl mb-6 flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Booking added successfully!
        </div>
      )}

      <div className="bg-white/3 border border-[#D4A853]/10 rounded-2xl p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">Customer Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">Travel Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">Pickup Time</label>
              <input type="time" name="time" value={form.time} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">Service Type *</label>
              <select name="service" value={form.service} onChange={handleChange} required className={inputClass}>
                <option value="">Select service</option>
                <option>Airport Drop/Pickup</option>
                <option>Wedding & Functions</option>
                <option>Pilgrimage Tour</option>
                <option>Outstation Trip</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">Passengers</label>
              <input name="passengers" value={form.passengers} onChange={handleChange} placeholder="e.g. 4" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widest mb-1.5">Route *</label>
            <input name="route" value={form.route} onChange={handleChange} placeholder="e.g. Bilimora → Surat Airport" required className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B9BB4] uppercase tracking-widests mb-1.5">Notes</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Any additional details..." className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#D4A853] text-[#1A1A2E] py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-[#F0C878] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            {loading ? "Adding Booking..." : "Add Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}