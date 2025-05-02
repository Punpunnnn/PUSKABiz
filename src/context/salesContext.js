// salesContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
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

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Storage permission is required to save the report.');
        return false;
      }
    }
    return true;
  };

  const downloadSalesReport = async () => {
    setIsDownloading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const { data, error } = await supabase.from('orders')
        .select('created_at, total, original_total, used_coin')
        .gte('created_at', sixMonthsAgo.toISOString())
        .lte('created_at', today.toISOString())
        .eq('order_status', 'COMPLETED')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        Alert.alert('Info', 'Tidak ada data penjualan dalam 6 bulan terakhir.');
        return;
      }

      const monthlyData = {};
      data.forEach(({ created_at, total, original_total, used_coin }) => {
        const date = new Date(created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = monthlyData[key] || {
          month: key, total: 0, original_total: 0, used_coin: 0, order_count: 0
        };
        monthlyData[key].total += parseFloat(total) || 0;
        monthlyData[key].original_total += parseFloat(original_total) || 0;
        monthlyData[key].used_coin += parseFloat(used_coin) || 0;
        monthlyData[key].order_count++;
      });

      const report = Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month));
      const csv = '\uFEFFBulan,Total Pendapatan,Total Asli,Koin Digunakan,Jumlah Pesanan\n' +
        report.map(({ month, total, original_total, used_coin, order_count }) => {
          const [year, m] = month.split('-');
          const monthName = `${monthNames[parseInt(m) - 1]} ${year}`;
          return `${monthName},${total.toFixed(0)},${original_total.toFixed(0)},${used_coin.toFixed(0)},${order_count}`;
        }).join('\n');

      const fileName = `Laporan_Pendapatan_Bulanan_${formatDate(new Date())}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csv);
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Downloads', asset, false);

      Alert.alert('Berhasil', `Laporan disimpan di folder Downloads sebagai: ${fileName}`);

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal mengunduh laporan: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

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
      fetchMonthlyProfit, fetchDailyProfit, downloadSalesReport
    }}>
      {children}
    </SalesContext.Provider>
  );
};
