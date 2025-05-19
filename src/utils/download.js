import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { getLast6MonthsBoundaries } from './getLast6MonthsBoundaries';
import { supabase } from '../lib/supabase';

export const downloadLast6MonthsReport = async (restaurantId, setIsDownloading) => {
  if (!restaurantId) return;

  console.log('Downloading report for restaurant ID:', restaurantId);

  setIsDownloading(true);
  try {
    const { start, end } = getLast6MonthsBoundaries();

    const { data, error } = await supabase
      .from('orders')
      .select('created_at, original_total, used_coin, total')
      .gte('created_at', start)
      .lte('created_at', end)
      .eq('order_status', 'COMPLETED')
      .eq('restaurants_id', restaurantId);

    if (error) throw error;

    // Kelompokkan dan akumulasi per bulan
    const monthlySummary = {};

    data.forEach((order) => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // Contoh: 2025-01

      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = {
          original_total: 0,
          used_coin: 0,
          total: 0,
        };
      }

      monthlySummary[monthKey].original_total += parseFloat(order.original_total) || 0;
      monthlySummary[monthKey].used_coin += parseFloat(order.used_coin) || 0;
      monthlySummary[monthKey].total += parseFloat(order.total) || 0;
    });

    // Susun CSV
    const csvHeader = 'Bulan,Keuntungan Kotor,PUSKACoin,Total\n';
    const csvRows = Object.keys(monthlySummary)
      .sort()
      .map((monthKey) => {
        const [year, month] = monthKey.split('-');
        const bulanStr = `${getMonthName(parseInt(month))} ${year}`;
        const { original_total, used_coin, total } = monthlySummary[monthKey];
        return `${bulanStr},${original_total},${used_coin},${total}`;
      });

    const csvContent = csvHeader + csvRows.join('\n');
    const fileUri = FileSystem.documentDirectory + 'penjualan_6_bulan.csv';

    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(fileUri);
        Alert.alert('Sukses', 'Laporan berhasil disimpan di penyimpanan lokal');
      }
    }
  } catch (err) {
    console.error('Gagal mengunduh laporan:', err);
    Alert.alert('Error', 'Gagal mengunduh laporan');
  } finally {
    setIsDownloading(false);
  }
};

const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[month - 1];
};
