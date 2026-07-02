"use client";

// インタラクティブ・タイル地図（Leaflet + CARTO light）。
// 承認済みモックの #lmap 相当：カテゴリ色の CircleMarker + ポップアップ（大会名/種別/日付/開催地）。
// JBCF タグ付きは濃青リングで区別。

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { Event } from "@/lib/types";
import { catLabel, shortDate } from "@/lib/ui";
import { CATEGORIES, JBCF_COLOR } from "@/lib/categories";

export default function TileMap({ events }: { events: Event[] }) {
  return (
    <MapContainer
      center={[37.8, 137.6]}
      zoom={5}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap © CARTO"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={18}
      />
      {events.map((e) => (
        <CircleMarker
          key={e.id}
          center={[e.lat, e.lng]}
          radius={e.featured ? 7 : 6}
          pathOptions={{
            color: (e.tags ?? []).includes("JBCF") ? JBCF_COLOR : "#fff",
            weight: (e.tags ?? []).includes("JBCF") ? 2.2 : 1.6,
            fillColor: CATEGORIES[e.category].color,
            fillOpacity: 1,
          }}
        >
          <Popup>
            <b>{e.name}</b>
            <br />
            {catLabel(e.category)} ・ {shortDate(e.date)}
            <br />
            {e.location}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
