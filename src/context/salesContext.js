// salesContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './authContext';

const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) throw new Error('useSales must be used within a SalesProvider');
  return context;
};

export const SalesProvider = ({ children }) => {
  const { restaurantId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [totalProfit, setTotalProfit] = useState(0);
  const [growthPercentage, setGrowthPercentage] = useState('0%');
  const [dailyProfit, setDailyProfit] = useState(0);
  const [dailyOrder, setDailyOrder] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const formattedMonth = () => `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const getMonthBoundaries = (date) => ({
    start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString(),
  });

  const getPreviousMonthBoundaries = (date) => {
    const prev = new Date(date);
    prev.setMonth(prev.getMonth() - 1);
    return getMonthBoundaries(prev);
  };

  const fetchMonthlyProfit = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const current = getMonthBoundaries(currentMonth);
      const previous = getPreviousMonthBoundaries(currentMonth);

      const [currentRes, previousRes] = await Promise.all([
        supabase.from('orders')
          .select('total')
          .gte('created_at', current.start)
          .lte('created_at', current.end)
          .eq('order_status', 'COMPLETED')
          .eq('restaurants_id', restaurantId),

        supabase.from('orders')
          .select('total')
          .gte('created_at', previous.start)
          .lte('created_at', previous.end)
          .eq('order_status', 'COMPLETED')
          .eq('restaurants_id', restaurantId)
      ]);

      if (currentRes.error || previousRes.error) throw currentRes.error || previousRes.error;

      const currentTotal = currentRes.data.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      const prevTotal = previousRes.data.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

      setTotalProfit(currentTotal);
      setGrowthPercentage(prevTotal > 0 ? `${((currentTotal - prevTotal) / prevTotal * 100).toFixed(2)}%` : 'N/A');

    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyProfit = async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    try {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data, error } = await supabase.from('orders')
        .select('total')
        .gte('created_at', start)
        .lt('created_at', end)
        .eq('order_status', 'COMPLETED')
        .eq('restaurants_id', restaurantId);

      if (error) throw error;

      setDailyProfit(data.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0));
      setDailyOrder(data.length);

    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data harian');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.setMonth(prev.getMonth() - 1)));

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    if (next <= new Date()) setCurrentMonth(next);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => { fetchMonthlyProfit(); }, [currentMonth, restaurantId]);
  useEffect(() => {
    fetchDailyProfit();
    const interval = setInterval(fetchDailyProfit, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SalesContext.Provider value={{
      currentMonth, totalProfit, growthPercentage, dailyProfit, dailyOrder,
      isLoading, isDownloading, error, formattedMonth,
      handlePrevMonth, handleNextMonth,
      formatCurrency, formatDate,
      fetchMonthlyProfit, fetchDailyProfit
    }}>
      {children}
    </SalesContext.Provider>
  );
};
