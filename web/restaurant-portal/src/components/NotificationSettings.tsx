import React, { useState, useEffect } from 'react';
import { 
  getSoundEnabled, 
  setSoundEnabled, 
  getSoundVolume, 
  setSoundVolume,
  playNotificationSound
} from '../utils/SoundUtils';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled());
  const [volume, setVolumeState] = useState(getSoundVolume() * 100); // Convert to percentage for slider

  useEffect(() => {
    // Load settings when component mounts
    setSoundEnabledState(getSoundEnabled());
    setVolumeState(getSoundVolume() * 100);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSoundToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setSoundEnabledState(enabled);
    setSoundEnabled(enabled);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(event.target.value);
    setVolumeState(newVolume);
    setSoundVolume(newVolume / 100); // Convert from percentage to 0-1 range
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>
        
        <div 
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            <p className="text-sm text-gray-500">Customize how you receive notifications</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Notification Sounds</h4>
                <p className="text-xs text-gray-500">Play sounds for new notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={soundEnabled}
                  onChange={handleSoundToggle}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f29f05]"></div>
              </label>
            </div>
            
            {soundEnabled && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Volume</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 8c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z" />
                    </svg>
                  </span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m3.183-9.172a9 9 0 010 11.313M10.704 6.646a5 5 0 010 7.072M7.521 4.464a9 9 0 010 11.313" />
                    </svg>
                  </span>
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {volume}%
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <button
                type="button"
                onClick={handleTestSound}
                disabled={!soundEnabled}
                className={`mr-2 px-4 py-2 text-sm font-medium rounded-md ${
                  soundEnabled 
                    ? 'bg-[#f29f05] text-white hover:bg-[#f29f05]/90' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Test Sound
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings; 