import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/contexts/AppThemeContext';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://192.168.1.22:8000';

type AlertItem = {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
};

type Device = {
  id: number;
  name: string;
  status: 'online' | 'offline';
};

export default function ReportsScreen() {
  const { colors } = useAppTheme();

  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [patients, setPatients] = useState<any[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = (globalThis as any).authToken;

      const [patientsRes, devicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/patients/`, {
          headers: { Authorization: `Token ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/devices/`, {
          headers: { Authorization: `Token ${token}` },
        }),
      ]);

      const patientsData = await patientsRes.json();
      const devicesData = await devicesRes.json();

      if (!patientsRes.ok) {
        setError(patientsData.detail || 'Unable to load patients report data.');
        return;
      }

      if (!devicesRes.ok) {
        setError(devicesData.detail || 'Unable to load devices report data.');
        return;
      }

      setPatients(Array.isArray(patientsData) ? patientsData : []);

      const formattedDevices: Device[] = Array.isArray(devicesData)
        ? devicesData.map((item: any) => ({
            id: Number(item.id),
            name: item.name ?? item.device_name ?? 'Unnamed Device',
            status: item.status?.toLowerCase() === 'offline' ? 'offline' : 'online',
          }))
        : [];

      setDevices(formattedDevices);

      try {
        const alertsRes = await fetch(`${API_BASE_URL}/api/alerts/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();

          const formattedAlerts: AlertItem[] = Array.isArray(alertsData)
            ? alertsData.map((item: any) => ({
                id: Number(item.id),
                type: item.type ?? 'system',
                message: item.message ?? 'No alert message',
                timestamp: item.timestamp ?? item.created_at ?? 'N/A',
                severity: item.severity ?? 'low',
                resolved: Boolean(item.resolved),
              }))
            : [];

          setAlertHistory(formattedAlerts);
        } else {
          setAlertHistory([]);
        }
      } catch {
        setAlertHistory([]);
      }
    } catch (error: any) {
      setError(error?.message || 'Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleClearAllAlerts = () => {
    Alert.alert('Clear All Alerts', 'Are you sure you want to clear all alerts?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: () => setAlertHistory([]),
      },
    ]);
  };

  const handleResolveAlert = (id: number) => {
    setAlertHistory((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, resolved: true } : alert))
    );
  };

  const activeAlertsCount = useMemo(
    () => alertHistory.filter((a) => !a.resolved).length,
    [alertHistory]
  );

  const onlineDevicesCount = useMemo(
    () => devices.filter((d) => d.status === 'online').length,
    [devices]
  );

  const queueStatus = 'Active';

  const getSeverityStyle = (severity: AlertItem['severity']) => {
    if (severity === 'high') {
      return { borderColor: '#f7c2c2', backgroundColor: '#fff3f3' };
    }
    if (severity === 'medium') {
      return { borderColor: '#ffe2b8', backgroundColor: '#fff8ef' };
    }
    return { borderColor: '#cfe8ff', backgroundColor: '#f4f9ff' };
  };

  const renderPeriodButton = (
    period: 'daily' | 'weekly' | 'monthly',
    label: string
  ) => (
    <TouchableOpacity
      onPress={() => setReportPeriod(period)}
      style={[
        styles.periodBtn,
        { backgroundColor: reportPeriod === period ? colors.primary : colors.muted },
      ]}
    >
      <Text
        style={[
          styles.periodBtnText,
          { color: reportPeriod === period ? '#fff' : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSimpleReport = () => {
    const totalPatients = patients.length;
    const totalDevices = devices.length;
    const offlineDevices = devices.filter((d) => d.status === 'offline').length;

    return (
      <View style={styles.reportContent}>
        <View style={[styles.chartContainer, { backgroundColor: colors.muted }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {reportPeriod.toUpperCase()} System Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subText }]}>Patients</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalPatients}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subText }]}>Devices</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{totalDevices}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subText }]}>Online Devices</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{onlineDevicesCount}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.subText }]}>Offline Devices</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>{offlineDevices}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading reports...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.danger }]}>Failed to load reports</Text>
        <Text style={[styles.errorText, { color: colors.subText }]}>{error}</Text>
        <TouchableOpacity
          onPress={fetchReportsData}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.pageContent}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.alertsHeader}>
              <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
                ⚠️ Alerts & Notifications
              </ThemedText>

              <TouchableOpacity
                onPress={handleClearAllAlerts}
                style={[styles.secondaryButton, { backgroundColor: colors.muted }]}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.alertsList}>
              {alertHistory.length > 0 ? (
                alertHistory.map((alert) => (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertItem,
                      getSeverityStyle(alert.severity),
                      alert.resolved && styles.alertResolved,
                    ]}
                  >
                    <View style={styles.alertContent}>
                      <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                      <Text style={[styles.alertMessage, { color: colors.text }]}>
                        {alert.message}
                      </Text>
                      <Text style={[styles.alertTime, { color: colors.subText }]}>
                        {alert.timestamp}
                      </Text>
                    </View>

                    {!alert.resolved ? (
                      <TouchableOpacity
                        onPress={() => handleResolveAlert(alert.id)}
                        style={[styles.resolveButton, { backgroundColor: colors.primary }]}
                      >
                        <Text style={styles.resolveButtonText}>Resolve</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.alertResolvedBadge, { color: colors.success }]}>
                        ✓ Resolved
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyState, { color: colors.subText }]}>
                  No alerts from API
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Vital Signs Report
            </ThemedText>

            <View style={styles.reportPeriodSelector}>
              {renderPeriodButton('daily', '📅 Daily')}
              {renderPeriodButton('weekly', '📊 Weekly')}
              {renderPeriodButton('monthly', '📈 Monthly')}
            </View>

            {renderSimpleReport()}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Device Uptime Report
            </ThemedText>

            <View style={styles.uptimeMetrics}>
              {devices.length === 0 ? (
                <Text style={[styles.emptyState, { color: colors.subText }]}>
                  No devices found from API.
                </Text>
              ) : (
                devices.map((device) => {
                  const uptime = device.status === 'online' ? 98 : 50;

                  return (
                    <View
                      key={device.id}
                      style={[styles.uptimeItem, { backgroundColor: colors.muted }]}
                    >
                      <View style={styles.uptimeInfo}>
                        <Text style={[styles.uptimeDeviceName, { color: colors.text }]}>
                          {device.name}
                        </Text>

                        <View style={styles.uptimeBarContainer}>
                          <View style={[styles.uptimeBar, { backgroundColor: colors.border }]}>
                            <View
                              style={[
                                styles.uptimeFill,
                                {
                                  backgroundColor:
                                    device.status === 'online' ? colors.success : colors.warning,
                                  width: `${uptime}%`,
                                },
                              ]}
                            />
                          </View>

                          <Text style={[styles.uptimePercentage, { color: colors.text }]}>
                            {uptime}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ThemedText type="subtitle" style={[styles.cardTitle, { color: colors.text }]}>
              Overview Statistics
            </ThemedText>

            <View style={styles.analyticsGrid}>
              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Total Patients
                </Text>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>
                  {patients.length}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  Loaded from API
                </Text>
              </View>

              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Active Alerts
                </Text>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>
                  {activeAlertsCount}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  Requiring attention
                </Text>
              </View>

              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Devices Online
                </Text>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>
                  {onlineDevicesCount}/{devices.length}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  Connected sensors
                </Text>
              </View>

              <View style={[styles.analyticsCard, { backgroundColor: colors.muted }]}>
                <Text style={[styles.analyticsHeading, { color: colors.text }]}>
                  Queue Status
                </Text>
                <Text
                  style={[
                    styles.analyticsValue,
                    {
                      color:
                        queueStatus.toLowerCase() === 'active'
                          ? colors.success
                          : colors.warning,
                    },
                  ]}
                >
                  {queueStatus}
                </Text>
                <Text style={[styles.analyticsSubtitle, { color: colors.subText }]}>
                  System operational
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },

  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  scrollContent: { paddingBottom: 24 },

  pageContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },

  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 13,
  },

  alertsList: { gap: 10 },

  alertItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },

  alertResolved: { opacity: 0.75 },

  alertContent: { marginBottom: 10 },

  alertType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#444',
    marginBottom: 4,
  },

  alertMessage: {
    fontSize: 14,
    marginBottom: 4,
  },

  alertTime: {
    fontSize: 12,
  },

  resolveButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  resolveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  alertResolvedBadge: {
    fontSize: 13,
    fontWeight: '700',
  },

  emptyState: {
    fontSize: 14,
  },

  reportPeriodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },

  periodBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  periodBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  reportContent: {
    gap: 16,
  },

  chartContainer: {
    borderRadius: 12,
    padding: 12,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
  },

  uptimeMetrics: {
    gap: 12,
    marginTop: 12,
  },

  uptimeItem: {
    borderRadius: 12,
    padding: 12,
  },

  uptimeInfo: {},

  uptimeDeviceName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },

  uptimeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  uptimeBar: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },

  uptimeFill: {
    height: '100%',
    borderRadius: 999,
  },

  uptimePercentage: {
    width: 42,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  analyticsGrid: {
    gap: 12,
    marginTop: 12,
  },

  analyticsCard: {
    borderRadius: 12,
    padding: 14,
  },

  analyticsHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },

  analyticsValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },

  analyticsSubtitle: {
    fontSize: 12,
  },
});