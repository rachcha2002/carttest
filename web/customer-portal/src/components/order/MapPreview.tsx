import React, { useRef, useEffect, useState } from 'react';

interface MapPreviewProps {
  address?: string;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

// Define window with optional initMap property
declare global {
  interface Window {
    google: any;
    initMap?: () => void;  // Mark initMap as optional with ?
  }
}

// Use the provided Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyCgPYZ5K8EXB0Ip5jGMASp-mAXOVzw7BTk";

const MapPreview: React.FC<MapPreviewProps> = ({ address, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [searchBox, setSearchBox] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocationFound, setUserLocationFound] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [currentLocationSelected, setCurrentLocationSelected] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  // Check if viewport is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Try to get user location before loading the map
  useEffect(() => {
    if (navigator.geolocation && !userLocationFound) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocationFound(true);
        },
        (error) => {
          console.log("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [userLocationFound]);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setInitializing(false);
      };
      
      // Handle script load error
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your internet connection and try again.');
        setInitializing(false);
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
        // Safely remove the initMap property from window
        if (window.initMap) {
          window.initMap = undefined;
        }
      };
    } else {
      setInitializing(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!initializing && mapRef.current && !map && window.google) {
      try {
        // A more neutral default center (0,0 is in the Atlantic Ocean)
        // Using a moderate zoom level to show a wider area
        let defaultCenter = { lat: 0, lng: 0 };
        let defaultZoom = 2;
        
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapTypeControl: isMobile ? false : true,
          streetViewControl: false,
          fullscreenControl: !isMobile,
          zoomControl: !isMobile, // Hide zoom controls on mobile for more map space
          // Apply dark mode styles if user prefers dark mode
          styles: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 
            [
              { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
              },
              {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
              },
              {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
              },
              {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
              },
              {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
              },
              {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
              },
            ] 
            : []
        });
        
        const newMarker = new window.google.maps.Marker({
          map: newMap,
          draggable: true,
          position: newMap.getCenter(),
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(isMobile ? 32 : 40, isMobile ? 32 : 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(isMobile ? 16 : 20, isMobile ? 32 : 40)
          }
        });
        
        const newGeocoder = new window.google.maps.Geocoder();
        
        // Define a more robust update function that ensures UI updates
        const updateLocationAndUI = (lat: number, lng: number) => {
          console.log("updateLocationAndUI called with", lat, lng);
          
          // Create a message to show marker movement is detected
          const messageDiv = document.createElement('div');
          messageDiv.textContent = 'Updating location...';
          messageDiv.style.position = 'absolute';
          messageDiv.style.top = '60px';
          messageDiv.style.left = '50%';
          messageDiv.style.transform = 'translateX(-50%)';
          messageDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
          messageDiv.style.color = 'white';
          messageDiv.style.padding = '8px 16px';
          messageDiv.style.borderRadius = '4px';
          messageDiv.style.zIndex = '9999';
          
          if (mapRef.current) {
            mapRef.current.appendChild(messageDiv);
            
            // Auto-remove after 2 seconds
            setTimeout(() => {
              if (mapRef.current && mapRef.current.contains(messageDiv)) {
                mapRef.current.removeChild(messageDiv);
              }
            }, 2000);
          }
          
          // Do the geocoding
          newGeocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              const formattedAddress = results[0].formatted_address;
              
              // Update the search box
              if (searchBoxRef.current) {
                searchBoxRef.current.value = formattedAddress;
              }
              
              // Notify parent component
              onLocationSelect(lat, lng, formattedAddress);
              
              // Direct DOM update for the address input field in the parent component
              try {
                const addressInput = document.querySelector('input[placeholder="Enter your delivery address"]') as HTMLInputElement;
                if (addressInput) {
                  addressInput.value = formattedAddress;
                  
                  // Create and dispatch events to trigger React state updates
                  const changeEvent = new Event('change', { bubbles: true });
                  addressInput.dispatchEvent(changeEvent);
                  
                  // Force blur to trigger save
                  addressInput.blur();
                }
              } catch (e) {
                console.error("Error with direct DOM update:", e);
              }
            }
          });
        };
        
        // Set up marker drag end event with the robust update function
        window.google.maps.event.addListener(newMarker, 'dragend', () => {
          const position = newMarker.getPosition();
          console.log("Marker dragend event triggered", position.lat(), position.lng());
          
          // Use the robust update function
          updateLocationAndUI(position.lat(), position.lng());
        });
        
        // Also listen for drag events to update position in real-time
        window.google.maps.event.addListener(newMarker, 'drag', () => {
          const position = newMarker.getPosition();
          // Update map center to follow marker while dragging
          newMap.panTo(position);
        });
        
        // Set up map click event with the robust update function
        window.google.maps.event.addListener(newMap, 'click', (event: any) => {
          newMarker.setPosition(event.latLng);
          
          // Use the robust update function
          updateLocationAndUI(event.latLng.lat(), event.latLng.lng());
        });
        
        // Initialize search box if search input is available
        if (searchBoxRef.current) {
          const newSearchBox = new window.google.maps.places.SearchBox(searchBoxRef.current);
          
          // Listen for the event fired when the user selects a prediction
          newSearchBox.addListener('places_changed', () => {
            const places = newSearchBox.getPlaces();
            
            if (places.length === 0) {
              return;
            }
            
            const place = places[0];
            
            if (!place.geometry || !place.geometry.location) {
              console.log("Returned place contains no geometry");
              return;
            }
            
            // If the place has a geometry, then center the map and set marker
            if (place.geometry.viewport) {
              newMap.fitBounds(place.geometry.viewport);
            } else {
              newMap.setCenter(place.geometry.location);
              newMap.setZoom(17);
            }
            
            newMarker.setPosition(place.geometry.location);
            
            // Get formatted address and pass to parent component
            if (place.formatted_address) {
              onLocationSelect(
                place.geometry.location.lat(),
                place.geometry.location.lng(),
                place.formatted_address
              );
            }
          });
          
          // Bias the SearchBox results towards current map's viewport
          newMap.addListener('bounds_changed', () => {
            newSearchBox.setBounds(newMap.getBounds());
          });
          
          setSearchBox(newSearchBox);
        }
        
        setMap(newMap);
        setMarker(newMarker);
        setGeocoder(newGeocoder);
        
        // If an address is provided, geocode it
        if (address && address.trim() !== '') {
          geocodeAddress(address, newGeocoder, newMap, newMarker);
        }
        
        // Prioritize getting user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              
              newMap.setCenter(pos);
              newMap.setZoom(isMobile ? 16 : 15); // Closer zoom on mobile
              newMarker.setPosition(pos);
              
              // Always reverse geocode and automatically select the location
              if (!currentLocationSelected) {
                reverseGeocode(pos.lat, pos.lng);
                setCurrentLocationSelected(true);
              }
              
              setUserLocationFound(true);
            },
            (error) => {
              console.log("Geolocation failed:", error);
              // If we have an address but no user location, try to geocode the address
              if (address && address.trim() !== '') {
                geocodeAddress(address, newGeocoder, newMap, newMarker);
              } else {
                // If IP geolocation is available, we could use that here
                console.log("Using default world view");
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        setError('An error occurred while initializing the map. Please refresh the page.');
      }
    }
  }, [initializing, map, address, onLocationSelect, userLocationFound, isMobile, currentLocationSelected]);

  // Geocode address to coordinates
  const geocodeAddress = (
    address: string, 
    geocoder: any, 
    map: any, 
    marker: any
  ) => {
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(isMobile ? 16 : 15); // Closer zoom when we have a specific address, even closer on mobile
        marker.setPosition(location);
      } else {
        console.warn(`Geocode was not successful for the following reason: ${status}`);
      }
    });
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = (lat: number, lng: number) => {
    if (geocoder) {
      const latlng = { lat, lng };
      
      setIsUpdatingAddress(true);
      console.log("Starting reverse geocoding for:", lat, lng);
      
      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const formattedAddress = results[0].formatted_address;
          console.log("Geocoding success:", formattedAddress);
          
          // Always update the search box with the new address when available
          if (searchBoxRef.current) {
            searchBoxRef.current.value = formattedAddress;
          }
          
          // Notify parent component about the new location
          // Explicit callback with new coordinates and address
          try {
            onLocationSelect(lat, lng, formattedAddress);
            console.log("Location select callback executed with:", formattedAddress);
          } catch (err) {
            console.error("Error in location select callback:", err);
          }
        } else {
          console.warn(`Reverse geocode was not successful for the following reason: ${status}`);
          // Still provide coordinates even if we can't get an address
          const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          if (searchBoxRef.current) {
            searchBoxRef.current.value = fallbackAddress;
          }
          
          try {
            onLocationSelect(lat, lng, fallbackAddress);
            console.log("Location select callback executed with fallback:", fallbackAddress);
          } catch (err) {
            console.error("Error in location select callback with fallback:", err);
          }
        }
        
        setIsUpdatingAddress(false);
      });
    } else {
      console.error("Geocoder not initialized");
    }
  };

  // Update marker position when address changes
  useEffect(() => {
    if (geocoder && map && marker && address && address.trim() !== '') {
      geocodeAddress(address, geocoder, map, marker);
    }
  }, [address, geocoder, map, marker, isMobile]);

  return (
    <div className="w-full h-full relative">
      {error ? (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-red-500 dark:text-red-400 text-center p-4 text-base md:text-lg">{error}</p>
        </div>
      ) : initializing ? (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">Loading map...</p>
        </div>
      ) : (
        <>
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-10 bg-white dark:bg-gray-700 rounded-md shadow-md">
            <input
              ref={searchBoxRef}
              type="text"
              placeholder={isMobile ? "Search location" : "Search for a location"}
              className="w-full p-2 md:p-3 rounded-md border border-gray-300 dark:border-gray-600 text-sm md:text-base dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div ref={mapRef} className="w-full h-full rounded-md" />
          
          {/* Location update indicator */}
          {isUpdatingAddress && (
            <div className="absolute top-12 sm:top-14 left-0 right-0 z-10 flex justify-center pointer-events-none">
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs shadow-lg flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating address...
              </div>
            </div>
          )}
          
          {/* Location marker indicator for mobile devices */}
          {isMobile && (
            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs shadow-lg">
                Tap to select this location
              </div>
            </div>
          )}
          
          {/* Info panel for desktop */}
          {!isMobile && (
            <div className="absolute bottom-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-md shadow-lg p-3 max-w-xs">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Map Controls</h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300">
                <li>• Click anywhere to place marker</li>
                <li>• Drag marker to adjust position</li>
                <li>• Use search box to find locations</li>
                <li>• Use zoom controls to adjust view</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MapPreview; 