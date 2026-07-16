import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import { TOWNS, Town } from '../data/towns';
import { useOrder } from '../context/OrderContext';

interface DestinationPickerScreenProps {
  onBack: () => void;
  onDestinationSet: () => void;
}

const DestinationPickerScreen = ({ onBack, onDestinationSet }: DestinationPickerScreenProps) => {
  const { trip, setDestination } = useOrder();
  const [selected, setSelected] = useState<Town | null>(trip.destinationTown);

  const selectableTowns = TOWNS.filter((t) => t.id !== trip.currentTown?.id);

  const confirm = () => {
    if (!selected) return;
    setDestination(selected);
    onDestinationSet();
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Where are you headed?" onBack={onBack} />

      <View style={styles.currentBanner}>
        <MapPin size={14} color="#CB2602" strokeWidth={2.5} />
        <Text style={styles.currentText}>
          {trip.currentTown ? `Currently in ${trip.currentTown.name}` : 'Locating you…'}
        </Text>
      </View>

      <View style={styles.townsPanel}>
        <Text style={styles.townsLabel}>Select your destination</Text>
        {selectableTowns.map((town) => {
          const active = selected?.id === town.id;
          return (
            <TouchableOpacity
              key={town.id}
              style={[styles.townRow, active && styles.townRowActive]}
              onPress={() => setSelected(town)}
            >
              <Navigation size={16} color={active ? '#CB2602' : 'rgba(255,255,255,0.4)'} strokeWidth={2} />
              <Text style={[styles.townName, active && styles.townNameActive]}>{town.name}</Text>
              {active && <View style={styles.townCheckDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
        onPress={confirm}
        disabled={!selected}
      >
        <Text style={styles.confirmText}>
          {selected ? `Order Food for ${selected.name}` : 'Pick a destination'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  currentBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 10 },
  currentText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  townsPanel: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  townsLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  townRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)', marginBottom: 8,
  },
  townRowActive: { borderColor: '#CB2602', backgroundColor: 'rgba(203,38,2,0.1)' },
  townName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  townNameActive: { color: '#FFFFFF' },
  townCheckDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CB2602' },
  confirmBtn: { margin: 16, backgroundColor: '#CB2602', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: 'rgba(203,38,2,0.3)' },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default DestinationPickerScreen;