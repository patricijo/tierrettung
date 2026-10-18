import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Coordinates, NearbyHelper } from '../services/locationService';

interface RescueMapProps {
  center: Coordinates;
  helpers: NearbyHelper[];
  selectedHelperId: string | null;
  onSelectHelper: (id: string) => void;
}

export function RescueMap({
  center,
  helpers,
  selectedHelperId,
  onSelectHelper,
}: RescueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lon],
      zoom: 12,
      scrollWheelZoom: true,
    });

    const tileUrl =
      import.meta.env.VITE_OSM_TILE_URL ||
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = markersLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();
    map.setView([center.lat, center.lon], map.getZoom() || 12, {
      animate: true,
    });

    // User location marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #0f766e;
          border: 3px solid #ffffff;
          box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.3), 0 2px 6px rgba(0,0,0,0.35);
        "></div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([center.lat, center.lon], { icon: userIcon })
      .addTo(layerGroup)
      .bindPopup(
        `<div style="font-size:13px;font-weight:600;color:#0f172a;">Dein aktueller Fundort / Standort</div><div style="font-size:11px;color:#475569;">${center.lat.toFixed(5)}, ${center.lon.toFixed(5)}</div>`
      );

    // Helper markers
    helpers.forEach((helper) => {
      const isSelected = helper.id === selectedHelperId;
      const bg =
        helper.type === 'wildlife_rescue'
          ? '#15803d'
          : helper.type === 'animal_shelter'
            ? '#d97706'
            : helper.emergency
              ? '#dc2626'
              : '#2563eb';

      const size = isSelected ? 34 : 28;
      const badgeLabel =
        helper.type === 'wildlife_rescue'
          ? 'W'
          : helper.type === 'animal_shelter'
            ? 'T'
            : '+';

      const helperIcon = L.divIcon({
        className: 'custom-helper-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 9999px;
            background: ${bg};
            color: #ffffff;
            font-weight: 800;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: ${isSelected ? '3px solid #0f172a' : '2.5px solid #ffffff'};
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            transition: transform 0.15s ease;
          ">${badgeLabel}</div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([helper.lat, helper.lon], {
        icon: helperIcon,
      }).addTo(layerGroup);

      const phoneHtml = helper.phone
        ? `<a href="tel:${helper.phone}" style="display:inline-block;margin-top:6px;padding:4px 8px;background:#0f766e;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;font-size:12px;">Anrufen: ${helper.phone}</a>`
        : '';

      marker.bindPopup(`
        <div style="min-width:180px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:${bg};">${helper.typeLabel} (${helper.distanceKm} km)</div>
          <div style="font-size:13px;font-weight:700;color:#0f172a;margin-top:2px;">${helper.name}</div>
          ${helper.address ? `<div style="font-size:12px;color:#475569;margin-top:2px;">${helper.address}</div>` : ''}
          ${phoneHtml}
        </div>
      `);

      marker.on('click', () => {
        onSelectHelper(helper.id);
      });

      if (isSelected) {
        marker.openPopup();
      }
    });
  }, [center, helpers, selectedHelperId, onSelectHelper]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs">
      <div
        ref={mapContainerRef}
        className="h-72 w-full sm:h-80"
        aria-label="Interaktive Karte der Tierärzte, Tierkliniken und Tierheime im Umkreis"
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="inline-block h-3 w-3 rounded-full bg-teal-700 ring-2 ring-teal-200" />
          Dein Standort
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
          Tierklinik / Notdienst
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-600" />
          Tierarztpraxis
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-600" />
          Tierheim / Tierschutz
        </span>
      </div>
    </div>
  );
}
