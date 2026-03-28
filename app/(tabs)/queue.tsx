import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Patient = {
  id: number;
  name: string;
  registeredAt: string;
};

type QueueStatus = 'Active' | 'Closed';

export default function QueueScreen() {
  const { colors } = useAppTheme();

  const [queueNumber, setQueueNumber] = useState(12);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>('Active');

  const [systemSettings] = useState({
    maxQueueSize: 50,
  });

  const [recentPatients, setRecentPatients] = useState<Patient[]>([
    { id: 1, name: 'John Doe', registeredAt: '09:00 AM' },
    { id: 2, name: 'Jane Smith', registeredAt: '09:15 AM' },
    { id: 3, name: 'Michael Johnson', registeredAt: '09:30 AM' },
    { id: 4, name: 'Sarah Williams', registeredAt: '09:45 AM' },
    { id: 5, name: 'Robert Brown', registeredAt: '10:00 AM' },
  ]);

  const queueProgress = useMemo(() => {
    return Math.round((queueNumber / systemSettings.maxQueueSize) * 100);
  }, [queueNumber, systemSettings.maxQueueSize]);

  const handleCallNextPatient = () => {
    if (queueStatus === 'Closed') {
      Alert.alert('Queue Closed', 'The queue is currently closed.');
      return;
    }

    if (recentPatients.length === 0) {
      Alert.alert('No Patients', 'There are no patients waiting in the queue.');
      return;
    }

    const nextPatient = recentPatients[0];

    Alert.alert('Calling Next Patient', `Now calling ${nextPatient.name} (#${queueNumber + 1})`, [
      {
        text: 'OK',
        onPress: () => {
          setQueueNumber((prev) => prev + 1);
          setRecentPatients((prev) => prev.slice(1));
        },
      },
    ]);
  };

  const handleToggleQueueStatus = () => {
    setQueueStatus((prev) => (prev === 'Active' ? 'Closed' : 'Active'));
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Queue Management System
            </ThemedText>

            <View style={styles.queueDisplay}>
              <View style={[styles.queueMain, { backgroundColor: colors.muted }]}>
                <Text
                  style={[
                    styles.queueNumberLarge,
                    { color: queueStatus === 'Active' ? colors.success : colors.danger },
                  ]}
                >
                  {queueNumber}
                </Text>
                <Text style={[styles.queueLabel, { color: colors.subText }]}>Current Queue Number</Text>
              </View>

              <View style={styles.queueInfo}>
                <Text style={[styles.infoText, { color: colors.text }]}>
                  <Text style={styles.infoLabel}>Status: </Text>
                  <Text style={{ color: queueStatus === 'Active' ? colors.success : colors.danger }}>
                    {queueStatus}
                  </Text>
                </Text>

                <Text style={[styles.infoText, { color: colors.text }]}>
                  <Text style={styles.infoLabel}>Max Capacity: </Text>
                  {systemSettings.maxQueueSize}
                </Text>

                <Text style={[styles.infoText, { color: colors.text }]}>
                  <Text style={styles.infoLabel}>Patients Registered: </Text>
                  {recentPatients.length}
                </Text>

                <Text style={[styles.infoText, { color: colors.text }]}>
                  <Text style={styles.infoLabel}>Queue Progress: </Text>
                  {queueProgress}%
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Queue Controls
            </ThemedText>

            <View style={styles.queueActionsLarge}>
              <TouchableOpacity
                onPress={handleCallNextPatient}
                style={[styles.largeButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.largeButtonText}>📢 Call Next Patient (#{queueNumber + 1})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleQueueStatus}
                style={[styles.largeButton, { backgroundColor: '#6c757d' }]}
              >
                <Text style={styles.largeButtonText}>
                  {queueStatus === 'Active' ? '🔴 Close Queue' : '🟢 Open Queue'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.queueProgressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progress,
                  { width: `${Math.min(queueProgress, 100)}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Waiting Patients
            </ThemedText>

            {recentPatients.length > 0 ? (
              <View style={styles.waitingPatientsList}>
                {recentPatients.map((person, index) => (
                  <View
                    key={person.id}
                    style={[
                      styles.waitingPatient,
                      { backgroundColor: colors.muted, borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.patientPosition, { backgroundColor: colors.primary }]}>
                      <Text style={styles.patientPositionText}>{index + 1}</Text>
                    </View>

                    <View style={styles.patientWaitingInfo}>
                      <Text style={[styles.patientName, { color: colors.text }]}>{person.name}</Text>
                      <Text style={[styles.patientRegistered, { color: colors.subText }]}>
                        Registered at {person.registeredAt}
                      </Text>
                    </View>

                    <View style={styles.patientWaitTime}>
                      <Text style={[styles.waitLabel, { color: colors.warning }]}>Waiting</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyState, { color: colors.subText }]}>No patients in queue</Text>
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
  queueDisplay: { gap: 18 },
  queueMain: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  queueNumberLarge: { fontSize: 56, fontWeight: '800', lineHeight: 64 },
  queueLabel: { marginTop: 8, fontSize: 14 },
  queueInfo: { gap: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
  infoLabel: { fontWeight: '700' },
  queueActionsLarge: { gap: 12 },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  largeButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  queueProgressBar: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  progress: { height: '100%', borderRadius: 999 },
  waitingPatientsList: { gap: 12 },
  waitingPatient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  patientPosition: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientPositionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  patientWaitingInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  patientRegistered: { fontSize: 13 },
  patientWaitTime: { marginLeft: 12 },
  waitLabel: { fontSize: 13, fontWeight: '600' },
  emptyState: { fontSize: 14 },
});