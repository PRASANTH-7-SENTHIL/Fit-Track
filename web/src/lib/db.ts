// ============================================================
// FitTrack AI - SQL Database Manager (node:sqlite)
// ============================================================
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    const dbPath = path.join(process.cwd(), 'fittrack.db');
    dbInstance = new DatabaseSync(dbPath);

    // Optimize SQLite settings
    dbInstance.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
    `);

    // Initialize Schema
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      authProvider TEXT NOT NULL DEFAULT 'password',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Fitness Profile Table
    CREATE TABLE IF NOT EXISTS fitness_profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      height REAL NOT NULL,
      currentWeight REAL NOT NULL,
      targetWeight REAL NOT NULL,
      fitnessGoal TEXT NOT NULL,
      activityLevel TEXT NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Fitness Targets Table
    CREATE TABLE IF NOT EXISTS fitness_targets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      dailyCalorieTarget INTEGER NOT NULL,
      proteinTarget INTEGER NOT NULL,
      carbsTarget INTEGER NOT NULL,
      fatsTarget INTEGER NOT NULL,
      fiberTarget INTEGER NOT NULL,
      waterTarget INTEGER NOT NULL,
      stepTarget INTEGER NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 4. Activity Tracker Table
    CREATE TABLE IF NOT EXISTS activity_trackers (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      steps INTEGER NOT NULL DEFAULT 0,
      distance REAL NOT NULL DEFAULT 0.0,
      activeMinutes INTEGER NOT NULL DEFAULT 0,
      caloriesBurned INTEGER NOT NULL DEFAULT 0,
      activityType TEXT NOT NULL DEFAULT 'walking',
      gpsSessionData TEXT,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 5. Workout Plans Table
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      difficultyLevel TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 6. Workout Sessions Table
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planId TEXT,
      workoutName TEXT NOT NULL,
      workoutDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER NOT NULL DEFAULT 0,
      difficulty TEXT NOT NULL,
      exercises TEXT NOT NULL,
      totalCaloriesBurned INTEGER NOT NULL DEFAULT 0,
      completionPercentage REAL NOT NULL DEFAULT 100.0,
      status TEXT NOT NULL DEFAULT 'completed',
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (planId) REFERENCES workout_plans(id) ON DELETE SET NULL
    );

    -- 7. Food Diary Table
    CREATE TABLE IF NOT EXISTS food_diaries (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      foodName TEXT NOT NULL,
      quantity REAL NOT NULL,
      servingSize TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fats REAL NOT NULL,
      fiber REAL NOT NULL,
      mealCategory TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 8. Nutrition Tracking Table
    CREATE TABLE IF NOT EXISTS nutrition_tracking (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      consumedNutrition TEXT NOT NULL,
      remainingNutrition TEXT NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 9. Weight History Table
    CREATE TABLE IF NOT EXISTS weight_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      weight REAL NOT NULL,
      bmi REAL NOT NULL,
      measurementDate TEXT NOT NULL,
      goalWeight REAL NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 10. Body Measurements Table
    CREATE TABLE IF NOT EXISTS body_measurements (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      chest REAL,
      waist REAL,
      hips REAL,
      neck REAL,
      bodyFatPercentage REAL,
      recordedDate TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 11. Body Transformations Table
    CREATE TABLE IF NOT EXISTS body_transformations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      photoUrl TEXT NOT NULL,
      avatarUrl TEXT,
      comparisonDate TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 12. Daily AI Reports Table
    CREATE TABLE IF NOT EXISTS daily_ai_reports (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      reportDate TEXT NOT NULL,
      nutritionAnalysis TEXT NOT NULL,
      activitySummary TEXT NOT NULL,
      achievements TEXT,
      recommendations TEXT NOT NULL,
      generatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 13. AI Assistant Sessions Table
    CREATE TABLE IF NOT EXISTS ai_assistant_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      sessionStart TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      lastUpdated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      conversationHistory TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 14. Water Tracking Table
    CREATE TABLE IF NOT EXISTS water_tracking (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      waterConsumedMl INTEGER NOT NULL DEFAULT 0,
      waterTargetMl INTEGER NOT NULL DEFAULT 2500,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 15. Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      scheduledTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_fitness_profiles_user ON fitness_profiles(userId);
    CREATE INDEX IF NOT EXISTS idx_fitness_targets_user ON fitness_targets(userId);
    CREATE INDEX IF NOT EXISTS idx_activity_trackers_user_date ON activity_trackers(userId, date);
    CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(userId);
    CREATE INDEX IF NOT EXISTS idx_food_diaries_user_date ON food_diaries(userId, date);
    CREATE INDEX IF NOT EXISTS idx_nutrition_tracking_user_date ON nutrition_tracking(userId, date);
    CREATE INDEX IF NOT EXISTS idx_weight_history_user ON weight_history(userId);
    CREATE INDEX IF NOT EXISTS idx_body_measurements_user ON body_measurements(userId);
    CREATE INDEX IF NOT EXISTS idx_body_transformations_user ON body_transformations(userId);
    CREATE INDEX IF NOT EXISTS idx_daily_ai_reports_user ON daily_ai_reports(userId);
    CREATE INDEX IF NOT EXISTS idx_ai_assistant_sessions_user ON ai_assistant_sessions(userId);
    CREATE INDEX IF NOT EXISTS idx_water_tracking_user_date ON water_tracking(userId, date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId);
  `);
}

// ============================================================
// Data Access Helper Functions
// ============================================================

// --- 1. User ---
export function upsertUser(user: {
  id: string;
  fullName: string;
  email: string;
  authProvider?: string;
  createdAt?: string;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(user.id);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE users
      SET fullName = ?, email = ?, authProvider = COALESCE(?, authProvider), updatedAt = ?
      WHERE id = ?
    `).run(user.fullName, user.email, user.authProvider || 'password', now, user.id);
  } else {
    db.prepare(`
      INSERT INTO users (id, fullName, email, authProvider, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.fullName,
      user.email,
      user.authProvider || 'password',
      user.createdAt || now,
      now
    );
  }

  return db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
}

export function getUser(userId: string) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

// --- 2. Fitness Profile ---
export function upsertFitnessProfile(profile: {
  userId: string;
  age: number;
  gender: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  fitnessGoal: string;
  activityLevel: string;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM fitness_profiles WHERE userId = ?').get(profile.userId) as any;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE fitness_profiles
      SET age = ?, gender = ?, height = ?, currentWeight = ?, targetWeight = ?, fitnessGoal = ?, activityLevel = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      profile.age,
      profile.gender,
      profile.height,
      profile.currentWeight,
      profile.targetWeight,
      profile.fitnessGoal,
      profile.activityLevel,
      now,
      existing.id
    );
    return db.prepare('SELECT * FROM fitness_profiles WHERE id = ?').get(existing.id);
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO fitness_profiles (id, userId, age, gender, height, currentWeight, targetWeight, fitnessGoal, activityLevel, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      profile.userId,
      profile.age,
      profile.gender,
      profile.height,
      profile.currentWeight,
      profile.targetWeight,
      profile.fitnessGoal,
      profile.activityLevel,
      now
    );
    return db.prepare('SELECT * FROM fitness_profiles WHERE id = ?').get(id);
  }
}

// --- 3. Fitness Target ---
export function upsertFitnessTarget(target: {
  userId: string;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  fiberTarget: number;
  waterTarget: number;
  stepTarget: number;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM fitness_targets WHERE userId = ?').get(target.userId) as any;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE fitness_targets
      SET dailyCalorieTarget = ?, proteinTarget = ?, carbsTarget = ?, fatsTarget = ?, fiberTarget = ?, waterTarget = ?, stepTarget = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      target.dailyCalorieTarget,
      target.proteinTarget,
      target.carbsTarget,
      target.fatsTarget,
      target.fiberTarget,
      target.waterTarget,
      target.stepTarget,
      now,
      existing.id
    );
    return db.prepare('SELECT * FROM fitness_targets WHERE id = ?').get(existing.id);
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO fitness_targets (id, userId, dailyCalorieTarget, proteinTarget, carbsTarget, fatsTarget, fiberTarget, waterTarget, stepTarget, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      target.userId,
      target.dailyCalorieTarget,
      target.proteinTarget,
      target.carbsTarget,
      target.fatsTarget,
      target.fiberTarget,
      target.waterTarget,
      target.stepTarget,
      now
    );
    return db.prepare('SELECT * FROM fitness_targets WHERE id = ?').get(id);
  }
}

// --- 4. Activity Tracker ---
export function upsertActivity(activity: {
  userId: string;
  date: string;
  steps: number;
  distance: number;
  activeMinutes: number;
  caloriesBurned: number;
  activityType?: string;
  gpsSessionData?: string;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM activity_trackers WHERE userId = ? AND date = ?').get(
    activity.userId,
    activity.date
  ) as any;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE activity_trackers
      SET steps = ?, distance = ?, activeMinutes = ?, caloriesBurned = ?, activityType = ?, gpsSessionData = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      activity.steps,
      activity.distance,
      activity.activeMinutes,
      activity.caloriesBurned,
      activity.activityType || 'walking',
      activity.gpsSessionData || null,
      now,
      existing.id
    );
    return db.prepare('SELECT * FROM activity_trackers WHERE id = ?').get(existing.id);
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO activity_trackers (id, userId, date, steps, distance, activeMinutes, caloriesBurned, activityType, gpsSessionData, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      activity.userId,
      activity.date,
      activity.steps,
      activity.distance,
      activity.activeMinutes,
      activity.caloriesBurned,
      activity.activityType || 'walking',
      activity.gpsSessionData || null,
      now
    );
    return db.prepare('SELECT * FROM activity_trackers WHERE id = ?').get(id);
  }
}

// --- 5 & 6. Workout Sessions ---
export function upsertWorkoutSession(session: {
  id?: string;
  userId: string;
  planId?: string | null;
  workoutName: string;
  workoutDate?: string;
  duration: number;
  difficulty: string;
  exercises: string; // JSON string
  totalCaloriesBurned?: number;
  completionPercentage?: number;
  status?: string;
}) {
  const db = getDatabase();
  const id = session.id || randomUUID();
  const existing = db.prepare('SELECT id FROM workout_sessions WHERE id = ?').get(id);

  if (existing) {
    db.prepare(`
      UPDATE workout_sessions
      SET workoutName = ?, duration = ?, difficulty = ?, exercises = ?, totalCaloriesBurned = ?, completionPercentage = ?, status = ?
      WHERE id = ?
    `).run(
      session.workoutName,
      session.duration,
      session.difficulty,
      session.exercises,
      session.totalCaloriesBurned || 0,
      session.completionPercentage || 100.0,
      session.status || 'completed',
      id
    );
  } else {
    db.prepare(`
      INSERT INTO workout_sessions (id, userId, planId, workoutName, workoutDate, duration, difficulty, exercises, totalCaloriesBurned, completionPercentage, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      session.userId,
      session.planId || null,
      session.workoutName,
      session.workoutDate || new Date().toISOString(),
      session.duration,
      session.difficulty,
      session.exercises,
      session.totalCaloriesBurned || 0,
      session.completionPercentage || 100.0,
      session.status || 'completed'
    );
  }
  return db.prepare('SELECT * FROM workout_sessions WHERE id = ?').get(id);
}

// --- 7. Food Diary ---
export function addFoodDiaryEntry(entry: {
  id?: string;
  userId: string;
  foodName: string;
  quantity: number;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  mealCategory: string;
  date: string;
  createdAt?: string;
}) {
  const db = getDatabase();
  const id = entry.id || randomUUID();
  db.prepare(`
    INSERT OR REPLACE INTO food_diaries (id, userId, foodName, quantity, servingSize, calories, protein, carbs, fats, fiber, mealCategory, date, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    entry.userId,
    entry.foodName,
    entry.quantity,
    entry.servingSize,
    entry.calories,
    entry.protein,
    entry.carbs,
    entry.fats,
    entry.fiber,
    entry.mealCategory,
    entry.date,
    entry.createdAt || new Date().toISOString()
  );
  return db.prepare('SELECT * FROM food_diaries WHERE id = ?').get(id);
}

export function removeFoodDiaryEntry(userId: string, entryId: string) {
  const db = getDatabase();
  db.prepare('DELETE FROM food_diaries WHERE id = ? AND userId = ?').run(entryId, userId);
}

// --- 8. Nutrition Tracking ---
export function upsertNutritionTracking(tracking: {
  userId: string;
  date: string;
  consumedNutrition: string;
  remainingNutrition: string;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM nutrition_tracking WHERE userId = ? AND date = ?').get(
    tracking.userId,
    tracking.date
  ) as any;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE nutrition_tracking
      SET consumedNutrition = ?, remainingNutrition = ?, updatedAt = ?
      WHERE id = ?
    `).run(tracking.consumedNutrition, tracking.remainingNutrition, now, existing.id);
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO nutrition_tracking (id, userId, date, consumedNutrition, remainingNutrition, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, tracking.userId, tracking.date, tracking.consumedNutrition, tracking.remainingNutrition, now);
  }
}

// --- 9. Weight History ---
export function addWeightEntry(entry: {
  id?: string;
  userId: string;
  weight: number;
  bmi: number;
  measurementDate: string;
  goalWeight: number;
  notes?: string;
  createdAt?: string;
}) {
  const db = getDatabase();
  const id = entry.id || randomUUID();
  db.prepare(`
    INSERT OR REPLACE INTO weight_history (id, userId, weight, bmi, measurementDate, goalWeight, notes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    entry.userId,
    entry.weight,
    entry.bmi,
    entry.measurementDate,
    entry.goalWeight,
    entry.notes || null,
    entry.createdAt || new Date().toISOString()
  );
  return db.prepare('SELECT * FROM weight_history WHERE id = ?').get(id);
}

// --- 10. Body Measurements ---
export function upsertBodyMeasurement(measurement: {
  userId: string;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  neck?: number | null;
  bodyFatPercentage?: number | null;
  recordedDate: string;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM body_measurements WHERE userId = ? AND recordedDate = ?').get(
    measurement.userId,
    measurement.recordedDate
  ) as any;

  if (existing) {
    db.prepare(`
      UPDATE body_measurements
      SET chest = ?, waist = ?, hips = ?, neck = ?, bodyFatPercentage = ?
      WHERE id = ?
    `).run(
      measurement.chest ?? null,
      measurement.waist ?? null,
      measurement.hips ?? null,
      measurement.neck ?? null,
      measurement.bodyFatPercentage ?? null,
      existing.id
    );
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO body_measurements (id, userId, chest, waist, hips, neck, bodyFatPercentage, recordedDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      measurement.userId,
      measurement.chest ?? null,
      measurement.waist ?? null,
      measurement.hips ?? null,
      measurement.neck ?? null,
      measurement.bodyFatPercentage ?? null,
      measurement.recordedDate
    );
  }
}

// --- 11. Body Transformation ---
export function addBodyTransformation(item: {
  id?: string;
  userId: string;
  photoUrl: string;
  avatarUrl?: string | null;
  comparisonDate: string;
  notes?: string | null;
  createdAt?: string;
}) {
  const db = getDatabase();
  const id = item.id || randomUUID();
  db.prepare(`
    INSERT OR REPLACE INTO body_transformations (id, userId, photoUrl, avatarUrl, comparisonDate, notes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    item.userId,
    item.photoUrl,
    item.avatarUrl || null,
    item.comparisonDate,
    item.notes || null,
    item.createdAt || new Date().toISOString()
  );
  return db.prepare('SELECT * FROM body_transformations WHERE id = ?').get(id);
}

// --- 12. Daily AI Reports ---
export function addDailyAIReport(report: {
  id?: string;
  userId: string;
  reportDate: string;
  nutritionAnalysis: string;
  activitySummary: string;
  achievements?: string | null;
  recommendations: string;
  generatedAt?: string;
}) {
  const db = getDatabase();
  const id = report.id || randomUUID();
  db.prepare(`
    INSERT OR REPLACE INTO daily_ai_reports (id, userId, reportDate, nutritionAnalysis, activitySummary, achievements, recommendations, generatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    report.userId,
    report.reportDate,
    report.nutritionAnalysis,
    report.activitySummary,
    report.achievements || null,
    report.recommendations,
    report.generatedAt || new Date().toISOString()
  );
  return db.prepare('SELECT * FROM daily_ai_reports WHERE id = ?').get(id);
}

// --- 13. AI Assistant Session ---
export function upsertAIAssistantSession(session: {
  userId: string;
  sessionStart?: string;
  lastUpdated?: string;
  conversationHistory: string; // JSON array of messages
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM ai_assistant_sessions WHERE userId = ?').get(session.userId) as any;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE ai_assistant_sessions
      SET conversationHistory = ?, lastUpdated = ?
      WHERE id = ?
    `).run(session.conversationHistory, session.lastUpdated || now, existing.id);
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO ai_assistant_sessions (id, userId, sessionStart, lastUpdated, conversationHistory)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, session.userId, session.sessionStart || now, now, session.conversationHistory);
  }
}

// --- 14. Water Tracking ---
export function upsertWaterTracking(water: {
  userId: string;
  date: string;
  waterConsumedMl: number;
  waterTargetMl: number;
}) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM water_tracking WHERE userId = ? AND date = ?').get(
    water.userId,
    water.date
  ) as any;
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE water_tracking
      SET waterConsumedMl = ?, waterTargetMl = ?, updatedAt = ?
      WHERE id = ?
    `).run(water.waterConsumedMl, water.waterTargetMl, now, existing.id);
  } else {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO water_tracking (id, userId, date, waterConsumedMl, waterTargetMl, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, water.userId, water.date, water.waterConsumedMl, water.waterTargetMl, now);
  }
}

// --- 15. Notifications ---
export function addNotification(notif: {
  id?: string;
  userId: string;
  title: string;
  message: string;
  status?: string;
  scheduledTime?: string;
}) {
  const db = getDatabase();
  const id = notif.id || randomUUID();
  db.prepare(`
    INSERT INTO notifications (id, userId, title, message, status, scheduledTime)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    notif.userId,
    notif.title,
    notif.message,
    notif.status || 'pending',
    notif.scheduledTime || new Date().toISOString()
  );
}

// ============================================================
// Full User Account Aggregation
// ============================================================
export function getUserFullAccountData(userId: string) {
  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return null;

  const profile = db.prepare('SELECT * FROM fitness_profiles WHERE userId = ?').get(userId);
  const target = db.prepare('SELECT * FROM fitness_targets WHERE userId = ?').get(userId);
  const activities = db.prepare('SELECT * FROM activity_trackers WHERE userId = ? ORDER BY date DESC').all(userId);
  const foodDiary = db.prepare('SELECT * FROM food_diaries WHERE userId = ? ORDER BY createdAt DESC').all(userId);
  const workouts = db.prepare('SELECT * FROM workout_sessions WHERE userId = ? ORDER BY workoutDate DESC').all(userId);
  const weights = db.prepare('SELECT * FROM weight_history WHERE userId = ? ORDER BY measurementDate DESC').all(userId);
  const measurements = db.prepare('SELECT * FROM body_measurements WHERE userId = ? ORDER BY recordedDate DESC').all(userId);
  const transformations = db.prepare('SELECT * FROM body_transformations WHERE userId = ? ORDER BY comparisonDate DESC').all(userId);
  const aiReports = db.prepare('SELECT * FROM daily_ai_reports WHERE userId = ? ORDER BY reportDate DESC').all(userId);
  const chatSession = db.prepare('SELECT * FROM ai_assistant_sessions WHERE userId = ?').get(userId);
  const water = db.prepare('SELECT * FROM water_tracking WHERE userId = ? ORDER BY date DESC').all(userId);
  const notifications = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY scheduledTime DESC').all(userId);

  return {
    user,
    profile,
    target,
    activities,
    foodDiary,
    workouts,
    weights,
    measurements,
    transformations,
    aiReports,
    chatSession,
    water,
    notifications,
  };
}

// ============================================================
// Database Diagnostics & Table Row Counts
// ============================================================
export function getDatabaseStats() {
  const db = getDatabase();
  const tables = [
    'users',
    'fitness_profiles',
    'fitness_targets',
    'activity_trackers',
    'workout_plans',
    'workout_sessions',
    'food_diaries',
    'nutrition_tracking',
    'weight_history',
    'body_measurements',
    'body_transformations',
    'daily_ai_reports',
    'ai_assistant_sessions',
    'water_tracking',
    'notifications',
  ];

  const stats: Record<string, number> = {};
  for (const table of tables) {
    try {
      const res = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
      stats[table] = res?.count ?? 0;
    } catch {
      stats[table] = 0;
    }
  }

  return {
    connected: true,
    engine: 'SQLite (node:sqlite) / Relational SQL',
    dbFile: 'fittrack.db',
    tables: stats,
    totalTables: tables.length,
    timestamp: new Date().toISOString(),
  };
}
