import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/theme';
import SubscriptionCard from '../components/SubscriptionCard';
import { loadSubscriptions, saveSubscriptions } from '../utils/storage';
import { scheduleRenewalReminder, cancelReminder } from '../utils/notifications';
import { useSettings } from '../context/SettingsContext';

export default function HomeScreen({ route, navigation }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  // Initial load from disk.
  useEffect(() => {
    (async () => {
      const saved = await loadSubscriptions();
      setSubscriptions(saved);
      setLoading(false);
    })();
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (!loading) {
      saveSubscriptions(subscriptions);
    }
  }, [subscriptions, loading]);

  // The form screen navigates back here with `savedSubscription` in params.
  // We pick it up, (re)schedule its reminder, and merge it into the list.
  useEffect(() => {
    const payload = route.params?.savedSubscription;
    if (!payload) return;

    (async () => {
      if (payload.notificationId) {
        await cancelReminder(payload.notificationId);
      }
      const notificationId = await scheduleRenewalReminder(payload, settings.reminderDays);
      const finalSub = { ...payload, notificationId };

      setSubscriptions((prev) => {
        const exists = prev.some((s) => s.id === finalSub.id);
        return exists
          ? prev.map((s) => (s.id === finalSub.id ? finalSub : s))
          : [...prev, finalSub];
      });

      // Clear the param so this doesn't re-fire on the next focus.
      navigation.setParams({ savedSubscription: undefined, isEditing: undefined });
    })();
  }, [route.params?.savedSubscription]);

  const handleDelete = useCallback((id) => {
    setSubscriptions((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target?.notificationId) {
        cancelReminder(target.notificationId);
      }
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const handleEdit = useCallback(
    (subscription) => {
      navigation.navigate('SubscriptionForm', { subscription });
    },
    [navigation]
  );

  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, s) => {
      const monthlyCost = s.billingCycle === 'yearly' ? s.cost / 12 : s.cost;
      return sum + monthlyCost;
    }, 0);
  }, [subscriptions]);

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort(
      (a, b) => new Date(a.nextRenewal) - new Date(b.nextRenewal)
    );
  }, [subscriptions]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>
            {settings.currencySymbol}
            {monthlyTotal.toFixed(2)} / month · {subscriptions.length}{' '}
            {subscriptions.length === 1 ? 'sub' : 'subs'}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Insights', { subscriptions })}
          >
            <Ionicons name="stats-chart-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {sortedSubscriptions.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Ionicons name="card-outline" size={48} color={COLORS.subtext} />
          <Text style={styles.emptyText}>No subscriptions yet.</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedSubscriptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SubscriptionCard
              subscription={item}
              onDelete={handleDelete}
              onPress={handleEdit}
              currencySymbol={settings.currencySymbol}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SubscriptionForm', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.subtext, marginTop: 4 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: COLORS.subtext, marginTop: 4, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
