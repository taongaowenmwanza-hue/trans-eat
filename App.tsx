import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Heart, Home as HomeIcon, ClipboardList, User } from 'lucide-react-native';
import { OrderProvider, useOrder } from './src/context/OrderContext';
import { CartProvider } from './src/context/CartContext';
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantsScreen from './src/screens/RestaurantsScreen';
import RestaurantMenuScreen from './src/screens/RestaurantMenuScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import DestinationPickerScreen from './src/screens/DestinationPickerScreen';
import PickupMethodScreen from './src/screens/PickupMethodScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import PartnerDashboardScreen from './src/screens/PartnerDashboardScreen';
import RegisterRestaurantScreen from './src/screens/RegisterRestaurantScreen';
import PartnerMenuScreen from './src/screens/PartnerMenuScreen';
import PartnerOrdersScreen from './src/screens/PartnerOrdersScreen';
import PartnerSettingsScreen from './src/screens/PartnerSettingsScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import TrendingPopularScreen from './src/screens/TrendingPopularScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FloatingOrderTracker from './src/components/FloatingOrderTracker';
import { authAPI } from './src/services/api';

const TAB_BAR_HEIGHT = 72;

const AppContent = () => {
  const [screen, setScreen] = useState('Splash');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  const [checking, setChecking] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: string; name: string } | null>(null);
  const [tabVisible, setTabVisible] = useState(true);
  const tabTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { activeOrder } = useOrder();

  useEffect(() => { checkAuth(); }, []);

  const hideTab = () => {
    setTabVisible(false);
    if (tabTimer.current) clearTimeout(tabTimer.current);
  };

  const resetTabTimer = () => {
    hideTab();
    tabTimer.current = setTimeout(() => setTabVisible(true), 3000);
  };

  useEffect(() => {
    resetTabTimer();
    return () => { if (tabTimer.current) clearTimeout(tabTimer.current); };
  }, [screen]);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) { 
        setIsLoggedIn(false); 
        setScreen('Splash'); 
        setChecking(false); 
        return; 
      }
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      const res = await Promise.race([authAPI.getMe(), timeoutPromise]) as any;
      setIsLoggedIn(true);
      const role = res.data.role;
      if (role === 'partner') {
        setIsPartner(true);
        setScreen('PartnerDashboard');
      } else {
        setScreen('Home');
      }
    } catch {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      setIsLoggedIn(false);
      setScreen('Splash');
    }
    setChecking(false);
  };

  const navigate = (name: string) => {
    setScreen(name);
  };

  const handleLogin = () => { setIsLoggedIn(true); navigate('Home'); };
  const handlePartnerLogin = () => { setIsLoggedIn(true); setIsPartner(true); navigate('PartnerDashboard'); };

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    setIsLoggedIn(false);
    setIsPartner(false);
    navigate('Splash');
  };

  const handleSelectRestaurant = (id: string, name: string) => {
    setSelectedRestaurant({ id, name });
    navigate('RestaurantMenu');
  };

  const isTravelerScreen = ['Home', 'Restaurants', 'RestaurantMenu', 'Checkout', 'Orders', 'LocationPicker', 'PickupMethod', 'OrderTracking', 'OrderDetail', 'TrendingPopular', 'Profile'].includes(screen);
  const isTabBarScreen = ['Home', 'Restaurants', 'RestaurantMenu', 'Orders', 'TrendingPopular', 'Profile'].includes(screen);

  if (checking) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#CB2602" />
      </View>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'Splash':
        return <SplashScreen onGetStarted={() => navigate('Auth')} onPartner={() => navigate('PartnerAuth')} />;
      case 'Auth':
        return <AuthScreen onLogin={handleLogin} />;
      case 'PartnerAuth':
        return <AuthScreen onLogin={handlePartnerLogin} isPartner />;
      case 'Home':
        return <HomeScreen onNavigate={navigate} onSelectRestaurant={handleSelectRestaurant} />;
      case 'Restaurants':
        return <RestaurantsScreen onBack={() => navigate('Home')} onSelectRestaurant={handleSelectRestaurant} />;
      case 'RestaurantMenu':
        return selectedRestaurant ? (
          <RestaurantMenuScreen
            onBack={() => navigate('Restaurants')}
            onCheckout={() => navigate('Checkout')}
            restaurantId={selectedRestaurant.id}
            restaurantName={selectedRestaurant.name}
          />
        ) : (
          <RestaurantsScreen onBack={() => navigate('Home')} onSelectRestaurant={handleSelectRestaurant} />
        );
      case 'TrendingPopular':
        return <TrendingPopularScreen onBack={() => navigate('Home')} onSelectRestaurant={handleSelectRestaurant} />;
      case 'Checkout':
        return <CheckoutScreen onBack={() => navigate('RestaurantMenu')} onOrderPlaced={() => navigate('OrderTracking')} />;
      case 'OrderTracking':
        return <OrderTrackingScreen onBack={() => navigate('Home')} />;
      case 'Orders':
        return <OrdersScreen onBack={() => navigate('Home')} onOrderPress={(id) => navigate('OrderDetail')} />;
      case 'OrderDetail':
        return <OrderDetailScreen onBack={() => navigate('Home')} />;
      case 'Profile':
        return <ProfileScreen onBack={() => navigate('Home')} onLogout={handleLogout} />;
      case 'LocationPicker':
        return <DestinationPickerScreen onBack={() => navigate('Home')} onDestinationSet={() => navigate('PickupMethod')} />;
      case 'PickupMethod':
        return <PickupMethodScreen onBack={() => navigate('LocationPicker')} onConfirm={() => navigate('Restaurants')} />;
      case 'PartnerDashboard':
        return <PartnerDashboardScreen onBack={() => navigate('Home')} onLogout={handleLogout} onNavigate={navigate} />;
      case 'RegisterRestaurant':
        return <RegisterRestaurantScreen onBack={() => navigate('PartnerDashboard')} onRegistered={() => navigate('PartnerDashboard')} />;
      case 'PartnerMenu':
        return <PartnerMenuScreen onBack={() => navigate('PartnerDashboard')} />;
      case 'PartnerOrders':
        return <PartnerOrdersScreen onBack={() => navigate('PartnerDashboard')} />;
      case 'PartnerSettings':
        return <PartnerSettingsScreen onBack={() => navigate('PartnerDashboard')} />;
      default:
        return <SplashScreen onGetStarted={() => navigate('Auth')} onPartner={() => navigate('PartnerAuth')} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={1}
        onPress={resetTabTimer}
      >
        <View style={styles.screenWrap} pointerEvents="box-none">
          {renderScreen()}
        </View>
      </TouchableOpacity>
      {isTabBarScreen && tabVisible && (
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigate('Home')}>
            <HomeIcon size={22} color={screen === 'Home' ? '#CB2602' : 'rgba(255,255,255,0.5)'} strokeWidth={2.25} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigate('TrendingPopular')}>
            <Heart size={22} color={screen === 'TrendingPopular' ? '#CB2602' : 'rgba(255,255,255,0.5)'} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigate('Orders')}>
            <ClipboardList size={22} color={screen === 'Orders' ? '#CB2602' : 'rgba(255,255,255,0.5)'} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigate('Profile')}>
            <User size={22} color={screen === 'Profile' ? '#CB2602' : 'rgba(255,255,255,0.5)'} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
      {isTravelerScreen && activeOrder && (
        <FloatingOrderTracker onViewDetails={() => navigate('OrderDetail')} onViewMap={() => navigate('OrderTracking')} />
      )}
    </View>
  );
};

const App = () => (
  <OrderProvider>
    <CartProvider>
      <AppContent />
    </CartProvider>
  </OrderProvider>
);

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#0A0A0A' },
  loadingWrap: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  touchArea: { flex: 1 },
  screenWrap: { flex: 1 },
  tabBar: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    height: TAB_BAR_HEIGHT, borderRadius: 24,
    backgroundColor: 'rgba(20,20,20,0.85)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default App;
