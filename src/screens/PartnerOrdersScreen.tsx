import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Clock, MapPin, Check } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import api from '../services/api';

const PartnerOrdersScreen = ({ onBack }: { onBack: () => void }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/restaurants/my');
      if (res.data.has_restaurant) {
        const ordersRes = await api.get(`/orders/restaurant/${res.data.restaurant.id}/orders`);
        setOrders(ordersRes.data);
      }
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      loadOrders();
    } catch (err) {
      Alert.alert('Error', 'Failed to update order');
    }
  };

  if (loading) return (
    <View style={styles.container}>
      <BackHeader title="Incoming Orders" onBack={onBack} />
      <ActivityIndicator size="large" color="#CB2602" style={{ marginTop: 40 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Incoming Orders" onBack={onBack} />
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Orders from travelers will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'placed' ? '#f98015' : item.status === 'preparing' ? '#CB2602' : '#22c55e' }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.orderMeta}>
                <Clock size={12} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                <Text style={styles.metaText}>To: {item.destination_town}</Text>
              </View>
              <View style={styles.orderMeta}>
                <MapPin size={12} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                <Text style={styles.metaText}>{item.pickup_method === 'station' ? 'Bus station pickup' : 'Restaurant pickup'}</Text>
              </View>
              <Text style={styles.orderTotal}>K{item.total_amount}</Text>
              <View style={styles.orderActions}>
                {item.status === 'placed' && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(item.id, 'preparing')}>
                    <Text style={styles.actionBtnText}>Start Preparing</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'preparing' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#22c55e' }]} onPress={() => handleUpdateStatus(item.id, 'ready')}>
                    <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.actionBtnText}>Mark Ready</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  list: { padding: 16, paddingBottom: 40 },
  orderCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  orderTotal: { fontSize: 18, fontWeight: '700', color: '#f98015', marginTop: 8 },
  orderActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#CB2602', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});

export default PartnerOrdersScreen;