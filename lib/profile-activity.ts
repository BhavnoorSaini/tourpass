import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export interface ProfileStats {
  toursTaken: number;
  citiesVisited: number;
}

interface RecordRouteCompletionInput {
  userId: string;
  routeId?: string | null;
  routeTitle?: string | null;
  city?: string | null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LOCAL_ROUTE_COMPLETIONS_PREFIX = 'route_completions';

interface LocalRouteCompletion {
  id: string;
  city: string | null;
}

function normalizeText(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : null;
}

function addCity(cities: Set<string>, value?: string | null) {
  const normalized = normalizeText(value);
  if (!normalized) return;
  cities.add(normalized.toLocaleLowerCase());
}

function relationCity(row: any) {
  const relation = row?.routes;
  if (Array.isArray(relation)) return relation[0]?.city ?? null;
  return relation?.city ?? null;
}

function isMissingRouteCompletionsTable(error: any) {
  const message = String(error?.message ?? '');
  return (
    error?.code === 'PGRST205' ||
    error?.code === '42P01' ||
    (message.includes('route_completions') && message.includes('schema cache'))
  );
}

function localCompletionsKey(userId: string) {
  return `${LOCAL_ROUTE_COMPLETIONS_PREFIX}:${userId}`;
}

async function loadLocalRouteCompletions(userId: string): Promise<LocalRouteCompletion[]> {
  try {
    const raw = await AsyncStorage.getItem(localCompletionsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is LocalRouteCompletion =>
        typeof item?.id === 'string' &&
        (typeof item?.city === 'string' || item?.city === null),
    );
  } catch {
    return [];
  }
}

async function saveLocalRouteCompletion(userId: string, city: string | null) {
  const current = await loadLocalRouteCompletions(userId);
  const next = [
    ...current,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      city,
    },
  ];
  await AsyncStorage.setItem(localCompletionsKey(userId), JSON.stringify(next));
}

export async function fetchProfileStats(userId: string): Promise<ProfileStats> {
  const [routeCompletionResult, tourRequestResult, customRouteResult] = await Promise.all([
    supabase
      .from('route_completions')
      .select('id, city')
      .eq('user_id', userId),
    supabase
      .from('tour_requests')
      .select('id, routes(city)')
      .or(`tourist_id.eq.${userId},guide_id.eq.${userId}`)
      .eq('status', 'completed'),
    supabase
      .from('custom_routes')
      .select('id')
      .or(`tourist_id.eq.${userId},guide_id.eq.${userId}`)
      .eq('status', 'completed'),
  ]);

  const routeCompletionsTableMissing =
    !!routeCompletionResult.error && isMissingRouteCompletionsTable(routeCompletionResult.error);

  if (routeCompletionResult.error) {
    if (!routeCompletionsTableMissing) {
      console.warn('Failed to load route completions', routeCompletionResult.error.message);
    }
  }
  if (tourRequestResult.error) {
    console.warn('Failed to load completed tour requests', tourRequestResult.error.message);
  }
  if (customRouteResult.error) {
    console.warn('Failed to load completed custom routes', customRouteResult.error.message);
  }

  const routeCompletions = routeCompletionsTableMissing
    ? await loadLocalRouteCompletions(userId)
    : routeCompletionResult.error
    ? []
    : routeCompletionResult.data ?? [];
  const tourRequests = tourRequestResult.error ? [] : tourRequestResult.data ?? [];
  const customRoutes = customRouteResult.error ? [] : customRouteResult.data ?? [];
  const cities = new Set<string>();

  routeCompletions.forEach((row: any) => addCity(cities, row.city));
  tourRequests.forEach((row: any) => addCity(cities, relationCity(row)));

  return {
    toursTaken: routeCompletions.length + tourRequests.length + customRoutes.length,
    citiesVisited: cities.size,
  };
}

export async function recordRouteCompletion({
  userId,
  routeId,
  routeTitle,
  city,
}: RecordRouteCompletionInput) {
  const normalizedRouteId = routeId && UUID_PATTERN.test(routeId) ? routeId : null;
  let resolvedCity = normalizeText(city);

  if (!resolvedCity && normalizedRouteId) {
    const { data, error } = await supabase
      .from('routes')
      .select('city')
      .eq('id', normalizedRouteId)
      .maybeSingle();

    if (!error) {
      resolvedCity = normalizeText((data as { city?: string | null } | null)?.city);
    }
  }

  const payload = {
    user_id: userId,
    route_id: normalizedRouteId,
    route_title: normalizeText(routeTitle),
    city: resolvedCity,
  };

  const { error } = await supabase.from('route_completions').insert(payload);

  if (error) {
    if (isMissingRouteCompletionsTable(error)) {
      await saveLocalRouteCompletion(userId, resolvedCity);
      return;
    }

    throw error;
  }
}
