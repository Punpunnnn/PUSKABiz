import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const RestaurantOrderContext = createContext();

export const RestaurantOrderProvider = ({ children, restaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Ambil semua pesanan restoran
  const getRestaurantOrders = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          user_id (id, full_name),
          created_at,
          used_coin,
          original_total,
          total,
          order_status,
          type,
          notes
        `)
        .eq('restaurants_id', id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const orderIds = ordersData.map(order => order.id);

      const { data: allOrderDishes, error: dishesError } = await supabase
        .from('order_dishes')
        .select(`
          id,
          order_id,
          quantity,
          menus (
            id,
            name,
            price,
            image
          )
        `)
        .in('order_id', orderIds);

      if (dishesError) throw dishesError;

      const dishesByOrderId = {};
      allOrderDishes.forEach(dish => {
        if (!dishesByOrderId[dish.order_id]) {
          dishesByOrderId[dish.order_id] = [];
        }
        dishesByOrderId[dish.order_id].push(dish);
      });

      const processedOrders = ordersData.map(order => ({
        id: order.id,
        username: order.user_id?.full_name,
        userId: order.user_id?.id, // ✅ FIX: string UUID
        dishesCount: dishesByOrderId[order.id]?.length || 0,
        dishes: dishesByOrderId[order.id] || [],
        createdAt: order.created_at,
        originalTotal: order.original_total,
        usedCoin: order.used_coin,
        total: order.total,
        status: order.order_status,
        type: order.type,
        notes: order.notes
      }));

      setOrders(processedOrders);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching restaurant orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ambil satu order lengkap
  const getRestaurantOrder = async (orderId) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id (id, full_name),
          created_at,
          used_coin,
          original_total,
          total,
          order_status,
          type,
          notes,
          order_dishes (
            quantity,
            menus (
              name,
              price,
              image
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const dishes = order.order_dishes.map(dish => ({
        quantity: dish.quantity,
        menu: {
          name: dish.menus.name,
          price: dish.menus.price,
          image: dish.menus.image
        }
      }));

      return {
        id: order.id,
        username: order.user_id?.full_name,
        userId: order.user_id?.id, // ✅ FIX: string UUID
        dishes,
        createdAt: order.created_at,
        originalTotal: order.original_total,
        usedCoin: order.used_coin,
        total: order.total,
        status: order.order_status,
        type: order.type,
        notes: order.notes
      };
    } catch (error) {
      console.error('Error fetching single order:', error);
      throw error;
    }
  };

  // ✅ Refresh order list
  const refreshOrders = () => {
    if (restaurantId) {
      getRestaurantOrders(restaurantId);
    }
  };

  // ✅ Update status order & beri koin
  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);
  
      if (error) throw error;
  
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
  
      // Jika status baru adalah "COMPLETED", tambahkan koin
      if (newStatus === 'COMPLETED') {
        const order = orders.find(o => o.id === orderId);
        if (order && order.total >= 10000) {
          const coinsToAdd = Math.floor(order.total / 100);
          await updateUserCoins(order.userId, coinsToAdd);
        }
      }
  
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserCoins = async (userId, coinsToAdd) => {
    console.log('User ID:', userId);
    console.log('Coins to add:', coinsToAdd);
  
    try {
      // Ambil data pengguna untuk mendapatkan jumlah koin saat ini
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();

  
      // Jika ada error dalam mengambil data, lempar error
      if (fetchError) throw fetchError;
  
      // Tentukan jumlah koin baru
      const currentCoins = userData.coins || 0;
      console.log('Current coins:', currentCoins);
      const newCoins = currentCoins + coinsToAdd;
      console.log('New coins:', newCoins);
  
      // Lakukan update koin di database
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', userId)
        .select();
  
      // Jika terjadi error saat update, lempar error
      if (updateError) {
        console.error('Error updating coins:', updateError);
        return { success: false, error: updateError.message };
      }
      console.log('Successfully updated coins');
      return { success: true, coinsAdded: coinsToAdd };
    } catch (error) {
      // Tangani error jika terjadi saat proses
      console.error('Error updating user coins:', error);
      return { success: false, error: error.message };
    }
  };
  // ✅ Fetch otomatis saat mount
  useEffect(() => {
    if (restaurantId) {
      getRestaurantOrders(restaurantId);
    }
  }, [restaurantId]);

  return (
    <RestaurantOrderContext.Provider
      value={{
        orders,
        loading,
        error,
        getRestaurantOrders,
        refreshOrders,
        updateOrderStatus,
        updateUserCoins,
        getRestaurantOrder
      }}
    >
      {children}
    </RestaurantOrderContext.Provider>
  );
};

// ✅ Custom hook
export const useRestaurantOrders = () => {
  const context = useContext(RestaurantOrderContext);
  if (!context) {
    throw new Error('useRestaurantOrders must be used within a RestaurantOrderProvider');
  }
  return context;
};
