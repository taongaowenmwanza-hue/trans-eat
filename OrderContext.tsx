import React, { createContext, useContext, useEffect, useState } from 'react';
import { Town, nearestTown, TOWNS } from '../data/towns';
import api from '../services/api';

export type PickupMethod = 'restaurant' | 'station' | null;

interface ActiveOrder {
  id: string;
  restaurant_name: string;
  status: string;
  total_amount: number;
  pickup_method: string;
  destination_town: string;
  items: { name: string; quantity: number; price: number }[];
  created_at: string;
}

interface TripState {
  currentTown: Town | null;
  currentCoords: [number, number] | null;
  destinationTown: Town | null;
  pickupMethod: PickupMethod;
  locationPermissionDenied: boolean;
}

interface OrderContextValue {
  trip: TripState;
  setDestination: (town: Town) => void;
  setPickupMethod: (method: PickupMethod) => void;
  clearTrip: () => void;
  canOrderFood: boolean;
  activeOrder: ActiveOrder | null;
  refreshActiveOrder: () => Promise<void>;
}

const OrderContext = createContext<OrderContextValue | null>(null);

const initialTrip: TripState = {
  currentTown: null,
  currentCoords: null,
  destinationTown: null,
  pickupMethod: null,
  locationPermissionDenied: false,
};

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [trip, setTrip] = useState<TripState>(initialTrip);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  useEffect(() => {
    setTrip((t) => ({
      ...t,
      currentCoords: [28.3228, -15.3875],
      currentTown: TOWNS.find((town) => town.id === 'lusaka') || TOWNS[0],
    }));
    refreshActiveOrder();
  }, []);

  const refreshActiveOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/orders/active');
      if (res.data.has_active_order) {
        setActiveOrder(res.data.order);
      } else {
        setActiveOrder(null);
      }
    } catch {
      setActiveOrder(null);
    }
  };

  const setDestination = (town: Town) => {
    setTrip((t) => ({ ...t, destinationTown: town, pickupMethod: null }));
  };

  const setPickupMethod = (method: PickupMethod) => {
    setTrip((t) => ({ ...t, pickupMethod: method }));
  };

  const clearTrip = () => {
    setTrip((t) => ({ ...t, destinationTown: null, pickupMethod: null }));
  };

  const canOrderFood = !!trip.destinationTown && trip.destinationTown.id !== trip.currentTown?.id;

  return (
    <OrderContext.Provider value={{ trip, setDestination, setPickupMethod, clearTrip, canOrderFood, activeOrder, refreshActiveOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within an OrderProvider');
  return ctx;
};