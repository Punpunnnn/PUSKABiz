// MonthlySales.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSales } from '../../context/salesContext'; // Import the context hook

const MonthlySales = () => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const {
    totalProfit,
    growthPercentage,
    isLoading,
    isDownloading,
    error,
    formattedMonth,
    handlePrevMonth,
    handleNextMonth,
    formatCurrency,
    downloadSalesReport
  } = useSales();
  
  const showInfo = () => {
    setShowInfoModal(true);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pendapatan Bulanan</Text>
      
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        
        <Text style={styles.month}>{formattedMonth()}</Text>
        
        <TouchableOpacity onPress={handleNextMonth}>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.salesInfo}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.profitContainer}>
            <Text style={styles.salesAmount}>{formatCurrency(totalProfit)}</Text>
            <Text style={[
              styles.salesGrowth, 
              { color: growthPercentage.startsWith('+') ? '#4CAF50' : growthPercentage === 'N/A' ? '#757575' : '#F44336' }
            ]}>
              {growthPercentage}
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.downloadButton, isDownloading && styles.disabledButton]}
            onPress={downloadSalesReport}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Unduh Data</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={showInfo}
          >
            <Icon name="info-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Modal
        transparent={true}
        visible={showInfoModal}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Catatan</Text>
            <Text style={styles.modalText}>
              Laporan bulanan berisi data pendapatan 6 bulan terakhir, termasuk:
            </Text>
            <View style={styles.modalListContainer}>
              <Text style={styles.modalListItem}>• Total pendapatan setelah diskon</Text>
              <Text style={styles.modalListItem}>• Total harga asli</Text>
              <Text style={styles.modalListItem}>• Jumlah koin yang digunakan</Text>
              <Text style={styles.modalListItem}>• Jumlah pesanan</Text>
            </View>
            <Text style={styles.modalText}>
              Laporan akan diunduh dalam format CSV yang dapat dibuka di Excel atau Google Sheets.
            </Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  month: {
    fontSize: 16,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  salesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
    marginBottom: 16,
  },
  profitContainer: {
    flex: 1,
  },
  salesAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  salesGrowth: {
    fontSize: 16,
    marginTop: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButton: {
    backgroundColor: '#5DA574',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    minWidth: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'left',
  },
  modalListContainer: {
    marginVertical: 8,
    paddingLeft: 8,
    marginBottom: 16,
  },
  modalListItem: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downloadSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  fullDownloadButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downloadDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default MonthlySales;