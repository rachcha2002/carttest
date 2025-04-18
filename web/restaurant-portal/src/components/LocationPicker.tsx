import React, { useState, useEffect, useRef } from "react";

interface LocationPickerProps {
  onChange: (location: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  }) => void;
  initialAddress?: string;
  initialCoordinates?: [number, number];
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onChange,
  initialAddress = "",
  initialCoordinates = [0, 0],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] =
    useState<[number, number]>(initialCoordinates);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not loaded");
      return;
    }

    if (!mapRef.current) return;

    // Initialize the map with initial coordinates if available
    const initialCenter =
      initialCoordinates[0] !== 0 && initialCoordinates[1] !== 0
        ? { lat: initialCoordinates[1], lng: initialCoordinates[0] }
        : { lat: 6.9271, lng: 79.8612 }; // Default to Colombo, Sri Lanka

    // Initialize the map
    const map = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 13,
    });

    // Create a marker at initial position
    const marker = new google.maps.Marker({
      position: initialCenter,
      map,
      draggable: true,
    });

    // Initialize autocomplete if input exists
    if (inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current
      );
      autocomplete.bindTo("bounds", map);

      // Set initial address if provided
      if (initialAddress) {
        inputRef.current.value = initialAddress;
      }

      // Handle place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        // Update map
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        // Update marker
        marker.setPosition(place.geometry.location);

        // Update state
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates([lng, lat]);
        setAddress(place.formatted_address || "");

        // Notify parent
        onChange({
          address: place.formatted_address || "",
          coordinates: [lng, lat],
        });
      });
    }

    // Handle marker drag
    marker.addListener("dragend", () => {
      const position = marker.getPosition();
      if (!position) return;

      const lat = position.lat();
      const lng = position.lng();
      setCoordinates([lng, lat]);

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setAddress(results[0].formatted_address);

          // Notify parent
          onChange({
            address: results[0].formatted_address,
            coordinates: [lng, lat],
          });
        }
      });
    });
  }, [onChange, initialAddress, initialCoordinates]);

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="location-input"
          className="block text-sm font-medium text-gray-700"
        >
          Restaurant Address
        </label>
        <input
          ref={inputRef}
          id="location-input"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Search for your restaurant location"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#f29f05] focus:outline-none focus:ring-1 focus:ring-[#f29f05] sm:text-sm"
        />
      </div>

      <div
        ref={mapRef}
        className="h-64 w-full rounded-lg border border-gray-300 shadow-sm"
      ></div>

      <div className="flex space-x-4">
        <div>
          <label className="block text-xs text-gray-500">Longitude</label>
          <input
            type="text"
            readOnly
            value={coordinates[0]}
            className="mt-1 block w-full text-xs bg-gray-50 rounded-md border border-gray-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Latitude</label>
          <input
            type="text"
            readOnly
            value={coordinates[1]}
            className="mt-1 block w-full text-xs bg-gray-50 rounded-md border border-gray-300 px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
