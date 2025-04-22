import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Linking, Alert } from 'react-native'; // Added Linking and Alert
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

// Define the Order type (optional but recommended for type safety)
type Order = {
  id: string;
  // Add 'picked_up' status
  status: 'ready' | 'on_way' | 'picked_up' | 'delivered' | string; // Allow other statuses too
  restaurant: string;
  restaurantLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  deliveryAddress: string;
  deliveryLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  items: number;
  amount: number;
  paymentStatus: string;
  driverId: string | null;
  customerId: string;
  createdAt: string;
};

// Initial data (can be moved outside the component if static)
const initialOrders: Order[] = [
  {
    id: 'ORD123456',
    status: 'ready',
    restaurant: 'Spice Garden',
    restaurantLocation: {
      type: 'Point',
      coordinates: [79.9707392, 6.9146775] // [lng, lat]
    },
    deliveryAddress: '123 Main St, City',
    deliveryLocation: {
      type: 'Point',
      coordinates: [79.9724578, 6.9182443]
    },
    items: 2,
    amount: 450,
    paymentStatus: 'paid',
    driverId: null,
    customerId: 'CUS1001',
    createdAt: '2025-04-19T18:30:00Z'
  },
  {
    id: 'ORD123458',
    status: 'delivered',
    restaurant: 'Biryani House',
    restaurantLocation: {
      type: 'Point',
      coordinates: [79.8589, 6.9197]
    },
    deliveryAddress: '789 Lake View',
    deliveryLocation: {
      type: 'Point',
      coordinates: [79.8631, 6.9183]
    },
    items: 1,
    amount: 350,
    paymentStatus: 'paid',
    driverId: 'DRV001',
    customerId: 'CUS1003',
    createdAt: '2025-04-19T17:40:00Z'
  }
  // Add more orders as needed
];


export default function Orders() {
  const [activeTab, setActiveTab] = useState('active');
  const [ordersData, setOrdersData] = useState<Order[]>(initialOrders); // Use state for orders
  // State to track the expanded order ID
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // --- Helper Functions for Styling/Text (Keep as they are) ---
  const getStatusColor = (status: string) => {
    // ...existing code...
    switch (status) {
      case 'ready':
        return styles.readyStatus;
      case 'on_way':
        return styles.onWayStatus;
      // Add case for picked_up
      case 'picked_up':
        return styles.pickedUpStatus; // Add new style
      case 'delivered':
        return styles.deliveredStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const getStatusTextStyle = (status: string) => {
    // ...existing code...
    switch (status) {
      case 'ready':
        return styles.readyStatusText;
      case 'on_way':
        return styles.onWayStatusText; // Added missing return
      // Add case for picked_up
      case 'picked_up':
        return styles.pickedUpStatusText; // Add new style
      case 'delivered':
        return styles.deliveredStatusText; // Added missing return
      default:
        return styles.defaultStatusText;
    }
  };

  // Refined getStatusText to ensure it always returns a string
  const getStatusText = (status: string | null | undefined): string => {
    switch (status) {
      case 'ready':
        return 'Pickup Ready';
      case 'on_way':
        return 'On the way';
      // Add case for picked_up
      case 'picked_up':
        return 'Picked Up';
      case 'delivered':
        return 'Delivered';
      default:
        // Handle potential null/undefined or empty string status
        return typeof status === 'string' && status ? status : 'Unknown';
    }
  };
  // --- End Helper Functions ---

  // Function to open map link
  const openMapLink = async (coordinates: [number, number], locationType: 'restaurant' | 'delivery') => {
    const [lng, lat] = coordinates;
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    try {
      const supported = await Linking.canOpenURL(mapUrl);
      if (supported) {
        await Linking.openURL(mapUrl);
      } else {
        Alert.alert("Navigation Error", `Cannot open this URL: ${mapUrl}`);
      }
    } catch (error) {
      console.error(`Error opening map URL for ${locationType}:`, error);
      Alert.alert(
        "Navigation Error",
        `Could not open Google Maps for ${locationType}. Please ensure it is installed or try again.`
      );
    }
  };

  // Function to handle accepting an order
  const handleAcceptOrder = async (orderToAccept: Order) => {
    console.log(`Accepting order: ${orderToAccept.id}`);

    // TODO: Add API call here to update status to 'on_way' on the server
    // try {
    //   await api.updateOrderStatus(orderToAccept.id, 'on_way');
    // } catch (error) { ... }

    // Update local state ONLY
    setOrdersData(currentOrders =>
      currentOrders.map(order =>
        order.id === orderToAccept.id
          ? { ...order, status: 'on_way' } // Update status locally
          : order
      )
    );
    // Removed map opening from here
  };

  // Function to handle picking up an order
  const handlePickupOrder = async (orderToPickup: Order) => {
    console.log(`Picking up order: ${orderToPickup.id}`);

    // TODO: Add API call here to update status to 'picked_up' on the server
    // try {
    //   await api.updateOrderStatus(orderToPickup.id, 'picked_up');
    // } catch (error) { ... }

    // Update local state
    setOrdersData(currentOrders =>
      currentOrders.map(order =>
        order.id === orderToPickup.id
          ? { ...order, status: 'picked_up' } // Update status locally
          : order
      )
    );
  };

  // Function to handle completing an order
  const handleCompleteOrder = async (orderToComplete: Order) => {
    console.log(`Completing order: ${orderToComplete.id}`);

    // TODO: Add API call here to update status to 'delivered' on the server
    // try {
    //   await api.updateOrderStatus(orderToComplete.id, 'delivered');
    // } catch (error) { ... }

    // Update local state
    setOrdersData(currentOrders =>
      currentOrders.map(order =>
        order.id === orderToComplete.id
          ? { ...order, status: 'delivered' } // Update status locally
          : order
      )
    );
  };

  // Function to toggle expanded details view for past orders
  const handleToggleDetails = (orderId: string) => {
    setExpandedOrderId(currentExpandedId =>
      currentExpandedId === orderId ? null : orderId // Toggle: collapse if same, else expand
    );
  };

  // Modified to accept the full order object and return appropriate buttons
  const getActionButton = (order: Order) => {
    switch (order.status) {
      case 'ready':
        return (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptOrder(order)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        );
      case 'on_way':
        // Show both Pickup and Navigate (to restaurant) buttons
        return (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.pickupButton} // Add new style
              onPress={() => handlePickupOrder(order)}
            >
              <Text style={styles.buttonText}>Pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => openMapLink(order.restaurantLocation.coordinates, 'restaurant')}
            >
              <Text style={styles.buttonText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        );
      case 'picked_up':
        // Show Navigate (to customer) and Complete buttons
        return (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.navigateButton} // Needs margin when next to complete
              onPress={() => openMapLink(order.deliveryLocation.coordinates, 'delivery')}
            >
              <Text style={styles.buttonText}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteOrder(order)}
            >
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        );
      default: // Includes 'delivered' and any other status
        return (
          <TouchableOpacity
            style={styles.viewButton}
            // Update onPress to toggle details
            onPress={() => handleToggleDetails(order.id)}>
            {/* Text remains "View Details", button action changes */}
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        );
    }
  };

  // Helper to format date/time
  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(); // Adjust formatting as needed
    } catch (e) {
      return dateString; // Fallback
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'active' && styles.activeTab]}
              onPress={() => setActiveTab('active')}>
              <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                Active Orders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'past' && styles.activeTab]}
              onPress={() => setActiveTab('past')}>
              <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                Past Orders
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders List */}
        <View style={styles.ordersList}>
          {ordersData // Use state variable here
            .filter(order => activeTab === 'active' ? order.status !== 'delivered' : order.status === 'delivered')
            .map(order => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderContent}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <View style={[styles.statusBadge, getStatusColor(order.status)]}>
                      {/* Ensure getStatusText result is used */}
                      <Text style={[styles.statusText, getStatusTextStyle(order.status)]}>
                        {getStatusText(order.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.restaurantInfo}>
                    <FontAwesome5 name="store" size={16} color="#6B7280" />
                    <Text style={styles.restaurantText}>{order.restaurant}</Text>
                  </View>
                  <View style={styles.addressInfo}>
                    <FontAwesome5 name="map-marker-alt" size={16} color="#6B7280" />
                    <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                  </View>
                  <View style={styles.orderFooter}>
                    {/* Explicitly wrap dynamic parts if needed, though usually not necessary for numbers */}
                    <Text style={styles.orderDetails}>{order.items} items • Rs {order.amount}</Text>
                    <View style={styles.actionButtonContainer}>
                      {getActionButton(order)}
                    </View>
                  </View>

                  {/* Conditionally render expanded details only for past orders */}
                  {activeTab === 'past' && expandedOrderId === order.id && (
                    <View style={styles.expandedDetails}>
                      <Text style={styles.detailText}>Delivered: {formatDateTime(order.createdAt)}</Text>
                      <Text style={styles.detailText}>Payment: <Text style={styles.paymentStatusText}>{order.paymentStatus}</Text></Text>
                      {/* Add more details here if needed */}
                    </View>
                  )}
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (Keep as they are) ---
const styles = StyleSheet.create({
  // ...existing styles...
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#f29f05',
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    // position: 'relative', // No longer needed for close button
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  orderContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  readyStatus: {
    backgroundColor: 'rgba(242, 159, 5, 0.1)',
  },
  onWayStatus: {
    backgroundColor: '#fef3c7',
  },
  // Add picked_up status style
  pickedUpStatus: {
    backgroundColor: '#e0f2fe', // Light blue
  },
  deliveredStatus: {
    backgroundColor: '#d1fae5',
  },
  defaultStatus: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  readyStatusText: {
    color: '#f29f05',
  },
  onWayStatusText: {
    color: '#d97706',
  },
  // Add picked_up status text style
  pickedUpStatusText: {
    color: '#0284c7', // Blue
  },
  deliveredStatusText: {
    color: '#059669',
  },
  defaultStatusText: {
    color: '#6b7280',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantText: {
    marginLeft: 8,
    color: '#374151',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    marginLeft: 8,
    color: '#6b7280',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  orderDetails: {
    color: '#6b7280',
  },
  acceptButton: {
    backgroundColor: '#f29f05',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navigateButton: {
    backgroundColor: '#f29f05',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8, // Ensure margin is present for spacing
  },
  viewButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  viewButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  // Container for action buttons to handle single or multiple buttons
  actionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Style for when multiple buttons are shown ('on_way' status)
  buttonGroup: {
    flexDirection: 'row',
  },
  // Add pickup button style (can be same as navigate/accept)
  pickupButton: {
    backgroundColor: '#3b82f6', // Blue color for pickup
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8, // Add margin if buttons are side-by-side
  },
  // Add complete button style
  completeButton: {
    backgroundColor: '#10b981', // Green color for complete
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    // No margin needed if it's the last button in the group
  },
  // Style for the expanded details section
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  paymentStatusText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});