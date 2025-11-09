import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import { addFuelLog, getLastLog } from '../../db/fuelService';
import Icon from 'react-native-vector-icons/Ionicons';


export default function FuelFormScreen({ navigation }) {
  let lastOdometer = 0; // This should ideally come from the last fuel log entry in the database
  const lastLog = getLastLog();
  
  if (lastLog) {
    lastOdometer = lastLog.odometer;
  }

  const [form, setForm] = useState({
    date: new Date(),
    time: new Date(),
    liter: '',
    price: '',
    odometer: '',
    fuel_type: 'Pertalite',
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const fuelTypes = [
    'Pertalite',
    'Pertamax',
    'Solar',
    'Dexlite',
    'BioSolar',
    'Premium',
    'Pertamax Turbo',
    'Pertamax Racing',
    'Pertamina Dex',
    'Pertamina Dexlite',
    'Shell V-Power',
    'Shell Diesel',
    'Total Performance 95',
    'Total Performance Diesel',
    'BP Ultimate 98',
    'BP Diesel',
    'Lainnya',
  ];

  // Fungsi format angka ke format Indonesia (ribuan dengan titik, desimal dengan koma)
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '';

    // Ubah ke string dan pisahkan bagian desimal (jika ada)
    const parts = value.toString().split(',');

    // Ambil bagian angka sebelum koma, hapus semua karakter non-digit
    const integerPart = parts[0].replace(/\D/g, '');

    // Format ribuan pakai titik
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Kalau ada bagian desimal, gabungkan lagi dengan koma
    if (parts.length > 1) {
      const decimalPart = parts[1].replace(/\D/g, ''); // hanya angka desimal
      return `${formattedInteger},${decimalPart}`;
    }

    return formattedInteger;
  };



  const validate = () => {
    const newErrors = {};
    if (!form.liter || isNaN(form.liter))
      newErrors.liter = 'Liter harus diisi dengan angka';
    if (!form.price || isNaN(form.price))
      newErrors.price = 'Harga harus diisi dengan angka';
    if (!form.odometer || isNaN(form.odometer))
      newErrors.odometer = 'Odometer harus diisi dengan angka';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    let literValue = form.liter
              .replace(/\./g, '')   // hapus pemisah ribuan
              .replace(',', '.');   // ubah koma ke titik desimal
    form.liter = literValue;

    let odometerValue = form.odometer
              .replace(/\./g, '')   // hapus pemisah ribuan
              .replace(',', '.');   // ubah koma ke titik desimal
    form.odometer = odometerValue;

    let priceValue = form.price
              .replace(/\./g, '')   // hapus pemisah ribuan
              .replace(',', '.');   // ubah koma ke titik desimal
    form.price = priceValue;

    if (!validate()) {
      Alert.alert('Kesalahan Validasi', 'Silakan isi semua field dengan benar.');
      return;
    }

    if (lastLog && lastLog.date) {
      if (Date.parse(form.date) < Date.parse(lastLog.date)) {
        Alert.alert('Kesalahan Validasi', `Tanggal tidak boleh sebelum ${lastLog.date}`);
        return;
      }

      // validasi time 
      if (Date.parse(form.date) >= Date.parse(lastLog.date)) {
        const formTime = form.time.getHours() * 3600 + form.time.getMinutes() * 60 + form.time.getSeconds();
        const lastLogTimeParts = lastLog.time.split(':');
        const lastLogTime = Number(lastLogTimeParts[0]) * 3600 + Number(lastLogTimeParts[1]) * 60 + Number(lastLogTimeParts[2]);
        
        if (formTime <= lastLogTime) {
          Alert.alert('Kesalahan Validasi', `Waktu tidak boleh sebelum atau sama dengan ${lastLog.time}`);
          return;
        }
      }
    }

    if(Number(form.odometer) < lastOdometer) {
      Alert.alert('Kesalahan Validasi', `Odometer tidak boleh kurang dari ${lastOdometer} km`);
      return;
    }

    addFuelLog({
      date: form.date.toISOString().split('T')[0],
      time: form.time.toTimeString().split(' ')[0],
      liter: Number(form.liter),
      price: Number(form.price),
      odometer: Number(form.odometer),
      fuel_type: form.fuel_type,
    });

    Alert.alert('Sukses', 'Riwayat bensin berhasil ditambahkan!');
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Riwayat Bensin</Text>
      </View>

      {/* Date Picker */}
      <Text style={styles.label}>Tanggal</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{form.date.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setForm({ ...form, date: selectedDate });
          }}
        />
      )}

      {/* Time Picker */}
      <Text style={styles.label}>Waktu</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTimePicker(true)}
      >
        <Text>{form.time.toTimeString().split(' ')[0]}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={form.time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);

            if (!selectedTime) return; // jika cancel

            setForm({ ...form, time: selectedTime });

          }}
        />
      )}

      {/* Liter */}
      <Text style={styles.label}>Liter</Text>
      <View style={{ marginBottom: 12 }}>
        <TextInputStyled
          value={form.liter}
          onChangeText={text => {
            setForm({ ...form, liter: text });
          }}
          keyboardType="numeric"
          error={errors.liter}
        />
      </View>

      {/* Biaya */}
      <Text style={styles.label}>Biaya</Text>
      <View style={{ marginBottom: 12 }}>
        <TextInputStyled
          value={form.price}
          onChangeText={text => {
            const formatted = formatNumber(text);
            // Ambil nilai numerik bersih (tanpa titik, ubah koma ke titik)
            setForm({ ...form, price: formatted });
          }}
          keyboardType="numeric"
          error={errors.price}
        />
      </View>

      {/* Odometer */}
      <Text style={styles.label}>Odometer</Text>
      <View style={{ marginBottom: 12 }}>
        <TextInputStyled
          value={form.odometer}
          onChangeText={text => {
            const formatted = formatNumber(text);
            setForm({ ...form, odometer: formatted });
          }}
          keyboardType="numeric"
          error={errors.odometer}
        />
      </View>

      {/* Fuel Type Picker */}
      <Text style={styles.label}>Jenis Bahan Bakar</Text>
      <FuelTypePicker
        selectedValue={form.fuel_type}
        options={fuelTypes}
        onValueChange={value => setForm({ ...form, fuel_type: value })}
      />


      {/* Buttons */}
      <View style={styles.buttonRow}>
        {/* Tombol Batal */}
        <LinearGradient
          colors={['#E5E7EB', '#D1D5DB']}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: 'transparent' }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#1F2937' }]}>Batal</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Tombol Simpan */}
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: 'transparent' }]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>Simpan</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

    </ScrollView>
  );
}

// Reusable styled TextInput with error
function TextInputStyled({
  value,
  onChangeText,
  keyboardType = 'default',
  error,
}) {
  return (
    <>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
}

function FuelTypePicker({ selectedValue, options, onValueChange }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: 'black' }}>{selectedValue}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={{
              marginHorizontal: 30,
              backgroundColor: 'white',
              borderRadius: 12,
              paddingVertical: 10,
              maxHeight: 300,
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                  }}
                  onPress={() => {
                    onValueChange(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={{ color: 'black', fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    color: '#1F2937',
  },
  label: { marginBottom: 4, fontWeight: '600', color: '#111827' },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    color: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'center',
  },
  inputError: { borderColor: '#EF4444', borderWidth: 1 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  buttonGradient: { borderRadius: 12, elevation: 3 },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cancelText: { color: '#1F2937', fontWeight: '600' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 12,
    elevation: 3,
  },
  buttonBase: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
