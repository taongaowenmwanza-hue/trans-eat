import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, Navigation, Clock, Check, X, Utensils } from 'lucide-react-native';
import { useOrder } from '../context/OrderContext';

const ORDER_STEPS = ['Order Placed', 'Restaurant Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up'];

const OrderTrackingScreen = ({ onBack }: { onBack: () => void }) => {
  const { trip } = useOrder();
  const [currentStep, setCurrentStep] = useState(0);
  const [distance, setDistance] = useState(145);
  const [eta, setEta] = useState('2h 15m');
  const [panelVisible, setPanelVisible] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const watchRef = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelAnim = useRef(new Animated.Value(1)).current;

  const destination: [number, number] = trip.destinationTown?.coords || [28.4464, -14.4469];

  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      showPanel();
    }, 3000);
  }, []);

  const hidePanel = () => {
    setPanelVisible(false);
    Animated.timing(panelAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
  };

  const showPanel = () => {
    setPanelVisible(true);
    Animated.timing(panelAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const handleMapInteraction = () => {
    hidePanel();
    resetIdleTimer();
  };

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, []);

  // Initialize real map with road routing
  useEffect(() => {
    let cancelled = false;

    import('maplibre-gl').then((maplibregl) => {
      if (cancelled || !mapContainer.current) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css';
      document.head.appendChild(link);

      const map = new maplibregl.default.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: destination,
        zoom: 7,
        attributionControl: false,
      });

      mapRef.current = map;
      const maplibre = maplibregl.default;

      map.on('load', () => {
        // Destination marker with food icon
        const destEl = document.createElement('div');
        destEl.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:44px;height:44px;border-radius:22px;background:#CB2602;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 12px rgba(203,38,2,0.5);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </div>
            <div style="color:white;font-size:10px;font-weight:600;text-align:center;margin-top:6px;background:rgba(0,0,0,0.75);padding:3px 10px;border-radius:6px;">${trip.destinationTown?.name || 'Destination'}</div>
          </div>`;
        new maplibre.Marker({ element: destEl, anchor: 'bottom' }).setLngLat(destination).addTo(map);

        // Try GPS position
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const userCoords: [number, number] = [pos.coords.longitude, pos.coords.latitude];

              const userEl = document.createElement('div');
              userEl.innerHTML = `<div style="width:20px;height:20px;border-radius:10px;background:#CB2602;border:3px solid white;box-shadow:0 0 14px rgba(203,38,2,0.6);"></div>`;
              markerRef.current = new maplibre.Marker({ element: userEl }).setLngLat(userCoords).addTo(map);

              // Get real road route from OSRM
              fetch(`https://router.project-osrm.org/route/v1/driving/${userCoords[0]},${userCoords[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`)
                .then((r) => r.json())
                .then((data) => {
                  if (data.routes && data.routes[0]) {
                    const routeCoords = data.routes[0].geometry.coordinates;
                    const routeDistance = Math.round(data.routes[0].distance / 1000);

                    map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords } } });
                    map.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-color': '#CB2602', 'line-width': 4, 'line-opacity': 0.85 } });

                    setDistance(routeDistance);
                    const hours = Math.floor(routeDistance / 60);
                    const mins = routeDistance % 60;
                    setEta(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
                  }
                });

              map.flyTo({ center: [(userCoords[0] + destination[0]) / 2, (userCoords[1] + destination[1]) / 2], zoom: 8 });

              // Watch GPS
              watchRef.current = navigator.geolocation.watchPosition(
                (update) => {
                  const newCoords: [number, number] = [update.coords.longitude, update.coords.latitude];
                  if (markerRef.current) markerRef.current.setLngLat(newCoords);

                  fetch(`https://router.project-osrm.org/route/v1/driving/${newCoords[0]},${newCoords[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`)
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.routes && data.routes[0]) {
                        const newDist = Math.round(data.routes[0].distance / 1000);
                        setDistance(newDist);
                        const h = Math.floor(newDist / 60);
                        const m = newDist % 60;
                        setEta(newDist <= 0 ? 'Arrived' : h > 0 ? `${h}h ${m}m` : `${m}m`);

                        if (map.getSource('route')) {
                          map.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: data.routes[0].geometry.coordinates } });
                        }
                      }
                    });
                },
                () => {},
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
              );
            },
            () => {
              const fallback: [number, number] = trip.currentCoords || [28.3228, -15.3875];
              const userEl = document.createElement('div');
              userEl.innerHTML = `<div style="width:20px;height:20px;border-radius:10px;background:#CB2602;border:3px solid white;"></div>`;
              markerRef.current = new maplibre.Marker({ element: userEl }).setLngLat(fallback).addTo(map);
            },
            { enableHighAccuracy: true, timeout: 10000 },
          );
        }
      });

      // Map interaction listeners
      map.on('mousedown', handleMapInteraction);
      map.on('touchstart', handleMapInteraction);
      map.on('drag', handleMapInteraction);
      map.on('zoom', handleMapInteraction);
    });

    return () => {
      cancelled = true;
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (distance < 100 && currentStep === 0) setCurrentStep(1);
    if (distance < 60 && currentStep === 1) setCurrentStep(2);
    if (distance < 20 && currentStep === 2) setCurrentStep(3);
    if (distance <= 0 && currentStep === 3) setCurrentStep(4);
  }, [distance]);

  const progressPercent = Math.max(0, Math.min(100, ((145 - distance) / 145) * 100));

  return (
    <View style={styles.container}>
      {/* Full screen map */}
      <View style={styles.mapFull}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </View>

      {/* Close button */}
      <TouchableOpacity style={styles.closeBtn} onPress={onBack}>
        <X size={20} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Auto-hiding info panel */}
      <Animated.View
        style={[
          styles.infoPanel,
          {
            transform: [{
              translateY: panelAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              })
            }],
            opacity: panelAnim,
          },
        ]}
      >
        {/* Tap indicator */}
        <View style={styles.panelHandle}>
          <View style={styles.handleBar} />
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercent)}%</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Clock size={16} color="#f98015" strokeWidth={2} />
            <Text style={styles.statLabel}>ETA</Text>
            <Text style={styles.statValue}>{eta}</Text>
          </View>
          <View style={styles.stat}>
            <Navigation size={16} color="#CB2602" strokeWidth={2} />
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance} km</Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          {ORDER_STEPS.map((step, i) => (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepDot, i <= currentStep && styles.stepDotDone]}>
                {i <= currentStep ? <Check size={10} color="#FFFFFF" strokeWidth={3} /> : <Text style={styles.stepNum}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepText, i <= currentStep && styles.stepTextDone]}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pickupInfo}>
          <MapPin size={14} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          <Text style={styles.pickupText}>
            Pickup: {trip.pickupMethod === 'station' ? `Bus Station, ${trip.destinationTown?.name}` : `Restaurant, ${trip.destinationTown?.name}`}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapFull: { ...StyleSheet.absoluteFillObject },
  closeBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 10,
  },
  infoPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,10,0.95)', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  panelHandle: { alignItems: 'center', marginBottom: 12 },
  handleBar: { width: 32, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#CB2602', borderRadius: 3 },
  progressText: { fontSize: 14, fontWeight: '700', color: '#CB2602' },
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 18 },
  stat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 14, alignItems: 'center' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  stepsContainer: { gap: 8, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  stepDotDone: { backgroundColor: '#CB2602' },
  stepNum: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  stepText: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  stepTextDone: { color: '#FFFFFF' },
  pickupInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  pickupText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
});

export default OrderTrackingScreen;