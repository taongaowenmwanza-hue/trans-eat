import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Star, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import { useOrder } from '../context/OrderContext';
import { restaurantsAPI } from '../services/api';
import api from '../services/api';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  review_count: number;
  address: string;
  town: string;
  prep_time_min: number;
  image_url: string;
}

const RestaurantsScreen = ({ onBack, onSelectRestaurant }: { onBack: () => void; onSelectRestaurant?: (id: string, name: string) => void }) => {
  const { trip } = useOrder();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeTown, setActiveTown] = useState(trip.destinationTown?.name || 'All');
  const [loading, setLoading] = useState(true);
  const [searchInfo, setSearchInfo] = useState('');

  const towns = ['All', 'Lusaka', 'Kabwe', 'Livingstone', 'Kitwe', 'Ndola'];

  useEffect(() => {
    loadRestaurants(activeTown === 'All' ? undefined : activeTown);
  }, [activeTown]);

  const loadRestaurants = async (town?: string) => {
    setLoading(true);
    try {
      const searchTerm = localStorage.getItem('searchTerm') || '';
      const filterCategory = localStorage.getItem('filterCategory') || '';

      if (searchTerm) setSearchInfo(`Results for "${searchTerm}"`);
      else if (filterCategory) setSearchInfo(`Category: ${filterCategory}`);
      else setSearchInfo('');

      const res = await restaurantsAPI.getAll(town, filterCategory || undefined);
      let data = res.data;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const filteredData: Restaurant[] = [];

        for (const restaurant of data) {
          const nameMatch = restaurant.name.toLowerCase().includes(term) ||
            restaurant.cuisine.toLowerCase().includes(term) ||
            (restaurant.address && restaurant.address.toLowerCase().includes(term));

          if (nameMatch) {
            filteredData.push(restaurant);
            continue;
          }

          try {
            const menuRes = await api.get(`/menu/restaurant/${restaurant.id}`);
            const matchingItems = menuRes.data.filter((item: any) =>
              item.name.toLowerCase().includes(term) ||
              (item.description && item.description.toLowerCase().includes(term)) ||
              (item.category && item.category.toLowerCase().includes(term))
            );

            if (matchingItems.length > 0) {
              filteredData.push(restaurant);
            }
          } catch (e) {}
        }

        data = filteredData;
      }

      setRestaurants(data);

      localStorage.removeItem('searchTerm');
      localStorage.removeItem('filterCategory');
    } catch (err) {
      console.log('Error loading restaurants:', err);
    }
    setLoading(false);
  };

  const getImage = (item: Restaurant) => {
    if (item.image_url) return item.image_url;
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
  };

  return (
    <View style={styles.container}>
      <BackHeader title={`Restaurants in ${trip.destinationTown?.name || 'Zambia'}`} onBack={onBack} />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={towns}
        keyExtractor={(t) => t}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeTown === item && styles.filterChipActive]}
            onPress={() => setActiveTown(item)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterText, activeTown === item && styles.filterTextActive]} numberOfLines={1}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {trip.destinationTown && (
        <View style={styles.destinationBanner}>
          <MapPin size={14} color="#CB2602" strokeWidth={2.5} />
          <Text style={styles.destinationText}>
            Ordering for {trip.destinationTown.name} · {trip.pickupMethod === 'station' ? 'Bus station pickup' : 'Restaurant pickup'}
          </Text>
        </View>
      )}

      {searchInfo !== '' && (
        <View style={styles.searchInfoBanner}>
          <Text style={styles.searchInfoText}>{searchInfo}</Text>
        </View>
      )}

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => onSelectRestaurant?.(item.id, item.name)}
          >
            <Image source={{ uri: getImage(item) }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <View style={styles.cuisineBadge}>
                  <Text style={styles.cuisineText}>{item.cuisine}</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <Star size={13} color="#f98015" fill="#f98015" strokeWidth={1} />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewText}>({item.review_count})</Text>
                <View style={styles.metaDot} />
                <Clock size={12} color="rgba(255,255,255,0.5)" strokeWidth={2} />
                <Text style={styles.prepText}>{item.prep_time_min} min</Text>
              </View>
              <View style={styles.cardBottom}>
                <MapPin size={12} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                <Text style={styles.addressText}>{item.address}, {item.town}</Text>
                <ChevronRight size={16} color="rgba(255,255,255,0.3)" strokeWidth={2} style={{ marginLeft: 'auto' }} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{loading ? 'Loading...' : 'No restaurants found'}</Text>
            <Text style={styles.emptySub}>Try a different search or town</Text>
          </View>
        }
      />
    </View>
  );
};

const CHIP_WIDTH = 80;
const CHIP_HEIGHT = 38;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: {
    width: CHIP_WIDTH,
    height: CHIP_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: '#CB2602',
    borderColor: '#CB2602',
  },
  filterText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  destinationBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: 'rgba(203,38,2,0.1)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(203,38,2,0.15)',
  },
  destinationText: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  searchInfoBanner: {
    marginHorizontal: 16, marginBottom: 12,
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInfoText: { fontSize: 12, color: '#f98015', fontWeight: '500' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    borderRadius: 20, overflow: 'hidden', marginBottom: 14,
    height: 180, justifyContent: 'flex-end',
  },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  cardContent: { padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  restaurantName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  cuisineBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cuisineText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  ratingText: { fontSize: 13, color: '#f98015', fontWeight: '700' },
  reviewText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },
  prepText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  addressText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '600' },
  emptySub: { color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 4 },
});

export default RestaurantsScreen;