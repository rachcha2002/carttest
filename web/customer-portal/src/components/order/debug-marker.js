// Debug script for marker update issues
// Copy and paste this into the browser console when the map is visible

(function() {
  console.log("Debug script loaded");
  
  // Patch the reverseGeocode function in MapPreview component
  function patchReverseGeocode() {
    try {
      // Find all React component instances
      const reactInstances = Array.from(document.querySelectorAll('*')).filter(el => {
        return Object.keys(el).some(key => key.startsWith('__reactFiber$'));
      });
      
      console.log("Found", reactInstances.length, "React instances");
      
      // Try to find the MapPreview component
      let mapComponent = null;
      let mapComponentFound = false;
      
      reactInstances.forEach(instance => {
        const fiberKey = Object.keys(instance).find(key => key.startsWith('__reactFiber$'));
        if (!fiberKey) return;
        
        let fiber = instance[fiberKey];
        while (fiber) {
          if (fiber.memoizedProps && 
              fiber.memoizedProps.onLocationSelect && 
              fiber.memoizedState && 
              fiber.memoizedState.geocoder) {
            mapComponent = fiber;
            mapComponentFound = true;
            console.log("Found MapPreview component!", fiber);
            break;
          }
          
          fiber = fiber.return;
        }
      });
      
      if (!mapComponentFound) {
        console.error("MapPreview component not found");
        return;
      }
      
      console.log("Original onLocationSelect:", mapComponent.memoizedProps.onLocationSelect);
      
      // Monkey patch the onLocationSelect callback
      const originalOnLocationSelect = mapComponent.memoizedProps.onLocationSelect;
      mapComponent.memoizedProps.onLocationSelect = function(lat, lng, address) {
        console.log("INTERCEPTED onLocationSelect call:", lat, lng, address);
        
        // Force update on LocationSelector
        try {
          document.querySelector('input[placeholder="Enter your delivery address"]').value = address;
          const event = new Event('change', { bubbles: true });
          document.querySelector('input[placeholder="Enter your delivery address"]').dispatchEvent(event);
          
          // Force blur to trigger address update
          document.querySelector('input[placeholder="Enter your delivery address"]').blur();
        } catch (e) {
          console.error("Error updating input:", e);
        }
        
        return originalOnLocationSelect(lat, lng, address);
      };
      
      console.log("Patched onLocationSelect function!");
      
      // Test forcing an update
      if (mapComponent.memoizedState.marker && mapComponent.memoizedState.geocoder) {
        console.log("Trying forced update with current marker position...");
        const position = mapComponent.memoizedState.marker.getPosition();
        
        if (position) {
          console.log("Marker position:", position.lat(), position.lng());
          mapComponent.memoizedState.geocoder.geocode(
            { location: { lat: position.lat(), lng: position.lng() } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                console.log("Forced geocode result:", results[0].formatted_address);
                mapComponent.memoizedProps.onLocationSelect(
                  position.lat(),
                  position.lng(),
                  results[0].formatted_address
                );
              }
            }
          );
        }
      }
      
    } catch (e) {
      console.error("Error patching components:", e);
    }
  }
  
  // Run the patch
  setTimeout(patchReverseGeocode, 1000);
  
  // Add a button to manually trigger an update
  const debugButton = document.createElement('button');
  debugButton.textContent = 'Force Location Update';
  debugButton.style.position = 'fixed';
  debugButton.style.top = '10px';
  debugButton.style.right = '10px';
  debugButton.style.zIndex = '9999';
  debugButton.style.padding = '8px 16px';
  debugButton.style.backgroundColor = '#ff0000';
  debugButton.style.color = 'white';
  debugButton.style.borderRadius = '4px';
  debugButton.style.border = 'none';
  debugButton.onclick = patchReverseGeocode;
  
  document.body.appendChild(debugButton);
  
  console.log("Debug interface added - click the red button at top right to force location update");
})(); 