import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { GeoSignal } from '../types';
import { severityColor, severityLabel } from '../types';
import { SeverityBadge } from './SeverityBadge';
import * as api from '../api';
import 'leaflet/dist/leaflet.css';

function FitBounds({ signals }: { signals: GeoSignal[] }) {
  const map = useMap();
  useEffect(() => {
    if (signals.length > 0) {
      const lats = signals.map((s) => s.latitude!);
      const lngs = signals.map((s) => s.longitude!);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats) - 5, Math.min(...lngs) - 5],
        [Math.max(...lats) + 5, Math.max(...lngs) + 5],
      ];
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [signals, map]);
  return null;
}

export function ThreatMap() {
  const [signals, setSignals] = useState<GeoSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchGeoSignals({ limit: 500 }).then((data) => {
      setSignals(data.filter((s) => s.latitude !== null && s.longitude !== null));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-surface-card rounded-xl border border-gray-700/50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700/50 overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '500px', width: '100%', background: '#0f172a' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {signals.length > 0 && <FitBounds signals={signals} />}
        {signals.map((sig) => (
          <CircleMarker
            key={sig.id}
            center={[sig.latitude!, sig.longitude!]}
            radius={Math.max(6, Math.min(14, sig.severity / 5))}
            pathOptions={{
              color: severityColor(sig.severity),
              fillColor: severityColor(sig.severity),
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-semibold text-sm mb-1">{sig.title}</p>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <SeverityBadge score={sig.severity} />
                  <span className="text-gray-600">{sig.source}</span>
                </div>
                {sig.location_name && (
                  <p className="text-xs text-gray-500">
                    📍 {sig.location_name} {sig.country_code ? `(${sig.country_code})` : ''}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {severityLabel(sig.severity)} severity · {sig.status}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="bg-surface-card px-4 py-2 flex items-center justify-between border-t border-gray-700/50">
        <span className="text-xs text-gray-500">
          {signals.length} geolocated signals
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-severity-low" /> Low</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-severity-med" /> Med</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-severity-high" /> High</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-severity-crit" /> Crit</span>
        </div>
      </div>
    </div>
  );
}
