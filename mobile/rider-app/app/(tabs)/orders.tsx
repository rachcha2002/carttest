import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function Orders() {
  const [activeTab, setActiveTab] = useState('active');

  const orders = [
    {
      id: 'ORD123456',
      status: 'ready',
      restaurant: 'Spice Garden',
      address: '123 Main St, City',
      items: 2,
      amount: 450,
    },
    {
      id: 'ORD123457',
      status: 'on_way',
      restaurant: 'Tandoor Express',
      address: '456 Park Road',
      items: 3,
      amount: 650,
    },
    {
      id: 'ORD123458',
      status: 'delivered',
      restaurant: 'Biryani House',
      address: '789 Lake View',
      items: 1,
      amount: 350,
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return styles.readyStatus;
      case 'on_way':
        return styles.onWayStatus;
      case 'delivered':
        return styles.deliveredStatus;
      default:
        return styles.defaultStatus;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'ready':
        return styles.readyStatusText;
      case 'on_way':
        return styles.onWayStatusText;
      case 'delivered':
        return styles.deliveredStatusText;
      default:
        return styles.defaultStatusText;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Pickup Ready';
      case 'on_way':
        return 'On the way';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getActionButton = (status: string) => {
    switch (status) {
      case 'ready':
        return (
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => {}}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
        );
      case 'on_way':
        return (
          <TouchableOpacity 
            style={styles.navigateButton}
            onPress={() => {}}>
            <Text style={styles.buttonText}>Navigate</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => {}}>
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        );
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
          {orders
            .filter(order => activeTab === 'active' ? order.status !== 'delivered' : order.status === 'delivered')
            .map(order => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderContent}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <View style={[styles.statusBadge, getStatusColor(order.status)]}>
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
                    <Text style={styles.addressText}>{order.address}</Text>
                  </View>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderDetails}>{order.items} items • Rs {order.amount}</Text>
                    {getActionButton(order.status)}
                  </View>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
}); 