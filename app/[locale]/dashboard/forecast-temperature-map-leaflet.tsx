"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export type LeafletForecastMapProps = {
  center: [number, number];
  currentTemperature: number | null;
  dailyMin: number | null;
  dailyMax: number | null;
  labels: {
    ariaLabel: string;
    current: string;
    dailyRange: string;
    location: string;
    timezone: string;
    unavailable: string;
  };
  timezone: string;
};

function formatTemperature(value: number | null) {
  if (value === null || Number.isNaN(value)) return "–";
  return `${value.toFixed(1)} °C`;
}

function ForecastMapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

export function LeafletForecastMap({
  center,
  currentTemperature,
  dailyMin,
  dailyMax,
  labels,
  timezone,
}: LeafletForecastMapProps) {
  const temperatureLabel = formatTemperature(currentTemperature);
  const dailyRange =
    dailyMin === null && dailyMax === null
      ? labels.unavailable
      : `${formatTemperature(dailyMin)} / ${formatTemperature(dailyMax)}`;

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="
            min-width: 78px;
            transform: translate(-50%, -100%);
            border-radius: 999px;
            border: 2px solid white;
            background: linear-gradient(135deg, #f59e0b 0%, #34d399 52%, #0d9488 100%);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
            color: #042f2e;
            font: 900 13px/1.1 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            letter-spacing: -0.02em;
            padding: 10px 12px;
            text-align: center;
            white-space: nowrap;
          ">
            ${temperatureLabel}
          </div>
        `,
        iconAnchor: [0, 0],
        popupAnchor: [0, -48],
      }),
    [temperatureLabel],
  );

  return (
    <MapContainer
      aria-label={labels.ariaLabel}
      center={center}
      className="h-full min-h-[28rem] w-full rounded-[1.65rem] sm:min-h-[32rem]"
      scrollWheelZoom={false}
      zoom={10}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ForecastMapRecenter center={center} />
      <Marker icon={markerIcon} position={center}>
        <Popup>
          <div className="min-w-48 space-y-2 text-sm">
            <p className="font-bold text-zinc-950">{labels.current}</p>
            <p>{temperatureLabel}</p>
            <p className="font-bold text-zinc-950">{labels.dailyRange}</p>
            <p>{dailyRange}</p>
            <p className="font-bold text-zinc-950">{labels.location}</p>
            <p>
              {center[0].toFixed(4)}, {center[1].toFixed(4)}
            </p>
            <p className="font-bold text-zinc-950">{labels.timezone}</p>
            <p>{timezone}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
