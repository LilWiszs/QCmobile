import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type PatientForm = {
  id: string;
  name: string;
  age: string;
  sex: string;
  contact: string;
};

type PatientErrors = {
  id?: string;
  name?: string;
  age?: string;
  contact?: string;
};

type RecentPatient = {
  id: string;
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

  const [vitals] = useState({
    status: 'Stable',
  });

  const [patient, setPatient] = useState<PatientForm>({
    id: '',
    name: '',
    age: '',
    sex: 'Male',
    contact: '',
  });

  const [patientErrors, setPatientErrors] = useState<PatientErrors>({});

  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([
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

    if (!patient.id.trim()) errors.id = 'Patient ID is required';
    if (!patient.name.trim()) errors.name = 'Full name is required';
    if (!patient.age.trim()) errors.age = 'Age is required';

    if (!patient.contact.trim()) {
      errors.contact = 'Contact number is required';
    } else if (!/^09\d{9}$/.test(patient.contact.trim())) {
      errors.contact = 'Contact must be an 11-digit PH mobile number';
    }

    return errors;
  };

  const handleRegisterPatient = () => {
    const errors = validatePatient();

    if (Object.keys(errors).length > 0) {
      setPatientErrors(errors);
      Alert.alert('Validation Error', 'Please complete the patient form correctly.');
      return;
    }

    const registeredAt = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newPatient: RecentPatient = {
      id: patient.id,
      name: patient.name,
      age: Number(patient.age),
      sex: patient.sex,
      contact: patient.contact,
      registeredAt,
    };

    setRecentPatients((prev) => [newPatient, ...prev]);
    setPatientErrors({});
    setPatient({
      id: '',
      name: '',
      age: '',
      sex: 'Male',
      contact: '',
    });

    Alert.alert('Patient Registered', `${newPatient.name} has been added successfully.`);
  };

  const handleViewPatient = (id: string) => {
    router.push({
      pathname: '/patients',
      params: { patientId: id },
    });
  };

  const handleRemovePatient = (id: string) => {
    Alert.alert('Remove Patient', 'Are you sure you want to remove this patient?', [
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
                  patientErrors.id && styles.inputError,
                ]}
                value={patient.id}
                onChangeText={(text) => handlePatientChange('id', text)}
                placeholder="e.g., QC-1023"
                placeholderTextColor={colors.subText}
              />
              {patientErrors.id ? <Text style={styles.errorMessage}>{patientErrors.id}</Text> : null}
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
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleRegisterPatient}
            >
              <Text style={styles.submitButtonText}>Register Patient</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Recently Registered Patients
            </ThemedText>

            {recentPatients.length > 0 ? (
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
                        {person.registeredAt}
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
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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