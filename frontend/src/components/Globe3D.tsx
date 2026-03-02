import { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { GeoSignal } from '../types';
import type { DataLayerState } from '../types';
import type { LayerData } from './DataLayerPanel';

/* ---- Geo math helpers ---- */
const GLOBE_RADIUS = 2;
const DEG2RAD = Math.PI / 180;

function latLngToVec3(lat: number, lng: number, altitude = 0): THREE.Vector3 {
  const r = GLOBE_RADIUS + altitude;
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lng + 180) * DEG2RAD;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/* ---- Globe sphere with hex-grid shader ---- */
function GlobeSphere() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);

          // Base dark color
          vec3 base = vec3(0.02, 0.04, 0.08);
          vec3 glowColor = vec3(0.94, 0.63, 0.19);

          // Subtle lat/lon grid
          float lat = asin(normalize(vPosition).y);
          float lon = atan(vPosition.z, vPosition.x);
          float latGrid = 1.0 - smoothstep(0.0, 0.03, abs(sin(lat * 6.0)));
          float lonGrid = 1.0 - smoothstep(0.0, 0.03, abs(sin(lon * 12.0)));
          float grid = max(latGrid, lonGrid) * 0.12;

          vec3 color = base + glowColor * grid;
          color += glowColor * fresnel * 0.25;

          gl_FragColor = vec4(color, 0.92);
        }
      `,
      transparent: true,
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
    </mesh>
  );
}

/* ---- Atmospheric glow ---- */
function Atmosphere() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.94, 0.63, 0.19, intensity * 0.35);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh material={material}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.12, 64, 64]} />
    </mesh>
  );
}

/* ---- Continent outlines from simplified GeoJSON ---- */
const CONTINENT_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson';

/* ---- Country borders — use dedicated boundary lines for crisp rendering ---- */
const COUNTRY_BORDERS_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_boundary_lines_land.geojson';
const COUNTRIES_FILL_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

/* ---- US States / Major Admin-1 boundaries ---- */
const STATES_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces_lines.geojson';
const STATES_POLY_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson';

/** Shared helper: parse polygon rings from a GeoJSON feature into Vector3 line geometries */
function parseGeoJSONRings(
  features: Array<{ geometry: { type: string; coordinates: any } }>,
  altitude: number,
): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];
  for (const feature of features) {
    const { type, coordinates } = feature.geometry;
    let rings: number[][][] = [];

    if (type === 'Polygon') {
      rings = coordinates as number[][][];
    } else if (type === 'MultiPolygon') {
      rings = (coordinates as number[][][][]).flat();
    } else if (type === 'LineString') {
      rings = [coordinates as number[][]];
    } else if (type === 'MultiLineString') {
      rings = coordinates as number[][][];
    }

    for (const ring of rings) {
      const pts: THREE.Vector3[] = [];
      for (const coord of ring) {
        const lng = coord[0];
        const lat = coord[1];
        if (typeof lat === 'number' && typeof lng === 'number') {
          pts.push(latLngToVec3(lat, lng, altitude));
        }
      }
      if (pts.length > 1) {
        geometries.push(new THREE.BufferGeometry().setFromPoints(pts));
      }
    }
  }
  return geometries;
}

function ContinentOutlines() {
  const [geos, setGeos] = useState<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    fetch(CONTINENT_URL)
      .then(r => r.json())
      .then((geojson: { features: Array<{ geometry: { type: string; coordinates: any } }> }) => {
        setGeos(parseGeoJSONRings(geojson.features, 0.003));
      })
      .catch(() => {});
  }, []);

  const lineObjects = useMemo(() =>
    geos.map(geo => new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: '#f0a030', transparent: true, opacity: 0.35 })
    )), [geos]);

  return (
    <group>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

/* ---- Country borders ---- */
function CountryBorders() {
  const [geos, setGeos] = useState<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    // First try dedicated boundary lines (clean LineString data), fallback to country polygons
    fetch(COUNTRY_BORDERS_URL)
      .then(r => { if (!r.ok) throw new Error('boundary lines failed'); return r.json(); })
      .then((geojson: { features: Array<{ geometry: { type: string; coordinates: any } }> }) => {
        setGeos(parseGeoJSONRings(geojson.features, 0.005));
      })
      .catch(() => {
        // Fallback: use country polygons for outlines
        fetch(COUNTRIES_FILL_URL)
          .then(r => r.json())
          .then((geojson: { features: Array<{ geometry: { type: string; coordinates: any } }> }) => {
            setGeos(parseGeoJSONRings(geojson.features, 0.005));
          })
          .catch(() => {});
      });
  }, []);

  const lineObjects = useMemo(() =>
    geos.map(geo => new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: '#4ade80', transparent: true, opacity: 0.55 })
    )), [geos]);

  return (
    <group>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

/* ---- State / Province borders ---- */
function StateBorders() {
  const [geos, setGeos] = useState<THREE.BufferGeometry[]>([]);

  useEffect(() => {
    // First try the dedicated lines file, fallback to polygon outlines
    fetch(STATES_URL)
      .then(r => { if (!r.ok) throw new Error('state lines failed'); return r.json(); })
      .then((geojson: { features: Array<{ geometry: { type: string; coordinates: any } }> }) => {
        setGeos(parseGeoJSONRings(geojson.features, 0.006));
      })
      .catch(() => {
        // Fallback: use state polygon outlines
        fetch(STATES_POLY_URL)
          .then(r => r.json())
          .then((geojson: { features: Array<{ geometry: { type: string; coordinates: any } }> }) => {
            setGeos(parseGeoJSONRings(geojson.features, 0.006));
          })
          .catch(() => {});
      });
  }, []);

  const lineObjects = useMemo(() =>
    geos.map(geo => new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.35 })
    )), [geos]);

  return (
    <group>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

/* ---- Glowing data point columns ---- */
interface PointData {
  lat: number;
  lng: number;
  color: string;
  size: number;
  label: string;
  sublabel?: string;
}

function DataColumns({ points }: { points: PointData[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const scale = 1.0 + Math.sin(t * 2 + i * 0.5) * 0.15;
        child.scale.setY(scale);
      }
    });
  });

  if (points.length === 0) return null;

  return (
    <group ref={groupRef}>
      {points.map((p, i) => {
        const pos = latLngToVec3(p.lat, p.lng, 0.0);
        const normal = pos.clone().normalize();
        const height = 0.02 + p.size * 0.06;

        // Position the column on the surface, oriented outward
        const columnPos = pos.clone().add(normal.clone().multiplyScalar(height / 2));

        // Create a quaternion that aligns Y-axis with the surface normal
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

        return (
          <group key={i}>
            {/* Column */}
            <mesh
              position={columnPos}
              quaternion={quaternion}
            >
              <cylinderGeometry args={[0.008, 0.012, height, 6]} />
              <meshBasicMaterial color={p.color} transparent opacity={0.7} />
            </mesh>
            {/* Glow dot at top */}
            <mesh position={pos.clone().add(normal.clone().multiplyScalar(height + 0.005))}>
              <sphereGeometry args={[0.015 + p.size * 0.008, 8, 8]} />
              <meshBasicMaterial color={p.color} transparent opacity={0.9} />
            </mesh>
            {/* Glow halo */}
            <mesh position={pos.clone().add(normal.clone().multiplyScalar(height + 0.005))}>
              <sphereGeometry args={[0.03 + p.size * 0.015, 8, 8]} />
              <meshBasicMaterial color={p.color} transparent opacity={0.15} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ---- Animated arcs between points ---- */
function AnimatedArcs({ arcs }: { arcs: ArcData[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Line) {
        const mat = child.material as THREE.LineBasicMaterial;
        mat.opacity = 0.15 + Math.sin(t * 1.5 + i) * 0.1;
      }
    });
  });

  const lineObjects = useMemo(() => {
    return arcs.map((arc) => {
      const start = latLngToVec3(arc.from[0], arc.from[1], 0.01);
      const end = latLngToVec3(arc.to[0], arc.to[1], 0.01);
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const dist = start.distanceTo(end);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.3);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const curvePoints = curve.getPoints(48);
      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const material = new THREE.LineBasicMaterial({
        color: arc.color,
        transparent: true,
        opacity: 0.25,
      });
      return new THREE.Line(geometry, material);
    });
  }, [arcs]);

  return (
    <group ref={groupRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

interface ArcData {
  from: [number, number];
  to: [number, number];
  color: string;
}

/* ---- Slow auto-rotate the globe group ---- */
function GlobeRotation({ groupRef, speed = 0.06 }: { groupRef: React.RefObject<THREE.Group | null>; speed?: number }) {
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * 0.002;
    }
  });
  return null;
}

/* ---- Main Globe Scene ---- */
function GlobeScene({ points, arcs }: { points: PointData[]; arcs: ArcData[] }) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[5, 3, 5]} intensity={0.2} color="#f0a030" />
      <pointLight position={[-5, -3, -5]} intensity={0.05} color="#3b82f6" />

      <Stars radius={80} depth={60} count={3000} factor={3} saturation={0} fade speed={0.3} />

      <group ref={groupRef}>
        <GlobeSphere />
        <Atmosphere />
        <ContinentOutlines />
        <CountryBorders />
        <StateBorders />
        <DataColumns points={points} />
        <AnimatedArcs arcs={arcs} />
      </group>

      <GlobeRotation groupRef={groupRef} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />
    </>
  );
}

/* ---- Public component ---- */
interface Globe3DProps {
  signals: GeoSignal[];
  layers?: DataLayerState[];
  layerData?: LayerData;
}

export function Globe3D({ signals, layers, layerData }: Globe3DProps) {
  const enabledLayers = useMemo(() => {
    if (!layers) return new Set(['signals']);
    return new Set(layers.filter(l => l.enabled).map(l => l.key));
  }, [layers]);

  const isLayerOn = useCallback((key: string) => enabledLayers.has(key), [enabledLayers]);

  const points = useMemo<PointData[]>(() => {
    const result: PointData[] = [];

    // OSINT Signals
    if (isLayerOn('signals')) {
      signals.filter(s => s.latitude && s.longitude).forEach(s => {
        const sevColor = s.severity >= 60 ? '#dc2626' : s.severity >= 35 ? '#ef4444' : s.severity >= 15 ? '#f59e0b' : '#22c55e';
        result.push({
          lat: s.latitude!,
          lng: s.longitude!,
          color: sevColor,
          size: Math.max(0.8, Math.min(2, s.severity / 20)),
          label: s.title,
          sublabel: `${s.source} · Sev ${s.severity}`,
        });
      });
    }

    // Earthquakes
    if (isLayerOn('earthquakes') && layerData?.earthquakes) {
      layerData.earthquakes.forEach(eq => {
        result.push({
          lat: eq.latitude,
          lng: eq.longitude,
          color: eq.magnitude >= 6 ? '#dc2626' : eq.magnitude >= 5 ? '#ef4444' : '#f59e0b',
          size: Math.max(0.6, eq.magnitude * 0.3),
          label: `M${eq.magnitude.toFixed(1)}`,
          sublabel: eq.title,
        });
      });
    }

    // Weather
    if (isLayerOn('weather') && layerData?.weather) {
      layerData.weather.forEach(wx => {
        const wxColor = wx.severity === 'extreme' ? '#dc2626' : wx.severity === 'severe' ? '#ef4444' : '#3b82f6';
        result.push({
          lat: wx.latitude,
          lng: wx.longitude,
          color: wxColor,
          size: 0.6,
          label: wx.city,
          sublabel: `${wx.temperature_c}°C · ${wx.condition}`,
        });
      });
    }

    // Cyber threats
    if (isLayerOn('cyber') && layerData?.cyber) {
      layerData.cyber.filter(c => c.latitude && c.longitude).forEach(c => {
        result.push({
          lat: c.latitude,
          lng: c.longitude,
          color: '#a855f7',
          size: 0.7,
          label: c.malware,
          sublabel: `${c.ip} · ${c.country}`,
        });
      });
    }

    // Disasters
    if (isLayerOn('disasters') && layerData?.disasters) {
      layerData.disasters.filter(d => d.latitude && d.longitude).forEach(d => {
        result.push({
          lat: d.latitude!,
          lng: d.longitude!,
          color: '#f97316',
          size: 0.9,
          label: d.title,
          sublabel: d.description?.slice(0, 60),
        });
      });
    }

    // Air Traffic (flights)
    if (isLayerOn('flights') && layerData?.flights) {
      layerData.flights
        .filter(f => f.latitude != null && f.longitude != null)
        .slice(0, 300) // cap for 3D performance
        .forEach(f => {
          result.push({
            lat: f.latitude!,
            lng: f.longitude!,
            color: f.on_ground ? '#64748b' : '#38bdf8',
            size: 0.4,
            label: f.callsign ?? f.icao24,
            sublabel: `${f.origin_country} · ${f.baro_altitude ? Math.round(f.baro_altitude * 3.28084).toLocaleString() + ' ft' : 'GND'}`,
          });
        });
    }

    // NASA EONET Events
    if (isLayerOn('nasaEvents') && layerData?.nasaEvents) {
      layerData.nasaEvents.filter(e => e.latitude != null && e.longitude != null).forEach(e => {
        const catColor: Record<string, string> = {
          'Wildfires': '#ef4444', 'Severe Storms': '#8b5cf6', 'Volcanoes': '#dc2626',
          'Sea and Lake Ice': '#67e8f9', 'Floods': '#3b82f6', 'Drought': '#fbbf24',
        };
        result.push({
          lat: e.latitude!,
          lng: e.longitude!,
          color: catColor[e.category] ?? '#34d399',
          size: 0.8,
          label: e.title,
          sublabel: `${e.category} · ${e.source}`,
        });
      });
    }

    // Fire Hotspots
    if (isLayerOn('fires') && layerData?.fires) {
      layerData.fires.slice(0, 200).forEach(f => {
        result.push({
          lat: f.latitude,
          lng: f.longitude,
          color: f.confidence === 'high' ? '#dc2626' : f.confidence === 'nominal' ? '#f97316' : '#fbbf24',
          size: Math.min(1.2, f.brightness / 350),
          label: `${f.brightness.toFixed(0)}K`,
          sublabel: `VIIRS · ${f.confidence}`,
        });
      });
    }

    return result;
  }, [signals, layers, layerData, isLayerOn]);

  // Arcs between high-severity points
  const arcs = useMemo<ArcData[]>(() => {
    const highPts = points.filter(p => p.size >= 0.8);
    const result: ArcData[] = [];
    for (let i = 0; i < Math.min(highPts.length, 10); i++) {
      const current = highPts[i];
      const next = highPts[(i + 1) % highPts.length];
      if (current && next) {
        result.push({
          from: [current.lat, current.lng],
          to: [next.lat, next.lng],
          color: current.color,
        });
      }
    }
    return result;
  }, [points]);

  return (
    <div className="w-full h-full" style={{ background: '#050a14' }}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#050a14' }}
      >
        <GlobeScene points={points} arcs={arcs} />
      </Canvas>

      {/* Overlay: point count */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
        <span className="text-[10px] font-mono text-amber/40 tracking-wider">
          {points.length} ACTIVE NODES · DRAG TO ROTATE · SCROLL TO ZOOM
        </span>
      </div>
    </div>
  );
}
