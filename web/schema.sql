-- ============================================================
-- FitTrack AI - Relational SQL Database Schema (PostgreSQL / SQLite)
-- ============================================================

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
  gpsSessionData TEXT, -- Serialized GeoJSON or Path data
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
  exercises TEXT NOT NULL, -- Serialized JSON: [{ name, sets, reps, completed }]
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
  consumedNutrition TEXT NOT NULL, -- Serialized JSON: { calories, protein, carbs, fats, fiber }
  remainingNutrition TEXT NOT NULL, -- Serialized JSON: { calories, protein, carbs, fats, fiber }
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
  conversationHistory TEXT NOT NULL, -- Serialized JSON: Array of messages [{ role, content, timestamp }]
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
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'read'
  scheduledTime TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for optimal per-user lookup performance
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
