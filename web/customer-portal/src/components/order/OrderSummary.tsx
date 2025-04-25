import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LocationSelector from "./LocationSelector";
import { MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../contexts/AuthContext";
import orderService from "../../services/orderService";
import { toast } from "react-hot-toast";

// Fallback dummy data in case cart is empty
const dummyOrder = {
  id: "ORD-12345",
  restaurantName: "Tasty Bites",
  items: [
    { id: 1, name: "Chicken Burger", quantity: 2, price: 12.99 },
    { id: 2, name: "French Fries", quantity: 1, price: 3.99 },
    { id: 3, name: "Coke", quantity: 2, price: 1.99 },
  ],
  subtotal: 33.95,
  tax: 2.71,
  deliveryFee: 2.99,
  total: 39.65,
  paymentMethod: "Credit Card",
  deliveryTime: "30-45 min",
};

// Sample restaurant data (static for now)
const sampleRestaurant = {
  restaurantInfo: {
    businessHours: {
      open: "10:00",
      close: "21:00",
    },
    location: {
      type: "Point",
      coordinates: [79.8747612487793, 6.928292856723946],
    },
    restaurantName: "Perera Indian Restaurant",
    description:
      "Perera Indian Restaurant offers authentic Indian cuisine in a warm, cozy setting with elegant decor and a welcoming vibe.",
    cuisine: ["indian"],
    images: [
      {
        url: "https://res.cloudinary.com/dn1w8k2l1/image/upload/v1745080636/xfawdqq9rcke1kwr1fw2.png",
        description: "",
        isPrimary: true,
        _id: "6803d14c69261470e97ecc5c",
        uploadedAt: "2025-04-19T16:37:32.327Z",
      },
    ],
  },
  deliveryInfo: {
    currentLocation: {
      type: "Point",
      coordinates: [0, 0],
    },
    documents: {
      driverLicense: {
        verified: false,
      },
      vehicleRegistration: {
        verified: false,
      },
      insurance: {
        verified: false,
      },
    },
    availabilityStatus: "offline",
  },
  _id: "6803d14c69261470e97ecc5b",
  name: "Janaka Perera",
  email: "jperera@gmail.com",
  phoneNumber: "0714804203",
  role: "restaurant",
  address: "213 Siri Dhamma Mawatha, Colombo 01000, Sri Lanka",
  isVerified: true,
  status: "active",
  defaultLocations: [],
  createdAt: "2025-04-19T16:37:32.328Z",
  updatedAt: "2025-04-19T16:37:32.328Z",
  __v: 0,
};

const OrderSummary: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, isEmpty, clearCart } = useCart();
  const { user } = useAuth();

  // Calculate tax and delivery fee
  const tax = totalAmount * 0.08; // 8% tax
  const deliveryFee = 2.99;
  const orderTotal = totalAmount + tax + deliveryFee;

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [addressChanged, setAddressChanged] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate a stable order ID that won't change on re-renders
  const [orderId, setOrderId] = useState<string>("");

  // Generate the order ID once when component mounts
  useEffect(() => {
    setOrderId(`ORD-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  // Automatically try to get user's location on component mount
  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      setIsValidatingAddress(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Store coordinates
          setLocationCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsValidatingAddress(false);
        },
        (error) => {
          // Error getting location
          console.log("Geolocation error:", error);
          setIsValidatingAddress(false);
          setUseCurrentLocation(false);
        }
      );
    }
  }, [useCurrentLocation]);

  const handleAddressChange = (newAddress: string) => {
    console.log("OrderSummary received address change:", newAddress);

    // Reset states if the address is empty
    if (!newAddress) {
      setValidationError(null);
      setAddressValidated(false);
      setDeliveryAddress("");
      return;
    }

    // Reset states
    setValidationError(null);
    setAddressValidated(false);

    // In a real app, you would validate the address with your delivery service
    // For demo purposes, we'll simulate a brief validation process
    setIsValidatingAddress(true);

    setTimeout(() => {
      setDeliveryAddress(newAddress);

      // Simulate validation success (in a real app, this would be a real validation)
      // For demo, just check if address is long enough to be valid
      if (newAddress.length < 10) {
        setValidationError(
          "Please enter a more specific address for accurate delivery."
        );
      } else {
        setAddressValidated(true);
        setAddressChanged(true);
      }

      setIsValidatingAddress(false);
      console.log(
        "Address validation complete:",
        newAddress,
        "Validated:",
        newAddress.length >= 10
      );
    }, 500); // Reduced timeout for better UX
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocationCoordinates({
      latitude: lat,
      longitude: lng,
    });
  };

  const handleProceedToPayment = async () => {
    try {
      setIsProcessing(true);

      // Make sure we have coordinates
      if (!locationCoordinates) {
        toast.error("Please select a delivery location");
        setIsProcessing(false);
        return;
      }

      // Create order data for saving to order service
      const orderData = {
        orderId,
        user: user || {
          id: "guest-user",
          name: localStorage.getItem("userName") || "Guest User",
          email: localStorage.getItem("userEmail") || "guest@example.com",
        },
        restaurant: sampleRestaurant,
        foods: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          // Include any other food item properties here
        })),
        subtotal: totalAmount,
        tax,
        deliveryFee,
        total: orderTotal,
        paymentStatus: "pending",
        paymentId: `PAY-${Math.floor(10000 + Math.random() * 90000)}`, // Payment ID will be updated after payment
        paymentMethod: "card", // Default payment method
        deliveryAddress,
        deliveryLocation: locationCoordinates,
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
      };

      // Save the order to the order service
      const createdOrder = await orderService.createOrder(orderData);
      console.log("Order created:", createdOrder);

      // Create payment data
      const paymentData = {
        orderId,
        amount: orderTotal,
        currency: "LKR",
        customerEmail:
          user?.email ||
          localStorage.getItem("userEmail") ||
          "customer@example.com",
        customerName:
          user?.name || localStorage.getItem("userName") || "Customer",
      };

      // Navigate to payment page with payment data
      navigate("/payment", { state: { orderData: paymentData } });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // If cart is empty, use dummy data
  const displayItems = isEmpty ? dummyOrder.items : items;
  const displaySubtotal = isEmpty ? dummyOrder.subtotal : totalAmount;
  const displayTax = isEmpty ? dummyOrder.tax : tax;
  const displayDeliveryFee = isEmpty ? dummyOrder.deliveryFee : deliveryFee;
  const displayTotal = isEmpty ? dummyOrder.total : orderTotal;
  const restaurantName = isEmpty
    ? dummyOrder.restaurantName
    : items[0]?.restaurantId || "Unknown Restaurant";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 w-full min-h-screen md:min-h-0 md:max-w-5xl mx-auto">
      <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6 dark:text-white">
        Order Summary
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 dark:text-white">
              Order #{orderId}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
              Restaurant: {restaurantName}
            </p>
          </div>

          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3 md:py-4">
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 dark:text-white">
              Items
            </h3>
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between mb-3 text-base md:text-lg"
              >
                <div>
                  <span className="font-medium dark:text-white">
                    {item.quantity}x{" "}
                  </span>
                  <span className="dark:text-gray-300">{item.name}</span>
                </div>
                <span className="dark:text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="dark:text-white">
                ${displaySubtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="dark:text-white">${displayTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span className="text-gray-600 dark:text-gray-400">
                Delivery Fee
              </span>
              <span className="dark:text-white">
                ${displayDeliveryFee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg md:text-xl mt-2">
              <span className="dark:text-white">Total</span>
              <span className="dark:text-white">
                ${displayTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg md:text-xl font-semibold mb-3 dark:text-white">
              Delivery Info
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-1 text-base md:text-lg">
              Estimated Time: 30-45 min
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
              Payment Method: Credit Card
            </p>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-6">
          <h3 className="text-lg md:text-xl font-semibold mb-3 dark:text-white">
            Delivery Details
          </h3>

          <div className="mb-4">
            <div className="flex items-start mb-3">
              <MapPinIcon
                className={`h-6 w-6 mt-1 mr-2 flex-shrink-0 ${
                  addressValidated ? "text-green-500" : "text-blue-500"
                }`}
              />
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200 text-base md:text-lg">
                  Delivery Address
                </p>
                {deliveryAddress && !isValidatingAddress ? (
                  <div className="flex items-center">
                    <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
                      {deliveryAddress}
                    </p>
                    {addressValidated && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic text-base md:text-lg">
                    {isValidatingAddress
                      ? "Getting your location..."
                      : "Please set your delivery address"}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 md:p-5 mb-4">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1 text-base md:text-lg">
                Delivery Location
              </h4>
              <p className="text-sm md:text-base text-blue-600 dark:text-blue-300 mb-2 md:mb-3">
                We need your exact delivery location. The quickest way is to:
              </p>
              <ul className="text-sm md:text-base text-blue-600 dark:text-blue-300 list-disc pl-5 mb-2 md:mb-3">
                <li className="font-medium">
                  Click "Use Current Location" below (recommended)
                </li>
                <li>Or enter your address manually</li>
                <li>Or search for an address using the map</li>
                <li>Or click directly on the map to select a location</li>
              </ul>

              <LocationSelector
                initialAddress={deliveryAddress}
                onAddressChange={handleAddressChange}
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {isValidatingAddress && (
              <p className="text-sm md:text-base text-blue-600 dark:text-blue-400 animate-pulse flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Validating address...
              </p>
            )}

            {validationError && (
              <p className="text-sm md:text-base text-red-600 dark:text-red-400 mt-1">
                {validationError}
              </p>
            )}

            {addressChanged && addressValidated && !isValidatingAddress && (
              <p className="text-sm md:text-base text-green-600 dark:text-green-400 mt-1 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                Delivery address updated successfully!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-md-up border-t border-gray-200 dark:border-gray-700 md:relative md:p-0 md:bg-transparent dark:md:bg-transparent md:shadow-none md:border-t-0 md:mt-6">
        <div className="flex flex-col sm:flex-row justify-between gap-2 md:mt-0 max-w-5xl mx-auto">
          <Link
            to="/"
            className="px-4 py-3 md:py-3 text-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 w-full md:w-auto text-base md:text-lg"
          >
            Back to Home
          </Link>
          <button
            onClick={handleProceedToPayment}
            disabled={!addressValidated || isProcessing}
            className={`px-4 py-3 md:py-3 text-center text-white rounded w-full md:w-auto text-base md:text-lg flex justify-center items-center
              ${
                !addressValidated || isProcessing
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700"
              }`}
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : !addressValidated ? (
              "Please confirm your address"
            ) : (
              "Proceed to Payment"
            )}
          </button>
        </div>
      </div>

      {/* Add bottom padding to account for fixed button bar on mobile */}
      <div className="h-24 md:h-0 block md:hidden"></div>
    </div>
  );
};

export default OrderSummary;
