import { useState, useEffect } from 'react';

export function HUDOverlay() {
  const [time, setTime] = useState(new Date());
  const [mousePos, setMousePos] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated GPS coords that follow a pattern
  useEffect(() => {
    const interval = setInterval(() => {
      setMousePos({
        lat: 30.2672 + Math.sin(Date.now() / 10000) * 0.01,
        lng: -97.7431 + Math.cos(Date.now() / 10000) * 0.01,
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const utc = time.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <>
      {/* TOP LEFT — Classification banner */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-red-900/80 px-6 py-0.5 text-[10px] font-display tracking-[0.3em] text-red-300 uppercase">
          TOP SECRET // SI // NOFORN
        </div>
      </div>

      {/* TOP LEFT — System info */}
      <div className="fixed top-8 left-60 z-40 pointer-events-none">
        <div className="space-y-0.5 text-[10px] text-amber/60 font-mono">
          <div>SYS: OSINT-WV v3.0.0</div>
          <div>OPR: ANALYST-01</div>
          <div>{utc}</div>
        </div>
      </div>

      {/* TOP RIGHT — Recording / Status */}
      <div className="fixed top-8 right-6 z-40 pointer-events-none">
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-rec-pulse" />
            <span className="text-red-400 tracking-wider">REC</span>
          </div>
          <div className="text-amber/60">
            SAT: 12/12
          </div>
          <div className="text-tactical-green/60">
            LINK: ACTIVE
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT — GPS coordinates */}
      <div className="fixed bottom-4 left-60 z-40 pointer-events-none">
        <div className="text-[10px] text-amber/40 font-mono space-y-0.5">
          <div>LAT {mousePos.lat.toFixed(6)}° N</div>
          <div>LNG {Math.abs(mousePos.lng).toFixed(6)}° W</div>
          <div>ALT 000.00m MSL</div>
        </div>
      </div>

      {/* BOTTOM RIGHT — Frame counter */}
      <div className="fixed bottom-4 right-6 z-40 pointer-events-none">
        <div className="text-[10px] text-amber/30 font-mono">
          FRM {Math.floor(Date.now() / 33) % 99999}
        </div>
      </div>

      {/* Corner brackets — top left */}
      <div className="fixed top-6 left-58 z-40 pointer-events-none">
        <svg width="20" height="20" className="text-amber/20">
          <path d="M0 15 L0 0 L15 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Corner brackets — top right */}
      <div className="fixed top-6 right-4 z-40 pointer-events-none">
        <svg width="20" height="20" className="text-amber/20">
          <path d="M20 15 L20 0 L5 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Corner brackets — bottom left */}
      <div className="fixed bottom-2 left-58 z-40 pointer-events-none">
        <svg width="20" height="20" className="text-amber/20">
          <path d="M0 5 L0 20 L15 20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Corner brackets — bottom right */}
      <div className="fixed bottom-2 right-4 z-40 pointer-events-none">
        <svg width="20" height="20" className="text-amber/20">
          <path d="M20 5 L20 20 L5 20" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </>
  );
}
