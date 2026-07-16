import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import { Plus, Minus, ShoppingBag } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import { useCart } from '../context/CartContext';
import api from '../services/api';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  prep_time_min: number;
  image_url: string;
}

interface Props {
  onBack: () => void;
  onCheckout: () => void;
  restaurantId: string;
  restaurantName: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 16;
const GRID_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GRID_GAP) / 2;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';

const RestaurantMenuScreen = ({ onBack, onCheckout, restaurantId, restaurantName }: Props) => {
  const { items, addItem, updateQuantity, totalAmount, itemCount } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenu();
  }, [restaurantId]);

  const loadMenu = async () => {
    try {
      const res = await api.get(`/menu/restaurant/${restaurantId}`);
      setMenuItems(res.data);
    } catch (err) {
      console.log('Error loading menu:', err);
    }
    setLoading(false);
  };

  const categories = ['All', ...new Set(menuItems.map((i) => i.category).filter(Boolean))];
  const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  const getItemQuantity = (id: string) => items.find((i) => i.id === id)?.quantity || 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <BackHeader title={restaurantName} onBack={onBack} />
        <ActivityIndicator size="large" color="#CB2602" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader title={restaurantName} onBack={onBack} />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeCategory === item && styles.filterChipActive]}
            onPress={() => setActiveCategory(item)}
            activeOpacity={0.85}
          >
            <Text style={[styles.filterText, activeCategory === item && styles.filterTextActive]} numberOfLines={1}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No menu items yet</Text>
            <Text style={styles.emptySub}>The restaurant hasn't added any items</Text>
          </View>
        }
        renderItem={({ item }) => {
          const qty = getItemQuantity(item.id);
          return (
            <View style={styles.menuCard}>
              <View style={styles.imageWrap}>
                <Image
                  source={{ uri: item.image_url || FALLBACK_IMAGE }}
                  style={styles.menuImage}
                  resizeMode="cover"
                />
                {qty > 0 ? (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, qty - 1)}>
                      <Minus size={14} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, qty + 1)}>
                      <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => addItem({ id: item.id, name: item.name, price: item.price, restaurantId, restaurantName })}
                  >
                    <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuPrice}>K{item.price}</Text>
                <Text style={styles.menuName} numberOfLines={2}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.menuDesc} numberOfLines={1}>{item.description}</Text>
                ) : null}
                <View style={styles.menuMetaRow}>
                  <Text style={styles.menuWeight}>{item.prep_time_min} min</Text>
                  <Text style={styles.menuTag}>{item.category}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      {itemCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartInfo}>
            <ShoppingBag size={20} color="#CB2602" strokeWidth={2} />
            <Text style={styles.cartCount}>{itemCount} item{itemCount > 1 ? 's' : ''}</Text>
            <Text style={styles.cartTotal}>K{totalAmount}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const CHIP_WIDTH = 90;
const CHIP_HEIGHT = 36;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  filterRow: { paddingHorizontal: H_PADDING, paddingBottom: 14, gap: 8 },
  filterChip: {
    width: CHIP_WIDTH, height: CHIP_HEIGHT,
    justifyContent: 'center', alignItems: 'center', borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: { backgroundColor: '#CB2602', borderColor: '#CB2602' },
  filterText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'center' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  listContent: { paddingHorizontal: H_PADDING, paddingBottom: 140, paddingTop: 6 },
  gridRow: { justifyContent: 'space-between', marginBottom: GRID_GAP },
  empty: { alignItems: 'center', paddingTop: 60, width: '100%' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '600' },
  emptySub: { color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 4 },
  menuCard: { width: CARD_WIDTH },
  imageWrap: {
    width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 20,
    overflow: 'hidden', backgroundColor: '#141414', position: 'relative',
  },
  menuImage: { width: '100%', height: '100%' },
  addBtn: {
    position: 'absolute', bottom: 10, right: 10,
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: '#CB2602', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 5, elevation: 5,
  },
  qtyRow: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(20,20,20,0.9)', borderRadius: 14,
    paddingHorizontal: 8, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 9,
    backgroundColor: '#CB2602', justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', minWidth: 16, textAlign: 'center' },
  menuInfo: { paddingTop: 10, paddingHorizontal: 2 },
  menuPrice: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 3 },
  menuName: { fontSize: 13.5, fontWeight: '600', color: '#FFFFFF', lineHeight: 18, marginBottom: 2 },
  menuDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 14, marginBottom: 4 },
  menuMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  menuWeight: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  menuTag: { fontSize: 10, color: '#f98015', fontWeight: '700', letterSpacing: 0.3 },
  cartBar: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: 'rgba(20,20,20,0.97)', borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  cartInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartCount: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  cartTotal: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  checkoutBtn: { backgroundColor: '#CB2602', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  checkoutText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});

export default RestaurantMenuScreen;