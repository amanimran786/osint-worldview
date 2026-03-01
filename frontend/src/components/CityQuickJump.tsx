import { MapPin } from 'lucide-react';

export interface City {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const CITIES: City[] = [
  { name: 'Austin', lat: 30.2672, lng: -97.7431, zoom: 11 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, zoom: 12 },
  { name: 'New York', lat: 40.7128, lng: -74.006, zoom: 11 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, zoom: 11 },
  { name: 'London', lat: 51.5074, lng: -0.1278, zoom: 11 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, zoom: 12 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, zoom: 11 },
  { name: 'Washington DC', lat: 38.9072, lng: -77.0369, zoom: 12 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, zoom: 11 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, zoom: 11 },
  { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818, zoom: 12 },
  { name: 'Kyiv', lat: 50.4501, lng: 30.5234, zoom: 11 },
];

interface CityQuickJumpProps {
  onJump: (city: City) => void;
  active?: string;
}

export function CityQuickJump({ onJump, active }: CityQuickJumpProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <MapPin className="h-3 w-3 text-amber/40 mr-1" />
      {CITIES.map((city) => (
        <button
          key={city.name}
          onClick={() => onJump(city)}
          className={`
            px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider
            border transition-all duration-150
            ${active === city.name
              ? 'text-amber border-amber/40 bg-amber/10'
              : 'text-gray-600 border-gray-800 hover:text-amber/70 hover:border-amber/20'
            }
          `}
        >
          {city.name}
        </button>
      ))}
    </div>
  );
}
