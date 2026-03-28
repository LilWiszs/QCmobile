import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Device = {
  id: number;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline';
  lastUpdate: string;
  reason?: string;
};

export default function DevicesScreen() {
  const { colors } = useAppTheme();

  const [devices] = useState<Device[]>([
    {
      id: 1,
      name: 'Pulse Oximeter #1',
      type: 'Pulse Oximeter',
      location: 'ER Room 1',
      status: 'online',
      lastUpdate: '2 mins ago',
    },
    {
      id: 2,
      name: 'Blood Pressure Monitor #1',
      type: 'Blood Pressure Monitor',
      location: 'Ward A',
      status: 'online',
      lastUpdate: '5 mins ago',
    },
    {
      id: 3,
      name: 'Heart Rate Monitor #1',
      type: 'Heart Rate Monitor',
      location: 'ICU Bed 2',
      status: 'online',
      lastUpdate: '1 min ago',
    },
    {
      id: 4,
      name: 'Temperature Sensor #1',
      type: 'Temperature Sensor',
      location: 'Lab Room',
      status: 'offline',
      lastUpdate: '2 hours ago',
      reason: 'No network signal',
    },
  ]);

  const { totalDevices, onlineCount, offlineCount } = useMemo(() => {
    const online = devices.filter((d) => d.status === 'online').length;
    const offline = devices.filter((d) => d.status === 'offline').length;

    return {
      totalDevices: devices.length,
      onlineCount: online,
      offlineCount: offline,
    };
  }, [devices]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContent}>
          {/* Summary */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
              Device & Sensor Management
            </ThemedText>

            <View style={styles.devicesSummary}>
              <View style={[styles.summaryStat, { backgroundColor: colors.muted }]}>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Total</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {totalDevices}
                </Text>
              </View>

              <View style={[styles.summaryStat, { backgroundColor: colors.muted }]}>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Online</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {onlineCount}
                </Text>
              </View>

              <View style={[styles.summaryStat, { backgroundColor: colors.muted }]}>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Offline</Text>
                <Text style={[styles.statValue, { color: colors.danger }]}>
                  {offlineCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Devices */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
              Connected Devices
            </ThemedText>

            {devices.map((device) => (
              <View
                key={device.id}
                style={[
                  styles.deviceItem,
                  { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.deviceName, { color: colors.text }]}>
                  {device.name}
                </Text>

                <Text style={{ color: colors.subText }}>
                  {device.type} | {device.location}
                </Text>

                <Text
                  style={{
                    color:
                      device.status === 'online'
                        ? colors.success
                        : colors.danger,
                    marginTop: 6,
                    fontWeight: '600',
                  }}
                >
                  {device.status.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  pageContent: { padding: 16, gap: 16 },

  card: {
    borderRadius: 16,
    padding: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  devicesSummary: {
    flexDirection: 'row',
    gap: 10,
  },

  summaryStat: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 12,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },

  deviceItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },

  deviceName: {
    fontWeight: '700',
    fontSize: 16,
  },
});