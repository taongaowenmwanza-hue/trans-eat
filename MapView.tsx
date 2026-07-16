import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface MapViewProps {
  origin: [number, number];
  destination: [number, number];
  destinationLabel: string;
  foodIcon?: string;
  style?: any;
}

const MapView = ({ origin, destination, destinationLabel, foodIcon, style }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLib, setMapLib] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    import('maplibre-gl').then((maplibregl) => {
      if (cancelled) return;
      setMapLib(maplibregl.default);
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!mapLib || !mapContainer.current || mapRef.current) return;

    // Dynamically load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css';
    document.head.appendChild(link);

    const map = new mapLib.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [(origin[0] + destination[0]) / 2, (origin[1] + destination[1]) / 2],
      zoom: 8,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Origin marker
      new mapLib.Marker({ color: '#CB2602' })
        .setLngLat(origin)
        .addTo(map);

      // Destination marker with food icon
      const destEl = document.createElement('div');
      destEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:40px;height:40px;border-radius:20px;background:rgba(203,38,2,0.2);display:flex;align-items:center;justify-content:center;border:2px solid #CB2602;">
          <span style="font-size:20px;">${foodIcon || '📍'}</span>
        </div>
        <div style="color:white;font-size:10px;font-weight:600;text-align:center;margin-top:4px;background:rgba(0,0,0,0.6);padding:2px 8px;border-radius:6px;">${destinationLabel}</div>
      </div>`;

      new mapLib.Marker({ element: destEl, anchor: 'bottom' })
        .setLngLat(destination)
        .addTo(map);

      // Route line
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [origin, destination] } },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#CB2602', 'line-width': 3, 'line-dasharray': [8, 4], 'line-opacity': 0.7 },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapLib]);

  return (
    <View style={[styles.container, style]}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' },
});

export default MapView;