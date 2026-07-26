import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions,
  ScrollView, Animated, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { G, Path } from 'react-native-svg';
import {
  Clock, Star, ChevronRight, Search, X,
  Utensils, CupSoda, ShoppingBasket, Pill,
  Sandwich, Coffee, Pizza, Drumstick, IceCream2, Cookie,
  Navigation,
} from 'lucide-react-native';
import { useOrder } from '../context/OrderContext';
import BurgerSVG from '../components/BurgerSVG';
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

const TransEatLogo = ({ width = 80, height = 80 }: { width?: number; height?: number }) => (
  <Svg width={width} height={height} viewBox="150 550 1000 350">
    <G transform="translate(216.968686, 834.260476)">
      <Path d="M 87.25 -182.21875 L 93.359375 -182.21875 L 82.125 -143.078125 L 104.578125 -143.078125 L 102.015625 -133.125 L 79.234375 -133.125 L 50.6875 -33.359375 C 48.125 -24.804688 46.84375 -19.035156 46.84375 -16.046875 C 46.84375 -12.191406 48.441406 -10.265625 51.640625 -10.265625 C 54.421875 -10.265625 57.84375 -11.8125 61.90625 -14.90625 C 65.976562 -18.007812 69.773438 -21.488281 73.296875 -25.34375 C 76.828125 -29.195312 78.703125 -31.550781 78.921875 -32.40625 L 85.015625 -32.40625 C 76.671875 -19.144531 68.328125 -9.785156 59.984375 -4.328125 C 51.648438 1.117188 44.0625 3.84375 37.21875 3.84375 C 33.582031 3.84375 30.265625 2.457031 27.265625 -0.3125 C 24.273438 -3.09375 22.78125 -7.375 22.78125 -13.15625 C 22.78125 -17 24.0625 -23.734375 26.625 -33.359375 L 55.171875 -133.125 L 31.125 -133.125 L 33.359375 -140.1875 C 45.984375 -142.320312 56.300781 -147.1875 64.3125 -154.78125 C 72.332031 -162.375 79.976562 -171.519531 87.25 -182.21875 Z M 87.25 -182.21875 " fill="#DDE9F1" />
    </G>
    <G transform="translate(295.561666, 834.260476)">
      <Path d="M 68.015625 -146.609375 L 48.4375 -63.515625 C 52.289062 -72.929688 57.796875 -84.160156 64.953125 -97.203125 C 72.117188 -110.242188 79.765625 -121.738281 87.890625 -131.6875 C 96.023438 -141.632812 103.40625 -146.609375 110.03125 -146.609375 C 112.8125 -146.609375 115.269531 -145.644531 117.40625 -143.71875 C 119.550781 -141.789062 120.625 -138.90625 120.625 -135.0625 C 120.625 -129.070312 119.390625 -122.972656 116.921875 -116.765625 C 114.460938 -110.566406 110.347656 -107.46875 104.578125 -107.46875 C 101.585938 -107.46875 99.554688 -108.210938 98.484375 -109.703125 C 97.410156 -111.203125 96.554688 -113.453125 95.921875 -116.453125 C 95.492188 -118.585938 95.007812 -120.132812 94.46875 -121.09375 C 93.9375 -122.0625 92.921875 -122.546875 91.421875 -122.546875 C 87.785156 -122.546875 82.648438 -116.769531 76.015625 -105.21875 C 69.390625 -93.664062 62.867188 -80.40625 56.453125 -65.4375 C 50.046875 -50.46875 45.769531 -39.242188 43.625 -31.765625 L 34.640625 0 L 10.90625 0 L 36.25 -103.625 C 36.46875 -104.257812 37.109375 -106.875 38.171875 -111.46875 C 39.242188 -116.070312 39.78125 -120.191406 39.78125 -123.828125 C 39.78125 -127.242188 38.816406 -129.488281 36.890625 -130.5625 C 34.960938 -131.632812 32.394531 -132.171875 29.1875 -132.171875 C 26.832031 -132.171875 24.742188 -132.0625 22.921875 -131.84375 C 21.109375 -131.632812 19.671875 -131.421875 18.609375 -131.203125 L 20.203125 -137.296875 L 62.5625 -146.609375 Z M 68.015625 -146.609375 " fill="#DDE9F1" />
    </G>
    <G transform="translate(381.532754, 834.260476)">
      <Path d="M 99.765625 -146.609375 C 105.535156 -146.609375 110.773438 -144.628906 115.484375 -140.671875 C 120.191406 -136.710938 123.078125 -131.203125 124.140625 -124.140625 L 124.796875 -124.140625 L 129.921875 -143.078125 L 155.265625 -146.609375 L 122.21875 -30.796875 C 122.007812 -30.367188 121.476562 -28.765625 120.625 -25.984375 C 119.769531 -23.203125 119.34375 -20.421875 119.34375 -17.640625 C 119.34375 -15.929688 119.769531 -14.59375 120.625 -13.625 C 121.476562 -12.664062 122.4375 -12.1875 123.5 -12.1875 C 126.28125 -12.1875 129.8125 -14.109375 134.09375 -17.953125 C 138.375 -21.804688 142.4375 -27.15625 146.28125 -34 L 151.09375 -30.796875 C 145.320312 -20.097656 138 -11.648438 129.125 -5.453125 C 120.25 0.742188 112.390625 3.84375 105.546875 3.84375 C 101.691406 3.84375 98.800781 2.457031 96.875 -0.3125 C 94.957031 -3.09375 94 -6.519531 94 -10.59375 C 94 -13.363281 94.582031 -17.90625 95.75 -24.21875 C 96.925781 -30.53125 98.800781 -36.894531 101.375 -43.3125 L 100.734375 -43.953125 C 76.773438 -12.085938 55.066406 3.84375 35.609375 3.84375 C 27.054688 3.84375 20.265625 0.15625 15.234375 -7.21875 C 10.210938 -14.59375 7.703125 -23.09375 7.703125 -32.71875 C 7.703125 -49.40625 12.566406 -66.675781 22.296875 -84.53125 C 32.023438 -102.382812 44.109375 -117.191406 58.546875 -128.953125 C 72.984375 -140.722656 86.722656 -146.609375 99.765625 -146.609375 Z M 33.359375 -38.8125 C 33.359375 -30.476562 35.28125 -24.382812 39.125 -20.53125 C 42.976562 -16.675781 47.472656 -14.75 52.609375 -14.75 C 59.242188 -14.75 66.410156 -17.742188 74.109375 -23.734375 C 81.804688 -29.722656 88.914062 -37.367188 95.4375 -46.671875 C 101.957031 -55.972656 106.820312 -65.4375 110.03125 -75.0625 C 113.238281 -84.476562 115.59375 -92.234375 117.09375 -98.328125 C 118.59375 -104.421875 119.34375 -110.351562 119.34375 -116.125 C 119.34375 -124.46875 117.414062 -130.617188 113.5625 -134.578125 C 109.707031 -138.535156 105.21875 -140.515625 100.09375 -140.515625 C 90.039062 -140.515625 79.828125 -134.363281 69.453125 -122.0625 C 59.078125 -109.769531 50.46875 -95.390625 43.625 -78.921875 C 36.78125 -62.453125 33.359375 -49.082031 33.359375 -38.8125 Z M 33.359375 -38.8125 " fill="#DDE9F1" />
    </G>
    <G transform="translate(513.697526, 834.260476)">
      <Path d="M 50.359375 -72.171875 C 63.835938 -94.421875 77.421875 -112.390625 91.109375 -126.078125 C 104.796875 -139.765625 117.519531 -146.609375 129.28125 -146.609375 C 134.195312 -146.609375 138.3125 -144.945312 141.625 -141.625 C 144.945312 -138.3125 146.609375 -133.554688 146.609375 -127.359375 C 146.609375 -121.578125 145.109375 -113.234375 142.109375 -102.328125 L 121.90625 -33.046875 C 119.976562 -26.203125 119.015625 -21.492188 119.015625 -18.921875 C 119.015625 -17.003906 119.492188 -15.613281 120.453125 -14.75 C 121.421875 -13.894531 122.4375 -13.46875 123.5 -13.46875 C 126.070312 -13.46875 130.03125 -16.25 135.375 -21.8125 C 140.71875 -27.375 144.351562 -31.757812 146.28125 -34.96875 L 151.09375 -31.125 C 144.46875 -21.925781 137.035156 -13.796875 128.796875 -6.734375 C 120.566406 0.316406 112.816406 3.84375 105.546875 3.84375 C 102.117188 3.84375 99.226562 2.507812 96.875 -0.15625 C 94.53125 -2.832031 93.359375 -6.414062 93.359375 -10.90625 C 93.359375 -15.613281 94.53125 -21.921875 96.875 -29.828125 L 118.6875 -106.5 C 118.90625 -107.144531 119.441406 -108.910156 120.296875 -111.796875 C 121.148438 -114.679688 121.578125 -117.515625 121.578125 -120.296875 C 121.578125 -123.078125 120.828125 -125.210938 119.328125 -126.703125 C 117.835938 -128.203125 116.238281 -128.953125 114.53125 -128.953125 C 109.601562 -128.953125 102.488281 -124.78125 93.1875 -116.4375 C 83.882812 -108.101562 74.847656 -97.628906 66.078125 -85.015625 C 58.597656 -74.535156 52.554688 -64.859375 47.953125 -55.984375 C 43.359375 -47.109375 39.242188 -36.359375 35.609375 -23.734375 C 32.828125 -14.535156 30.582031 -6.625 28.875 0 L 4.171875 0 L 34.640625 -106.828125 C 34.859375 -107.460938 35.609375 -110.1875 36.890625 -115 C 38.171875 -119.8125 38.8125 -123.289062 38.8125 -125.4375 C 38.8125 -128 37.898438 -129.972656 36.078125 -131.359375 C 34.265625 -132.753906 31.863281 -133.453125 28.875 -133.453125 C 25.875 -133.453125 21.597656 -133.238281 16.046875 -132.8125 L 16.046875 -138.578125 L 65.125 -146.609375 L 70.890625 -146.609375 L 49.71875 -72.828125 Z M 50.359375 -72.171875 " fill="#DDE9F1" />
    </G>
    <G transform="translate(645.862312, 834.260476)">
      <Path d="M 75.703125 -146.609375 C 83.398438 -146.609375 90.671875 -144.789062 97.515625 -141.15625 C 101.367188 -139.4375 104.046875 -138.578125 105.546875 -138.578125 C 109.609375 -138.578125 112.921875 -141.253906 115.484375 -146.609375 L 121.265625 -146.609375 L 112.59375 -97.84375 L 106.828125 -97.84375 C 106.828125 -111.738281 104.097656 -122.21875 98.640625 -129.28125 C 93.191406 -136.34375 86.507812 -139.875 78.59375 -139.875 C 72.820312 -139.875 68.0625 -138.050781 64.3125 -134.40625 C 60.570312 -130.769531 58.703125 -126.707031 58.703125 -122.21875 C 58.703125 -117.09375 60.195312 -111.910156 63.1875 -106.671875 C 66.1875 -101.429688 70.894531 -94.53125 77.3125 -85.96875 C 84.582031 -76.5625 90.140625 -68.328125 93.984375 -61.265625 C 97.835938 -54.210938 99.765625 -46.835938 99.765625 -39.140625 C 99.765625 -31.867188 97.785156 -24.96875 93.828125 -18.4375 C 89.867188 -11.914062 84.253906 -6.570312 76.984375 -2.40625 C 69.710938 1.757812 61.265625 3.84375 51.640625 3.84375 C 46.085938 3.84375 39.351562 2.453125 31.4375 -0.328125 C 25.875 -2.035156 22.238281 -2.890625 20.53125 -2.890625 C 16.46875 -2.890625 12.832031 -0.644531 9.625 3.84375 L 2.890625 3.84375 L 12.1875 -47.484375 L 18.609375 -47.484375 C 19.460938 -34.648438 22.082031 -24.007812 26.46875 -15.5625 C 30.851562 -7.113281 39.03125 -2.890625 51 -2.890625 C 59.34375 -2.890625 65.867188 -5.722656 70.578125 -11.390625 C 75.285156 -17.054688 77.640625 -22.988281 77.640625 -29.1875 C 77.640625 -33.675781 76.351562 -38.328125 73.78125 -43.140625 C 71.21875 -47.953125 68.332031 -52.710938 65.125 -57.421875 C 61.914062 -62.128906 59.773438 -65.226562 58.703125 -66.71875 L 53.890625 -73.78125 C 48.328125 -81.476562 44.207031 -88.109375 41.53125 -93.671875 C 38.863281 -99.234375 37.53125 -105.222656 37.53125 -111.640625 C 37.53125 -119.335938 39.5625 -125.804688 43.625 -131.046875 C 47.6875 -136.285156 52.710938 -140.1875 58.703125 -142.75 C 64.691406 -145.320312 70.359375 -146.609375 75.703125 -146.609375 Z M 75.703125 -146.609375 " fill="#DDE9F1" />
    </G>
    <G transform="translate(692.360315, 831.7969)">
      <Path d="M 82.359375 2.546875 C 66.515625 2.546875 53.164062 -1.082031 42.3125 -8.34375 C 31.46875 -15.613281 23.445312 -25.144531 18.25 -36.9375 C 13.0625 -48.726562 10.46875 -61.414062 10.46875 -75 C 10.46875 -88.59375 13.0625 -101.285156 18.25 -113.078125 C 23.445312 -124.867188 31.46875 -134.441406 42.3125 -141.796875 C 53.164062 -149.160156 66.707031 -152.84375 82.9375 -152.84375 C 104.070312 -152.84375 120.863281 -146.191406 133.3125 -132.890625 C 145.769531 -119.585938 152 -100.289062 152 -75 L 152 -62.84375 L 52.9375 -62.84375 L 52.9375 -60.578125 C 52.9375 -52.835938 55.625 -46.179688 61 -40.609375 C 66.375 -35.046875 73.210938 -32.265625 81.515625 -32.265625 C 87.929688 -32.265625 93.40625 -33.726562 97.9375 -36.65625 C 102.46875 -39.582031 105.675781 -43.5 107.5625 -48.40625 L 150.859375 -48.40625 C 147.085938 -33.5 139.304688 -21.28125 127.515625 -11.75 C 115.722656 -2.21875 100.671875 2.546875 82.359375 2.546875 Z M 109.828125 -91.140625 C 109.640625 -101.328125 107.039062 -108.875 102.03125 -113.78125 C 97.03125 -118.6875 90.378906 -121.140625 82.078125 -121.140625 C 73.585938 -121.140625 66.84375 -118.5 61.84375 -113.21875 C 56.84375 -107.9375 54.25 -100.578125 54.0625 -91.140625 Z M 109.828125 -91.140625 " fill="#CB2602" />
    </G>
    <G transform="translate(832.186403, 831.7969)">
      <Path d="M 67.078125 2.546875 C 48.585938 2.546875 34.296875 -4.476562 24.203125 -18.53125 C 14.109375 -32.59375 9.0625 -51.414062 9.0625 -75 C 9.0625 -98.78125 14.25 -117.695312 24.625 -131.75 C 35 -145.8125 49.335938 -152.84375 67.640625 -152.84375 C 80.285156 -152.84375 90.003906 -150.054688 96.796875 -144.484375 C 103.585938 -138.921875 108.304688 -133.3125 110.953125 -127.65625 L 113.21875 -127.65625 L 113.21875 -149.734375 L 157.65625 -149.734375 L 157.65625 0 L 113.21875 0 L 113.21875 -24.0625 L 110.953125 -24.0625 C 108.117188 -18.019531 103.257812 -12.070312 96.375 -6.21875 C 89.488281 -0.375 79.722656 2.546875 67.078125 2.546875 Z M 83.78125 -32.828125 C 93.78125 -32.828125 101.234375 -37.023438 106.140625 -45.421875 C 111.046875 -53.828125 113.5 -63.785156 113.5 -75.296875 C 113.5 -86.609375 111.046875 -96.460938 106.140625 -104.859375 C 101.234375 -113.265625 93.78125 -117.46875 83.78125 -117.46875 C 73.40625 -117.46875 65.8125 -113.363281 61 -105.15625 C 56.1875 -96.945312 53.78125 -87.085938 53.78125 -75.578125 C 53.78125 -63.878906 56.1875 -53.828125 61 -45.421875 C 65.8125 -37.023438 73.40625 -32.828125 83.78125 -32.828125 Z M 83.78125 -32.828125 " fill="#CB2602" />
    </G>
    <G transform="translate(986.165005, 831.7969)">
      <Path d="M 75.578125 -115.484375 L 75.578125 -55.484375 C 75.578125 -48.878906 75.90625 -44.019531 76.5625 -40.90625 C 77.226562 -37.789062 79.113281 -35.285156 82.21875 -33.390625 C 85.332031 -31.503906 90.382812 -30.5625 97.375 -30.5625 C 100.957031 -30.5625 104.632812 -30.941406 108.40625 -31.703125 L 108.40625 -1.125 C 106.519531 -0.75 102.742188 -0.328125 97.078125 0.140625 C 91.421875 0.609375 85.765625 0.84375 80.109375 0.84375 C 65.390625 0.84375 54.488281 -1.320312 47.40625 -5.65625 C 40.332031 -10 35.945312 -15.285156 34.25 -21.515625 C 32.550781 -27.742188 31.703125 -35.859375 31.703125 -45.859375 L 31.703125 -115.484375 L 7.640625 -115.484375 L 7.640625 -149.734375 L 31.703125 -149.734375 L 31.703125 -198.140625 L 75.578125 -198.140625 L 75.578125 -149.734375 L 108.40625 -149.734375 L 108.40625 -115.484375 Z M 75.578125 -115.484375 " fill="#CB2602" />
    </G>
  </Svg>
);

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

  const burgerTranslateX = useRef(new Animated.Value(0)).current;
  const burgerOpacity = useRef(new Animated.Value(1)).current;

  const runBurgerCycle = useCallback(() => {
    burgerTranslateX.setValue(0);
    burgerOpacity.setValue(1);
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(burgerTranslateX, { toValue: width + 200, duration: 1000, useNativeDriver: true }),
        Animated.timing(burgerOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => {
          burgerTranslateX.setValue(-200);
          burgerOpacity.setValue(0);
          Animated.parallel([
            Animated.timing(burgerTranslateX, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.timing(burgerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          ]).start(() => {
            runBurgerCycle();
          });
        }, 30000);
      });
    }, 60000);
  }, [width]);

  useEffect(() => {
    runBurgerCycle();
  }, [runBurgerCycle]);

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
        const filtered = [...new Set(allNames)].filter((name) => name.toLowerCase().includes(text.toLowerCase())).slice(0, 5);
        setSearchSuggestions(filtered);
      } catch (e) { setSearchSuggestions([]); }
    } else { setSearchSuggestions([]); }
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

  const handleItemPress = async (item: MenuItem) => {
    await AsyncStorage.setItem('highlightItem', item.name);
    onSelectRestaurant?.(item.restaurant_id, item.restaurant_name);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TransEatLogo width={80} height={80} />
        <Animated.View style={{
          transform: [{ translateX: burgerTranslateX }],
          opacity: burgerOpacity,
          marginLeft: 2,
        }}>
          <BurgerSVG width={70} height={70} />
        </Animated.View>
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 2,
    zIndex: 10,
  },
  tripCard: {
    backgroundColor: 'rgba(203,38,2,0.1)', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(203,38,2,0.2)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  tripIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(203,38,2,0.15)', justifyContent: 'center', alignItems: 'center' },
  tripInfo: { flex: 1 },
  tripTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  tripSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  searchWrap: { marginBottom: 16, position: 'relative', zIndex: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  searchDropdown: { position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: 'rgba(20,20,20,0.98)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', zIndex: 100 },
  suggestionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  suggestionText: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  categoryPillActive: { backgroundColor: '#CB2602', borderColor: '#CB2602' },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  categoryLabelActive: { color: '#FFFFFF' },
  foodTypeRow: { gap: 18, paddingBottom: 4, paddingRight: 8 },
  foodTypeItem: { alignItems: 'center', width: 60 },
  foodTypeIconWrap: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(203,38,2,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
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
  foodCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  foodImagePlaceholder: { height: 90, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8, position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' },
  foodImage: { width: '100%', height: '100%' },
  prepTimeBadge: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  prepTimeText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  foodRestaurant: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  foodName: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  foodPrice: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default HomeScreen;
