// Function to get notification sound setting from localStorage
export const getSoundEnabled = (): boolean => {
  const setting = localStorage.getItem('notification_sound_enabled');
  return setting === null ? true : setting === 'true';
};

// Function to set notification sound setting in localStorage
export const setSoundEnabled = (enabled: boolean): void => {
  localStorage.setItem('notification_sound_enabled', enabled.toString());
};

// Function to get notification volume from localStorage
export const getSoundVolume = (): number => {
  const volume = localStorage.getItem('notification_sound_volume');
  return volume === null ? 0.5 : parseFloat(volume);
};

// Function to set notification volume in localStorage
export const setSoundVolume = (volume: number): void => {
  localStorage.setItem('notification_sound_volume', volume.toString());
};

// Play notification sound
export const playNotificationSound = (): void => {
  if (!getSoundEnabled()) return;
  
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = getSoundVolume();
    
    // Some browsers require user interaction before playing audio
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Notification sound could not be played:', error);
      });
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};

// Create a preloaded audio element for better performance
let preloadedAudio: HTMLAudioElement | null = null;

// Preload notification sound
export const preloadNotificationSound = (): void => {
  try {
    preloadedAudio = new Audio('/notification.mp3');
    preloadedAudio.load();
  } catch (error) {
    console.error('Error preloading notification sound:', error);
  }
};

// Play the preloaded notification sound
export const playPreloadedNotificationSound = (): void => {
  if (!getSoundEnabled() || !preloadedAudio) return;
  
  try {
    // Create a clone to allow overlapping sounds
    const audioClone = preloadedAudio.cloneNode() as HTMLAudioElement;
    audioClone.volume = getSoundVolume();
    
    const playPromise = audioClone.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Preloaded notification sound could not be played:', error);
      });
    }
  } catch (error) {
    console.error('Error playing preloaded notification sound:', error);
  }
}; 