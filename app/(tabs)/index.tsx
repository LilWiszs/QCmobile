import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://192.168.1.22:8000';

type PatientForm = {
  patient_id: string;
  name: string;
  age: string;
  sex: string;
  contact: string;
};

type PatientErrors = {
  patient_id?: string;
  name?: string;
  age?: string;
  contact?: string;
};

type RecentPatient = {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  sex: string;
  contact: string;
  registeredAt: string;
};

export default function DashboardScreen() {
  const { colors } = useAppTheme();

  const [queueNumber] = useState(12);
  const [queueStatus] = useState('Active');
  const [vitals] = useState({ status: 'Stable' });

  const [patient, setPatient] = useState<PatientForm>({
    patient_id: '',
    name: '',
    age: '',
    sex: 'Male',
    contact: '',
  });

  const [patientErrors, setPatientErrors] = useState<PatientErrors>({});
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [savingPatient, setSavingPatient] = useState(false);

  const formatPatients = (data: any[]): RecentPatient[] => {
    return data.map((item: any) => ({
      id: String(item.id),
      patient_id: item.patient_id ?? '',
      name: item.name ?? 'Unnamed Patient',
      age: Number(item.age ?? 0),
      sex: item.sex ?? 'N/A',
      contact: item.contact ?? 'N/A',
      registeredAt: item.registered_at ?? 'N/A',
    }));
  };

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);

      const token = (globalThis as any).authToken;

      const response = await fetch(`${API_BASE_URL}/api/patients/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.detail || 'Unable to load patients.');
        return;
      }

      setRecentPatients(formatPatients(data));
    } catch (error: any) {
      Alert.alert('Connection Error', error?.message || 'Cannot connect to backend.');
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Recent Patients', value: String(recentPatients.length) },
      { label: 'Current Queue', value: String(queueNumber) },
      { label: 'Last Vitals Status', value: vitals.status },
      { label: 'Queue Status', value: queueStatus },
    ],
    [recentPatients.length, queueNumber, vitals.status, queueStatus]
  );

  const handlePatientChange = (field: keyof PatientForm, value: string) => {
    setPatient((prev) => ({ ...prev, [field]: value }));

    if (patientErrors[field as keyof PatientErrors]) {
      setPatientErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePatient = () => {
    const errors: PatientErrors = {};

    if (!patient.patient_id.trim()) errors.patient_id = 'Patient ID is required';
    if (!patient.name.trim()) errors.name = 'Full name is required';
    if (!patient.age.trim()) errors.age = 'Age is required';

    if (!patient.contact.trim()) {
      errors.contact = 'Contact number is required';
    } else if (!/^09\d{9}$/.test(patient.contact.trim())) {
      errors.contact = 'Contact must be an 11-digit PH mobile number';
    }

    return errors;
  };

  const handleRegisterPatient = async () => {
    const errors = validatePatient();

    if (Object.keys(errors).length > 0) {
      setPatientErrors(errors);
      Alert.alert('Validation Error', 'Please complete the patient form correctly.');
      return;
    }

    try {
      setSavingPatient(true);

      const token = (globalThis as any).authToken;

      const response = await fetch(`${API_BASE_URL}/api/patients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          patient_id: patient.patient_id,
          name: patient.name,
          age: Number(patient.age),
          sex: patient.sex,
          contact: patient.contact,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Add Patient Failed',
          data.patient_id?.[0] ||
            data.name?.[0] ||
            data.age?.[0] ||
            data.contact?.[0] ||
            data.detail ||
            'Unable to add patient.'
        );
        return;
      }

      const newPatient = formatPatients([data])[0];

      setRecentPatients((prev) => [newPatient, ...prev]);
      setPatientErrors({});
      setPatient({
        patient_id: '',
        name: '',
        age: '',
        sex: 'Male',
        contact: '',
      });

      Alert.alert('Patient Registered', `${newPatient.name} has been saved to the backend.`);
    } catch (error: any) {
      Alert.alert('Connection Error', error?.message || 'Cannot connect to backend.');
    } finally {
      setSavingPatient(false);
    }
  };

  const handleViewPatient = (id: string) => {
    router.push({
      pathname: '/patients',
      params: { patientId: id },
    });
  };

  const handleRemovePatient = (id: string) => {
    Alert.alert('Remove Patient', 'This only removes the patient from this mobile list, not the backend.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setRecentPatients((prev) => prev.filter((person) => person.id !== id));
        },
      },
    ]);
  };

  const getStatusTextColor = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized === 'stable' || normalized === 'active') return colors.success;
    return colors.text;
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Dashboard Overview
            </ThemedText>

            <View style={styles.dashboardStats}>
              {stats.map((stat) => (
                <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.statNumber, { color: getStatusTextColor(stat.value) }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.subText }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Patient Registration Form
            </ThemedText>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Patient ID *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.input, color: colors.text },
                  patientErrors.patient_id && styles.inputError,
                ]}
                value={patient.patient_id}
                onChangeText={(text) => handlePatientChange('patient_id', text)}
                placeholder="e.g., QC-1023"
                placeholderTextColor={colors.subText}
              />
              {patientErrors.patient_id ? <Text style={styles.errorMessage}>{patientErrors.patient_id}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.input, color: colors.text },
                  patientErrors.name && styles.inputError,
                ]}
                value={patient.name}
                onChangeText={(text) => handlePatientChange('name', text)}
                placeholder="Enter patient name"
                placeholderTextColor={colors.subText}
              />
              {patientErrors.name ? <Text style={styles.errorMessage}>{patientErrors.name}</Text> : null}
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formHalf]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Age *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.input, color: colors.text },
                    patientErrors.age && styles.inputError,
                  ]}
                  value={patient.age}
                  onChangeText={(text) => handlePatientChange('age', text)}
                  placeholder="Age"
                  placeholderTextColor={colors.subText}
                  keyboardType="number-pad"
                />
                {patientErrors.age ? <Text style={styles.errorMessage}>{patientErrors.age}</Text> : null}
              </View>

              <View style={[styles.formGroup, styles.formHalf]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Sex *</Text>
                <View style={styles.sexSelector}>
                  {['Male', 'Female', 'Other'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.sexOption,
                        { backgroundColor: colors.muted },
                        patient.sex === option && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => handlePatientChange('sex', option)}
                    >
                      <Text
                        style={[
                          styles.sexOptionText,
                          { color: patient.sex === option ? '#fff' : colors.text },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.input, color: colors.text },
                  patientErrors.contact && styles.inputError,
                ]}
                value={patient.contact}
                onChangeText={(text) => handlePatientChange('contact', text)}
                placeholder="09123456789"
                placeholderTextColor={colors.subText}
                keyboardType="phone-pad"
              />
              {patientErrors.contact ? <Text style={styles.errorMessage}>{patientErrors.contact}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }, savingPatient && styles.disabledButton]}
              onPress={handleRegisterPatient}
              disabled={savingPatient}
            >
              <Text style={styles.submitButtonText}>
                {savingPatient ? 'Saving...' : 'Register Patient'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.listHeader}>
              <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                Recently Registered Patients
              </ThemedText>

              <TouchableOpacity onPress={fetchPatients}>
                <Text style={[styles.refreshText, { color: colors.primary }]}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {loadingPatients ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.emptyState, { color: colors.subText }]}>Loading patients...</Text>
              </View>
            ) : recentPatients.length > 0 ? (
              <View style={styles.patientList}>
                {recentPatients.map((person) => (
                  <View
                    key={person.id}
                    style={[
                      styles.patientItem,
                      { backgroundColor: colors.muted, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.patientInfo}>
                      <Text style={[styles.patientName, { color: colors.text }]}>{person.name}</Text>
                      <Text style={[styles.patientTime, { color: colors.subText }]}>
                        ID: {person.patient_id} • {person.registeredAt}
                      </Text>
                    </View>

                    <View style={styles.patientActions}>
                      <TouchableOpacity
                        onPress={() => handleViewPatient(person.id)}
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                      >
                        <Text style={styles.actionBtnText}>View Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleRemovePatient(person.id)}
                        style={[styles.actionBtn, { backgroundColor: colors.danger }]}
                      >
                        <Text style={styles.actionBtnText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyState, { color: colors.subText }]}>
                No patients registered yet
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  pageContent: { paddingHorizontal: 16, paddingTop: 20, gap: 16 },
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
  dashboardStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statNumber: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  formGroup: { marginBottom: 14 },
  formRow: { flexDirection: 'row', gap: 12 },
  formHalf: { flex: 1 },
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
  sexSelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  sexOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sexOptionText: { fontSize: 14, fontWeight: '600' },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  patientList: { gap: 12 },
  patientItem: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  patientInfo: { marginBottom: 12 },
  patientName: { fontSize: 15, fontWeight: '700' },
  patientTime: { fontSize: 13, marginTop: 4 },
  patientActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyState: { fontSize: 14 },
});