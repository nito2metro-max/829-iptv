import { useColorScheme as useRNColorScheme } from 'react-native';

/** Devuelve siempre 'light' o 'dark' (React Native también puede dar 'unspecified' o null). */
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
