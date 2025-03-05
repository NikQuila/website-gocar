'use client';
import { useEffect } from 'react';
import { useGeneralStore } from '../store/useGeneralStore';

export const useInitializeStore = () => {
  const { initializeStore, isLoading, error } = useGeneralStore();

  useEffect(() => {
    initializeStore();
  }, []); // Run once on mount

  return { isLoading, error };
};
