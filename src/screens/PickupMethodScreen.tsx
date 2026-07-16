import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Store, Bus, Check } from 'lucide-react-native';
import BackHeader from '../components/BackHeader';
import { useOrder, PickupMethod } from '../context/OrderContext';

const STATION_FEE = 15;

interface PickupMethodScreenProps {
  onBack: () => void;
  onConfirm: () => void;
}

const PickupMethodScreen = ({ onBack, onConfirm }: PickupMethodScreenProps) => {
  const { trip, setPickupMethod } = useOrder();

  const choose = (method: PickupMethod) => setPickupMethod(method);

  const options: { id: Exclude<PickupMethod, null>; title: string; sub: string; icon: typeof Store; fee?: number }[] = [
    {
      id: 'restaurant',
      title: 'Pick up from restaurant',
      sub: `Collect directly when you arrive in ${trip.destinationTown?.name ?? 'town'}`,
      icon: Store,
    },
    {
      id: 'station',
      title: 'Pick up at bus station',
      sub: `Your order is brought to the main bus station in ${trip.destinationTown?.name ?? 'town'}`,
      icon: Bus,
      fee: STATION_FEE,
    },
  ];

  return (
    <View style={styles.container}>
      <BackHeader title="Pickup Method" onBack={onBack} />

      <Text style={styles.intro}>
        Your order will be timed to be ready when you reach {trip.destinationTown?.name ?? 'your destination'}.
        How do you want to collect it?
      </Text>

      {options.map((opt) => {
        const Icon = opt.icon;
        const active = trip.pickupMethod === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[styles.optionCard, active && styles.optionCardActive]}
            onPress={() => choose(opt.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Icon size={22} color={active ? '#FFFFFF' : '#CB2602'} strokeWidth={2} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <Text style={styles.optionSub}>{opt.sub}</Text>
              {opt.fee ? <Text style={styles.optionFee}>+K{opt.fee} fee</Text> : <Text style={styles.optionFree}>No extra fee</Text>}
            </View>
            {active && (
              <View style={styles.checkDot}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.confirmBtn, !trip.pickupMethod && styles.confirmBtnDisabled]}
        onPress={onConfirm}
        disabled={!trip.pickupMethod}
      >
        <Text style={styles.confirmText}>Continue to Restaurants</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingHorizontal: 16 },
  intro: { fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 19, marginBottom: 20 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 12,
  },
  optionCardActive: { borderColor: '#CB2602', backgroundColor: 'rgba(203,38,2,0.08)' },
  iconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(203,38,2,0.12)', justifyContent: 'center', alignItems: 'center',
  },
  iconWrapActive: { backgroundColor: '#CB2602' },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  optionSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 16 },
  optionFee: { fontSize: 12, fontWeight: '700', color: '#f98015', marginTop: 6 },
  optionFree: { fontSize: 12, fontWeight: '600', color: '#2f8f5b', marginTop: 6 },
  checkDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#CB2602', justifyContent: 'center', alignItems: 'center' },
  confirmBtn: { marginTop: 8, backgroundColor: '#CB2602', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: 'rgba(203,38,2,0.3)' },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default PickupMethodScreen;