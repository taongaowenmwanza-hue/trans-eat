import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Store, Menu, ClipboardList, Settings, LogOut, Plus } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import api from '../services/api';

const PartnerDashboardScreen = ({ onBack, onLogout, onNavigate }: { onBack: () => void; onLogout: () => void; onNavigate: (s: string) => void }) => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const res = await api.get('/restaurants/my');
      if (res.data.has_restaurant) {
        setRestaurant(res.data.restaurant);
      }
    } catch (err) {
      console.log('Error loading restaurant:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <BackHeader title="Restaurant Partner" onBack={onBack} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#CB2602" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader title="Restaurant Partner" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Restaurant Status */}
        {restaurant ? (
          <View style={styles.restaurantCard}>
            <View style={styles.restaurantIcon}>
              <Store size={28} color="#CB2602" strokeWidth={2} />
            </View>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantTown}>{restaurant.town} · {restaurant.cuisine}</Text>
            <View style={styles.restaurantStats}>
              <Text style={styles.statText}>⭐ {restaurant.rating}</Text>
              <Text style={styles.statText}>🕐 {restaurant.prep_time_min} min</Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Store size={28} color="#CB2602" strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Register Your Restaurant</Text>
            <Text style={styles.cardSub}>
              Set up your restaurant to start receiving orders from travelers heading to your town.
            </Text>
            <TouchableOpacity style={styles.cardBtn} onPress={() => onNavigate('RegisterRestaurant')}>
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.cardBtnText}>Register Restaurant</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Management Options */}
        <Text style={styles.sectionTitle}>Management</Text>

        <TouchableOpacity style={styles.actionRow} onPress={() => onNavigate('PartnerMenu')}>
          <View style={styles.actionIcon}>
            <Menu size={20} color="#CB2602" strokeWidth={2} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Menu Items</Text>
            <Text style={styles.actionSub}>Add, edit, or remove food items</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => onNavigate('PartnerOrders')}>
          <View style={styles.actionIcon}>
            <ClipboardList size={20} color="#f98015" strokeWidth={2} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Incoming Orders</Text>
            <Text style={styles.actionSub}>View and manage customer orders</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow} onPress={() => onNavigate('PartnerSettings')}>
          <View style={styles.actionIcon}>
            <Settings size={20} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Restaurant Settings</Text>
            <Text style={styles.actionSub}>Update hours, prep time, address</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <LogOut size={18} color="#CB2602" strokeWidth={2} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  restaurantCard: {
    backgroundColor: 'rgba(203,38,2,0.08)', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: 'rgba(203,38,2,0.15)', alignItems: 'center', marginBottom: 28,
  },
  restaurantIcon: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(203,38,2,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  restaurantName: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  restaurantTown: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  restaurantStats: { flexDirection: 'row', gap: 16, marginTop: 12 },
  statText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  card: {
    backgroundColor: 'rgba(203,38,2,0.08)', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: 'rgba(203,38,2,0.15)', alignItems: 'center', marginBottom: 28,
  },
  cardIcon: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(203,38,2,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  cardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#CB2602', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
  },
  cardBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  actionIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center',
  },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  actionSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 30, padding: 16,
    backgroundColor: 'rgba(203,38,2,0.08)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(203,38,2,0.15)',
  },
  logoutText: { color: '#CB2602', fontSize: 14, fontWeight: '600' },
});

export default PartnerDashboardScreen;