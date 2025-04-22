import React, { useState, useEffect } from 'react';
import { MapPinIcon, MapIcon } from '@heroicons/react/24/solid';
import MapPreview from './MapPreview';

interface LocationSelectorProps {
  initialAddress?: string;
  onAddressChange: (address: string) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  initialAddress = '', 
  onAddressChange,
  onLocationSelect
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | null>(null);
  const [attemptedLocationAccess, setAttemptedLocationAccess] = useState(false);

  // Automatically try to get the user's location on component mount
  useEffect(() => {
    if (!attemptedLocationAccess && initialAddress === '') {
      getCurrentLocation();
      setAttemptedLocationAccess(true);
    }
  }, [initialAddress, attemptedLocationAccess]);

  // Function to get current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    setShowMap(true); // Show map immediately so user can see it's working
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setCoordinates({ lat, lng });
          
          // Notify parent component of the location change if callback exists
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
          
          // Reverse geocode the coordinates to get the address
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCgPYZ5K8EXB0Ip5jGMASp-mAXOVzw7BTk`
            );
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const formattedAddress = data.results[0].formatted_address;
              setAddress(formattedAddress);
              // Notify parent component of the address change
              onAddressChange(formattedAddress);
            }
          } catch (geocodeError) {
            console.error("Error reverse geocoding:", geocodeError);
          }
          
          setLoading(false);
        } catch (error) {
          setError('Failed to get address from coordinates');
          setLoading(false);
        }
      },
      (error) => {
        let errorMessage = 'Error getting location';
        
        // Provide more helpful error messages
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = `Error getting location: ${error.message}`;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Toggle map display
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  // Manual address input handler
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  // Save address when input loses focus
  const handleAddressBlur = () => {
    onAddressChange(address);
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, formattedAddress: string) => {
    console.log("Location selected:", lat, lng, formattedAddress);
    setCoordinates({ lat, lng });
    setAddress(formattedAddress);
    
    // Force update the parent component immediately with the new address
    onAddressChange(formattedAddress);
    
    // Notify parent component of the location coordinates if callback exists
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
    
    // Update the address input field in case it's not binding correctly
    const addressInput = document.querySelector('input[placeholder="Enter your delivery address"]') as HTMLInputElement;
    if (addressInput) {
      addressInput.value = formattedAddress;
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We'll just update the parent with the manually entered address
    onAddressChange(address);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <MapPinIcon className="h-5 w-5 md:h-6 md:w-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter your delivery address"
            className="flex-1 p-2 md:p-3 text-base md:text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            value={address}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
          />
        </form>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="w-full flex items-center justify-center px-3 py-2 md:py-3 text-sm md:text-base font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-blue-700 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Location...
              </>
            ) : (
              'Use Current Location'
            )}
          </button>
          
          <button
            type="button"
            onClick={toggleMap}
            className="w-full flex items-center justify-center px-3 py-2 md:py-3 text-sm md:text-base font-medium bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <MapIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            {showMap ? 'Hide Map' : 'Select on Map'}
          </button>
        </div>
        
        {error && (
          <p className="text-sm md:text-base text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}
      </div>
      
      {showMap && (
        <div className="mt-4 border rounded-md overflow-hidden dark:border-gray-700">
          <div className="h-60 sm:h-80 md:h-96"> {/* Taller map for better visualization */}
            <MapPreview 
              address={address}
              onLocationSelect={handleLocationSelect}
            />
          </div>
          <div className="p-2 md:p-3 bg-gray-50 dark:bg-gray-700 text-xs md:text-sm text-gray-600 dark:text-gray-300">
            <span className="hidden sm:inline">Click on the map to select a location or use the search box to find an address</span>
            <span className="sm:hidden">Tap on the map to select a location</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector; 