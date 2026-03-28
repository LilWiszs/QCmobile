import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Patient = {
  id: string;
  name: string;
  age: number;
  sex: string;
  contact: string;
  registeredAt: string;
};

type Vitals = {
  temperature: string;
  bloodPressure: string;
  pulseRate: string;
  weight: string;
  height: string;
  status: string;
};

type VitalErrors = {
  temperature?: string;
  pulseRate?: string;
  weight?: string;
  height?: string;
};

export default function PatientsScreen() {
  const { colors } = useAppTheme();
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patientId ?? 'P-1001');

  const [recentPatients] = useState<Patient[]>([
    {
      id: 'P-1001',
      name: 'John Doe',
      age: 45,
      sex: 'Male',
      contact: '09123456789',
      registeredAt: '09:00 AM',
    },
    {
      id: 'P-1002',
      name: 'Jane Smith',
      age: 32,
      sex: 'Female',
      contact: '09987654321',
      registeredAt: '09:15 AM',
    },
  ]);

  const [vitals, setVitals] = useState<Vitals>({
    temperature: '36.8',
    bloodPressure: '120/80',
    pulseRate: '78',
    weight: '65',
    height: '170',
    status: 'Stable',
  });

  const [vitalErrors, setVitalErrors] = useState<VitalErrors>({});

  useEffect(() => {
    if (patientId) setSelectedPatientId(patientId);
  }, [patientId]);

  const patient = recentPatients.find((p) => p.id === selectedPatientId) || null;

  const computeStatus = (nextVitals: Vitals) => {
    const temp = parseFloat(nextVitals.temperature);
    const pulse = parseInt(nextVitals.pulseRate, 10);

    if (!isNaN(temp) && temp >= 38.5) return 'Critical';
    if (!isNaN(pulse) && pulse >= 110) return 'Critical';
    if (!isNaN(temp) && temp >= 37.6) return 'Monitor';
    return 'Stable';
  };

  const handleVitalsChange = (field: keyof Vitals, value: string) => {
    const updatedVitals = { ...vitals, [field]: value };

    if (field === 'temperature' || field === 'pulseRate' || field === 'weight' || field === 'height') {
      updatedVitals.status = computeStatus(updatedVitals);
    }

    setVitals(updatedVitals);

    if (vitalErrors[field as keyof VitalErrors]) {
      setVitalErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateVitals = () => {
    const errors: VitalErrors = {};
    if (!vitals.temperature.trim()) errors.temperature = 'Temperature is required';
    if (!vitals.pulseRate.trim()) errors.pulseRate = 'Pulse rate is required';
    if (!vitals.weight.trim()) errors.weight = 'Weight is required';
    if (!vitals.height.trim()) errors.height = 'Height is required';
    return errors;
  };

  const handleVitalsSubmit = () => {
    const errors = validateVitals();

    if (Object.keys(errors).length > 0) {
      setVitalErrors(errors);
      Alert.alert('Validation Error', 'Please complete the required vital fields.');
      return;
    }

    Alert.alert('Vitals Updated', `Patient vitals updated for ${patient?.name ?? 'patient'}.`);
    setVitalErrors({});
  };

  const handleBackToDashboard = () => {
    router.push('/');
  };

  const handleSelectSamplePatient = () => {
    setSelectedPatientId('P-1001');
  };

  const statusColors = useMemo(() => {
    const normalized = vitals.status.toLowerCase();
    if (normalized === 'critical') return { bg: '#fdecec', text: colors.danger };
    if (normalized === 'monitor') return { bg: '#fff4e5', text: colors.warning };
    return { bg: '#e9f8ef', text: colors.success };
  }, [vitals.status, colors.danger, colors.warning, colors.success]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back to Dashboard</Text>
          </TouchableOpacity>

          {selectedPatientId && patient ? (
            <>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                  Patient Details - {patient.name}
                </ThemedText>

                <View style={styles.patientDetailsGrid}>
                  {[
                    ['Patient Name:', patient.name],
                    ['Patient Age:', `${patient.age} years`],
                    ['Sex:', patient.sex],
                    ['Contact:', patient.contact],
                    ['Patient ID:', patient.id],
                    ['Registered At:', patient.registeredAt],
                  ].map(([label, value]) => (
                    <View key={label} style={[styles.detailItem, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.detailLabel, { color: colors.subText }]}>{label}</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                  Vitals Monitoring
                </ThemedText>

                <View style={styles.vitalsGrid}>
                  <View style={styles.vitalInput}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Temperature (°C) *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.input, color: colors.text },
                        vitalErrors.temperature && styles.inputError,
                      ]}
                      keyboardType="decimal-pad"
                      value={vitals.temperature}
                      onChangeText={(text) => handleVitalsChange('temperature', text)}
                      placeholderTextColor={colors.subText}
                    />
                    {vitalErrors.temperature ? <Text style={styles.errorMessage}>{vitalErrors.temperature}</Text> : null}
                  </View>

                  <View style={styles.vitalInput}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Blood Pressure *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                      value={vitals.bloodPressure}
                      onChangeText={(text) => handleVitalsChange('bloodPressure', text)}
                      placeholder="120/80"
                      placeholderTextColor={colors.subText}
                    />
                  </View>

                  <View style={styles.vitalInput}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Pulse Rate (bpm) *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.input, color: colors.text },
                        vitalErrors.pulseRate && styles.inputError,
                      ]}
                      keyboardType="number-pad"
                      value={vitals.pulseRate}
                      onChangeText={(text) => handleVitalsChange('pulseRate', text)}
                      placeholderTextColor={colors.subText}
                    />
                    {vitalErrors.pulseRate ? <Text style={styles.errorMessage}>{vitalErrors.pulseRate}</Text> : null}
                  </View>

                  <View style={styles.vitalInput}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Weight (kg) *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.input, color: colors.text },
                        vitalErrors.weight && styles.inputError,
                      ]}
                      keyboardType="decimal-pad"
                      value={vitals.weight}
                      onChangeText={(text) => handleVitalsChange('weight', text)}
                      placeholderTextColor={colors.subText}
                    />
                    {vitalErrors.weight ? <Text style={styles.errorMessage}>{vitalErrors.weight}</Text> : null}
                  </View>

                  <View style={styles.vitalInput}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Height (cm) *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.input, color: colors.text },
                        vitalErrors.height && styles.inputError,
                      ]}
                      keyboardType="number-pad"
                      value={vitals.height}
                      onChangeText={(text) => handleVitalsChange('height', text)}
                      placeholderTextColor={colors.subText}
                    />
                    {vitalErrors.height ? <Text style={styles.errorMessage}>{vitalErrors.height}</Text> : null}
                  </View>
                </View>

                <View style={[styles.vitalStatus, { backgroundColor: statusColors.bg }]}>
                  <Text style={[styles.vitalStatusText, { color: colors.text }]}>
                    <Text style={styles.infoLabel}>Health Status: </Text>
                    <Text style={{ color: statusColors.text }}>{vitals.status}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary }]}
                  onPress={handleVitalsSubmit}
                >
                  <Text style={styles.submitButtonText}>Update Patient Vitals</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyState, { color: colors.subText }]}>
                Please select a patient from the dashboard to view details
              </Text>

              <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: colors.primary }]}
                onPress={handleSelectSamplePatient}
              >
                <Text style={styles.selectButtonText}>Select Sample Patient</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  pageContent: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8 },
  backButtonText: { fontSize: 15, fontWeight: '600' },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 14 },
  patientDetailsGrid: { gap: 12 },
  detailItem: { borderRadius: 12, padding: 12 },
  detailLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  detailValue: { fontSize: 15 },
  vitalsGrid: { gap: 14 },
  vitalInput: {},
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: { borderColor: '#FF3B30' },
  errorMessage: { color: '#FF3B30', fontSize: 12, marginTop: 4 },
  vitalStatus: {
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  vitalStatusText: { fontSize: 14, fontWeight: '600' },
  infoLabel: { fontWeight: '700' },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyState: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  selectButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  selectButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});