import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: "customers",
    label: "Customers",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "add-booking",
    label: "Add Booking",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
];

export default function Sidebar({ active, setActive, mobileOpen, setMobileOpen }) {
  const { adminData, logout } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#D4A853]/10">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="#D4A853" strokeWidth="1.2" />
          <path d="M7 22Q13 13 18 16Q23 19 29 12" stroke="#D4A853" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="29" cy="12" r="2.5" fill="#D4A853" />
          <rect x="11" y="20" width="14" height="5" rx="2" fill="#2C2C4A" stroke="#D4A853" strokeWidth="0.8" />
        </svg>
        <div>
          <div className="font-playfair text-base text-[#D4A853]">NikloSafar</div>
          <div className="text-[10px] text-[#8B9BB4] tracking-widest uppercase">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActive(item.id); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer border-none text-left
              ${active === item.id
                ? "bg-[#D4A853] text-[#1A1A2E]"
                : "text-[#8B9BB4] hover:bg-white/5 hover:text-white"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div className="px-4 py-4 border-t border-[#D4A853]/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-[#D4A853] text-xs font-bold">
            {adminData?.name?.[0] || "A"}
          </div>
          <div>
            <div className="text-white text-xs font-medium">{adminData?.name || "Admin"}</div>
            <div className="text-[#8B9BB4] text-[10px]">{adminData?.role || "Administrator"}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[#8B9BB4] hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1A1A2E] border-r border-[#D4A853]/10 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-[#1A1A2E] border-r border-[#D4A853]/10 h-full">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}