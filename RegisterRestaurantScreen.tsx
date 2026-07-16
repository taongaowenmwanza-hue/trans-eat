import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import BackHeader from '../components/BackHeader';
import api from '../services/api';

const TOWNS = ['Lusaka', 'Kabwe', 'Livingstone', 'Kitwe', 'Ndola', 'Kapiri Mposhi'];
const CUISINES = ['Zambian', 'Fast Food', 'Pizza', 'Grill', 'International', 'Other'];

const RegisterRestaurantScreen = ({ onBack, onRegistered }: { onBack: () => void; onRegistered: () => void }) => {
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [town, setTown] = useState('');
  const [phone, setPhone] = useState('');
  const [prepTime, setPrepTime] = useState('20');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toString());
          setLongitude(pos.coords.longitude.toString());
          Alert.alert('Location Set', `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`);
        },
        () => Alert.alert('Error', 'Could not get location. Please allow GPS access.'),
        { enableHighAccuracy: true }
      );
    } else {
      Alert.alert('Error', 'Geolocation not supported');
    }
  };

  const handleSubmit = async () => {
    if (!name || !cuisine || !address || !town || !phone) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/restaurants/register', {
        name, cuisine, address, town, phone,
        prep_time_min: parseInt(prepTime),
        image_url: imageUrl || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });
      Alert.alert('Success', 'Restaurant registered! Add menu items next.');
      onRegistered();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to register');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Register Restaurant" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Restaurant Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Hungry Lion" placeholderTextColor="rgba(255,255,255,0.3)" />

        <Text style={styles.label}>Cuisine Type *</Text>
        <View style={styles.chipRow}>
          {CUISINES.map((c) => (
            <TouchableOpacity key={c} style={[styles.chip, cuisine === c && styles.chipActive]} onPress={() => setCuisine(c)}>
              <Text style={[styles.chipText, cuisine === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Town *</Text>
        <View style={styles.chipRow}>
          {TOWNS.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, town === t && styles.chipActive]} onPress={() => setTown(t)}>
              <Text style={[styles.chipText, town === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Address *</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street address" placeholderTextColor="rgba(255,255,255,0.3)" />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+260..." placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="phone-pad" />

        <Text style={styles.label}>Default Prep Time (minutes)</Text>
        <TextInput style={styles.input} value={prepTime} onChangeText={setPrepTime} placeholder="20" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />

        <Text style={styles.label}>Restaurant Image URL</Text>
        <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor="rgba(255,255,255,0.3)" />

        <Text style={styles.label}>GPS Location</Text>
        <View style={styles.gpsRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={latitude} onChangeText={setLatitude} placeholder="Latitude" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} value={longitude} onChangeText={setLongitude} placeholder="Longitude" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
        </View>
        <TouchableOpacity style={styles.gpsBtn} onPress={handleGetLocation}>
          <Text style={styles.gpsBtnText}>📍 Use Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Registering...' : 'Register Restaurant'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, fontSize: 15, color: '#FFFFFF' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: '#CB2602', borderColor: '#CB2602' },
  chipText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },
  gpsRow: { flexDirection: 'row', gap: 8 },
  gpsBtn: { backgroundColor: 'rgba(203,38,2,0.1)', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: 'rgba(203,38,2,0.2)' },
  gpsBtnText: { color: '#CB2602', fontSize: 14, fontWeight: '600' },
  btn: { backgroundColor: '#CB2602', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

export default RegisterRestaurantScreen;