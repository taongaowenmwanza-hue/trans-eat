import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Navigation, Search } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';

const DEFAULT_COORDS: [number, number] = [28.3228, -15.3875];

const NEXT_STOPS = [
  { id: 's1', name: 'Kabwe', coords: [28.4464, -14.4469] as [number, number], etaFromRoute: '1h 40m ahead' },
  { id: 's2', name: 'Kapiri Mposhi', coords: [28.6801, -13.9694] as [number, number], etaFromRoute: '2h 15m ahead' },
  { id: 's3', name: 'Kitwe', coords: [28.2132, -12.8024] as [number, number], etaFromRoute: '3h 55m ahead' },
];

interface LocationPickerScreenProps {
  onBack: () => void;
  onConfirm: (coords: [number, number], label: string) => void;
  inTransit?: boolean;
}

const LocationPickerScreen = ({ onBack, onConfirm, inTransit = false }: LocationPickerScreenProps) => {
  const [pinCoords, setPinCoords] = useState<[number, number]>(DEFAULT_COORDS);
  const [addressText, setAddressText] = useState('Current Location');

  const jumpToStop = (stop: typeof NEXT_STOPS[0]) => {
    setPinCoords(stop.coords);
    setAddressText(stop.name);
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Set Delivery Location" onBack={onBack} />

      <View style={styles.mapPlaceholder}>
        <MapPin size={32} color="#CB2602" strokeWidth={2} />
        <Text style={styles.mapPlaceholderText}>Map: {pinCoords[0].toFixed(4)}, {pinCoords[1].toFixed(4)}</Text>
        <Text style={styles.mapNote}>MapLibre will render here on native</Text>
      </View>

      <View style={styles.searchOverlay}>
        <View style={styles.searchBar}>
          <Search size={16} color="rgba(255,255,255,0.45)" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            value={addressText}
            onChangeText={setAddressText}
            placeholder="Edit delivery address..."
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
        </View>
      </View>

      {inTransit && (
        <View style={styles.stopsPanel}>
          <Text style={styles.stopsLabel}>Next stops on your route</Text>
          {NEXT_STOPS.map((stop) => (
            <TouchableOpacity key={stop.id} style={styles.stopRow} onPress={() => jumpToStop(stop)}>
              <View style={styles.stopDot} />
              <Text style={styles.stopName}>{stop.name}</Text>
              <Text style={styles.stopEta}>{stop.etaFromRoute}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.confirmBtn} onPress={() => onConfirm(pinCoords, addressText)}>
        <Text style={styles.confirmText}>Use This Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  mapPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)', margin: 16, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  mapPlaceholderText: { color: '#FFFFFF', fontSize: 13, marginTop: 10 },
  mapNote: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },
  searchOverlay: { position: 'absolute', top: 100, left: 16, right: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(10,10,10,0.85)', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  stopsPanel: {
    backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 16,
    paddingTop: 14, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  stopsLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  stopDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#f98015' },
  stopName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  stopEta: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  confirmBtn: { margin: 16, backgroundColor: '#CB2602', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default LocationPickerScreen;