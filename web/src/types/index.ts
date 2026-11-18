// ============================================================
// FitTrack AI - Core Type Definitions
// ============================================================

// --- User & Auth ---
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  onboardingComplete: boolean;
  providers: string[];
}

export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export type FitnessGoal =
  | 'weight_loss'
  | 'weight_gain'
  | 'muscle_building'
  | 'weight_maintenance'
  | 'general_fitness';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active';

export interface PersonalProfile {
  uid: string;
  fullName: string;
  photoURL?: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  // Optional body measurements
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  neckCm?: number;
  bodyFatPercentage?: number;
  updatedAt: string;
}

// --- Fitness Calculations ---
export interface FitnessCalculations {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  dailyStepTarget: number;
  waterIntakeMl: number;
}

export interface DailyTargets {
  uid: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  steps: number;
  waterMl: number;
  setAt: string;
}

// --- Activity Tracking ---
export interface DailyActivity {
  uid: string;
  date: string; // YYYY-MM-DD
  steps: number;
  distanceKm: number;
  activeMinutes: number;
  caloriesBurned: number;
  activities: ActivityRecord[];
}

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  distanceKm?: number;
  caloriesBurned: number;
  averageSpeedKmh?: number;
  route?: GeoPoint[];
  status: 'active' | 'paused' | 'completed';
}

export type ActivityType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'gym_workout'
  | 'general_exercise';

export interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

// --- Workouts ---
export type WorkoutDifficulty = 'easy' | 'medium' | 'hard';

export interface WorkoutPlan {
  id: string;
  name: string;
  difficulty: WorkoutDifficulty;
  exercises: Exercise[];
  estimatedDurationMinutes: number;
  estimatedCaloriesBurned: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: 'reps' | 'duration' | 'distance';
  targetReps?: number;
  targetDurationSeconds?: number;
  targetDistanceKm?: number;
  restDurationSeconds: number;
  caloriesPerUnit: number;
  muscleGroups: string[];
  instructions: string[];
  imageUrl?: string;
}

export interface WorkoutSession {
  id: string;
  uid: string;
  workoutPlanId: string;
  workoutName: string;
  difficulty: WorkoutDifficulty;
  date: string;
  startTime: string;
  endTime?: string;
  exercises: ExerciseResult[];
  totalCaloriesBurned: number;
  completionPercentage: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface ExerciseResult {
  exerciseId: string;
  exerciseName: string;
  completedReps?: number;
  completedDurationSeconds?: number;
  completedDistanceKm?: number;
  completed: boolean;
  caloriesBurned: number;
}

// --- Food & Nutrition ---
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodEntry {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  mealCategory: MealCategory;
  foodName: string;
  quantity: number;
  unit: string;
  servingSizeG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  imageUrl?: string;
  source: 'ai_scan' | 'search' | 'manual';
  confirmed: boolean;
  createdAt: string;
}

export interface DailyNutrition {
  uid: string;
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  meals: {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snacks: FoodEntry[];
  };
}

export interface FoodAnalysisResult {
  foodName: string;
  category: string;
  quantity: number;
  unit: string;
  servingSizeG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  confidence: number;
}

// --- Weight Tracking ---
export interface WeightEntry {
  id: string;
  uid: string;
  date: string;
  weightKg: number;
  bmi: number;
  notes?: string;
  createdAt: string;
}

// --- Body Transformation ---
export type AvatarView = 'front' | 'side' | 'back';
export type AvatarGender = 'male' | 'female';

export interface BodyAvatar {
  id: string;
  uid: string;
  date: string;
  avatarGender: AvatarGender;
  heightCm: number;
  weightKg: number;
  bmi: number;
  measurements?: {
    chestCm?: number;
    waistCm?: number;
    hipCm?: number;
    neckCm?: number;
    bodyFatPercentage?: number;
  };
  views: {
    front: string; // SVG or data URL
    side: string;
    back: string;
  };
  isGoalBody: boolean;
  createdAt: string;
}

// --- AI Reports ---
export interface DailyAIReport {
  id: string;
  uid: string;
  date: string;
  summary: string;
  nutritionAnalysis: {
    overall: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  activityAnalysis: {
    steps: string;
    exercise: string;
    caloriesBurned: string;
  };
  recommendations: string[];
  achievements: string[];
  improvements: string[];
  generatedAt: string;
}

// --- Notifications ---
export interface NotificationPreferences {
  uid: string;
  stepReminders: boolean;
  workoutReminders: boolean;
  waterReminders: boolean;
  nutritionReminders: boolean;
  dailyReportNotifications: boolean;
  fitnessProgressNotifications: boolean;
}

// --- Chat ---
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// --- Theme ---
export type ThemeMode = 'light' | 'dark';
