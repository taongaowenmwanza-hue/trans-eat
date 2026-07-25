import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions,
  ScrollView, Animated, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LogOut, Clock, Star, ChevronRight, Search, X,
  Utensils, CupSoda, ShoppingBasket, Pill,
  Sandwich, Coffee, Pizza, Drumstick, IceCream2, Cookie,
  Navigation,
} from 'lucide-react-native';
import { useOrder } from '../context/OrderContext';
import TransEatWordmark from '../components/TransEatWordmark';
import api from '../services/api';
import { restaurantsAPI } from '../services/api';

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'drinks', label: 'Drinks', icon: CupSoda },
  { id: 'grocery', label: 'Grocery', icon: ShoppingBasket },
  { id: 'medicine', label: 'Medicine', icon: Pill },
] as const;

const FOOD_TYPES = [
  { id: 'burger', label: 'Burger', icon: Sandwich },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'pizza', label: 'Pizza', icon: Pizza },
  { id: 'chicken', label: 'Chicken', icon: Drumstick },
  { id: 'icecream', label: 'Ice Cream', icon: IceCream2 },
  { id: 'dessert', label: 'Dessert', icon: Cookie },
];

const OFFERS = [
  { id: 'o1', title: '50% OFF First Order', subtitle: 'Use code TRANS50 at checkout', accent: '#CB2602', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80' },
  { id: 'o2', title: 'Free Delivery Weekend', subtitle: 'No delivery fee on orders over K150', accent: '#f98015', image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=900&q=80' },
  { id: 'o3', title: 'Grocery Restock', subtitle: 'Fresh produce delivered same-day', accent: '#2f8f5b', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80' },
];

const RECENT_SEARCHES = ['Pizza near me', 'Cough syrup', 'Weekly groceries'];
const TRENDING_SEARCHES = ['Nshima combo', 'Fried chicken', 'Cold drinks'];

interface MenuItem {
  id: string;
  name: string;
  price: number;
  prep_time_min: number;
  image_url: string;
  restaurant_name: string;
  restaurant_id: string;
}

const HomeScreen = ({ onNavigate, onSelectRestaurant }: { onNavigate: (screen: string) => void; onSelectRestaurant?: (id: string, name: string) => void }) => {
  const { width } = useWindowDimensions();
  const { trip, canOrderFood } = useOrder();

  const goOrderFood = () => {
    return onNavigate('Restaurants');
  };

  const [activeCategory, setActiveCategory] = useState('food');
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [offerIndex, setOfferIndex] = useState(0);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [trendingItems, setTrendingItems] = useState<MenuItem[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const offerScrollRef = useRef<ScrollView>(null);
  const offerCardWidth = width - 32;

  useEffect(() => {
    const timer = setInterval(() => {
      setOfferIndex((prev) => {
        const next = (prev + 1) % OFFERS.length;
        offerScrollRef.current?.scrollTo({ x: next * offerCardWidth, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [offerCardWidth]);

  useEffect(() => {
    loadTrendingPopular();
  }, []);

  const loadTrendingPopular = async () => {
    try {
      const res = await restaurantsAPI.getAll();
      const restaurants = res.data;
      let allItems: any[] = [];

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

      const shuffled = [...allItems].sort(() => 0.5 - Math.random());
      setPopularItems(shuffled.slice(0, 3));
      
      const shuffled2 = [...allItems].sort(() => 0.5 - Math.random());
      setTrendingItems(shuffled2.slice(0, 3));
    } catch (err) {}
  };

  const handleSearchChange = async (text: string) => {
    setSearchText(text);
    if (text.length >= 2) {
      try {
        const res = await restaurantsAPI.getAll();
        const restaurants = res.data;
        let allNames: string[] = [];
        
        for (const restaurant of restaurants) {
          try {
            const menuRes = await api.get(`/menu/restaurant/${restaurant.id}`);
            const itemNames = menuRes.data.map((item: any) => item.name);
            allNames = [...allNames, ...itemNames];
          } catch (e) {}
        }

        const filtered = [...new Set(allNames)]
          .filter((name) => name.toLowerCase().includes(text.toLowerCase()))
          .slice(0, 5);
        setSearchSuggestions(filtered);
      } catch (e) {
        setSearchSuggestions([]);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSearchSubmit = async () => {
    if (searchText.trim()) {
      await AsyncStorage.setItem('searchTerm', searchText.trim());
      await AsyncStorage.removeItem('filterCategory');
      goOrderFood();
    }
  };

  const handleCategoryPress = async (categoryId: string) => {
    setActiveCategory(categoryId);
    await AsyncStorage.setItem('filterCategory', categoryId);
    await AsyncStorage.removeItem('searchTerm');
    goOrderFood();
  };

  const handleFoodTypePress = async (foodType: string) => {
    await AsyncStorage.setItem('searchTerm', foodType);
    await AsyncStorage.removeItem('filterCategory');
    goOrderFood();
  };

  const handleSuggestionTap = async (term: string) => {
    setSearchText(term);
    setSearchFocused(false);
    setSearchSuggestions([]);
    await AsyncStorage.setItem('searchTerm', term);
    await AsyncStorage.removeItem('filterCategory');
    goOrderFood();
  };

  const handleItemPress = (item: MenuItem) => {
    AsyncStorage.setItem('highlightItem', item.name);
    onSelectRestaurant?.(item.restaurant_id, item.restaurant_name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home')}>
          <TransEatWordmark width={140} height={45} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
      >
        <TouchableOpacity style={styles.tripCard} activeOpacity={0.85} onPress={() => onNavigate('LocationPicker')}>
          <View style={styles.tripIconWrap}>
            <Navigation size={22} color="#CB2602" strokeWidth={2} />
          </View>
          <View style={styles.tripInfo}>
            {canOrderFood ? (
              <>
                <Text style={styles.tripTitle}>Ordering to {trip.destinationTown?.name}</Text>
                <Text style={styles.tripSub}>{trip.pickupMethod === 'station' ? 'Bus station pickup' : 'Restaurant pickup'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.tripTitle}>Where are you headed?</Text>
                <Text style={styles.tripSub}>Set destination before checkout</Text>
              </>
            )}
          </View>
          <ChevronRight size={18} color="#f98015" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <Search size={18} color="rgba(255,255,255,0.4)" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search across all restaurants..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={searchText}
              onChangeText={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => { setSearchFocused(false); setSearchSuggestions([]); }, 200)}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchText(''); setSearchSuggestions([]); }}>
                <X size={16} color="rgba(255,255,255,0.4)" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
          {searchFocused && searchSuggestions.length > 0 && (
            <View style={styles.searchDropdown}>
              {searchSuggestions.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggestionRow} onPress={() => handleSuggestionTap(s)}>
                  <Search size={13} color="rgba(255,255,255,0.35)" strokeWidth={2} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {searchFocused && searchText.length === 0 && searchSuggestions.length === 0 && (
            <View style={styles.searchDropdown}>
              <Text style={styles.suggestionLabel}>Recent</Text>
              {RECENT_SEARCHES.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestionRow} onPress={() => handleSuggestionTap(s)}>
                  <Clock size={13} color="rgba(255,255,255,0.35)" strokeWidth={2} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.suggestionLabel, { marginTop: 10 }]}>Trending</Text>
              {TRENDING_SEARCHES.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestionRow} onPress={() => handleSuggestionTap(s)}>
                  <Search size={13} color="rgba(255,255,255,0.35)" strokeWidth={2} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <TouchableOpacity key={cat.id} style={[styles.categoryPill, active && styles.categoryPillActive]} onPress={() => handleCategoryPress(cat.id)} activeOpacity={0.85}>
                <Icon size={15} color={active ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} strokeWidth={2.25} />
                <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foodTypeRow}>
          {FOOD_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <TouchableOpacity key={type.id} style={styles.foodTypeItem} activeOpacity={0.8} onPress={() => handleFoodTypePress(type.label)}>
                <View style={styles.foodTypeIconWrap}>
                  <Icon size={22} color="#CB2602" strokeWidth={1.75} />
                </View>
                <Text style={styles.foodTypeLabel}>{type.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Ongoing Offers</Text>
        <ScrollView ref={offerScrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setOfferIndex(Math.round(e.nativeEvent.contentOffset.x / offerCardWidth))}>
          {OFFERS.map((offer) => (
            <View key={offer.id} style={[styles.offerCard, { width: offerCardWidth }]}>
              <Image source={{ uri: offer.image }} style={styles.offerImage} resizeMode="cover" />
              <View style={styles.offerOverlay} />
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                <TouchableOpacity style={[styles.offerCta, { backgroundColor: offer.accent }]} onPress={goOrderFood}>
                  <Text style={styles.offerCtaText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsRow}>
          {OFFERS.map((offer, i) => (
            <View key={offer.id} style={[styles.dot, i === offerIndex && { backgroundColor: '#CB2602', width: 16 }]} />
          ))}
        </View>

        {popularItems.length > 0 && (
          <View style={styles.columnsRow}>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Popular</Text>
              {popularItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.foodCard} activeOpacity={0.85} onPress={() => handleItemPress(item)}>
                  <View style={styles.foodImagePlaceholder}>
                    <Image source={{ uri: item.image_url }} style={styles.foodImage} resizeMode="cover" />
                    <View style={styles.prepTimeBadge}>
                      <Clock size={10} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.prepTimeText}>{item.prep_time_min} min</Text>
                    </View>
                  </View>
                  <Text style={styles.foodRestaurant} numberOfLines={1}>{item.restaurant_name}</Text>
                  <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.foodPrice}>K{item.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.column}>
              <Text style={styles.sectionLabel}>Trending</Text>
              {trendingItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.foodCard} activeOpacity={0.85} onPress={() => handleItemPress(item)}>
                  <View style={styles.foodImagePlaceholder}>
                    <Image source={{ uri: item.image_url }} style={styles.foodImage} resizeMode="cover" />
                    <View style={styles.prepTimeBadge}>
                      <Clock size={10} color="#FFFFFF" strokeWidth={2.5} />
                      <Text style={styles.prepTimeText}>{item.prep_time_min} min</Text>
                    </View>
                  </View>
                  <Text style={styles.foodRestaurant} numberOfLines={1}>{item.restaurant_name}</Text>
                  <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.foodPrice}>K{item.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8,
  },
  tripCard: {
    backgroundColor: 'rgba(203,38,2,0.1)', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(203,38,2,0.2)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  tripIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(203,38,2,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  tripInfo: { flex: 1 },
  tripTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  tripSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  searchWrap: { marginBottom: 16, position: 'relative', zIndex: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  searchDropdown: {
    position: 'absolute', top: 52, left: 0, right: 0,
    backgroundColor: 'rgba(20,20,20,0.98)', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 100,
  },
  suggestionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  suggestionText: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  categoryPillActive: { backgroundColor: '#CB2602', borderColor: '#CB2602' },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  categoryLabelActive: { color: '#FFFFFF' },
  foodTypeRow: { gap: 18, paddingBottom: 4, paddingRight: 8 },
  foodTypeItem: { alignItems: 'center', width: 60 },
  foodTypeIconWrap: {
    width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(203,38,2,0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  foodTypeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'center' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12, letterSpacing: -0.2 },
  offerCard: { borderRadius: 20, minHeight: 150, justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' },
  offerImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  offerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  offerContent: { padding: 20 },
  offerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', maxWidth: '85%' },
  offerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, marginBottom: 12 },
  offerCta: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  offerCtaText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 22 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  columnsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  column: { flex: 1 },
  foodCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  foodImagePlaceholder: {
    height: 90, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  foodImage: { width: '100%', height: '100%' },
  prepTimeBadge: {
    position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  prepTimeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  foodRestaurant: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  foodName: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  foodPrice: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default HomeScreen;
