import { create } from 'zustand';
import { Color, Condition, FuelType, Category } from '@/utils/types';
import { supabase } from '@/lib/supabase';

interface GeneralStore {
  // States
  colors: Color[];
  conditions: Condition[];
  fuelTypes: FuelType[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setColors: (colors: Color[]) => void;
  setConditions: (conditions: Condition[]) => void;
  setFuelTypes: (fuelTypes: FuelType[]) => void;
  setCategories: (categories: Category[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Initialize function
  initializeStore: () => Promise<void>;
}

export const useGeneralStore = create<GeneralStore>()((set, get) => ({
  // Initial states
  colors: [],
  conditions: [],
  fuelTypes: [],
  categories: [],
  isLoading: false,
  error: null,

  // Actions
  setColors: (colors) => set({ colors }),
  setConditions: (conditions) => set({ conditions }),
  setFuelTypes: (fuelTypes) => set({ fuelTypes }),
  setCategories: (categories) => set({ categories }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Initialize function
  initializeStore: async () => {
    const store = get();
    if (
      store.colors.length > 0 &&
      store.conditions.length > 0 &&
      store.fuelTypes.length > 0 &&
      store.categories.length > 0
    ) {
      return; // Data already loaded
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch all data in parallel
      const [
        { data: colors, error: colorsError },
        { data: conditions, error: conditionsError },
        { data: fuelTypes, error: fuelTypesError },
        { data: categories, error: categoriesError },
      ] = await Promise.all([
        supabase.from('colors').select('*').order('id'),
        supabase.from('conditions').select('*').order('id'),
        supabase.from('fuel_types').select('*').order('id'),
        supabase.from('categories').select('*').order('id'),
      ]);

      // Check for errors
      if (colorsError) throw new Error(colorsError.message);
      if (conditionsError) throw new Error(conditionsError.message);
      if (fuelTypesError) throw new Error(fuelTypesError.message);
      if (categoriesError) throw new Error(categoriesError.message);

      // Update store
      set({
        colors: colors || [],
        conditions: conditions || [],
        fuelTypes: fuelTypes || [],
        categories: categories || [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while fetching data',
        isLoading: false,
      });
    }
  },
}));
