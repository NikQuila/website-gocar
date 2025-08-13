import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveBuilderFilterState {
  selectedBrands: string[];
  selectedYears: string[];
  selectedTypes: string[];
  selectedFuels: string[];
  selectedConditions: string[];
  selectedColors: string[];
  availableBrands: string[];
  availableYears: string[];
  availableTypes: string[];
  availableFuels: string[];
  availableConditions: string[];
  availableColors: string[];
  priceRange: { min: number; max: number };
  minMaxPrice: { min: number; max: number };
  sortOrder: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc';
  setSortOrder: (
    order: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc'
  ) => void;
  setSelectedBrands: (
    brands: string[] | ((prev: string[]) => string[])
  ) => void;
  setSelectedYears: (years: string[] | ((prev: string[]) => string[])) => void;
  setSelectedTypes: (types: string[] | ((prev: string[]) => string[])) => void;
  setSelectedFuels: (fuels: string[] | ((prev: string[]) => string[])) => void;
  setSelectedConditions: (
    conditions: string[] | ((prev: string[]) => string[])
  ) => void;
  setSelectedColors: (
    colors: string[] | ((prev: string[]) => string[])
  ) => void;
  setAvailableBrands: (brands: string[]) => void;
  setAvailableYears: (years: string[]) => void;
  setAvailableTypes: (types: string[]) => void;
  setAvailableFuels: (fuels: string[]) => void;
  setAvailableConditions: (conditions: string[]) => void;
  setAvailableColors: (colors: string[]) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setMinMaxPrice: (range: { min: number; max: number }) => void;
  clearFilters: () => void;
}

const useActiveBuilderFilter = create(
  persist<ActiveBuilderFilterState>((set, get) => ({
    selectedBrands: [],
    selectedYears: [],
    selectedTypes: [],
    selectedFuels: [],
    selectedConditions: [],
    selectedColors: [],
    availableBrands: [],
    availableYears: [],
    availableTypes: [],
    availableFuels: [],
    availableConditions: [],
    availableColors: [],
    priceRange: { min: 0, max: 1000000000 },
    minMaxPrice: { min: 0, max: 1000000000 },
    sortOrder: 'date_desc',
    setSortOrder: (order) => set({ sortOrder: order }),
    setSelectedBrands: (brands) =>
      set({
        selectedBrands:
          typeof brands === 'function' ? brands(get().selectedBrands) : brands,
      }),
    setSelectedYears: (years) =>
      set({
        selectedYears:
          typeof years === 'function' ? years(get().selectedYears) : years,
      }),
    setSelectedTypes: (types) =>
      set({
        selectedTypes:
          typeof types === 'function' ? types(get().selectedTypes) : types,
      }),
    setSelectedFuels: (fuels) =>
      set({
        selectedFuels:
          typeof fuels === 'function' ? fuels(get().selectedFuels) : fuels,
      }),
    setSelectedConditions: (conditions) =>
      set({
        selectedConditions:
          typeof conditions === 'function'
            ? conditions(get().selectedConditions)
            : conditions,
      }),
    setSelectedColors: (colors) =>
      set({
        selectedColors:
          typeof colors === 'function' ? colors(get().selectedColors) : colors,
      }),
    setAvailableBrands: (brands) => set({ availableBrands: brands }),
    setAvailableYears: (years) => set({ availableYears: years }),
    setAvailableTypes: (types) => set({ availableTypes: types }),
    setAvailableFuels: (fuels) => set({ availableFuels: fuels }),
    setAvailableConditions: (conditions) =>
      set({ availableConditions: conditions }),
    setAvailableColors: (colors) => set({ availableColors: colors }),
    setPriceRange: (range) => set({ priceRange: range }),
    setMinMaxPrice: (range) => set({ minMaxPrice: range }),
    clearFilters: () =>
      set({
        selectedBrands: [],
        selectedYears: [],
        selectedTypes: [],
        selectedFuels: [],
        selectedConditions: [],
        selectedColors: [],
        priceRange: { min: 0, max: 1000000000 },
        sortOrder: 'date_desc',
      }),
  }))
);

export default useActiveBuilderFilter;
