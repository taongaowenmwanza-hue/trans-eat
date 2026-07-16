import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Clock, MapPin, ShoppingBag } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import api from '../services/api';

const OrdersScreen = ({ onBack, onOrderPress }: { onBack: () => void; onOrderPress?: (id: string) => void }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <BackHeader title="My Orders" onBack={onBack} />
      {loading ? (
        <ActivityIndicator size="large" color="#CB2602" style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <ShoppingBag size={48} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Your food orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => onOrderPress?.(item.id)}
              activeOpacity={0.85}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'ready' ? '#22c55e' : item.status === 'preparing' ? '#CB2602' : '#f98015' }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.orderMeta}>
                <MapPin size={12} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                <Text style={styles.metaText}>{item.destination_town} · {item.pickup_method === 'station' ? 'Bus station' : 'Restaurant'}</Text>
              </View>
              <View style={styles.orderMeta}>
                <Clock size={12} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.orderTotal}>K{item.total_amount}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 16 },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  list: { padding: 16, paddingBottom: 40 },
  orderCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  restaurantName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF', textTransform: 'uppercase' },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  metaText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  orderTotal: { fontSize: 18, fontWeight: '700', color: '#f98015', marginTop: 8 },
});

export default OrdersScreen;