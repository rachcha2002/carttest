import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

export default function Earnings() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const earningsData = {
    today: {
      total: 1250,
      deliveries: 12,
      tips: 150,
      incentives: 100
    },
    weekly: {
      total: 8750,
      deliveries: 85,
      tips: 950,
      incentives: 700
    },
    monthly: {
      total: 32500,
      deliveries: 312,
      tips: 3500,
      incentives: 2500
    }
  };

  const currentData = earningsData[selectedPeriod];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Earnings</Text>
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'today' && styles.selectedPeriod]}
              onPress={() => setSelectedPeriod('today')}>
              <Text style={[styles.periodButtonText, selectedPeriod === 'today' && styles.selectedPeriodText]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'weekly' && styles.selectedPeriod]}
              onPress={() => setSelectedPeriod('weekly')}>
              <Text style={[styles.periodButtonText, selectedPeriod === 'weekly' && styles.selectedPeriodText]}>Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'monthly' && styles.selectedPeriod]}
              onPress={() => setSelectedPeriod('monthly')}>
              <Text style={[styles.periodButtonText, selectedPeriod === 'monthly' && styles.selectedPeriodText]}>Monthly</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Earnings Card */}
        <View style={styles.totalEarningsCard}>
          <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
          <Text style={styles.totalEarningsAmount}>Rs {currentData.total}</Text>
          <View style={styles.earningsBreakdown}>
            <View style={styles.breakdownItem}>
              <FontAwesome5 name="motorcycle" size={20} color="#f29f05" />
              <Text style={styles.breakdownLabel}>Deliveries</Text>
              <Text style={styles.breakdownValue}>{currentData.deliveries}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <FontAwesome5 name="hand-holding-usd" size={20} color="#f29f05" />
              <Text style={styles.breakdownLabel}>Tips</Text>
              <Text style={styles.breakdownValue}>Rs {currentData.tips}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <FontAwesome5 name="gift" size={20} color="#f29f05" />
              <Text style={styles.breakdownLabel}>Incentives</Text>
              <Text style={styles.breakdownValue}>Rs {currentData.incentives}</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transactionList}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <FontAwesome5 name="motorcycle" size={20} color="#f29f05" />
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>Delivery #1234</Text>
                    <Text style={styles.transactionTime}>2 hours ago</Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>Rs 150</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity style={styles.withdrawButton}>
          <FontAwesome5 name="money-bill-wave" size={20} color="#ffffff" />
          <Text style={styles.withdrawButtonText}>Withdraw Earnings</Text>
        </TouchableOpacity>
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
    backgroundColor: '#f29f05',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#f29f05',
  },
  periodButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  selectedPeriodText: {
    color: '#ffffff',
  },
  totalEarningsCard: {
    margin: 16,
    marginTop: -20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  totalEarningsLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  totalEarningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f29f05',
    marginBottom: 20,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  transactionsSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f29f05',
  },
  withdrawButton: {
    margin: 16,
    backgroundColor: '#f29f05',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 