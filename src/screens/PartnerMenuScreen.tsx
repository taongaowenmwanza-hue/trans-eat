import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import api from '../services/api';

const PartnerMenuScreen = ({ onBack }: { onBack: () => void }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/restaurants/my');
      if (res.data.has_restaurant) {
        setRestaurantId(res.data.restaurant.id);
        const menuRes = await api.get(`/menu/restaurant/${res.data.restaurant.id}`);
        setItems(menuRes.data);
      }
    } catch (err) { console.log(err); }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name || !price) { Alert.alert('Error', 'Name and price required'); return; }
    try {
      await api.post('/menu/add', { name, description, price: parseFloat(price), category, prep_time_min: parseInt(prepTime), image_url: imageUrl });
      Alert.alert('Added', 'Menu item added');
      setShowAdd(false); setName(''); setDescription(''); setPrice(''); setCategory(''); setPrepTime('15'); setImageUrl('');
      loadData();
    } catch (err: any) { Alert.alert('Error', err.response?.data?.detail || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/menu/${id}`);
      loadData();
    } catch (err) { Alert.alert('Error', 'Failed to delete'); }
  };

  if (loading) return (
    <View style={styles.container}>
      <BackHeader title="Menu Items" onBack={onBack} />
      <ActivityIndicator size="large" color="#CB2602" style={{ marginTop: 40 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Menu Items" onBack={onBack} rightSlot={
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Plus size={22} color="#CB2602" strokeWidth={2.5} />
        </TouchableOpacity>
      } />

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput style={styles.input} placeholder="Item name" placeholderTextColor="rgba(255,255,255,0.3)" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Description" placeholderTextColor="rgba(255,255,255,0.3)" value={description} onChangeText={setDescription} />
          <TextInput style={styles.input} placeholder="Price (K)" placeholderTextColor="rgba(255,255,255,0.3)" value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Category (e.g. Pizza, Grill)" placeholderTextColor="rgba(255,255,255,0.3)" value={category} onChangeText={setCategory} />
          <TextInput style={styles.input} placeholder="Prep time (minutes)" placeholderTextColor="rgba(255,255,255,0.3)" value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Image URL (optional)" placeholderTextColor="rgba(255,255,255,0.3)" value={imageUrl} onChangeText={setImageUrl} />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
              <Text style={styles.itemMeta}>{item.category} · {item.prep_time_min} min · K{item.price}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Trash2 size={18} color="#CB2602" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No menu items yet. Tap + to add your first item.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  addForm: { padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, gap: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, fontSize: 14, color: '#FFFFFF' },
  addBtn: { backgroundColor: '#CB2602', borderRadius: 12, padding: 12, alignItems: 'center' },
  addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  itemDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  itemMeta: { fontSize: 11, color: '#f98015', marginTop: 4, fontWeight: '500' },
  emptyText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 40, fontSize: 14 },
});

export default PartnerMenuScreen;