import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface LocationPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialAddress = "",
  initialLat = 0,
  initialLng = 0,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const newMap = new google.maps.Map(mapRef.current, {
          center: { lat: initialLat || 0, lng: initialLng || 0 },
          zoom: 15,
        });
        setMap(newMap);

        if (initialLat && initialLng) {
          const newMarker = new google.maps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map: newMap,
          });
          setMarker(newMarker);
        }

        if (inputRef.current) {
          const newAutocomplete = new google.maps.places.Autocomplete(
            inputRef.current
          );
          setAutocomplete(newAutocomplete);

          newAutocomplete.addListener("place_changed", () => {
            const place = newAutocomplete.getPlace();
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              const address = place.formatted_address || "";

              setAddress(address);
              newMap.setCenter({ lat, lng });
              newMap.setZoom(15);

              if (marker) {
                marker.setMap(null);
              }

              const newMarker = new google.maps.Marker({
                position: { lat, lng },
                map: newMap,
              });
              setMarker(newMarker);

              onLocationSelect(address, lat, lng);
            }
          });
        }
      }
    });
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (map && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      if (marker) {
        marker.setMap(null);
      }

      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map,
      });
      setMarker(newMarker);

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const address = results[0].formatted_address;
          setAddress(address);
          onLocationSelect(address, lat, lng);
        }
      });
    }
  };

  useEffect(() => {
    if (map) {
      map.addListener("click", handleMapClick);
      return () => {
        google.maps.event.clearListeners(map, "click");
      };
    }
  }, [map]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div ref={mapRef} className="w-full h-64 rounded-lg border" />
    </div>
  );
};

export default LocationPicker;
