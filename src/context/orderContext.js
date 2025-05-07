import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const RestaurantOrderContext = createContext();

export const RestaurantOrderProvider = ({ children, restaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        userId: order.user_id?.id,
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
        userId: order.user_id?.id,
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('user_id, used_coin, total')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      const updates = [];

      if (status === 'CANCELLED' && orderData.used_coin > 0) {
        updates.push(
          supabase.rpc('increment_coins', {
            user_id_param: orderData.user_id,
            coin_amount: orderData.used_coin,
          })
        );
      }

        if (status === 'COMPLETED' && orderData.used_coin === 0) {
          const { total, user_id } = orderData;
          console.log('Total belanja:', total);
          console.log('User ID:', user_id);
        
          // Jika total belanja >= 10.000, beri koin (1% dari total)
          if (total >= 10000) {
            const coinToAdd = Math.floor(total * 0.01); // Misal 15000 => 150
            console.log('Koin yang akan diberikan:', coinToAdd);
        
            updates.push(
              supabase.rpc('increment_coins', {
                user_id_param: user_id,
                coin_amount: coinToAdd,
              })
            );
          }
        }
      updates.push(
        supabase
          .from('orders')
          .update({ order_status: status })
          .eq('id', orderId)
      );

      const results = await Promise.all(updates);

      for (const result of results) {
        if (result.error) throw result.error;
      }

      // Perbarui state lokal jika berhasil
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Failed to update order status:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshOrders = () => {
    if (restaurantId) {
      getRestaurantOrders(restaurantId);
    }
  };

  const updateUserCoins = async (userId, coinsToAdd) => {
    try {
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentCoins = userData.coins || 0;
      const newCoins = currentCoins + coinsToAdd;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', userId);
        console.log('Updating user ID:', userId);


      console.log('Updated coins:', newCoins);

      if (updateError) throw updateError;

      return { success: true, coinsAdded: coinsToAdd };
    } catch (error) {
      console.error('Error updating user coins:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (!restaurantId) return;
    getRestaurantOrders(restaurantId);
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

export const useRestaurantOrders = () => {
  const context = useContext(RestaurantOrderContext);
  if (!context) {
    throw new Error('useRestaurantOrders must be used within a RestaurantOrderProvider');
  }
  return context;
};
