import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, PanResponder, View } from 'react-native';
import { ShoppingBag, Map, FileText } from 'lucide-react-native';
import { useOrder } from '../context/OrderContext';

const FloatingOrderTracker = ({ onViewDetails, onViewMap }: { onViewDetails: () => void; onViewMap: () => void }) => {
  const { activeOrder } = useOrder();
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const panOffset = useRef({ x: 0, y: 0 });
  let collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => expanded ? false : true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2,
    onPanResponderGrant: () => {
      pan.setOffset({ x: panOffset.current.x, y: panOffset.current.y });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => {
      pan.flattenOffset();
      panOffset.current = { x: panOffset.current.x + gs.dx, y: panOffset.current.y + gs.dy };
    },
  });

  const handlePress = () => {
    if (expanded) {
      collapse();
    } else {
      expand();
    }
  };

  const expand = () => {
    setExpanded(true);
    Animated.spring(expandAnim, { toValue: 1, friction: 7, useNativeDriver: false }).start();
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    collapseTimer.current = setTimeout(collapse, 5000);
  };

  const collapse = () => {
    Animated.timing(expandAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => setExpanded(false));
  };

  if (!activeOrder) return null;

  const expandedSize = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [56, 180] });
  const expandedRadius = expandAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 90] });
  const menuOpacity = expandAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const badgeOpacity = expandAnim.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0] });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: expandedSize,
          height: expandedSize,
          borderRadius: expandedRadius,
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[styles.bubble, { borderRadius: expanded ? 90 : 28 }]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {!expanded ? (
          <View style={styles.collapsedContent}>
            <ShoppingBag size={22} color="#FFFFFF" strokeWidth={2} />
            <Animated.View style={[styles.badge, { opacity: badgeOpacity }]}>
              <Text style={styles.badgeText}>{activeOrder.items.length}</Text>
            </Animated.View>
          </View>
        ) : (
          <Animated.View style={[styles.expandedContent, { opacity: menuOpacity }]}>
            <Text style={styles.orderTitle} numberOfLines={1}>{activeOrder.restaurant_name}</Text>
            <Text style={styles.orderStatus}>{activeOrder.status} · K{activeOrder.total_amount}</Text>

            <TouchableOpacity style={styles.menuBtn} onPress={() => { collapse(); setTimeout(onViewMap, 300); }}>
              <Map size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.menuBtnText}>View Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={() => { collapse(); setTimeout(onViewDetails, 300); }}>
              <FileText size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.menuBtnText}>View Details</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', right: 16, bottom: 100, zIndex: 100,
  },
  bubble: {
    width: '100%', height: '100%',
    backgroundColor: '#CB2602',
    shadowColor: '#CB2602', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
    overflow: 'hidden',
  },
  collapsedContent: {
    width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#f98015', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#CB2602',
  },
  badgeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  expandedContent: {
    flex: 1, paddingHorizontal: 24, paddingVertical: 20,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  orderTitle: {
    color: '#FFFFFF', fontSize: 13, fontWeight: '700', textAlign: 'center',
  },
  orderStatus: {
    color: 'rgba(255,255,255,0.7)', fontSize: 10, marginBottom: 6,
    textTransform: 'capitalize', textAlign: 'center',
  },
  menuBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16, width: '100%',
  },
  menuBtnText: {
    color: '#FFFFFF', fontSize: 12, fontWeight: '600',
  },
});

export default FloatingOrderTracker;