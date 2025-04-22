import React, { useState, useRef, useEffect } from 'react';

interface StatusUpdateDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const StatusUpdateDropdown: React.FC<StatusUpdateDropdownProps> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { value: 'order-received', label: 'Order Received' },
    { value: 'preparing-your-order', label: 'Preparing Order' },
    { value: 'wrapping-up', label: 'Wrapping Up' },
    { value: 'picking-up', label: 'Picking Up' },
    { value: 'heading-your-way', label: 'Heading Your Way' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const currentStatusLabel = statusOptions.find(option => option.value === currentStatus)?.label || 'Update Status';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    onStatusChange(value);
    setIsOpen(false);
  };

  // Determine if status is completed or cancelled and disable dropdown
  const isDisabled = currentStatus === 'delivered' || currentStatus === 'cancelled';

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "order-received":
        return "bg-yellow-100 text-yellow-800";
      case "preparing-your-order":
        return "bg-[#f29f05]/10 text-[#f29f05]";
      case "wrapping-up":
        return "bg-blue-100 text-blue-800";
      case "picking-up":
        return "bg-purple-100 text-purple-800";
      case "heading-your-way":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className={`inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f29f05] ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          disabled={isDisabled}
        >
          <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(currentStatus)}`}>
            {currentStatusLabel}
          </span>
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`${
                  currentStatus === option.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                role="menuitem"
              >
                <span className={`inline-block mr-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(option.value)}`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusUpdateDropdown; 