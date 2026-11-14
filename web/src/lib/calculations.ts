// ============================================================
// FitTrack AI - Fitness Calculations
// ============================================================
import {
  FitnessCalculations,
  Gender,
  ActivityLevel,
  FitnessGoal,
} from '@/types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

const GOAL_CALORIE_ADJUSTMENTS: Record<FitnessGoal, number> = {
  weight_loss: -500,
  weight_gain: 400,
  muscle_building: 300,
  weight_maintenance: 0,
  general_fitness: -200,
};

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  }
  // For 'prefer_not_to_say', use average
  return Math.round(base - 78);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateAllFitnessMetrics(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  fitnessGoal: FitnessGoal
): FitnessCalculations {
  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Calorie target based on goal
  let dailyCalorieTarget = tdee + GOAL_CALORIE_ADJUSTMENTS[fitnessGoal];
  // Ensure minimum safe calories
  dailyCalorieTarget = Math.max(dailyCalorieTarget, gender === 'male' ? 1500 : 1200);

  // Macronutrient targets
  // Protein: 1.6-2.2g per kg for muscle building, 1.2-1.6 for others
  let proteinMultiplier = 1.4;
  if (fitnessGoal === 'muscle_building') proteinMultiplier = 2.0;
  else if (fitnessGoal === 'weight_loss') proteinMultiplier = 1.6;
  else if (fitnessGoal === 'weight_gain') proteinMultiplier = 1.8;

  const proteinTargetG = Math.round(weightKg * proteinMultiplier);
  const proteinCalories = proteinTargetG * 4;

  // Fat: 25-35% of calories
  const fatCalories = dailyCalorieTarget * 0.28;
  const fatTargetG = Math.round(fatCalories / 9);

  // Carbs: remaining calories
  const carbCalories = dailyCalorieTarget - proteinCalories - fatCalories;
  const carbTargetG = Math.round(carbCalories / 4);

  // Fiber: 25-38g based on calorie level
  const fiberTargetG = gender === 'male' ? 38 : 25;

  // Step target based on activity level
  const stepTargets: Record<ActivityLevel, number> = {
    sedentary: 6000,
    lightly_active: 8000,
    moderately_active: 10000,
    very_active: 12000,
  };

  // Water intake: ~30-35ml per kg body weight
  const waterIntakeMl = Math.round(weightKg * 33);

  return {
    bmi,
    bmiCategory,
    bmr,
    tdee,
    dailyCalorieTarget,
    proteinTargetG,
    carbTargetG,
    fatTargetG,
    fiberTargetG,
    dailyStepTarget: stepTargets[activityLevel],
    waterIntakeMl,
  };
}

export function calculateCaloriesBurned(
  activityType: string,
  durationMinutes: number,
  weightKg: number
): number {
  // MET values (approximate)
  const metValues: Record<string, number> = {
    walking: 3.5,
    running: 8.0,
    cycling: 6.0,
    gym_workout: 5.0,
    general_exercise: 4.0,
    push_ups: 8.0,
    squats: 5.0,
    jumping_jacks: 8.0,
    burpees: 10.0,
    stretching: 2.5,
    strength_training: 6.0,
  };

  const met = metValues[activityType] || 4.0;
  // Calories = MET × weight (kg) × time (hours)
  return Math.round(met * weightKg * (durationMinutes / 60));
}

export function calculateDistance(steps: number, heightCm: number): number {
  // Average stride length ≈ 0.415 × height
  const strideLengthM = (0.415 * heightCm) / 100;
  return Math.round((steps * strideLengthM) / 1000 * 100) / 100;
}
