// ============================================================
// FitTrack AI - Global State Store (Zustand + SQL Sync)
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserProfile,
  PersonalProfile,
  DailyTargets,
  FitnessCalculations,
  ThemeMode,
  DailyActivity,
  FoodEntry,
  DailyNutrition,
  WeightEntry,
  WorkoutSession,
  DailyAIReport,
  BodyAvatar,
  ChatMessage,
  NotificationPreferences,
} from '@/types';
import {
  syncProfileToFirestore,
  syncDailyNutritionToFirestore,
  syncDailyActivityToFirestore,
  syncWeightToFirestore,
  syncWorkoutToFirestore,
  loadFullUserDataFromFirebase,
} from '@/lib/firebase';
import {
  syncUserAccountToSql,
  syncProfileToSql,
  syncDailyTargetsToSql,
  syncActivityToSql,
  syncFoodEntryToSql,
  removeFoodEntryFromSql,
  syncWeightEntryToSql,
  syncWorkoutSessionToSql,
  syncAIReportToSql,
  syncChatToSql,
  fetchUserAccountFromSql,
} from '@/lib/sql-sync';
import { calculateAllFitnessMetrics } from '@/lib/calculations';

interface AppState {
  // Auth
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Profile
  profile: PersonalProfile | null;
  setProfile: (profile: PersonalProfile | null) => void;

  // Fitness Calculations
  calculations: FitnessCalculations | null;
  setCalculations: (calc: FitnessCalculations | null) => void;

  // Daily Targets
  dailyTargets: DailyTargets | null;
  setDailyTargets: (targets: DailyTargets | null) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Today's Activity
  todayActivity: DailyActivity | null;
  setTodayActivity: (activity: DailyActivity | null) => void;

  // Today's Nutrition
  todayNutrition: DailyNutrition | null;
  setTodayNutrition: (nutrition: DailyNutrition | null) => void;

  // Food entries
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (entryId: string) => void;

  // Weight history
  weightHistory: WeightEntry[];
  setWeightHistory: (entries: WeightEntry[]) => void;
  addWeightEntry: (entry: WeightEntry) => void;

  // Workout sessions
  workoutSessions: WorkoutSession[];
  setWorkoutSessions: (sessions: WorkoutSession[]) => void;
  addWorkoutSession: (session: WorkoutSession) => void;
  updateWorkoutSession: (session: WorkoutSession) => void;

  // AI Reports
  aiReports: DailyAIReport[];
  setAIReports: (reports: DailyAIReport[]) => void;
  addAIReport: (report: DailyAIReport) => void;

  // Body Avatars
  bodyAvatars: BodyAvatar[];
  setBodyAvatars: (avatars: BodyAvatar[]) => void;
  addBodyAvatar: (avatar: BodyAvatar) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // Notification Preferences
  notificationPrefs: NotificationPreferences | null;
  setNotificationPrefs: (prefs: NotificationPreferences) => void;

  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;

  // Active workout
  activeWorkout: WorkoutSession | null;
  setActiveWorkout: (session: WorkoutSession | null) => void;

  // SQL Hydration
  loadUserDataFromSql: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => {
        set({ user });
        if (user) {
          // Always ensure the account exists in SQL
          syncUserAccountToSql(user);
          // And hydrate stored data from SQL for this account
          get().loadUserDataFromSql(user.uid);
        }
      },

      // Profile
      profile: null,
      setProfile: (profile) => {
        set({ profile });
        const user = get().user;
        if (user && profile) {
          // Sync to SQL
          syncProfileToSql(user.uid, profile);
          if (!user.uid.startsWith('demo_')) {
            syncProfileToFirestore(user.uid, profile);
          }
        }
      },

      // Fitness Calculations
      calculations: null,
      setCalculations: (calculations) => set({ calculations }),

      // Daily Targets
      dailyTargets: null,
      setDailyTargets: (dailyTargets) => {
        set({ dailyTargets });
        const user = get().user;
        if (user && dailyTargets) {
          syncDailyTargetsToSql(user.uid, dailyTargets);
        }
      },

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Today's Activity
      todayActivity: null,
      setTodayActivity: (todayActivity) => {
        set({ todayActivity });
        const user = get().user;
        if (user && todayActivity) {
          syncActivityToSql(user.uid, todayActivity);
          if (!user.uid.startsWith('demo_')) {
            syncDailyActivityToFirestore(user.uid, todayActivity.date, todayActivity);
          }
        }
      },

      // Today's Nutrition
      todayNutrition: null,
      setTodayNutrition: (todayNutrition) => set({ todayNutrition }),

      // Food entries
      addFoodEntry: (entry) =>
        set((state) => {
          const user = state.user;
          const nutrition = state.todayNutrition;
          if (!nutrition) return state;
          const category = entry.mealCategory;
          const updatedMeals = {
            ...nutrition.meals,
            [category]: [...nutrition.meals[category], entry],
          };
          const newNutrition = {
            ...nutrition,
            totalCalories: nutrition.totalCalories + entry.calories,
            totalProteinG: nutrition.totalProteinG + entry.proteinG,
            totalCarbsG: nutrition.totalCarbsG + entry.carbsG,
            totalFatG: nutrition.totalFatG + entry.fatG,
            totalFiberG: nutrition.totalFiberG + entry.fiberG,
            meals: updatedMeals,
          };
          if (user) {
            syncFoodEntryToSql(user.uid, entry);
            if (!user.uid.startsWith('demo_')) {
              syncDailyNutritionToFirestore(user.uid, nutrition.date, newNutrition);
            }
          }
          return { todayNutrition: newNutrition };
        }),
      removeFoodEntry: (entryId) =>
        set((state) => {
          const user = state.user;
          const nutrition = state.todayNutrition;
          if (!nutrition) return state;
          let removedEntry: FoodEntry | null = null;
          const updatedMeals = { ...nutrition.meals };
          for (const cat of ['breakfast', 'lunch', 'dinner', 'snacks'] as const) {
            const idx = updatedMeals[cat].findIndex((e) => e.id === entryId);
            if (idx !== -1) {
              removedEntry = updatedMeals[cat][idx];
              updatedMeals[cat] = [
                ...updatedMeals[cat].slice(0, idx),
                ...updatedMeals[cat].slice(idx + 1),
              ];
              break;
            }
          }
          if (!removedEntry) return state;
          if (user) {
            removeFoodEntryFromSql(user.uid, entryId);
          }
          return {
            todayNutrition: {
              ...nutrition,
              totalCalories: nutrition.totalCalories - removedEntry.calories,
              totalProteinG: nutrition.totalProteinG - removedEntry.proteinG,
              totalCarbsG: nutrition.totalCarbsG - removedEntry.carbsG,
              totalFatG: nutrition.totalFatG - removedEntry.fatG,
              totalFiberG: nutrition.totalFiberG - removedEntry.fiberG,
              meals: updatedMeals,
            },
          };
        }),

      // Weight history
      weightHistory: [],
      setWeightHistory: (entries) => set({ weightHistory: entries }),
      addWeightEntry: (entry) =>
        set((state) => {
          if (state.user) {
            syncWeightEntryToSql(state.user.uid, entry);
            if (!state.user.uid.startsWith('demo_')) {
              syncWeightToFirestore(state.user.uid, entry);
            }
          }
          return {
            weightHistory: [...state.weightHistory, entry],
          };
        }),

      // Workout sessions
      workoutSessions: [],
      setWorkoutSessions: (sessions) => set({ workoutSessions: sessions }),
      addWorkoutSession: (session) =>
        set((state) => {
          if (state.user) {
            syncWorkoutSessionToSql(state.user.uid, session);
            if (!state.user.uid.startsWith('demo_')) {
              syncWorkoutToFirestore(state.user.uid, session);
            }
          }
          return {
            workoutSessions: [...state.workoutSessions, session],
          };
        }),
      updateWorkoutSession: (session) =>
        set((state) => {
          if (state.user) {
            syncWorkoutSessionToSql(state.user.uid, session);
          }
          return {
            workoutSessions: state.workoutSessions.map((s) =>
              s.id === session.id ? session : s
            ),
          };
        }),

      // AI Reports
      aiReports: [],
      setAIReports: (reports) => set({ aiReports: reports }),
      addAIReport: (report) =>
        set((state) => {
          if (state.user) {
            syncAIReportToSql(state.user.uid, report);
          }
          return {
            aiReports: [...state.aiReports, report],
          };
        }),

      // Body Avatars
      bodyAvatars: [],
      setBodyAvatars: (avatars) => set({ bodyAvatars: avatars }),
      addBodyAvatar: (avatar) =>
        set((state) => ({
          bodyAvatars: [...state.bodyAvatars, avatar],
        })),

      // Chat
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => {
          const updated = [...state.chatMessages, message];
          if (state.user) {
            syncChatToSql(state.user.uid, updated);
          }
          return {
            chatMessages: updated,
          };
        }),
      clearChat: () => set({ chatMessages: [] }),

      // Notification Preferences
      notificationPrefs: null,
      setNotificationPrefs: (prefs) => set({ notificationPrefs: prefs }),

      // Onboarding
      onboardingStep: 0,
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      // Active workout
      activeWorkout: null,
      setActiveWorkout: (session) => set({ activeWorkout: session }),

      // Load all account data from SQL
      loadUserDataFromSql: async (userId: string) => {
        try {
          const data = await fetchUserAccountFromSql(userId);
          if (!data) return;

          const updates: Partial<AppState> = {};

          if (data.profile) {
            const p = data.profile;
            const loadedProfile: PersonalProfile = {
              uid: userId,
              fullName: p.fullName || data.user?.fullName || 'Athlete',
              age: p.age,
              gender: p.gender,
              heightCm: p.height,
              weightKg: p.currentWeight,
              fitnessGoal: p.fitnessGoal,
              activityLevel: p.activityLevel,
              updatedAt: p.updatedAt,
            };
            updates.profile = loadedProfile;

            // Re-calculate fitness metrics
            const calcs = calculateAllFitnessMetrics(
              p.currentWeight,
              p.height,
              p.age,
              p.gender,
              p.activityLevel,
              p.fitnessGoal
            );
            updates.calculations = calcs;
          }

          if (data.target) {
            const t = data.target;
            const loadedTarget: DailyTargets = {
              uid: userId,
              calories: t.dailyCalorieTarget,
              proteinG: t.proteinTarget,
              carbsG: t.carbsTarget,
              fatG: t.fatsTarget,
              fiberG: t.fiberTarget,
              steps: t.stepTarget,
              waterMl: t.waterTarget,
              setAt: t.updatedAt,
            };
            updates.dailyTargets = loadedTarget;
          }

          if (Array.isArray(data.weights) && data.weights.length > 0) {
            updates.weightHistory = data.weights.map((w: any) => ({
              id: w.id,
              uid: w.userId,
              date: w.measurementDate,
              weightKg: w.weight,
              bmi: w.bmi,
              notes: w.notes,
              createdAt: w.createdAt,
            }));
          }

          if (Array.isArray(data.workouts) && data.workouts.length > 0) {
            updates.workoutSessions = data.workouts.map((w: any) => ({
              id: w.id,
              uid: w.userId,
              workoutPlanId: w.planId || '',
              workoutName: w.workoutName,
              difficulty: w.difficulty,
              date: w.workoutDate ? w.workoutDate.split('T')[0] : getTodayString(),
              startTime: w.workoutDate,
              exercises: typeof w.exercises === 'string' ? JSON.parse(w.exercises) : w.exercises,
              totalCaloriesBurned: w.totalCaloriesBurned,
              completionPercentage: w.completionPercentage,
              status: w.status,
            }));
          }

          if (Array.isArray(data.aiReports) && data.aiReports.length > 0) {
            updates.aiReports = data.aiReports.map((r: any) => ({
              id: r.id,
              uid: r.userId,
              date: r.reportDate,
              summary: r.activitySummary,
              nutritionAnalysis: typeof r.nutritionAnalysis === 'string' ? JSON.parse(r.nutritionAnalysis) : r.nutritionAnalysis,
              activityAnalysis: typeof r.activitySummary === 'string' && r.activitySummary.startsWith('{') ? JSON.parse(r.activitySummary) : { steps: '', exercise: '', caloriesBurned: '' },
              recommendations: r.recommendations ? r.recommendations.split('; ') : [],
              achievements: r.achievements ? r.achievements.split('; ') : [],
              improvements: [],
              generatedAt: r.generatedAt,
            }));
          }

          const todayStr = getTodayString();

          // Real today activity from SQL
          const todayAct = Array.isArray(data.activities) ? data.activities.find((a: any) => a.date === todayStr) : null;
          if (todayAct) {
            updates.todayActivity = {
              uid: userId,
              date: todayStr,
              steps: todayAct.steps,
              distanceKm: todayAct.distance,
              activeMinutes: todayAct.activeMinutes,
              caloriesBurned: todayAct.caloriesBurned,
              activities: [],
            };
          } else {
            updates.todayActivity = {
              uid: userId,
              date: todayStr,
              steps: 0,
              distanceKm: 0,
              activeMinutes: 0,
              caloriesBurned: 0,
              activities: [],
            };
          }

          // Real today nutrition from SQL food diary
          if (Array.isArray(data.foodDiary)) {
            const todayFoods = data.foodDiary.filter((f: any) => f.date === todayStr);
            const meals = {
              breakfast: [] as FoodEntry[],
              lunch: [] as FoodEntry[],
              dinner: [] as FoodEntry[],
              snacks: [] as FoodEntry[],
            };
            let totalCalories = 0, totalProteinG = 0, totalCarbsG = 0, totalFatG = 0, totalFiberG = 0;

            for (const f of todayFoods) {
              const entry: FoodEntry = {
                id: f.id,
                uid: f.userId,
                date: f.date,
                mealCategory: f.mealCategory,
                foodName: f.foodName,
                quantity: f.quantity,
                unit: f.servingSize,
                servingSizeG: f.quantity,
                calories: f.calories,
                proteinG: f.protein,
                carbsG: f.carbs,
                fatG: f.fats,
                fiberG: f.fiber,
                source: 'manual',
                confirmed: true,
                createdAt: f.createdAt,
              };
              if (meals[f.mealCategory as keyof typeof meals]) {
                meals[f.mealCategory as keyof typeof meals].push(entry);
              }
              totalCalories += f.calories;
              totalProteinG += f.protein;
              totalCarbsG += f.carbs;
              totalFatG += f.fats;
              totalFiberG += f.fiber;
            }

            updates.todayNutrition = {
              uid: userId,
              date: todayStr,
              totalCalories,
              totalProteinG,
              totalCarbsG,
              totalFatG,
              totalFiberG,
              meals,
            };
          }

          // Also check Firebase Firestore for real cloud data if user is not demo
          if (!userId.startsWith('demo_')) {
            try {
              const fbData = await loadFullUserDataFromFirebase(userId, todayStr);
              if (fbData?.profile && !updates.profile) {
                updates.profile = fbData.profile;
              }
              if (fbData?.activity && (!todayAct || todayAct.steps === 0)) {
                updates.todayActivity = fbData.activity as DailyActivity;
              }
              if (fbData?.nutrition && (!updates.todayNutrition || updates.todayNutrition.totalCalories === 0)) {
                updates.todayNutrition = fbData.nutrition as DailyNutrition;
              }
              if (Array.isArray(fbData?.weights) && fbData.weights.length > 0 && (!updates.weightHistory || updates.weightHistory.length === 0)) {
                updates.weightHistory = fbData.weights as any;
              }
              if (Array.isArray(fbData?.workouts) && fbData.workouts.length > 0 && (!updates.workoutSessions || updates.workoutSessions.length === 0)) {
                updates.workoutSessions = fbData.workouts as any;
              }
            } catch (fbErr) {
              console.warn('[Firebase Cloud Sync] Failed to load Firestore data:', fbErr);
            }
          }

          set(updates);
        } catch (err) {
          console.warn('[SQL Sync] loadUserDataFromSql error:', err);
        }
      },
    }),
    {
      name: 'fittrack-ai-storage',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
        profile: state.profile,
        calculations: state.calculations,
        dailyTargets: state.dailyTargets,
        todayNutrition: state.todayNutrition,
        todayActivity: state.todayActivity,
        weightHistory: state.weightHistory,
        workoutSessions: state.workoutSessions,
        aiReports: state.aiReports,
        bodyAvatars: state.bodyAvatars,
        chatMessages: state.chatMessages,
        notificationPrefs: state.notificationPrefs,
        onboardingStep: state.onboardingStep,
      }),
    }
  )
);

// Helper to get today's date string
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Initialize today's nutrition if not set
export function initializeTodayNutrition(uid: string): DailyNutrition {
  const today = getTodayString();
  return {
    uid,
    date: today,
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    totalFiberG: 0,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
  };
}

// Initialize today's activity if not set
export function initializeTodayActivity(uid: string): DailyActivity {
  const today = getTodayString();
  return {
    uid,
    date: today,
    steps: 0,
    distanceKm: 0,
    activeMinutes: 0,
    caloriesBurned: 0,
    activities: [],
  };
}
