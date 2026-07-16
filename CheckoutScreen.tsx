import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { MapPin, Clock, CreditCard } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import MapView from '../components/MapView';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import api from '../services/api';

const CheckoutScreen = ({ onBack, onOrderPlaced }: { onBack: () => void; onOrderPlaced: () => void }) => {
  const { items, totalAmount, clearCart } = useCart();
  const { trip, refreshActiveOrder } = useOrder();
  const stationFee = trip.pickupMethod === 'station' ? 15 : 0;
  const grandTotal = totalAmount + stationFee;

  const origin: [number, number] = trip.currentCoords || [28.3228, -15.3875];
  const destination: [number, number] = trip.destinationTown?.coords || [28.4464, -14.4469];

  const handlePlaceOrder = async () => {
    alert('Items: ' + items.length + '\nTotal: K' + grandTotal + '\nRestaurant: ' + items[0]?.restaurantId + '\nTown: ' + trip.destinationTown?.name + '\nPickup: ' + trip.pickupMethod);
    
    if (!items.length) {
      Alert.alert('Cart empty', 'Add items first');
      return;
    }
    if (!trip.destinationTown) {
      Alert.alert('Set Destination', 'Please set your destination before ordering.');
      return;
    }
    try {
      const payload = {
        restaurant_id: items[0].restaurantId,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total_amount: grandTotal,
        pickup_method: trip.pickupMethod || 'restaurant',
        destination_town: trip.destinationTown?.name || 'Unknown',
      };
      console.log('Sending order:', JSON.stringify(payload));
      const res = await api.post('/orders/place', payload);
      console.log('Order response:', res.data);
      clearCart();
      await refreshActiveOrder();
      onOrderPlaced();
    } catch (err: any) {
      console.log('Order error:', err);
      console.log('Error response:', err.response?.data);
      Alert.alert('Error', JSON.stringify(err.response?.data?.detail || 'Failed'));
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Checkout" onBack={onBack} />

      <View style={styles.mapContainer}>
        <MapView
          origin={origin}
          destination={destination}
          destinationLabel={trip.destinationTown?.name || 'Destination'}
          foodIcon="🍔"
        />
      </View>

      <Text style={styles.sectionTitle}>Order Summary</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
            <Text style={styles.itemPrice}>K{item.price * item.quantity}</Text>
          </View>
        )}
      />

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>K{totalAmount}</Text>
        </View>
        {stationFee > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Bus station fee</Text>
            <Text style={styles.totalValue}>K{stationFee}</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandLabel}>Total</Text>
          <Text style={styles.grandValue}>K{grandTotal}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Clock size={16} color="rgba(255,255,255,0.5)" strokeWidth={2} />
        <Text style={styles.infoText}>Ready when you arrive in {trip.destinationTown?.name}</Text>
      </View>
      <View style={styles.infoRow}>
        <MapPin size={16} color="rgba(255,255,255,0.5)" strokeWidth={2} />
        <Text style={styles.infoText}>
          {trip.pickupMethod === 'station' ? `Bus Station, ${trip.destinationTown?.name}` : `Restaurant, ${trip.destinationTown?.name}`}
        </Text>
      </View>

      <TouchableOpacity style={styles.orderBtn} onPress={handlePlaceOrder}>
        <CreditCard size={18} color="#FFFFFF" strokeWidth={2} />
        <Text style={styles.orderText}>Place Order · K{grandTotal}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  mapContainer: { height: 220, margin: 16, borderRadius: 16, overflow: 'hidden' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', paddingHorizontal: 16, marginBottom: 10 },
  list: { maxHeight: 180, paddingHorizontal: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  itemName: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  itemPrice: { fontSize: 14, color: '#f98015', fontWeight: '600' },
  totals: { paddingHorizontal: 16, marginTop: 12, gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  totalValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  grandTotal: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 10, marginTop: 4 },
  grandLabel: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  grandValue: { fontSize: 16, fontWeight: '700', color: '#CB2602' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 10 },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  orderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    margin: 16, backgroundColor: '#CB2602', borderRadius: 16, paddingVertical: 16,
  },
  orderText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default CheckoutScreen;