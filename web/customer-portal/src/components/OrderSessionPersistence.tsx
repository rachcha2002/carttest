import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

// Session storage keys
const CART_DATA_KEY = "food_delivery_cart_data";
const CART_TIMESTAMP_KEY = "food_delivery_cart_timestamp";
const ORDER_IN_PROGRESS_KEY = "food_delivery_order_in_progress";

// How long to keep cart data (in milliseconds)
const CART_EXPIRY_TIME = 2 * 60 * 60 * 1000; // 2 hours

/**
 * This component doesn't render anything - it just manages order session persistence
 * by syncing order/cart data with local storage and handling order state recovery.
 */
const OrderSessionPersistence = () => {
  const { isAuthenticated } = useAuth();
  const { items, clearCart, addItem } = useCart();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(CART_DATA_KEY, JSON.stringify(items));
      localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString());
      localStorage.setItem(ORDER_IN_PROGRESS_KEY, "true");
    } else if (
      items.length === 0 &&
      localStorage.getItem(ORDER_IN_PROGRESS_KEY) === "true"
    ) {
      // Clear only if the cart was previously in progress and is now empty
      localStorage.removeItem(CART_DATA_KEY);
      localStorage.removeItem(CART_TIMESTAMP_KEY);
      localStorage.removeItem(ORDER_IN_PROGRESS_KEY);
    }
  }, [items]);

  //   // Restore cart data on login or page load
  //   useEffect(() => {
  //     const storedTimestamp = localStorage.getItem(CART_TIMESTAMP_KEY);
  //     const storedCartData = localStorage.getItem(CART_DATA_KEY);

  //     if (storedCartData && storedTimestamp) {
  //       const timestamp = parseInt(storedTimestamp);
  //       const isExpired = Date.now() - timestamp > CART_EXPIRY_TIME;

  //       if (isExpired) {
  //         // Clear expired cart data
  //         localStorage.removeItem(CART_DATA_KEY);
  //         localStorage.removeItem(CART_TIMESTAMP_KEY);
  //         localStorage.removeItem(ORDER_IN_PROGRESS_KEY);
  //       } else if (items.length === 0) {
  //         // Only restore if cart is empty to prevent duplication
  //         try {
  //           const cartData = JSON.parse(storedCartData);

  //           // Add items to cart
  //           cartData.forEach((item: any) => {
  //             addItem(
  //               {
  //                 id: item.id,
  //                 name: item.name,
  //                 price: item.price,
  //                 restaurantId: item.restaurantId,
  //                 image: item.image,
  //                 quantity: item.quantity,

  //               },

  //             );
  //           });

  //           // Notify user of cart restoration
  //           toast.success("Your previous order has been restored!", {
  //             duration: 3000,
  //             icon: "🛒",
  //           });
  //         } catch (error) {
  //           console.error("Error restoring cart data:", error);
  //         }
  //       }
  //     }
  //   }, [isAuthenticated, items.length, addItem]);

  // When user logs out, handle cart appropriately
  useEffect(() => {
    const handleLogout = () => {
      // You can decide whether to clear the cart on logout
      // For food ordering apps, it's often better to keep the cart
      // clearCart();
    };

    window.addEventListener("user-logout", handleLogout);

    return () => {
      window.removeEventListener("user-logout", handleLogout);
    };
  }, [clearCart]);

  // Handle browser close/refresh to keep order data
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (items.length > 0) {
        localStorage.setItem(CART_DATA_KEY, JSON.stringify(items));
        localStorage.setItem(CART_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(ORDER_IN_PROGRESS_KEY, "true");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [items]);

  return null; // This component doesn't render anything
};

export default OrderSessionPersistence;
