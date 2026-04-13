import React, { memo, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface TourRequestRow {
  id: string;
  status: string;
  created_at: string;
  route_id: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

const STATUS_TONES = {
  pending: 'rgba(217, 119, 87, 0.14)',
  accepted: 'rgba(39, 103, 73, 0.14)',
  cancelled: 'rgba(155, 44, 44, 0.12)',
  default: 'rgba(138, 135, 128, 0.14)',
} as const;

const RequestRow = memo(function RequestRow({
  request,
  isLast,
}: {
  request: TourRequestRow;
  isLast: boolean;
}) {
  const theme = useTheme();
  const statusKey = request.status.toLowerCase();
  const badgeBackground =
    STATUS_TONES[statusKey as keyof typeof STATUS_TONES] ?? STATUS_TONES.default;
  const statusLabel = STATUS_LABELS[statusKey] ?? request.status;

  return (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.background,
        },
      ]}
    >
      <View style={styles.rowContent}>
        <Text style={[typography.bodyM, { color: theme.text }]}>
          Request {request.id.slice(0, 8)}
        </Text>
        <Text style={[typography.bodyS, styles.metaText, { color: theme.textSecondary }]}>
          {new Date(request.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: badgeBackground }]}>
        <Text style={[typography.labelS, { color: theme.text }]}>{statusLabel}</Text>
      </View>
    </View>
  );
});

export const RequestStatusList = memo(function RequestStatusList() {
  const theme = useTheme();
  const [requests, setRequests] = useState<TourRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('tour_requests')
      .select('id, status, created_at, route_id')
      .eq('tourist_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setRequests((data as TourRequestRow[]) ?? []);
    }

    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  return (
    <View style={styles.container}>
      <Text style={[typography.labelS, styles.label, { color: theme.textSecondary }]}>
        Your Requests
      </Text>

      <Card innerStyle={styles.cardInner}>
        {loading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={theme.accent} />
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.stateBlock}>
            <Text style={[typography.bodyS, { color: theme.textSecondary, textAlign: 'center' }]}>
              Tour requests you send will appear here with their latest status.
            </Text>
          </View>
        ) : (
          requests.map((request, index) => (
            <RequestRow
              key={request.id}
              request={request}
              isLast={index === requests.length - 1}
            />
          ))
        )}
      </Card>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  label: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardInner: {
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  metaText: {
    marginTop: 2,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
  },
  stateBlock: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
