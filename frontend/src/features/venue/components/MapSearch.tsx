import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import type { VenueItem } from "../types/venue.types";

// Fix missing marker icons in leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Apply default icon fix
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapSearchProps {
  venues: VenueItem[];
}

// A helper component to automatically adjust map view based on markers
function MapBounds({ venues }: { venues: VenueItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (venues.length === 0) return;
    
    const validVenues = venues.filter(v => v.latitude != null && v.longitude != null);
    if (validVenues.length === 0) return;

    const bounds = L.latLngBounds(
      validVenues.map(v => [v.latitude!, v.longitude!])
    );
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [venues, map]);

  return null;
}

export function MapSearch({ venues }: MapSearchProps) {
  const navigate = useNavigate();

  // Filter out venues without coordinates
  const venuesWithCoords = venues.filter(v => v.latitude != null && v.longitude != null);

  // Default center if no venues (e.g. Hanoi)
  const defaultCenter: [number, number] = [21.028511, 105.804817];
  
  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {venuesWithCoords.map((venue) => (
          <Marker 
            key={venue.id} 
            position={[venue.latitude!, venue.longitude!]}
          >
            <Popup className="venue-popup" minWidth={250}>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-gray-800 m-0 leading-tight">{venue.name}</h3>
                <p className="text-sm text-gray-600 m-0 line-clamp-2">{venue.address}</p>
                {venue.minPrice && (
                  <div className="font-semibold text-[#005E2E]">
                    Từ {venue.minPrice.toLocaleString("vi-VN")} đ
                  </div>
                )}
                <button
                  onClick={() => navigate(`/player/venues/${venue.id}`)}
                  className="mt-2 bg-[#005E2E] hover:bg-[#004a25] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Đặt ngay
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapBounds venues={venuesWithCoords} />
      </MapContainer>
    </div>
  );
}
