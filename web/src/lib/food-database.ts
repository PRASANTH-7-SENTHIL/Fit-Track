// ============================================================
// FitTrack AI - Indian Food Database
// ============================================================

export interface FoodItem {
  name: string;
  category: string;
  servingSizeG: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  aliases: string[];
}

export const FOOD_DATABASE: FoodItem[] = [
  // South Indian
  { name: 'Idli', category: 'South Indian', servingSizeG: 40, unit: 'piece', calories: 58, proteinG: 2, carbsG: 12, fatG: 0.4, fiberG: 0.5, aliases: ['idly'] },
  { name: 'Dosa', category: 'South Indian', servingSizeG: 100, unit: 'piece', calories: 130, proteinG: 3, carbsG: 22, fatG: 3, fiberG: 1.2, aliases: ['plain dosa', 'masala dosa'] },
  { name: 'Sambar', category: 'South Indian', servingSizeG: 150, unit: 'bowl', calories: 80, proteinG: 4, carbsG: 12, fatG: 2, fiberG: 3, aliases: ['sambhar'] },
  { name: 'Rasam', category: 'South Indian', servingSizeG: 150, unit: 'bowl', calories: 35, proteinG: 1.5, carbsG: 5, fatG: 1, fiberG: 1, aliases: ['pepper rasam'] },
  { name: 'Vada', category: 'South Indian', servingSizeG: 50, unit: 'piece', calories: 140, proteinG: 5, carbsG: 15, fatG: 7, fiberG: 2, aliases: ['medu vada', 'vadai'] },
  { name: 'Upma', category: 'South Indian', servingSizeG: 200, unit: 'bowl', calories: 210, proteinG: 5, carbsG: 30, fatG: 8, fiberG: 2, aliases: ['rava upma'] },
  { name: 'Pongal', category: 'South Indian', servingSizeG: 200, unit: 'bowl', calories: 240, proteinG: 6, carbsG: 35, fatG: 8, fiberG: 1.5, aliases: ['ven pongal'] },
  { name: 'Uttapam', category: 'South Indian', servingSizeG: 120, unit: 'piece', calories: 160, proteinG: 4, carbsG: 25, fatG: 5, fiberG: 1.5, aliases: ['uthappam'] },
  { name: 'Coconut Chutney', category: 'South Indian', servingSizeG: 30, unit: 'tbsp', calories: 50, proteinG: 1, carbsG: 3, fatG: 4, fiberG: 1, aliases: ['chutney'] },
  
  // North Indian
  { name: 'Chapati', category: 'North Indian', servingSizeG: 40, unit: 'piece', calories: 104, proteinG: 3.5, carbsG: 18, fatG: 2, fiberG: 2, aliases: ['roti', 'phulka'] },
  { name: 'Paratha', category: 'North Indian', servingSizeG: 80, unit: 'piece', calories: 230, proteinG: 5, carbsG: 30, fatG: 10, fiberG: 2, aliases: ['parota', 'aloo paratha'] },
  { name: 'Naan', category: 'North Indian', servingSizeG: 90, unit: 'piece', calories: 260, proteinG: 8, carbsG: 45, fatG: 5, fiberG: 2, aliases: ['butter naan', 'garlic naan'] },
  { name: 'Dal', category: 'North Indian', servingSizeG: 150, unit: 'bowl', calories: 120, proteinG: 8, carbsG: 18, fatG: 2, fiberG: 4, aliases: ['dhal', 'lentil curry', 'dal fry'] },
  { name: 'Paneer Curry', category: 'North Indian', servingSizeG: 200, unit: 'bowl', calories: 300, proteinG: 15, carbsG: 12, fatG: 22, fiberG: 2, aliases: ['paneer butter masala', 'shahi paneer'] },
  { name: 'Rajma', category: 'North Indian', servingSizeG: 200, unit: 'bowl', calories: 180, proteinG: 10, carbsG: 28, fatG: 3, fiberG: 6, aliases: ['kidney beans curry'] },
  { name: 'Chole', category: 'North Indian', servingSizeG: 200, unit: 'bowl', calories: 200, proteinG: 10, carbsG: 30, fatG: 5, fiberG: 7, aliases: ['chana masala', 'chickpea curry'] },
  
  // Rice & Grains
  { name: 'Rice', category: 'Grains', servingSizeG: 150, unit: 'bowl', calories: 195, proteinG: 4, carbsG: 44, fatG: 0.5, fiberG: 0.5, aliases: ['white rice', 'steamed rice', 'cooked rice'] },
  { name: 'Brown Rice', category: 'Grains', servingSizeG: 150, unit: 'bowl', calories: 170, proteinG: 4, carbsG: 36, fatG: 1.5, fiberG: 2.5, aliases: ['brown rice cooked'] },
  { name: 'Oats', category: 'Grains', servingSizeG: 40, unit: 'cup', calories: 150, proteinG: 5, carbsG: 27, fatG: 2.5, fiberG: 4, aliases: ['oatmeal', 'rolled oats'] },
  { name: 'Biryani', category: 'Grains', servingSizeG: 250, unit: 'plate', calories: 350, proteinG: 12, carbsG: 50, fatG: 12, fiberG: 2, aliases: ['chicken biryani', 'veg biryani'] },
  { name: 'Fried Rice', category: 'Grains', servingSizeG: 250, unit: 'plate', calories: 310, proteinG: 8, carbsG: 48, fatG: 10, fiberG: 2, aliases: ['egg fried rice', 'veg fried rice'] },
  
  // Protein
  { name: 'Boiled Egg', category: 'Protein', servingSizeG: 50, unit: 'piece', calories: 78, proteinG: 6, carbsG: 0.5, fatG: 5, fiberG: 0, aliases: ['egg', 'hard boiled egg'] },
  { name: 'Egg Omelette', category: 'Protein', servingSizeG: 70, unit: 'piece', calories: 110, proteinG: 7, carbsG: 1, fatG: 8, fiberG: 0, aliases: ['omelette', 'omelet'] },
  { name: 'Chicken Breast', category: 'Protein', servingSizeG: 100, unit: 'piece', calories: 165, proteinG: 31, carbsG: 0, fatG: 3.5, fiberG: 0, aliases: ['grilled chicken', 'chicken'] },
  { name: 'Chicken Curry', category: 'Protein', servingSizeG: 200, unit: 'bowl', calories: 240, proteinG: 22, carbsG: 8, fatG: 14, fiberG: 1, aliases: ['chicken masala'] },
  { name: 'Fish Curry', category: 'Protein', servingSizeG: 200, unit: 'bowl', calories: 200, proteinG: 25, carbsG: 6, fatG: 9, fiberG: 1, aliases: ['fish', 'fish fry'] },
  { name: 'Soya Chunks', category: 'Protein', servingSizeG: 50, unit: 'cup', calories: 170, proteinG: 26, carbsG: 15, fatG: 0.5, fiberG: 7, aliases: ['soy chunks', 'meal maker', 'soya'] },
  { name: 'Paneer', category: 'Protein', servingSizeG: 100, unit: 'piece', calories: 265, proteinG: 18, carbsG: 3, fatG: 20, fiberG: 0, aliases: ['cottage cheese', 'fresh paneer'] },
  { name: 'Tofu', category: 'Protein', servingSizeG: 100, unit: 'piece', calories: 76, proteinG: 8, carbsG: 2, fatG: 4.5, fiberG: 0.5, aliases: ['bean curd'] },
  { name: 'Mutton Curry', category: 'Protein', servingSizeG: 200, unit: 'bowl', calories: 280, proteinG: 24, carbsG: 6, fatG: 18, fiberG: 1, aliases: ['lamb curry', 'goat curry'] },
  { name: 'Prawns', category: 'Protein', servingSizeG: 100, unit: 'serving', calories: 100, proteinG: 20, carbsG: 1, fatG: 1.5, fiberG: 0, aliases: ['shrimp'] },
  
  // Dairy
  { name: 'Milk', category: 'Dairy', servingSizeG: 200, unit: 'glass', calories: 120, proteinG: 6.5, carbsG: 10, fatG: 6, fiberG: 0, aliases: ['whole milk', 'cow milk'] },
  { name: 'Curd', category: 'Dairy', servingSizeG: 150, unit: 'bowl', calories: 90, proteinG: 5, carbsG: 7, fatG: 5, fiberG: 0, aliases: ['yogurt', 'dahi'] },
  { name: 'Buttermilk', category: 'Dairy', servingSizeG: 200, unit: 'glass', calories: 40, proteinG: 3, carbsG: 5, fatG: 1, fiberG: 0, aliases: ['chaas', 'majjiga', 'mor'] },
  { name: 'Lassi', category: 'Dairy', servingSizeG: 250, unit: 'glass', calories: 160, proteinG: 6, carbsG: 25, fatG: 4, fiberG: 0, aliases: ['sweet lassi', 'mango lassi'] },
  { name: 'Whey Protein', category: 'Dairy', servingSizeG: 30, unit: 'scoop', calories: 120, proteinG: 24, carbsG: 3, fatG: 1, fiberG: 0, aliases: ['protein shake', 'protein powder'] },
  
  // Fruits
  { name: 'Banana', category: 'Fruits', servingSizeG: 120, unit: 'piece', calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, fiberG: 3, aliases: ['banana fruit'] },
  { name: 'Apple', category: 'Fruits', servingSizeG: 180, unit: 'piece', calories: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3, fiberG: 4, aliases: ['apple fruit'] },
  { name: 'Mango', category: 'Fruits', servingSizeG: 200, unit: 'piece', calories: 135, proteinG: 1.5, carbsG: 35, fatG: 0.5, fiberG: 3, aliases: ['ripe mango'] },
  { name: 'Orange', category: 'Fruits', servingSizeG: 150, unit: 'piece', calories: 65, proteinG: 1.3, carbsG: 16, fatG: 0.2, fiberG: 3, aliases: ['orange fruit'] },
  { name: 'Papaya', category: 'Fruits', servingSizeG: 150, unit: 'bowl', calories: 60, proteinG: 0.8, carbsG: 15, fatG: 0.3, fiberG: 2.5, aliases: ['pawpaw'] },
  { name: 'Watermelon', category: 'Fruits', servingSizeG: 200, unit: 'bowl', calories: 60, proteinG: 1.2, carbsG: 15, fatG: 0.3, fiberG: 0.6, aliases: [] },
  { name: 'Grapes', category: 'Fruits', servingSizeG: 150, unit: 'bowl', calories: 104, proteinG: 1, carbsG: 27, fatG: 0.2, fiberG: 1.4, aliases: [] },
  { name: 'Pomegranate', category: 'Fruits', servingSizeG: 150, unit: 'bowl', calories: 120, proteinG: 2.5, carbsG: 28, fatG: 1.5, fiberG: 6, aliases: [] },
  
  // Vegetables
  { name: 'Mixed Vegetable Curry', category: 'Vegetables', servingSizeG: 200, unit: 'bowl', calories: 120, proteinG: 4, carbsG: 18, fatG: 4, fiberG: 5, aliases: ['veg curry', 'sabzi'] },
  { name: 'Palak Paneer', category: 'Vegetables', servingSizeG: 200, unit: 'bowl', calories: 220, proteinG: 12, carbsG: 10, fatG: 16, fiberG: 3, aliases: ['spinach paneer'] },
  { name: 'Salad', category: 'Vegetables', servingSizeG: 150, unit: 'bowl', calories: 35, proteinG: 1.5, carbsG: 7, fatG: 0.3, fiberG: 2.5, aliases: ['green salad', 'vegetable salad'] },
  { name: 'Aloo Gobi', category: 'Vegetables', servingSizeG: 200, unit: 'bowl', calories: 160, proteinG: 4, carbsG: 22, fatG: 7, fiberG: 4, aliases: ['potato cauliflower'] },
  { name: 'Bhindi', category: 'Vegetables', servingSizeG: 150, unit: 'bowl', calories: 100, proteinG: 3, carbsG: 12, fatG: 5, fiberG: 4, aliases: ['okra', 'lady finger'] },
  
  // Snacks & Nuts
  { name: 'Almonds', category: 'Nuts', servingSizeG: 28, unit: 'handful', calories: 164, proteinG: 6, carbsG: 6, fatG: 14, fiberG: 3.5, aliases: ['badam'] },
  { name: 'Peanuts', category: 'Nuts', servingSizeG: 30, unit: 'handful', calories: 170, proteinG: 7, carbsG: 6, fatG: 14, fiberG: 2.5, aliases: ['groundnut'] },
  { name: 'Cashews', category: 'Nuts', servingSizeG: 28, unit: 'handful', calories: 155, proteinG: 5, carbsG: 9, fatG: 12, fiberG: 1, aliases: ['kaju'] },
  { name: 'Walnuts', category: 'Nuts', servingSizeG: 28, unit: 'handful', calories: 185, proteinG: 4, carbsG: 4, fatG: 18, fiberG: 2, aliases: ['akhrot'] },
  { name: 'Peanut Butter', category: 'Nuts', servingSizeG: 32, unit: 'tbsp', calories: 190, proteinG: 7, carbsG: 7, fatG: 16, fiberG: 2, aliases: [] },
  
  // Beverages
  { name: 'Tea', category: 'Beverages', servingSizeG: 150, unit: 'cup', calories: 30, proteinG: 1, carbsG: 5, fatG: 0.5, fiberG: 0, aliases: ['chai', 'milk tea'] },
  { name: 'Coffee', category: 'Beverages', servingSizeG: 150, unit: 'cup', calories: 35, proteinG: 1, carbsG: 5, fatG: 1, fiberG: 0, aliases: ['filter coffee'] },
  { name: 'Green Tea', category: 'Beverages', servingSizeG: 200, unit: 'cup', calories: 2, proteinG: 0, carbsG: 0.5, fatG: 0, fiberG: 0, aliases: [] },
  { name: 'Coconut Water', category: 'Beverages', servingSizeG: 250, unit: 'glass', calories: 45, proteinG: 1.7, carbsG: 9, fatG: 0.5, fiberG: 2.5, aliases: ['nariyal pani'] },
  { name: 'Fresh Juice', category: 'Beverages', servingSizeG: 200, unit: 'glass', calories: 90, proteinG: 0.5, carbsG: 22, fatG: 0.2, fiberG: 0.5, aliases: ['orange juice', 'fruit juice'] },
  
  // Sweets & Desserts
  { name: 'Gulab Jamun', category: 'Sweets', servingSizeG: 50, unit: 'piece', calories: 150, proteinG: 2, carbsG: 22, fatG: 6, fiberG: 0.3, aliases: [] },
  { name: 'Jalebi', category: 'Sweets', servingSizeG: 50, unit: 'piece', calories: 150, proteinG: 1, carbsG: 25, fatG: 6, fiberG: 0, aliases: [] },
  { name: 'Rasgulla', category: 'Sweets', servingSizeG: 50, unit: 'piece', calories: 120, proteinG: 3, carbsG: 22, fatG: 2, fiberG: 0, aliases: [] },
  { name: 'Dark Chocolate', category: 'Sweets', servingSizeG: 30, unit: 'piece', calories: 155, proteinG: 2, carbsG: 13, fatG: 10, fiberG: 3, aliases: ['chocolate'] },
];

export function searchFoods(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  return FOOD_DATABASE.filter(food => {
    const nameMatch = food.name.toLowerCase().includes(q);
    const categoryMatch = food.category.toLowerCase().includes(q);
    const aliasMatch = food.aliases.some(a => a.toLowerCase().includes(q));
    return nameMatch || categoryMatch || aliasMatch;
  }).slice(0, 20);
}

export function getFoodByName(name: string): FoodItem | undefined {
  const q = name.toLowerCase().trim();
  return FOOD_DATABASE.find(food => {
    return food.name.toLowerCase() === q || 
           food.aliases.some(a => a.toLowerCase() === q);
  });
}

export function scaleNutrition(food: FoodItem, quantity: number): {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  totalWeightG: number;
} {
  return {
    calories: Math.round(food.calories * quantity),
    proteinG: Math.round(food.proteinG * quantity * 10) / 10,
    carbsG: Math.round(food.carbsG * quantity * 10) / 10,
    fatG: Math.round(food.fatG * quantity * 10) / 10,
    fiberG: Math.round(food.fiberG * quantity * 10) / 10,
    totalWeightG: Math.round(food.servingSizeG * quantity),
  };
}
