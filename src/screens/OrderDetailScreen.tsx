import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, Check } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import { useOrder } from '../context/OrderContext';

const ORDER_STEPS = ['placed', 'confirmed', 'preparing', 'ready', 'picked_up'];
const STEP_LABELS: Record<string, string> = {
  placed: 'Order Placed',
  confirmed: 'Restaurant Confirmed',
  preparing: 'Preparing Your Meal',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
};

const OrderDetailScreen = ({ onBack }: { onBack: () => void }) => {
  const { activeOrder, trip } = useOrder();
  if (!activeOrder) return null;

  const currentStepIndex = ORDER_STEPS.indexOf(activeOrder.status);

  return (
    <View style={styles.container}>
      <BackHeader title="Your Order" onBack={onBack} />
      <View style={styles.content}>
        <Text style={styles.restaurantName}>{activeOrder.restaurant_name}</Text>
        <Text style={styles.total}>K{activeOrder.total_amount}</Text>

        <View style={styles.stepsContainer}>
          {ORDER_STEPS.map((step, i) => (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepDot, i <= currentStepIndex && styles.stepDotDone]}>
                {i <= currentStepIndex ? <Check size={10} color="#FFFFFF" strokeWidth={3} /> : <Text style={styles.stepNum}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepText, i <= currentStepIndex && styles.stepTextDone]}>{STEP_LABELS[step]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        {activeOrder.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
            <Text style={styles.itemPrice}>K{item.price * item.quantity}</Text>
          </View>
        ))}

        <View style={styles.infoRow}>
          <MapPin size={14} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          <Text style={styles.infoText}>Destination: {activeOrder.destination_town}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={14} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          <Text style={styles.infoText}>Pickup: {activeOrder.pickup_method === 'station' ? 'Bus Station' : 'Restaurant'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16 },
  restaurantName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  total: { fontSize: 18, fontWeight: '700', color: '#f98015', marginTop: 4 },
  stepsContainer: { gap: 8, marginTop: 24, marginBottom: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  stepDotDone: { backgroundColor: '#CB2602' },
  stepNum: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  stepText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  stepTextDone: { color: '#FFFFFF' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  itemName: { fontSize: 14, color: '#FFFFFF' },
  itemPrice: { fontSize: 14, color: '#f98015', fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
});

export default OrderDetailScreen;