import { ChevronDown, Search, Shield, Users } from "lucide-react";

const navItems = [
  { label: "Home", active: true },
  { label: "Members" },
  { label: "Progress", hasDropdown: true },
  { label: "Events", hasDropdown: true },
];

const ClanCrest = ({ compact = false }: { compact?: boolean }) => (
  <div
    className={`relative grid place-items-center overflow-hidden rounded-full border border-[#d8c9ad]/70 bg-[#11100d] shadow-[0_0_0_2px_rgba(0,0,0,0.7),0_0_18px_rgba(216,201,173,0.18)] ${
      compact ? "h-7 w-7" : "h-20 w-20"
    }`}
    aria-label="Clan crest"
  >
    <div className="absolute inset-1 rounded-full border border-[#7e1b17]/80 bg-[#e3dac5]" />
    <div className="absolute bottom-0 h-1/2 w-3/5 rounded-t-full bg-[#b32622]" />
    <Shield className={`relative z-10 text-[#11100d] ${compact ? "h-4 w-4" : "h-10 w-10"}`} strokeWidth={1.6} />
    <span
      className={`absolute z-20 rounded-full bg-[#11100d] font-serif font-bold text-[#e3dac5] ${
        compact ? "right-1 top-1 h-2 w-2 text-[5px]" : "right-4 top-4 h-4 w-4 text-[10px]"
      }`}
    >
      K
    </span>
  </div>
);

const Index = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07090b] text-[#cdbf9e]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#1d2023] bg-[#0b0d0f]/95 shadow-[0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm">
        <div className="flex h-[38px] items-center justify-between px-2 sm:px-4">
          <a href="#" className="flex items-center gap-2" aria-label="Kravy home">
            <ClanCrest compact />
            <span className="font-serif text-[11px] font-bold uppercase tracking-[0.28em] text-[#e0d3b2] drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]">
              Kravy
            </span>
          </a>

          <nav className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                className={`group relative flex h-full items-center gap-1 px-5 font-serif text-[10px] uppercase tracking-[0.16em] transition-colors ${
                  item.active ? "text-[#dfd0ad]" : "text-[#8d856f] hover:text-[#d6c8a8]"
                }`}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="h-3 w-3 opacity-70" />}
                {item.active && <span className="absolute bottom-0 left-4 right-4 h-px bg-[#d5c6a3]" />}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <label className="hidden h-[24px] w-[156px] items-center rounded-sm border border-[#252a2e] bg-[#07090b] px-2 text-[#646a70] lg:flex">
              <input
                className="min-w-0 flex-1 bg-transparent text-[10px] text-[#8e949a] outline-none placeholder:text-[#3c4248]"
                placeholder="Search player..."
                aria-label="Search player"
              />
              <Search className="h-3 w-3 text-[#66635a]" />
            </label>
            <button className="flex h-[24px] items-center gap-2 rounded-sm border border-[#24282c] bg-[#17191c] px-3 font-serif text-[10px] font-bold uppercase tracking-[0.13em] text-[#d8c9a8] shadow-inner shadow-white/5 transition-colors hover:bg-[#202328]">
              <Users className="h-3.5 w-3.5" />
              Login
            </button>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen pt-[38px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.035),transparent_46%),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[length:100%_100%,4px_4px,4px_4px]" />
        <div className="relative h-[142px] bg-[#07090b]" />
        <div className="relative h-[132px] bg-[#27292b] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),inset_0_-1px_0_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.028),transparent_58%)]" />
        </div>
        <div className="relative flex h-[152px] items-end justify-center bg-[#07090b] pb-0 shadow-[inset_0_1px_0_rgba(0,0,0,0.8)]">
          <div className="translate-y-1/2">
            <ClanCrest />
          </div>
        </div>
        <div className="relative h-[132px] bg-[#27292b] shadow-[inset_0_1px_0_rgba(255,255,255,0.02),inset_0_-1px_0_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.028),transparent_58%)]" />
        </div>
        <div className="relative h-[150px] bg-[#07090b]" />
        <div className="relative h-[54px] bg-[#27292b] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]" />
      </section>

      <img src="/assets/placeholder.svg" alt="placeholder" className="sr-only" />
    </main>
  );
};

export default Index;
