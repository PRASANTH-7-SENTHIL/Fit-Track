// ============================================================
// FitTrack AI - Client-side SQL Sync Engine
// Connects client actions directly to the SQL database per account
// ============================================================
import {
  UserProfile,
  PersonalProfile,
  DailyTargets,
  DailyActivity,
  FoodEntry,
  WeightEntry,
  WorkoutSession,
  DailyAIReport,
  ChatMessage,
} from '@/types';

async function postSqlSync(userId: string, type: string, data: any) {
  try {
    const res = await fetch('/api/sql/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`[SQL Sync] Error syncing ${type}:`, err);
    }
  } catch (err) {
    console.warn(`[SQL Sync Network Error] ${type}:`, err);
  }
}

export async function syncUserAccountToSql(user: UserProfile) {
  try {
    await fetch('/api/sql/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.uid,
        fullName: user.displayName,
        email: user.email,
        authProvider: user.providers?.[0] || 'password',
        createdAt: user.createdAt,
      }),
    });
  } catch (err) {
    console.warn('[SQL Sync] Failed to register user to SQL:', err);
  }
}

export async function syncProfileToSql(userId: string, profile: PersonalProfile) {
  return postSqlSync(userId, 'profile', profile);
}

export async function syncDailyTargetsToSql(userId: string, targets: DailyTargets) {
  return postSqlSync(userId, 'target', targets);
}

export async function syncActivityToSql(userId: string, activity: DailyActivity) {
  return postSqlSync(userId, 'activity', activity);
}

export async function syncFoodEntryToSql(userId: string, entry: FoodEntry) {
  return postSqlSync(userId, 'food_add', entry);
}

export async function removeFoodEntryFromSql(userId: string, entryId: string) {
  return postSqlSync(userId, 'food_remove', { id: entryId });
}

export async function syncWeightEntryToSql(userId: string, entry: WeightEntry) {
  return postSqlSync(userId, 'weight', entry);
}

export async function syncWorkoutSessionToSql(userId: string, session: WorkoutSession) {
  return postSqlSync(userId, 'workout', session);
}

export async function syncAIReportToSql(userId: string, report: DailyAIReport) {
  return postSqlSync(userId, 'ai_report', report);
}

export async function syncChatToSql(userId: string, messages: ChatMessage[]) {
  return postSqlSync(userId, 'chat', { messages });
}

export async function fetchUserAccountFromSql(userId: string) {
  try {
    const res = await fetch(`/api/sql/sync?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.accountData;
  } catch (err) {
    console.warn('[SQL Sync] Failed to fetch user account data:', err);
    return null;
  }
}

export async function fetchSqlStats() {
  try {
    const res = await fetch('/api/sql/stats');
    if (!res.ok) return null;
    const json = await res.json();
    return json.stats;
  } catch (err) {
    console.warn('[SQL Sync] Failed to fetch SQL stats:', err);
    return null;
  }
}
