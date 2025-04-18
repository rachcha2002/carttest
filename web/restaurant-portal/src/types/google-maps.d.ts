// src/types/google-maps.d.ts
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng | LatLngLiteral): void;
      getPosition(): LatLng;
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(point: LatLng): LatLngBounds;
    }

    class Geocoder {
      geocode(
        request: {
          address?: string;
          location?: LatLng | LatLngLiteral;
        },
        callback: (results: GeocoderResult[], status: GeocoderStatus) => void
      ): void;
    }

    interface GeocoderResult {
      geometry: {
        location: LatLng;
        viewport?: LatLngBounds;
      };
      formatted_address: string;
      place_id: string;
    }

    type GeocoderStatus =
      | "OK"
      | "ZERO_RESULTS"
      | "OVER_QUERY_LIMIT"
      | "REQUEST_DENIED"
      | "INVALID_REQUEST"
      | "UNKNOWN_ERROR";

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      draggable?: boolean;
    }

    interface MapsEventListener {
      remove(): void;
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: Function): MapsEventListener;
        bindTo(bindKey: string, target: any): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        bounds?: LatLngBounds;
        componentRestrictions?: { country: string | string[] };
        fields?: string[];
        types?: string[];
      }

      interface PlaceResult {
        address_components?: any[];
        adr_address?: string;
        formatted_address?: string;
        geometry: {
          location: LatLng;
          viewport?: LatLngBounds;
        };
        icon?: string;
        name?: string;
        photos?: any[];
        place_id?: string;
        types?: string[];
      }
    }
  }
}
