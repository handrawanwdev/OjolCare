import React, { useState } from 'react';
import {
  ScrollView,
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import ButtonPrimary from '../../components/ButtonPrimary';
import { addServiceLog } from '../../db/serviceService';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ServiceFormScreen({ navigation }) {
  const [form, setForm] = useState({
    component: '',
    odometer: '',
    cost: '',
    date: new Date(),
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.component) newErrors.component = 'Komponen harus diisi';
    if (!form.odometer || isNaN(form.odometer))
      newErrors.odometer = 'Odometer harus diisi dengan angka';
    if (!form.cost || isNaN(form.cost))
      newErrors.cost = 'Biaya harus diisi dengan angka';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi format angka ke format ribuan Indonesia (contoh: 48000 -> 48.000)
  const formatNumber = (value) => {
    if (!value) return '';
    // Hapus semua karakter non-digit
    const numberString = value.replace(/\D/g, '');
    // Format pakai titik ribuan
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert(
        'Kesalahan Validasi',
        'Silakan isi semua field dengan benar.',
      );
      return;
    }

    addServiceLog({
      component: form.component,
      odometer: Number(form.odometer),
      cost: Number(form.cost),
      date: form.date.toISOString().split('T')[0],
      is_complete: false,
      note: form.note,
    });

    Alert.alert('Sukses', 'Riwayat servis berhasil ditambahkan!');
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
        <Text style={styles.headerTitle}>Tambah Riwayat Servis</Text>
      </View>

      {/* Component */}
      <Text style={styles.label}>Komponen</Text>
      <TextInputStyled
        value={form.component}
        onChangeText={text => setForm({ ...form, component: text })}
        error={errors.component}
      />

      {/* Odometer */}
      <Text style={styles.label}>Odometer (km)</Text>
      <TextInputStyled
        value={form.odometer}
        onChangeText={text => {
          const formatted = formatNumber(text);
          setForm({ ...form, odometer: formatted });
        }}
        keyboardType="numeric"
        error={errors.odometer}
      />

      {/* Cost */}
      <Text style={styles.label}>Biaya</Text>
      <TextInputStyled
        value={form.cost}
        onChangeText={text => {
          const formatted = formatNumber(text);
          setForm({ ...form, cost: formatted });
        }}
        keyboardType="numeric"
        error={errors.cost}
      />

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
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) setForm({ ...form, date: selectedDate });
          }}
        />
      )}

      {/* Note */}
      <Text style={styles.label}>Catatan</Text>
      <TextInputStyled
        value={form.note}
        onChangeText={text => setForm({ ...form, note: text })}
        multiline={true}
        numberOfLines={4}
        style={{
          textAlignVertical: 'top',
          height: 100,
          borderWidth: 1,
          borderColor: "#D2D6DC",
          borderRadius: 12,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 2,
          padding: 10,
        }}
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

// Reusable TextInput with error
function TextInputStyled({ value, onChangeText, error, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        style={[styles.input, error && styles.inputError, props.style]} // tetap pakai style asli
        value={value}
        onChangeText={onChangeText}
        {...props} // props tambahan seperti multiline, height, dsb
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'center',
  },
  inputError: { borderColor: '#EF4444', borderWidth: 1 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  buttonGradient: { borderRadius: 12, elevation: 3, flex: 1 },
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
    gap: 12, // jarak antar tombol (bisa diganti marginRight juga)
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
