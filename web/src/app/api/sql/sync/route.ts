import { NextRequest, NextResponse } from 'next/server';
import {
  upsertUser,
  upsertFitnessProfile,
  upsertFitnessTarget,
  upsertActivity,
  upsertWorkoutSession,
  addFoodDiaryEntry,
  removeFoodDiaryEntry,
  upsertNutritionTracking,
  addWeightEntry,
  upsertBodyMeasurement,
  addBodyTransformation,
  addDailyAIReport,
  upsertAIAssistantSession,
  upsertWaterTracking,
  addNotification,
  getUserFullAccountData,
} from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, data } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required for sync' }, { status: 400 });
    }

    let result: any = null;

    switch (type) {
      case 'user':
        result = upsertUser({
          id: userId,
          fullName: data.fullName || data.displayName || 'FitTrack Athlete',
          email: data.email,
          authProvider: data.authProvider || 'password',
          createdAt: data.createdAt,
        });
        break;

      case 'profile':
        result = upsertFitnessProfile({
          userId,
          age: data.age,
          gender: data.gender,
          height: data.heightCm ?? data.height,
          currentWeight: data.weightKg ?? data.currentWeight,
          targetWeight: data.targetWeight ?? data.weightKg ?? 70,
          fitnessGoal: data.fitnessGoal,
          activityLevel: data.activityLevel,
        });
        // Also save body measurements if present
        if (data.chestCm || data.waistCm || data.hipCm || data.neckCm || data.bodyFatPercentage) {
          upsertBodyMeasurement({
            userId,
            chest: data.chestCm,
            waist: data.waistCm,
            hips: data.hipCm,
            neck: data.neckCm,
            bodyFatPercentage: data.bodyFatPercentage,
            recordedDate: data.updatedAt ? data.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
          });
        }
        break;

      case 'target':
        result = upsertFitnessTarget({
          userId,
          dailyCalorieTarget: data.dailyCalorieTarget ?? data.calories,
          proteinTarget: data.proteinTarget ?? data.proteinG,
          carbsTarget: data.carbsTarget ?? data.carbsG,
          fatsTarget: data.fatsTarget ?? data.fatG,
          fiberTarget: data.fiberTarget ?? data.fiberG,
          waterTarget: data.waterTarget ?? data.waterMl ?? 2500,
          stepTarget: data.stepTarget ?? data.steps ?? 10000,
        });
        break;

      case 'activity':
        result = upsertActivity({
          userId,
          date: data.date,
          steps: data.steps,
          distance: data.distanceKm ?? data.distance ?? 0,
          activeMinutes: data.activeMinutes,
          caloriesBurned: data.caloriesBurned,
          activityType: data.activityType || 'walking',
          gpsSessionData: data.gpsSessionData ? JSON.stringify(data.gpsSessionData) : undefined,
        });
        break;

      case 'food_add':
        result = addFoodDiaryEntry({
          id: data.id,
          userId,
          foodName: data.foodName,
          quantity: data.quantity,
          servingSize: data.unit ? `${data.servingSizeG ?? data.quantity} ${data.unit}` : data.servingSize || 'serving',
          calories: data.calories,
          protein: data.proteinG ?? data.protein,
          carbs: data.carbsG ?? data.carbs,
          fats: data.fatG ?? data.fats,
          fiber: data.fiberG ?? data.fiber,
          mealCategory: data.mealCategory,
          date: data.date,
          createdAt: data.createdAt,
        });
        break;

      case 'food_remove':
        removeFoodDiaryEntry(userId, data.id);
        result = { removed: true, id: data.id };
        break;

      case 'nutrition_tracking':
        result = upsertNutritionTracking({
          userId,
          date: data.date,
          consumedNutrition: JSON.stringify(data.consumedNutrition || {}),
          remainingNutrition: JSON.stringify(data.remainingNutrition || {}),
        });
        break;

      case 'workout':
        result = upsertWorkoutSession({
          id: data.id,
          userId,
          planId: data.workoutPlanId || null,
          workoutName: data.workoutName || 'Workout Session',
          workoutDate: data.startTime || data.date || new Date().toISOString(),
          duration: data.duration || 0,
          difficulty: data.difficulty || 'medium',
          exercises: typeof data.exercises === 'string' ? data.exercises : JSON.stringify(data.exercises || []),
          totalCaloriesBurned: data.totalCaloriesBurned || 0,
          completionPercentage: data.completionPercentage || 100,
          status: data.status || 'completed',
        });
        break;

      case 'weight':
        result = addWeightEntry({
          id: data.id,
          userId,
          weight: data.weightKg ?? data.weight,
          bmi: data.bmi,
          measurementDate: data.date ?? data.measurementDate,
          goalWeight: data.goalWeight || (data.weightKg ?? data.weight),
          notes: data.notes,
          createdAt: data.createdAt,
        });
        break;

      case 'measurement':
        result = upsertBodyMeasurement({
          userId,
          chest: data.chest,
          waist: data.waist,
          hips: data.hips,
          neck: data.neck,
          bodyFatPercentage: data.bodyFatPercentage,
          recordedDate: data.recordedDate || new Date().toISOString().split('T')[0],
        });
        break;

      case 'transformation':
        result = addBodyTransformation({
          id: data.id,
          userId,
          photoUrl: data.photoUrl,
          avatarUrl: data.avatarUrl,
          comparisonDate: data.comparisonDate,
          notes: data.notes,
          createdAt: data.createdAt,
        });
        break;

      case 'ai_report':
        result = addDailyAIReport({
          id: data.id,
          userId,
          reportDate: data.date ?? data.reportDate,
          nutritionAnalysis: typeof data.nutritionAnalysis === 'string' ? data.nutritionAnalysis : JSON.stringify(data.nutritionAnalysis || {}),
          activitySummary: typeof data.activityAnalysis === 'string' ? data.activityAnalysis : JSON.stringify(data.activityAnalysis || {}),
          achievements: data.achievements ? (Array.isArray(data.achievements) ? data.achievements.join('; ') : data.achievements) : null,
          recommendations: data.recommendations ? (Array.isArray(data.recommendations) ? data.recommendations.join('; ') : data.recommendations) : '',
          generatedAt: data.generatedAt,
        });
        break;

      case 'chat':
        result = upsertAIAssistantSession({
          userId,
          lastUpdated: new Date().toISOString(),
          conversationHistory: typeof data.messages === 'string' ? data.messages : JSON.stringify(data.messages || []),
        });
        break;

      case 'water':
        result = upsertWaterTracking({
          userId,
          date: data.date,
          waterConsumedMl: data.waterConsumedMl ?? data.waterMl ?? 0,
          waterTargetMl: data.waterTargetMl ?? 2500,
        });
        break;

      case 'notification':
        result = addNotification({
          id: data.id,
          userId,
          title: data.title,
          message: data.message,
          status: data.status || 'pending',
          scheduledTime: data.scheduledTime,
        });
        break;

      default:
        return NextResponse.json({ error: `Unknown sync type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, type, result });
  } catch (error: any) {
    console.error('SQL Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }

    const accountData = getUserFullAccountData(userId);
    return NextResponse.json({ success: true, accountData });
  } catch (error: any) {
    console.error('SQL Sync Fetch Error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
