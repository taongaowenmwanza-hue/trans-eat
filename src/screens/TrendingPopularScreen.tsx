import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Star, Clock } from 'lucide-react-native';
import { restaurantsAPI } from '../services/api';
import api from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  prep_time_min: number;
  image_url: string;
  restaurant_name: string;
  restaurant_id: string;
  order_count?: number;
}

const TrendingPopularScreen = ({ onBack, onSelectRestaurant }: { onBack: () => void; onSelectRestaurant?: (id: string, name: string) => void }) => {
  const [popular, setPopular] = useState<MenuItem[]>([]);
  const [trending, setTrending] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await restaurantsAPI.getAll();
      const restaurants = res.data;
      let allItems: MenuItem[] = [];

      for (const restaurant of restaurants) {
        try {
          const menuRes = await api.get(`/menu/restaurant/${restaurant.id}`);
          const items = menuRes.data.map((item: any) => ({
            ...item,
            restaurant_name: restaurant.name,
            restaurant_id: restaurant.id,
            image_url: item.image_url || restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
          }));
          allItems = [...allItems, ...items];
        } catch (e) {}
      }

      // Popular = random shuffle simulating most ordered
      const shuffled = [...allItems].sort(() => 0.5 - Math.random());
      setPopular(shuffled.slice(0, 6));

      // Trending = different random set
      const shuffled2 = [...allItems].sort(() => 0.5 - Math.random());
      setTrending(shuffled2.slice(0, 6));
    } catch (err) {
      console.log('Error loading trending/popular:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#CB2602" style={{ marginTop: 40 }} />
      </View>
    );
  }

  const renderItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onSelectRestaurant?.(item.restaurant_id, item.restaurant_name)}
    >
      <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardOverlay} />
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName} numberOfLines={1}>{item.restaurant_name}</Text>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.row}>
          <Star size={12} color="#f98015" fill="#f98015" strokeWidth={1} />
          <Text style={styles.rating}>4.5</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.prepRow}>
            <Clock size={10} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.prepText}>{item.prep_time_min} min</Text>
          </View>
          <Text style={styles.price}>K{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>🔥 Popular Items</Text>
            <View style={styles.grid}>{popular.map(renderItem)}</View>
            <Text style={styles.sectionTitle}>📈 Trending Now</Text>
            <View style={styles.grid}>{trending.map(renderItem)}</View>
          </View>
        }
        data={[]}
        renderItem={() => null}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  listContent: { padding: 12, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  card: {
    width: '48%', borderRadius: 16, overflow: 'hidden', height: 170,
    justifyContent: 'flex-end',
  },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  cardContent: { padding: 12 },
  restaurantName: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  itemName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 11, color: '#f98015', fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  prepRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  prepText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  price: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default TrendingPopularScreen;