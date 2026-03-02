import { useState, useEffect, useMemo } from 'react';

/** Convert decimal degrees to DMS string */
function toDMS(deg: number, isLat: boolean): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const mFloat = (abs - d) * 60;
  const m = Math.floor(mFloat);
  const s = ((mFloat - m) * 60).toFixed(2);
  const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}'${s.padStart(5, '0')}"${dir}`;
}

/** Pseudo MGRS grid reference from lat/lng */
function toMGRS(lat: number, lng: number): string {
  const zone = Math.floor((lng + 180) / 6) + 1;
  const letters = 'CDEFGHJKLMNPQRSTUVWX';
  const band = letters[Math.max(0, Math.min(letters.length - 1, Math.floor((lat + 80) / 8)))];
  const easting = String(Math.floor(((lng + 180) % 6) / 6 * 100000)).padStart(5, '0');
  const northing = String(Math.floor(((lat + 90) % 8) / 8 * 100000)).padStart(5, '0');
  const gridLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'];
  const col = gridLetters[Math.floor(Math.abs(lng * 7) % 20)];
  const row = gridLetters[Math.floor(Math.abs(lat * 11) % 20)];
  return `${zone}${band} ${col}${row} ${easting.slice(0, 4)} ${northing.slice(0, 4)}`;
}

/** Sun elevation approximation (very rough) */
function getSunElevation(lat: number, lng: number, date: Date): number {
  const hr = date.getUTCHours() + date.getUTCMinutes() / 60 + lng / 15;
  const hourAngle = ((hr % 24) - 12) * 15;
  const decl = 23.45 * Math.sin((2 * Math.PI / 365) * (date.getDate() + 284));
  const sinElev =
    Math.sin(lat * Math.PI / 180) * Math.sin(decl * Math.PI / 180) +
    Math.cos(lat * Math.PI / 180) * Math.cos(decl * Math.PI / 180) * Math.cos(hourAngle * Math.PI / 180);
  return Math.round(Math.asin(Math.max(-1, Math.min(1, sinElev))) * 180 / Math.PI * 10) / 10;
}

export function HUDOverlay() {
  const [time, setTime] = useState(new Date());
  const [mousePos, setMousePos] = useState({ lat: 30.2672, lng: -97.7431 });

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

  const utc = time.toISOString().replace('T', ' ').slice(0, 19) + 'Z';

  // Satellite-style telemetry (simulated)
  const telem = useMemo(() => {
    const dayOfYear = Math.floor((time.getTime() - new Date(time.getFullYear(), 0, 0).getTime()) / 86400000);
    const orbitNum = 47000 + dayOfYear * 15 + Math.floor(time.getHours() * 0.625);
    const passNum = 170 + (time.getHours() % 6);
    const kh = `KH11-${4060 + (dayOfYear % 10)}`;
    const ops = `OPS-${4100 + (time.getHours() % 60)}`;
    const gsd = (800 + Math.sin(Date.now() / 5000) * 200).toFixed(2);
    const alt = (350000 + Math.sin(Date.now() / 8000) * 50000).toFixed(0);
    const niirs = Math.min(9.0, Math.max(0, 3 + Math.sin(Date.now() / 7000) * 2)).toFixed(1);
    const sunEl = getSunElevation(mousePos.lat, mousePos.lng, time);
    return { orbitNum, passNum, kh, ops, gsd, alt, niirs, sunEl };
  }, [time, mousePos]);

  return (
    <>
      {/* TOP CENTER — Classification banner */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-red-900/80 px-6 py-0.5 text-[10px] font-display tracking-[0.3em] text-red-300 uppercase">
          TOP SECRET // SI-TK // NOFORN
        </div>
      </div>

      {/* TOP LEFT — Satellite designation & system info */}
      <div className="fixed top-8 left-60 z-40 pointer-events-none">
        <div className="space-y-0.5 font-mono">
          <div className="text-[10px] text-cyan-400/80 tracking-wider">{telem.kh} {telem.ops}</div>
          <div className="text-[10px] text-amber/60">SYS: OSINT-WV v3.2.0</div>
          <div className="text-[10px] text-amber/60">OPR: ANALYST-01</div>
          <div className="text-[10px] text-amber/50">{utc}</div>
        </div>
      </div>

      {/* TOP RIGHT — Recording indicator + orbit telemetry */}
      <div className="fixed top-8 right-6 z-40 pointer-events-none">
        <div className="space-y-0.5 text-right font-mono">
          <div className="flex items-center justify-end gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-rec-pulse" />
            <span className="text-[10px] text-red-400 tracking-wider">REC {time.toISOString().slice(0, 10)} {time.toISOString().slice(11, 23)}</span>
          </div>
          <div className="text-[10px] text-amber/60">
            ORB: {telem.orbitNum} PASS: DESC-{telem.passNum}
          </div>
          <div className="text-[10px] text-tactical-green/60">
            SAT: 12/12 · LINK: ACTIVE
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT — MGRS + GPS coordinates */}
      <div className="fixed bottom-4 left-60 z-40 pointer-events-none">
        <div className="font-mono space-y-0.5">
          <div className="text-[9px] text-amber/30 tracking-widest">┌ MGRS: {toMGRS(mousePos.lat, mousePos.lng)}</div>
          <div className="text-[10px] text-amber/50">
            {toDMS(mousePos.lat, true)} {toDMS(mousePos.lng, false)}
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT — GSD / NIIRS / Altitude / Sun */}
      <div className="fixed bottom-4 right-6 z-40 pointer-events-none">
        <div className="text-right font-mono space-y-0.5">
          <div className="text-[10px] text-amber/50">
            GSD: {telem.gsd}M NIIRS: {telem.niirs}
          </div>
          <div className="text-[10px] text-amber/40">
            ALT: {Number(telem.alt).toLocaleString()}M SUN: {telem.sunEl > 0 ? '+' : ''}{telem.sunEl}° EL
          </div>
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
