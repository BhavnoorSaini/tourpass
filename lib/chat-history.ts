import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type HiddenChatKey = `tr:${string}` | `cr:${string}`;

const HIDDEN_THREADS_KEY = 'hidden_message_threads';

export function getHiddenChatKeys(user: User | null): HiddenChatKey[] {
  const raw = user?.user_metadata?.[HIDDEN_THREADS_KEY];
  if (!Array.isArray(raw)) return [];

  return raw.filter(
    (value): value is HiddenChatKey =>
      typeof value === 'string' && (value.startsWith('tr:') || value.startsWith('cr:')),
  );
}

export async function hideChatKeyForUser(
  user: User,
  chatKey: HiddenChatKey,
  existingKeys: HiddenChatKey[] = getHiddenChatKeys(user),
) {
  const nextKeys = Array.from(new Set([...existingKeys, chatKey]));

  const { data, error } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      [HIDDEN_THREADS_KEY]: nextKeys,
    },
  });

  return { data, error, nextKeys };
}
