import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, CATEGORIES } from '../constants/theme';

function toDateString(date) {
  // Formats a Date as YYYY-MM-DD using local time (avoids UTC off-by-one issues).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function SubscriptionFormScreen({ route, navigation }) {
  // If editing, an existing subscription is passed in via route params.
  const existing = route.params?.subscription;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [cost, setCost] = useState(existing ? String(existing.cost) : '');
  const [billingCycle, setBillingCycle] = useState(existing?.billingCycle ?? 'monthly');
  const [renewalDate, setRenewalDate] = useState(
    existing?.nextRenewal ? new Date(existing.nextRenewal) : new Date()
  );
  const [showPicker, setShowPicker] = useState(false);
  const [category, setCategory] = useState(existing?.category ?? CATEGORIES[0]);
  const [error, setError] = useState('');

  function handleDateChange(event, selectedDate) {
    // On Android the picker is a dialog that closes itself; on iOS it stays inline.
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setRenewalDate(selectedDate);
    }
  }

  function handleSave() {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }
    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      setError('Please enter a valid cost.');
      return;
    }

    const payload = {
      id: existing?.id ?? Date.now().toString(),
      name: name.trim(),
      cost: parsedCost,
      billingCycle,
      nextRenewal: toDateString(renewalDate),
      category,
      notificationId: existing?.notificationId, // caller reschedules and overwrites this
    };

    navigation.navigate({
      name: 'Home',
      params: { savedSubscription: payload, isEditing },
      merge: true,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Netflix"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Cost</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 15.99"
          keyboardType="decimal-pad"
          value={cost}
          onChangeText={setCost}
        />

        <Text style={styles.label}>Billing Cycle</Text>
        <View style={styles.row}>
          {['monthly', 'yearly'].map((cycle) => (
            <TouchableOpacity
              key={cycle}
              style={[styles.pill, billingCycle === cycle && styles.pillActive]}
              onPress={() => setBillingCycle(cycle)}
            >
              <Text style={[styles.pillText, billingCycle === cycle && styles.pillTextActive]}>
                {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Next Renewal Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateButtonText}>{toDateString(renewalDate)}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={renewalDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Category</Text>
        <View style={styles.wrapRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.pill, category === cat && styles.pillActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>{isEditing ? 'Save Changes' : 'Add Subscription'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.subtext, marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateButtonText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, color: COLORS.text },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  error: { color: COLORS.danger, marginTop: 10, fontSize: 13 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.subtext, fontWeight: '600' },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700' },
});
