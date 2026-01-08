import { useEffect, useState } from 'react';
import Gallery from "./components/Gallery";
import Feed from "./components/Feed";
import FocusedView from "./components/FocusedView";
import { useStore, generateRandomUser } from "./lib/store";
import { seedImages } from "./services/unsplash";
import { Activity, RefreshCw, Aperture } from "lucide-react";

function App() {
  const { user, setUser, setIsFeedOpen } = useStore();
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!user) {
      setUser(generateRandomUser());
    }
  }, [user, setUser]);

  const handleSeed = async () => {
    setSeeding(true);
    await seedImages();
    setSeeding(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20">

      {/* Floating Header */}
      <header className="fixed top-0 inset-x-0 z-40 p-6 pointer-events-none flex justify-between items-start">
        {/* Brand */}
        {/* Brand */}
        <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-full flex items-center gap-4 shadow-2xl group transition-all hover:bg-white/5 hover:border-white/20 hover:scale-105 cursor-default">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse blur-md"></div>
            <Aperture size={20} className="relative z-10 text-white group-hover:rotate-180 transition-transform duration-700 ease-in-out" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-[0.3em] text-white leading-none">LUMA</h1>
            <span className="text-[10px] text-white/40 tracking-widest font-light leading-none mt-1">GALLERY</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="pointer-events-auto flex items-center gap-3 lg:mr-[420px] transition-all duration-500 ease-in-out">

          {/* User Badge */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full shadow-xl">
              <span className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]" style={{ background: user.color, color: user.color }} />
              <span className="text-xs font-medium text-white/70">{user.name}</span>
            </div>
          )}

          {/* Refresh Action */}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="group w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-full transition-all active:scale-95"
            title="Refresh Canvas"
          >
            <RefreshCw size={18} className={`text-white/70 group-hover:text-white transition-colors ${seeding ? 'animate-spin' : ''}`} />
          </button>

          {/* Feed Toggle (Mobile Only) */}
          <button
            onClick={() => setIsFeedOpen(true)}
            className="lg:hidden group flex items-center gap-2 bg-white/10 hover:bg-white text-white px-4 py-2 rounded-full backdrop-blur-xl border border-white/10 transition-all shadow-xl hover:shadow-white/10 active:scale-95"
          >
            <Activity size={16} />
            <span className="text-sm font-medium">Activity</span>
          </button>
        </div>
      </header>

      {/* Main Content - Fullscreen Canvas */}
      <main className="relative min-h-screen lg:pr-[400px] transition-[padding] duration-500 ease-in-out">
        <Gallery />
      </main>

      {/* Overlays */}
      <Feed />
      <FocusedView />
    </div>
  )
}

export default App
