'use client';

// Vehículos vendidos y reservados se muestran solo por 3 días desde la fecha de venta/reserva
// Sold and reserved vehicles are shown only for 3 days from the sale/reservation date

import { useState, useEffect, useMemo } from 'react';

import {
  Button,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  ScrollShadow,
} from '@heroui/react';

import { Icon } from '@iconify/react';
import NewVehicleFilters from './new-vehicle-filters';
import useVehiclesStore from '@/store/useVehiclesStore';
import { Vehicle } from '@/utils/types';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import VehicleHorizontalCard from '@/components/vehicles/VehicleHorizontalCard';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import useMediaQuery from '@/hooks/useMediaQuery';
import useThemeStore from '@/store/useThemeStore';
import Link from 'next/link';
import useClientStore from '@/store/useClientStore';
import { formatWhatsAppNumber } from '@/utils/contact-utils';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';

// ============================================
// MOTOR DE BÚSQUEDA INTELIGENTE v4.0 PRO+
// ============================================
// Features:
// - Fuzzy matching (tolera errores de tipeo)
// - Detección de rangos de precio en lenguaje natural
// - Detección de rangos de año
// - Detección de kilometraje
// - Expansión inteligente de términos
// - Sinónimos contextuales
// - Búsqueda negativa (excluir términos)
// - Búsqueda por características
// - Autocompletado inteligente
// - Sugerencias de búsqueda
// ============================================

// Normalizar texto (quitar acentos, minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// ============================================
// FUZZY MATCHING - Distancia de Levenshtein
// ============================================
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
};

// Calcular similaridad (0-1) basada en distancia de Levenshtein
const calculateSimilarity = (str1: string, str2: string): number => {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLen;
};

// Verificar si dos strings son similares (fuzzy match)
const isFuzzyMatch = (str1: string, str2: string, threshold = 0.75): boolean => {
  const n1 = normalizeText(str1);
  const n2 = normalizeText(str2);

  // Match exacto
  if (n1 === n2) return true;

  // Si uno contiene al otro
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Fuzzy match solo para términos de 4+ caracteres
  if (n1.length >= 4 && n2.length >= 4) {
    return calculateSimilarity(n1, n2) >= threshold;
  }

  return false;
};

// ============================================
// MARCAS DE AUTOS - Para fuzzy matching
// ============================================
const KNOWN_BRANDS = [
  'toyota', 'honda', 'nissan', 'mazda', 'hyundai', 'kia', 'chevrolet', 'ford',
  'volkswagen', 'audi', 'bmw', 'mercedes', 'mercedesbenz', 'jeep', 'suzuki',
  'mitsubishi', 'subaru', 'lexus', 'porsche', 'ferrari', 'lamborghini', 'volvo',
  'peugeot', 'renault', 'citroen', 'fiat', 'alfa romeo', 'seat', 'skoda',
  'land rover', 'range rover', 'jaguar', 'mini', 'smart', 'tesla', 'byd',
  'chery', 'geely', 'great wall', 'haval', 'jac', 'mg', 'changan', 'dfsk',
  'ssangyong', 'mahindra', 'tata', 'dacia', 'opel', 'saab', 'lancia',
  'chrysler', 'dodge', 'ram', 'cadillac', 'buick', 'gmc', 'lincoln', 'acura',
  'infiniti', 'genesis', 'maserati', 'bentley', 'rolls royce', 'aston martin'
];

// Corrección de errores comunes de tipeo en marcas
const BRAND_CORRECTIONS: Record<string, string> = {
  'toyta': 'toyota', 'toyoya': 'toyota', 'totoya': 'toyota', 'tyota': 'toyota',
  'hynday': 'hyundai', 'hundai': 'hyundai', 'hyunday': 'hyundai', 'hiundai': 'hyundai',
  'volksvagen': 'volkswagen', 'wolkswagen': 'volkswagen', 'volkswaguen': 'volkswagen', 'vw': 'volkswagen',
  'chevroled': 'chevrolet', 'chebrolet': 'chevrolet', 'chevi': 'chevrolet', 'chevy': 'chevrolet',
  'merzedes': 'mercedes', 'mercedez': 'mercedes', 'mersedes': 'mercedes',
  'porshe': 'porsche', 'porche': 'porsche',
  'lamborgini': 'lamborghini', 'lamborgihni': 'lamborghini',
  'mitsubichi': 'mitsubishi', 'mitsubisi': 'mitsubishi',
  'peguot': 'peugeot', 'peugeout': 'peugeot',
  'renaut': 'renault', 'reno': 'renault',
  'citreon': 'citroen', 'sitrohen': 'citroen',
  'suzuky': 'suzuki', 'susuki': 'suzuki',
  'bwm': 'bmw', 'bmv': 'bmw',
  'nisan': 'nissan', 'nissa': 'nissan',
  'masda': 'mazda', 'mazdaa': 'mazda',
  'kya': 'kia',
  'jepp': 'jeep', 'jip': 'jeep',
  'forde': 'ford',
  'audy': 'audi', 'aidy': 'audi',
};

// Encontrar la mejor marca coincidente
const findBestBrandMatch = (term: string): string | null => {
  const normalized = normalizeText(term);

  // Primero verificar correcciones directas
  if (BRAND_CORRECTIONS[normalized]) {
    return BRAND_CORRECTIONS[normalized];
  }

  // Buscar en marcas conocidas con fuzzy matching
  for (const brand of KNOWN_BRANDS) {
    if (isFuzzyMatch(normalized, brand, 0.8)) {
      return brand;
    }
  }

  return null;
};

// ============================================
// DETECCIÓN DE RANGOS NUMÉRICOS
// ============================================
interface NumericFilter {
  type: 'price' | 'year' | 'mileage';
  min?: number;
  max?: number;
}

// Patrones para detectar rangos de precio
const PRICE_PATTERNS = [
  // "bajo X millones", "menos de X millones"
  { regex: /(?:bajo|menos de|menor a|hasta|max|maximo)\s*(\d+(?:[.,]\d+)?)\s*(?:millones?|mill?|palos?|m)/i, type: 'max' as const },
  // "sobre X millones", "más de X millones"
  { regex: /(?:sobre|mas de|mayor a|desde|min|minimo)\s*(\d+(?:[.,]\d+)?)\s*(?:millones?|mill?|palos?|m)/i, type: 'min' as const },
  // "entre X y Y millones"
  { regex: /entre\s*(\d+(?:[.,]\d+)?)\s*(?:y|a|-)\s*(\d+(?:[.,]\d+)?)\s*(?:millones?|mill?|palos?|m)?/i, type: 'range' as const },
  // "X a Y millones"
  { regex: /(\d+(?:[.,]\d+)?)\s*(?:a|-)\s*(\d+(?:[.,]\d+)?)\s*(?:millones?|mill?|palos?|m)/i, type: 'range' as const },
  // Solo número + millones (interpretado como máximo)
  { regex: /(\d+(?:[.,]\d+)?)\s*(?:millones?|mill?|palos?)/i, type: 'max' as const },
  // "barato" = bajo precio
  { regex: /\b(?:barato|baratos?|economico|economica)\b/i, type: 'cheap' as const },
];

// Patrones para detectar años
const YEAR_PATTERNS = [
  // "2020 o más nuevo", "del 2020 en adelante"
  { regex: /(?:del?\s*)?(\d{4})\s*(?:o\s*mas\s*nuevo|en\s*adelante|o\s*superior|para\s*arriba|\+)/i, type: 'min' as const },
  // "hasta 2020", "2020 o más antiguo"
  { regex: /(?:hasta|max|maximo)\s*(\d{4})|(\d{4})\s*(?:o\s*mas\s*antiguo|para\s*abajo|o\s*anterior)/i, type: 'max' as const },
  // "entre 2018 y 2022"
  { regex: /(?:entre|del?)\s*(\d{4})\s*(?:y|a|-|al?)\s*(\d{4})/i, type: 'range' as const },
  // "año 2020", "del 2020"
  { regex: /(?:ano|year|del?)\s*(\d{4})/i, type: 'exact' as const },
  // Solo un año (4 dígitos entre 1990-2030)
  { regex: /\b((?:19|20)\d{2})\b/i, type: 'exact' as const },
  // "nuevo" = últimos 3 años
  { regex: /\b(?:nuevo|nueva|reciente|recientes|ultimo modelo)\b/i, type: 'recent' as const },
];

// Patrones para kilometraje
const MILEAGE_PATTERNS = [
  // "menos de 50000 km", "bajo 50 mil km"
  { regex: /(?:menos de|bajo|hasta|max)\s*(\d+(?:[.,]?\d+)?)\s*(?:mil)?\s*(?:km|kilometros?)/i, type: 'max' as const },
  // "pocos km", "bajo kilometraje"
  { regex: /\b(?:pocos?\s*km|bajo\s*kilometraje|poco\s*uso|poco\s*recorrido)\b/i, type: 'low' as const },
];

// Extraer filtros numéricos del query
const extractNumericFilters = (query: string): { filters: NumericFilter[], cleanedQuery: string } => {
  const filters: NumericFilter[] = [];
  let cleanedQuery = query;
  const currentYear = new Date().getFullYear();

  // Procesar precios
  for (const pattern of PRICE_PATTERNS) {
    const match = cleanedQuery.match(pattern.regex);
    if (match) {
      if (pattern.type === 'cheap') {
        // "barato" = menos de 12 millones
        filters.push({ type: 'price', max: 12000000 });
      } else if (pattern.type === 'range' && match[1] && match[2]) {
        const val1 = parseFloat(match[1].replace(',', '.')) * 1000000;
        const val2 = parseFloat(match[2].replace(',', '.')) * 1000000;
        filters.push({ type: 'price', min: Math.min(val1, val2), max: Math.max(val1, val2) });
      } else if (pattern.type === 'max' && match[1]) {
        const val = parseFloat(match[1].replace(',', '.')) * 1000000;
        filters.push({ type: 'price', max: val });
      } else if (pattern.type === 'min' && match[1]) {
        const val = parseFloat(match[1].replace(',', '.')) * 1000000;
        filters.push({ type: 'price', min: val });
      }
      cleanedQuery = cleanedQuery.replace(match[0], ' ');
    }
  }

  // Procesar años
  for (const pattern of YEAR_PATTERNS) {
    const match = cleanedQuery.match(pattern.regex);
    if (match) {
      if (pattern.type === 'recent') {
        // "nuevo" = últimos 3 años
        filters.push({ type: 'year', min: currentYear - 3 });
      } else if (pattern.type === 'range' && match[1] && match[2]) {
        const y1 = parseInt(match[1]);
        const y2 = parseInt(match[2]);
        filters.push({ type: 'year', min: Math.min(y1, y2), max: Math.max(y1, y2) });
      } else if (pattern.type === 'min' && match[1]) {
        filters.push({ type: 'year', min: parseInt(match[1]) });
      } else if (pattern.type === 'max') {
        const year = match[1] ? parseInt(match[1]) : match[2] ? parseInt(match[2]) : null;
        if (year) filters.push({ type: 'year', max: year });
      } else if (pattern.type === 'exact' && match[1]) {
        const year = parseInt(match[1]);
        // Solo considerar si es un año razonable
        if (year >= 1990 && year <= currentYear + 1) {
          filters.push({ type: 'year', min: year, max: year });
          cleanedQuery = cleanedQuery.replace(match[0], ' ');
        }
      }
      if (pattern.type !== 'exact') {
        cleanedQuery = cleanedQuery.replace(match[0], ' ');
      }
    }
  }

  // Procesar kilometraje
  for (const pattern of MILEAGE_PATTERNS) {
    const match = cleanedQuery.match(pattern.regex);
    if (match) {
      if (pattern.type === 'low') {
        // "pocos km" = menos de 50000 km
        filters.push({ type: 'mileage', max: 50000 });
      } else if (pattern.type === 'max' && match[1]) {
        let val = parseFloat(match[1].replace(/[.,]/g, ''));
        // Si tiene "mil" o es menor a 1000, multiplicar
        if (match[0].toLowerCase().includes('mil') || val < 1000) {
          val *= 1000;
        }
        filters.push({ type: 'mileage', max: val });
      }
      cleanedQuery = cleanedQuery.replace(match[0], ' ');
    }
  }

  return { filters, cleanedQuery: cleanedQuery.replace(/\s+/g, ' ').trim() };
};

// Verificar si un vehículo cumple con los filtros numéricos
const vehicleMatchesNumericFilters = (vehicle: Vehicle, filters: NumericFilter[]): boolean => {
  for (const filter of filters) {
    if (filter.type === 'price') {
      const price = vehicle.price || 0;
      if (filter.min !== undefined && price < filter.min) return false;
      if (filter.max !== undefined && price > filter.max) return false;
    } else if (filter.type === 'year') {
      const year = vehicle.year || 0;
      if (filter.min !== undefined && year < filter.min) return false;
      if (filter.max !== undefined && year > filter.max) return false;
    } else if (filter.type === 'mileage') {
      const mileage = vehicle.mileage || 0;
      if (filter.min !== undefined && mileage < filter.min) return false;
      if (filter.max !== undefined && mileage > filter.max) return false;
    }
  }
  return true;
};

// Stopwords - palabras comunes que no aportan a la búsqueda
const STOPWORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'hacia',
  'busco', 'buscar', 'quiero', 'querer', 'necesito', 'necesitar', 'estoy', 'buscando',
  'me', 'interesa', 'gustaria', 'quisiera', 'deseo', 'encuentren', 'muestren', 'muestrame',
  'dame', 'ver', 'mostrar', 'encontrar',
  'y', 'o', 'e', 'u', 'que', 'como', 'pero', 'si', 'no', 'mas', 'muy', 'tan', 'algo',
  'buen', 'buena', 'bueno', 'buenos', 'buenas', 'mejor', 'mejores', 'bonito', 'bonita',
  'lindo', 'linda', 'bien', 'ideal', 'perfecto', 'perfecta', 'excelente',
  'tipo', 'estilo', 'clase', 'version',
  'tengan', 'tenga', 'sea', 'sean', 'este', 'esta', 'esten',
  'hay', 'tienen', 'tiene', 'tener', 'ser', 'estar',
]);

// Términos que se expanden a múltiples categorías/valores
const TERM_EXPANSIONS: Record<string, string[]> = {
  // "Camioneta" en Chile/Latam puede ser SUV o Pickup
  'camioneta': ['suv', 'pickup', 'crossover', '4x4'],
  'camionetas': ['suv', 'pickup', 'crossover', '4x4'],
  'suv': ['suv', 'crossover'],
  // "Auto" puede ser cualquier vehículo de pasajeros
  'auto': ['sedan', 'hatchback', 'coupe'],
  'autos': ['sedan', 'hatchback', 'coupe'],
  'carro': ['sedan', 'hatchback', 'coupe', 'suv'],
  'carros': ['sedan', 'hatchback', 'coupe', 'suv'],
  'vehiculo': ['sedan', 'hatchback', 'coupe', 'suv', 'pickup'],
  // "Económico" se refiere a bajo consumo
  'economico': ['hatchback', 'sedan', 'hibrido', 'electrico'],
  'economica': ['hatchback', 'sedan', 'hibrido', 'electrico'],
  'rendidor': ['hatchback', 'sedan', 'hibrido', 'electrico'],
  'eficiente': ['hibrido', 'electrico'],
  // "Familiar" puede ser wagon, SUV o van
  'familiar': ['wagon', 'suv', 'van', 'crossover'],
  'familiares': ['wagon', 'suv', 'van', 'crossover'],
  'familia': ['wagon', 'suv', 'van', 'crossover'],
  'espacioso': ['suv', 'van', 'wagon'],
  'amplio': ['suv', 'van', 'wagon'],
  // "Grande" se refiere a SUV, pickup, van
  'grande': ['suv', 'pickup', 'van'],
  'grandes': ['suv', 'pickup', 'van'],
  // "Pequeño/Chico" se refiere a hatchback, sedan compacto
  'pequeno': ['hatchback', 'citycar'],
  'pequena': ['hatchback', 'citycar'],
  'chico': ['hatchback', 'citycar'],
  'chica': ['hatchback', 'citycar'],
  'compacto': ['hatchback', 'citycar'],
  'compacta': ['hatchback', 'citycar'],
  'city': ['hatchback', 'citycar'],
  // "Deportivo"
  'deportivo': ['coupe', 'sport', 'gt'],
  'deportiva': ['coupe', 'sport', 'gt'],
  'rapido': ['coupe', 'sport', 'gt'],
  'potente': ['coupe', 'sport', 'gt', 'suv'],
  // "4x4" puede ser SUV o Pickup
  '4x4': ['suv', 'pickup', 'crossover'],
  'todoterreno': ['suv', 'pickup'],
  'offroad': ['suv', 'pickup'],
  'aventura': ['suv', 'pickup'],
  // Trabajo/carga
  'trabajo': ['pickup', 'van', 'furgon'],
  'carga': ['pickup', 'van', 'furgon'],
  'comercial': ['pickup', 'van', 'furgon'],
  // Combustible
  'electrico': ['electrico', 'ev', 'electric'],
  'eco': ['hibrido', 'electrico'],
  'verde': ['hibrido', 'electrico'],
  'gasolina': ['bencina', 'gasolina', 'nafta'],
  'nafta': ['bencina', 'gasolina', 'nafta'],
  // Transmisión
  'automatica': ['automatico', 'automatic', 'cvt', 'tiptronic', 'at'],
  'mecanico': ['manual', 'mecanico', 'mt'],
  // Lujo
  'lujo': ['premium', 'luxury'],
  'premium': ['premium', 'luxury', 'full'],
  'full': ['full', 'full equipo', 'equipado'],
  'equipado': ['full', 'full equipo', 'equipado'],
};

// Mapeo de términos coloquiales a valores de BD
const TERM_TO_DB_VALUES: Record<string, string[]> = {
  // Categorías (nombres exactos que podrían estar en la BD)
  'suv': ['SUV', 'Suv', 'suv', 'CROSSOVER', 'Crossover', 'crossover'],
  'crossover': ['SUV', 'Suv', 'suv', 'CROSSOVER', 'Crossover', 'crossover'],
  'sedan': ['Sedan', 'SEDAN', 'sedan', 'Sedán'],
  'hatchback': ['Hatchback', 'HATCHBACK', 'hatchback'],
  'citycar': ['Hatchback', 'HATCHBACK', 'hatchback', 'City Car'],
  'pickup': ['Pickup', 'PICKUP', 'pickup', 'Pick-up', 'Pick Up', 'Camioneta'],
  'van': ['Van', 'VAN', 'van', 'Minivan', 'MINIVAN'],
  'coupe': ['Coupe', 'COUPE', 'coupe', 'Coupé'],
  'wagon': ['Wagon', 'WAGON', 'wagon', 'Station Wagon'],
  'furgon': ['Furgón', 'Furgon', 'FURGON', 'Van'],
  // Condiciones
  'nuevo': ['Nuevo', 'NUEVO', 'nuevo', 'New', '0 km', '0km'],
  'seminuevo': ['Seminuevo', 'SEMINUEVO', 'seminuevo', 'Semi-nuevo', 'Semi Nuevo'],
  'usado': ['Usado', 'USADO', 'usado', 'Used'],
  // Transmisión
  'automatico': ['Automático', 'Automatico', 'AUTOMATICO', 'Automatic', 'automatica', 'Automática', 'CVT', 'Tiptronic', 'AT'],
  'manual': ['Manual', 'MANUAL', 'manual', 'Mecánico', 'Mecanico', 'MT'],
  // Combustible
  'bencina': ['Bencina', 'BENCINA', 'bencina', 'Gasolina', 'GASOLINA', 'Nafta'],
  'diesel': ['Diesel', 'DIESEL', 'diesel', 'Diésel', 'Petrolero'],
  'electrico': ['Eléctrico', 'Electrico', 'ELECTRICO', 'Electric', 'EV'],
  'hibrido': ['Híbrido', 'Hibrido', 'HIBRIDO', 'Hybrid', 'PHEV', 'HEV'],
  'gnc': ['GNC', 'Gas', 'GLP'],
  // Colores
  'blanco': ['Blanco', 'BLANCO', 'blanco', 'White', 'Perla', 'Perlado'],
  'negro': ['Negro', 'NEGRO', 'negro', 'Black'],
  'gris': ['Gris', 'GRIS', 'gris', 'Plata', 'Plateado', 'Silver', 'Grey', 'Gray'],
  'plata': ['Gris', 'GRIS', 'gris', 'Plata', 'Plateado', 'Silver'],
  'rojo': ['Rojo', 'ROJO', 'rojo', 'Red', 'Bordó', 'Bordo', 'Granate'],
  'azul': ['Azul', 'AZUL', 'azul', 'Blue', 'Marino', 'Celeste', 'Navy'],
  'verde': ['Verde', 'VERDE', 'verde', 'Green', 'Oliva'],
  'cafe': ['Café', 'Cafe', 'CAFE', 'Marrón', 'Marron', 'Brown', 'Beige', 'Camel'],
  'amarillo': ['Amarillo', 'AMARILLO', 'amarillo', 'Yellow', 'Dorado', 'Gold'],
  'naranja': ['Naranja', 'NARANJA', 'naranja', 'Orange'],
  'morado': ['Morado', 'Púrpura', 'Purpura', 'Violeta', 'Purple'],
};

// Frases compuestas que deben normalizarse
const COMPOUND_PHRASES: Record<string, string> = {
  'semi nuevo': 'seminuevo', 'semi nueva': 'seminuevo',
  'poco uso': 'seminuevo', 'poco kilometraje': 'seminuevo',
  'como nuevo': 'seminuevo', 'como nueva': 'seminuevo',
  'cero km': 'nuevo', '0 km': 'nuevo', '0km': 'nuevo',
  'segunda mano': 'usado', 'de segunda': 'usado',
  'doble cabina': 'pickup', 'cabina doble': 'pickup',
  'station wagon': 'wagon', 'station': 'wagon',
  'pick up': 'pickup', 'pick-up': 'pickup',
  'grand cherokee': 'grandcherokee', 'santa fe': 'santafe', 'great wall': 'greatwall',
  'cero emisiones': 'electrico', 'full electric': 'electrico',
  'plug in': 'hibrido', 'plug-in': 'hibrido',
  'full equipo': 'full', 'full equipado': 'full',
  'todo terreno': 'todoterreno', 'todo-terreno': 'todoterreno',
  'mercedes benz': 'mercedesbenz', 'land rover': 'landrover', 'range rover': 'rangerover',
  'alfa romeo': 'alfaromeo', 'aston martin': 'astonmartin', 'rolls royce': 'rollsroyce',
};

// Pre-procesar query
const preprocessQuery = (query: string): string => {
  let processed = normalizeText(query);
  for (const [phrase, replacement] of Object.entries(COMPOUND_PHRASES)) {
    const normalizedPhrase = normalizeText(phrase);
    if (processed.includes(normalizedPhrase)) {
      processed = processed.replace(new RegExp(normalizedPhrase, 'g'), replacement);
    }
  }
  return processed;
};

// Expandir un término a sus posibles significados
const expandTerm = (term: string): string[] => {
  const normalized = normalizeText(term);
  const expansions = TERM_EXPANSIONS[normalized];
  if (expansions) {
    return [normalized, ...expansions];
  }
  return [normalized];
};

// Verificar si un valor de campo coincide con un término (con fuzzy matching)
const fieldMatchesTerm = (fieldValue: string, searchTerm: string): boolean => {
  if (!fieldValue || !searchTerm) return false;

  const normalizedField = normalizeText(fieldValue);
  const normalizedTerm = normalizeText(searchTerm);

  // Match exacto
  if (normalizedField === normalizedTerm) return true;
  if (normalizedField.includes(normalizedTerm) && normalizedTerm.length >= 3) return true;
  if (normalizedField.startsWith(normalizedTerm) && normalizedTerm.length >= 2) return true;

  // Fuzzy match para términos largos
  if (normalizedTerm.length >= 4 && normalizedField.length >= 4) {
    if (isFuzzyMatch(normalizedField, normalizedTerm, 0.8)) return true;
  }

  // Verificar si el término tiene valores de BD mapeados
  const dbValues = TERM_TO_DB_VALUES[normalizedTerm];
  if (dbValues) {
    for (const dbVal of dbValues) {
      if (normalizeText(dbVal) === normalizedField || normalizedField.includes(normalizeText(dbVal))) {
        return true;
      }
    }
  }

  // Verificar mapeo inverso: el campo puede tener un valor de BD que corresponde al término
  for (const [term, values] of Object.entries(TERM_TO_DB_VALUES)) {
    if (values.some(v => normalizeText(v) === normalizedField)) {
      if (term === normalizedTerm) return true;
      // También verificar si el término buscado expande a este term
      const expansions = expandTerm(searchTerm);
      if (expansions.includes(term)) return true;
    }
  }

  return false;
};

// Verificar match considerando expansiones y fuzzy matching para marcas
const fieldMatchesWithExpansion = (fieldValue: string, searchTerm: string, fieldType: string): boolean => {
  // Para marcas, intentar corrección de errores de tipeo primero
  if (fieldType === 'brand') {
    const correctedBrand = findBestBrandMatch(searchTerm);
    if (correctedBrand) {
      if (isFuzzyMatch(fieldValue, correctedBrand, 0.85)) {
        return true;
      }
    }
  }

  const expandedTerms = expandTerm(searchTerm);
  for (const term of expandedTerms) {
    if (fieldMatchesTerm(fieldValue, term)) {
      return true;
    }
  }
  return false;
};

// Obtener campos buscables del vehículo con pesos
const getSearchableFields = (vehicle: Vehicle): { field: string; value: string; weight: number; type: string }[] => {
  return [
    { field: 'brand', value: vehicle.brand?.name || '', weight: 50, type: 'brand' },
    { field: 'model', value: vehicle.model?.name || '', weight: 45, type: 'model' },
    { field: 'category', value: vehicle.category?.name || '', weight: 35, type: 'category' },
    { field: 'condition', value: vehicle.condition?.name || '', weight: 35, type: 'condition' },
    { field: 'fuel_type', value: vehicle.fuel_type?.name || '', weight: 30, type: 'fuel' },
    { field: 'transmission', value: vehicle.transmission || '', weight: 30, type: 'transmission' },
    { field: 'color', value: vehicle.color?.name || '', weight: 25, type: 'color' },
    { field: 'year', value: vehicle.year?.toString() || '', weight: 25, type: 'year' },
    { field: 'title', value: vehicle.title || '', weight: 20, type: 'text' },
    { field: 'label', value: vehicle.label || '', weight: 15, type: 'text' },
    { field: 'description', value: vehicle.description || '', weight: 10, type: 'text' },
    ...(vehicle.features || []).map(f => ({ field: 'feature', value: f, weight: 15, type: 'feature' })),
  ].filter(f => f.value);
};

// Calcular score de relevancia usando expansiones y fuzzy matching
const calculateRelevanceScore = (vehicle: Vehicle, searchTerms: string[]): number => {
  const fields = getSearchableFields(vehicle);
  let totalScore = 0;
  let matchedTermsCount = 0;

  for (const term of searchTerms) {
    let termMatched = false;
    let bestMatchScore = 0;

    for (const field of fields) {
      // Usar fieldMatchesWithExpansion con tipo de campo para fuzzy matching de marcas
      if (fieldMatchesWithExpansion(field.value, term, field.type)) {
        bestMatchScore = Math.max(bestMatchScore, field.weight);
        termMatched = true;
      }
    }

    if (termMatched) {
      totalScore += bestMatchScore;
      matchedTermsCount++;
    }
  }

  // Si no coincide ningún término, score 0
  if (matchedTermsCount === 0) return 0;

  // Bonus por coincidencia de todos los términos
  if (matchedTermsCount === searchTerms.length && searchTerms.length > 1) {
    totalScore += 25;
  }

  // Bonus proporcional por porcentaje de términos encontrados
  const matchRatio = matchedTermsCount / searchTerms.length;
  totalScore = totalScore * (0.5 + matchRatio * 0.5);

  return totalScore;
};

// ============================================
// BÚSQUEDA NEGATIVA - Excluir términos
// ============================================
const NEGATIVE_PREFIXES = ['no', 'sin', 'except', 'excepto', 'menos', '-'];

// Extraer términos negativos del query
const extractNegativeTerms = (query: string): { negativeTerms: string[], cleanedQuery: string } => {
  const negativeTerms: string[] = [];
  let cleanedQuery = query;

  // Patrón para "no X", "sin X", etc.
  for (const prefix of NEGATIVE_PREFIXES) {
    const regex = new RegExp(`\\b${prefix}\\s+(\\w+)`, 'gi');
    let match;
    while ((match = regex.exec(query)) !== null) {
      negativeTerms.push(normalizeText(match[1]));
      cleanedQuery = cleanedQuery.replace(match[0], ' ');
    }
  }

  // Patrón para "-término" (sin espacio)
  const dashRegex = /-(\w+)/g;
  let dashMatch;
  while ((dashMatch = dashRegex.exec(query)) !== null) {
    negativeTerms.push(normalizeText(dashMatch[1]));
    cleanedQuery = cleanedQuery.replace(dashMatch[0], ' ');
  }

  return { negativeTerms, cleanedQuery: cleanedQuery.replace(/\s+/g, ' ').trim() };
};

// Verificar si un vehículo debe ser excluido por términos negativos
const vehicleMatchesNegativeTerm = (vehicle: Vehicle, negativeTerms: string[]): boolean => {
  if (negativeTerms.length === 0) return false;

  const fields = getSearchableFields(vehicle);

  for (const negativeTerm of negativeTerms) {
    for (const field of fields) {
      if (fieldMatchesWithExpansion(field.value, negativeTerm, field.type)) {
        return true; // El vehículo debe ser excluido
      }
    }
  }

  return false;
};

// ============================================
// BÚSQUEDA POR CARACTERÍSTICAS
// ============================================
const FEATURE_PATTERNS: Record<string, string[]> = {
  'sunroof': ['sunroof', 'techo solar', 'techo panoramico', 'panoramic'],
  'camara': ['camara', 'camera', 'retroceso', 'reversa', '360'],
  'cuero': ['cuero', 'leather', 'piel'],
  'navegador': ['navegador', 'gps', 'navigation', 'nav'],
  'bluetooth': ['bluetooth', 'bt', 'handsfree'],
  'climatizador': ['climatizador', 'clima', 'ac', 'aire acondicionado', 'air conditioning'],
  'sensores': ['sensores', 'sensor', 'parking', 'estacionamiento'],
  'cruise': ['cruise', 'control crucero', 'velocidad crucero'],
  'asientos calefaccionados': ['asientos calefaccionados', 'heated seats', 'calefaccion'],
  'apple carplay': ['carplay', 'apple carplay', 'android auto'],
  'led': ['led', 'xenon', 'luces led'],
  'llantas': ['llantas', 'rines', 'aros', 'wheels'],
  'turbo': ['turbo', 'turbocharged', 'biturbo'],
  '7 asientos': ['7 asientos', '7 plazas', 'tercera fila', '7 pasajeros'],
};

// Extraer búsqueda por características
const extractFeatureSearch = (query: string): { features: string[], cleanedQuery: string } => {
  const features: string[] = [];
  let cleanedQuery = normalizeText(query);

  // Patrones "con X"
  const withRegex = /\b(?:con|tiene|incluye|with)\s+(\w+(?:\s+\w+)?)/gi;
  let match;
  while ((match = withRegex.exec(query)) !== null) {
    const featureTerm = normalizeText(match[1]);
    features.push(featureTerm);
    cleanedQuery = cleanedQuery.replace(normalizeText(match[0]), ' ');
  }

  return { features, cleanedQuery: cleanedQuery.replace(/\s+/g, ' ').trim() };
};

// Verificar si un vehículo tiene una característica
const vehicleHasFeature = (vehicle: Vehicle, featureTerm: string): boolean => {
  const vehicleFeatures = vehicle.features || [];
  const description = vehicle.description || '';
  const title = vehicle.title || '';

  // Buscar en las características del vehículo
  const allText = [
    ...vehicleFeatures,
    description,
    title,
  ].join(' ').toLowerCase();

  const normalizedFeature = normalizeText(featureTerm);

  // Verificar match directo
  if (allText.includes(normalizedFeature)) return true;

  // Verificar patrones de características conocidas
  for (const [key, patterns] of Object.entries(FEATURE_PATTERNS)) {
    if (patterns.some(p => normalizeText(p).includes(normalizedFeature) || normalizedFeature.includes(normalizeText(p)))) {
      // Si el término coincide con un patrón conocido, buscar cualquiera de sus variantes
      if (patterns.some(p => allText.includes(normalizeText(p)))) {
        return true;
      }
    }
  }

  return false;
};

// ============================================
// GENERAR SUGERENCIAS DE BÚSQUEDA
// ============================================
const generateSearchSuggestions = (vehicles: Vehicle[], query: string): string[] => {
  const suggestions: string[] = [];
  const normalized = normalizeText(query);

  // Obtener marcas y modelos únicos
  const uniqueBrands = [...new Set(vehicles.map(v => v.brand?.name).filter(Boolean))];
  const uniqueModels = [...new Set(vehicles.map(v => v.model?.name).filter(Boolean))];
  const uniqueCategories = [...new Set(vehicles.map(v => v.category?.name).filter(Boolean))];
  const uniqueColors = [...new Set(vehicles.map(v => v.color?.name).filter(Boolean))];

  // Sugerir marcas similares
  for (const brand of uniqueBrands) {
    if (brand && isFuzzyMatch(normalized, brand, 0.6)) {
      suggestions.push(brand);
    }
  }

  // Sugerir modelos similares
  for (const model of uniqueModels) {
    if (model && isFuzzyMatch(normalized, model, 0.6)) {
      suggestions.push(model);
    }
  }

  // Sugerir categorías si hay expansión
  const expansions = TERM_EXPANSIONS[normalized];
  if (expansions) {
    for (const category of uniqueCategories) {
      if (category && expansions.some(e => normalizeText(category).includes(e))) {
        suggestions.push(category);
      }
    }
  }

  // Limitar a 5 sugerencias únicas
  return [...new Set(suggestions)].slice(0, 5);
};

// ============================================
// AUTOCOMPLETADO INTELIGENTE
// ============================================
const generateAutocomplete = (vehicles: Vehicle[], partialQuery: string): string[] => {
  if (!partialQuery || partialQuery.length < 2) return [];

  const normalized = normalizeText(partialQuery);
  const suggestions: Set<string> = new Set();

  // Marcas que empiezan con el query
  vehicles.forEach(v => {
    if (v.brand?.name && normalizeText(v.brand.name).startsWith(normalized)) {
      suggestions.add(v.brand.name);
    }
    if (v.model?.name && normalizeText(v.model.name).startsWith(normalized)) {
      suggestions.add(`${v.brand?.name || ''} ${v.model.name}`.trim());
    }
  });

  // Correcciones de marcas
  const correctedBrand = findBestBrandMatch(partialQuery);
  if (correctedBrand) {
    const matchingVehicle = vehicles.find(v =>
      v.brand?.name && normalizeText(v.brand.name).includes(correctedBrand)
    );
    if (matchingVehicle?.brand?.name) {
      suggestions.add(matchingVehicle.brand.name);
    }
  }

  // Sugerencias de categorías por términos coloquiales
  const termExpansion = TERM_EXPANSIONS[normalized];
  if (termExpansion) {
    termExpansion.forEach(expansion => {
      const category = vehicles.find(v =>
        v.category?.name && normalizeText(v.category.name).includes(expansion)
      )?.category?.name;
      if (category) suggestions.add(category);
    });
  }

  // Sugerencias de búsquedas comunes
  const commonSearches = [
    'SUV automática',
    'Sedan económico',
    'Camioneta 4x4',
    'Auto familiar',
    'Bajo 15 millones',
    '2020 o más nuevo',
  ];

  commonSearches.forEach(search => {
    if (normalizeText(search).includes(normalized)) {
      suggestions.add(search);
    }
  });

  return [...suggestions].slice(0, 8);
};

// Búsqueda inteligente v4.0
const smartSearch = (vehicles: Vehicle[], query: string): Vehicle[] => {
  if (!query.trim()) return vehicles;

  // PASO 0: Extraer términos negativos
  const { negativeTerms, cleanedQuery: queryWithoutNegatives } = extractNegativeTerms(query);

  // PASO 0.5: Extraer búsqueda por características
  const { features, cleanedQuery: queryWithoutFeatures } = extractFeatureSearch(queryWithoutNegatives);

  // PASO 1: Extraer filtros numéricos (precio, año, kilometraje)
  const { filters: numericFilters, cleanedQuery } = extractNumericFilters(queryWithoutFeatures);

  // Pre-filtrar por filtros numéricos
  let filteredVehicles = vehicles;
  if (numericFilters.length > 0) {
    filteredVehicles = vehicles.filter(v => vehicleMatchesNumericFilters(v, numericFilters));
  }

  // Aplicar filtros negativos
  if (negativeTerms.length > 0) {
    filteredVehicles = filteredVehicles.filter(v => !vehicleMatchesNegativeTerm(v, negativeTerms));
  }

  // Aplicar filtros de características
  if (features.length > 0) {
    filteredVehicles = filteredVehicles.filter(v =>
      features.every(feature => vehicleHasFeature(v, feature))
    );
  }

  // Si solo había filtros especiales y no hay más términos, devolver filtrados
  if (!cleanedQuery.trim()) {
    return filteredVehicles;
  }

  // PASO 2: Pre-procesar para detectar frases compuestas
  const processedQuery = preprocessQuery(cleanedQuery);

  // Extraer términos (palabras de 2+ caracteres, excluyendo stopwords)
  const allTerms = processedQuery
    .split(/\s+/)
    .filter(term => term.length >= 2);

  // Filtrar stopwords
  const searchTerms = allTerms.filter(term => !STOPWORDS.has(term));

  // Si después de filtrar no quedan términos, devolver filtrados por numéricos
  if (searchTerms.length === 0) return filteredVehicles;

  // PASO 3: Calcular scores con fuzzy matching
  const scoredVehicles = filteredVehicles.map(vehicle => ({
    vehicle,
    score: calculateRelevanceScore(vehicle, searchTerms),
  }));

  // Filtrar y ordenar por relevancia
  return scoredVehicles
    .filter(sv => sv.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(sv => sv.vehicle);
};

const CATEGORY_ICONS: Record<string, string> = {
  all: 'mdi:car-multiple',
  SUV: 'mdi:car-suv',
  Sedan: 'mdi:car',
  Hatchback: 'mdi:car-hatchback',
  Pickup: 'mdi:truck-pickup',
  Van: 'mdi:van-passenger',
  Coupe: 'mdi:car-sports',
  Wagon: 'mdi:car-estate',
};

interface NewVehiclesSectionProps {
  /** Ocultar título y buscador (para landing page) */
  minimal?: boolean;
}

const NewVehiclesSection = ({ minimal = false }: NewVehiclesSectionProps) => {
  const { theme } = useThemeStore();
  const { vehicles, isLoading } = useVehiclesStore();
  const { client } = useClientStore();
  const isMd = useMediaQuery('(min-width: 768px)');
  const { t } = useTranslation();

  // Extract unique values for filters
  const brands = useMemo(() => {
    const uniqueBrands = new Map();
    vehicles.forEach((v) => {
      if (v.brand?.id && v.brand?.name) {
        uniqueBrands.set(v.brand.id, v.brand);
      }
    });
    return Array.from(uniqueBrands.values());
  }, [vehicles]);

  const models = useMemo(() => {
    const uniqueModels = new Map();
    vehicles.forEach((v) => {
      if (v.model?.id && v.model?.name) {
        uniqueModels.set(v.model.id, { ...v.model, brand_id: v.brand?.id });
      }
    });
    return Array.from(uniqueModels.values());
  }, [vehicles]);

  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    vehicles.forEach((v) => {
      if (v.category?.id && v.category?.name) {
        uniqueCategories.set(v.category.id, v.category);
      }
    });
    return Array.from(uniqueCategories.values());
  }, [vehicles]);

  const fuelTypes = useMemo(() => {
    const uniqueFuelTypes = new Map();
    vehicles.forEach((v) => {
      if (v.fuel_type?.id && v.fuel_type?.name) {
        uniqueFuelTypes.set(v.fuel_type.id, v.fuel_type);
      }
    });
    return Array.from(uniqueFuelTypes.values());
  }, [vehicles]);

  const conditions = useMemo(() => {
    const uniqueConditions = new Map();
    vehicles.forEach((v) => {
      if (v.condition?.id && v.condition?.name) {
        uniqueConditions.set(v.condition.id, v.condition);
      }
    });
    return Array.from(uniqueConditions.values());
  }, [vehicles]);

  const colors = useMemo(() => {
    const uniqueColors = new Map();
    vehicles.forEach((v) => {
      if (v.color?.id && v.color?.name) {
        uniqueColors.set(v.color.id, v.color);
      }
    });
    return Array.from(uniqueColors.values());
  }, [vehicles]);

  const availableYears = useMemo(() => {
    return [...new Set(vehicles.map((v) => v.year).filter(Boolean))]
      .map(String)
      .sort((a, b) => b.localeCompare(a));
  }, [vehicles]);

  // Calcular el precio máximo real de todos los vehículos disponibles
  const maxPrice = Math.max(
    ...vehicles
      .filter((v) => v.price && v.price > 0) // Only filter by having a valid price
      .map((v) => v.price || 0)
  );

  // Estado de filtros global con Zustand
  const {
    filters,
    priceRange,
    sortOrder,
    searchQuery,
    setPriceRange,
    setSortOrder,
    setSearchQuery,
    clearFilters,
  } = useVehicleFiltersStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const activeView = 'grid'; // Fixed to grid view

  // Generar autocompletado cuando cambia el query
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const suggestions = generateAutocomplete(vehicles, searchQuery);
      setAutocompleteResults(suggestions);
      setShowAutocomplete(suggestions.length > 0);
    } else {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
    }
  }, [searchQuery, vehicles]);

    // Localized categories and sort options
  // Obtener categorías que tienen vehículos
  const categoriesWithVehicles = useMemo(() => {
    const categorySet = new Set<string>();
    vehicles.forEach(v => {
      if (v.category?.name) {
        categorySet.add(v.category.name);
      }
    });
    return categorySet;
  }, [vehicles]);

  const allCategories = [
    { id: 'all', name: t('vehicles.categories.all'), icon: CATEGORY_ICONS.all, description: t('vehicles.categoryDescriptions.all') },
    { id: 'SUV', name: t('vehicles.categories.suv'), icon: CATEGORY_ICONS.SUV, description: t('vehicles.categoryDescriptions.suv') },
    { id: 'Sedan', name: t('vehicles.categories.sedan'), icon: CATEGORY_ICONS.Sedan, description: t('vehicles.categoryDescriptions.sedan') },
    { id: 'Hatchback', name: t('vehicles.categories.hatchback'), icon: CATEGORY_ICONS.Hatchback, description: t('vehicles.categoryDescriptions.hatchback') },
    { id: 'Pickup', name: t('vehicles.categories.pickup'), icon: CATEGORY_ICONS.Pickup, description: t('vehicles.categoryDescriptions.pickup') },
    { id: 'Van', name: t('vehicles.categories.van'), icon: CATEGORY_ICONS.Van, description: t('vehicles.categoryDescriptions.van') },
    { id: 'Coupe', name: t('vehicles.categories.coupe'), icon: CATEGORY_ICONS.Coupe, description: t('vehicles.categoryDescriptions.coupe') },
    { id: 'Wagon', name: t('vehicles.categories.wagon'), icon: CATEGORY_ICONS.Wagon, description: t('vehicles.categoryDescriptions.wagon') },
  ];

  // Filtrar solo categorías que tienen vehículos (siempre mostrar "all")
  const vehicleCategories = allCategories.filter(cat =>
    cat.id === 'all' || categoriesWithVehicles.has(cat.id)
  );

  const sortOptions = [
    { key: 'date_desc', label: t('vehicles.sorting.dateDesc'), icon: 'mdi:clock-outline' },
    { key: 'date_asc', label: t('vehicles.sorting.dateAsc'), icon: 'mdi:clock' },
    { key: 'price_asc', label: t('vehicles.sorting.priceAsc'), icon: 'mdi:sort-ascending' },
    { key: 'price_desc', label: t('vehicles.sorting.priceDesc'), icon: 'mdi:sort-descending' },
    { key: 'year_desc', label: t('vehicles.sorting.yearDesc'), icon: 'mdi:calendar' },
    { key: 'year_asc', label: t('vehicles.sorting.yearAsc'), icon: 'mdi:calendar-outline' },
    { key: 'mileage_asc', label: t('vehicles.sorting.mileageAsc'), icon: 'mdi:speedometer-slow' },
  ];

  const clearAllFilters = () => {
    clearFilters(maxPrice);
    setSelectedCategory('all');
  };

  // Filtrado de vehículos usando búsqueda inteligente local
  const filteredVehicles = useMemo(() => {
    // PASO 1: Aplicar búsqueda inteligente (si hay query)
    let result = searchQuery.trim() !== ''
      ? smartSearch(vehicles, searchQuery)
      : vehicles;

    // Helper para verificar si un valor está en un filtro (soporta arrays y strings)
    const matchesFilter = (filterValue: string | string[] | undefined, vehicleValue: string | undefined): boolean => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true;
      if (!vehicleValue) return false;
      if (Array.isArray(filterValue)) {
        return filterValue.includes(vehicleValue);
      }
      return filterValue === vehicleValue;
    };

    // PASO 2: Aplicar filtros adicionales
    result = result.filter((vehicle) => {
      let matches = true;

      // Category from tabs
      if (
        selectedCategory !== 'all' &&
        vehicle?.category?.name.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        matches = false;
      }

      // Filters from sidebar (ahora soportan multi-select)
      if (!matchesFilter(filters.brand, vehicle?.brand?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.model, vehicle?.model?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.category, vehicle?.category?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.fuel_type, vehicle?.fuel_type?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.condition, vehicle?.condition?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.color, vehicle?.color?.id?.toString())) {
        matches = false;
      }

      if (!matchesFilter(filters.year, vehicle?.year?.toString())) {
        matches = false;
      }

      if (vehicle?.price < priceRange[0] || vehicle?.price > priceRange[1]) {
        matches = false;
      }

      return matches;
    });

    // PASO 3: Ordenar (solo si NO hay búsqueda activa, ya que smartSearch ya ordena por relevancia)
    if (searchQuery.trim() === '') {
      result = [...result].sort((a, b) => {
        switch (sortOrder) {
          case 'date_desc':
            return (
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
            );
          case 'date_asc':
            return (
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime()
            );
          case 'price_asc':
            return (a.price || 0) - (b.price || 0);
          case 'price_desc':
            return (b.price || 0) - (a.price || 0);
          case 'year_desc':
            return (b.year || 0) - (a.year || 0);
          case 'year_asc':
            return (a.year || 0) - (b.year || 0);
          case 'mileage_asc':
            return (a.mileage || 0) - (b.mileage || 0);
          default:
            return (
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime()
            );
        }
      });
    }

    return result;
  }, [vehicles, searchQuery, selectedCategory, filters, priceRange, sortOrder]);

  // Generar sugerencias cuando no hay resultados
  const noResultsSuggestions = useMemo(() => {
    if (filteredVehicles.length === 0 && searchQuery.trim()) {
      return generateSearchSuggestions(vehicles, searchQuery);
    }
    return [];
  }, [filteredVehicles.length, searchQuery, vehicles]);

  const activeFiltersCount =
    Object.keys(filters).length +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (sortOrder !== 'date_desc' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const selectedCategoryData = vehicleCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const whatsappNumber = client?.contact
    ? formatWhatsAppNumber(client.contact)
    : '56996366455';

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  // Estado para controlar la visibilidad de los botones flotantes en móvil
  const [showMobileButtons, setShowMobileButtons] = useState(false);

  // Detectar si estamos dentro de la sección de vehículos
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('vehicles-section');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      // Mostrar botones cuando la sección está visible y hemos scrolleado un poco dentro
      const isInSection = sectionTop < windowHeight * 0.7 && sectionBottom > windowHeight * 0.3;

      setShowMobileButtons(isInSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (maxPrice > 0 && priceRange[1] === 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice]);

  return (
    <div id='vehicles-section' className='min-h-screen bg-slate-50/50 dark:bg-dark-bg'>
      {/* Botón de WhatsApp - Siempre visible, derecha */}
      <a
        href={whatsappUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='fixed bottom-6 right-6 z-[99999] p-3 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200'
      >
        <Icon icon='logos:whatsapp-icon' className='text-xl' />
      </a>

      {/* Botón de Filtros móvil - Solo visible en sección vehículos, izquierda */}
      <button
        onClick={onOpen}
        className={`md:hidden fixed bottom-6 left-6 z-[99999] flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#0B0B0F] rounded-full border border-slate-200 dark:border-neutral-700 shadow-lg hover:shadow-xl transition-all duration-300 ${
          showMobileButtons
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <Icon icon='solar:filter-linear' className='text-lg text-primary' />
        <span className='text-sm font-medium text-gray-700 dark:text-white'>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className='w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium'>
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Fixed Categories Navigation */}
      <div className='sticky top-[var(--navbar-height)] z-30 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2'>
          <div className='flex flex-col gap-2'>
            {/* Title and Actions - Oculto en modo minimal */}
            {!minimal && (
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                      {selectedCategoryData?.name || t('vehicles.categories.all')}

                      <Chip size='sm' variant='flat' color='primary'>
                        {filteredVehicles.length}
                      </Chip>
                    </h1>

                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      {selectedCategoryData?.description || t('home.featuredVehicles.subtitle')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}

            <ScrollShadow orientation='horizontal' className='w-full'>
              <div className='flex justify-start lg:justify-center items-center w-full'>
                <div className='flex gap-2 pt-2 pb-2 min-w-max'>
                  {vehicleCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? 'solid' : 'light'
                      }
                      color={
                        selectedCategory === category.id ? 'primary' : 'default'
                      }
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap hover:-translate-y-0.5 transition-all px-4 py-2 rounded-full ${
                        selectedCategory === category.id ? 'shadow-md' : ''
                      } ${selectedCategory === category.id && theme === 'dark' ? 'text-black' : ''}`}
                      startContent={
                        <Icon icon={category.icon} className='text-xl' />
                      }
                      size='md'
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollShadow>
          </div>
        </div>
      </div>

      {/* Search Bar - Oculto en modo minimal */}
      {!minimal && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-1 sm:mb-2 flex flex-col sm:flex-row gap-2 sm:gap-4'>
          {/* Buscador con Autocompletado */}
          <div className='w-full sm:flex-[3] relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10'
              size={16}
            />
            <Input
              type='text'
              placeholder={t('pages.vehicles.searchPlaceholder')}
              className='
                pl-12 pr-10 py-2 min-h-[36px]
                rounded-xl
                border border-slate-300
                bg-slate-100 dark:bg-neutral-800 dark:border-neutral-700
                text-sm text-gray-700 dark:text-gray-200
                shadow-md
                focus:border-primary focus:ring-2 focus:ring-primary
                transition-all
                w-full
                max-w-xxl
              '
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowAutocomplete(autocompleteResults.length > 0)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            />
            {/* Botón para limpiar búsqueda */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
              >
                <Icon icon='mdi:close-circle' className='text-lg' />
              </button>
            )}

            {/* Dropdown de Autocompletado */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 overflow-hidden'>
                <div className='py-1'>
                  {autocompleteResults.map((suggestion, index) => (
                    <button
                      key={index}
                      className='w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 dark:hover:bg-primary/20 flex items-center gap-3 transition-colors'
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowAutocomplete(false);
                      }}
                    >
                      <Icon icon='mdi:magnify' className='text-gray-400 text-base' />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
                {/* Tip de búsqueda */}
                <div className='px-4 py-2 bg-slate-50 dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-700'>
                  <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5'>
                    <Icon icon='mdi:lightbulb-outline' className='text-yellow-500' />
                    Prueba: "bajo 15 millones", "no diesel", "con sunroof"
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Selector de orden */}
          <div className='w-full sm:flex-1 min-w-[80px] flex mt-2 sm:mt-0 -mb-4'>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant='light'
                  startContent={<Icon icon='mdi:sort' className='text-base' />}
                  className='w-full flex items-center gap-x-1 px-3 py-2 min-h-[36px] text-sm shadow-none bg-transparent border-none hover:bg-slate-100 focus:bg-slate-100 transition-colors'
                >
                  {sortOptions.find((option) => option.key === sortOrder)?.label ||
                    t('pages.vehicles.orderBy')}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode='single'
                selectedKeys={new Set([sortOrder])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected) setSortOrder(selected.toString());
                }}
              >
                {sortOptions.map((option) => (
                  <DropdownItem
                    key={option.key}
                    startContent={<Icon icon={option.icon} className='text-xl' />}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      )}

      {/* Main Content */}

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20'>
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Filtro en desktop - sticky y colapsable */}
          {isMd && !isFiltersCollapsed && (
            <aside className='w-72 shrink-0'>
              <div className='sticky top-24'>
                <div className='max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden'>
                  <NewVehicleFilters
                    brands={brands}
                    models={models}
                    categories={categories}
                    fuelTypes={fuelTypes}
                    conditions={conditions}
                    colors={colors}
                    initialOpenAccordion={filters.color ? 'color' : undefined}
                    availableYears={availableYears}
                    maxPrice={maxPrice}
                    isCollapsed={isFiltersCollapsed}
                    onToggleCollapse={() => setIsFiltersCollapsed(true)}
                  />
                </div>
              </div>
            </aside>
          )}

          {/* Botón para expandir filtros cuando están colapsados */}
          {isMd && isFiltersCollapsed && (
            <button
              onClick={() => setIsFiltersCollapsed(false)}
              className='sticky top-24 h-fit shrink-0 p-3 bg-white dark:bg-[#0B0B0F] rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 flex flex-col items-center gap-2'
              aria-label='Mostrar filtros'
            >
              <Icon icon='solar:filter-linear' className='text-xl text-primary' />
              {activeFiltersCount > 0 && (
                <span className='w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium'>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}

          {/* Vehicles Content */}

          <div className='flex-1 min-w-0'>
            {/* Vehicle Cards */}

            <div
              className={`grid gap-4 sm:gap-5 transition-all duration-500 ${
                activeView === 'grid'
                  ? isFiltersCollapsed
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              } mx-auto`}
            >
              {isLoading
                ? Array(6)
                    .fill(null)

                    .map((_, index) => <VehicleCardSkeleton key={index} />)
                : filteredVehicles.map((vehicle) =>
                    activeView === 'grid' ? (
                      <VehicleVerticalCard key={vehicle.id} vehicle={vehicle} />
                    ) : (
                      <VehicleHorizontalCard
                        key={vehicle.id}
                        vehicle={vehicle}
                      />
                    )
                  )}
            </div>

            {/* No Results State - Mejorado con sugerencias inteligentes */}

            {!isLoading && filteredVehicles.length === 0 && (
              <div className='text-center py-12 max-w-md mx-auto'>
                <div className='w-20 h-20 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <Icon
                    icon='mdi:car-search'
                    className='text-4xl text-gray-400 dark:text-gray-500'
                  />
                </div>

                <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                  {t('vehicles.page.noResults')}
                </h3>

                <p className='text-gray-500 dark:text-gray-400 mb-6'>
                  {searchQuery.trim()
                    ? `No encontramos vehículos para "${searchQuery}"`
                    : t('vehicles.page.noResultsDescription')
                  }
                </p>

                {/* Sugerencias inteligentes */}
                {noResultsSuggestions.length > 0 && (
                  <div className='mb-6'>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mb-3'>
                      ¿Quisiste decir?
                    </p>
                    <div className='flex flex-wrap justify-center gap-2'>
                      {noResultsSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(suggestion)}
                          className='px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-colors'
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips de búsqueda */}
                <div className='bg-slate-50 dark:bg-neutral-800/50 rounded-xl p-4 mb-6 text-left'>
                  <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2'>
                    <Icon icon='mdi:lightbulb-on' className='text-yellow-500' />
                    Tips de búsqueda inteligente
                  </p>
                  <ul className='text-xs text-gray-500 dark:text-gray-400 space-y-2'>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:currency-usd' className='text-green-500 mt-0.5 shrink-0' />
                      <span><strong>"bajo 15 millones"</strong> - Filtra por precio máximo</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:calendar' className='text-blue-500 mt-0.5 shrink-0' />
                      <span><strong>"2020 o más nuevo"</strong> - Filtra por año mínimo</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:close-circle' className='text-red-500 mt-0.5 shrink-0' />
                      <span><strong>"no diesel"</strong> - Excluye un tipo de combustible</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <Icon icon='mdi:star' className='text-purple-500 mt-0.5 shrink-0' />
                      <span><strong>"con sunroof"</strong> - Busca por características</span>
                    </li>
                  </ul>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                  <Button
                    color='primary'
                    variant='solid'
                    onPress={clearAllFilters}
                    startContent={<Icon icon='mdi:refresh' />}
                  >
                    Ver todos los vehículos
                  </Button>
                  <Button
                    color='default'
                    variant='light'
                    onPress={() => setSearchQuery('')}
                    startContent={<Icon icon='mdi:eraser' />}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement='bottom'
        className='bg-white dark:bg-dark-card z-[999999]'
        classNames={{
          base: 'h-[90vh] rounded-t-xl z-[999999]',
          wrapper: 'z-[999999]',
          backdrop: 'z-[999998]',
          header:
            'border-b border-transparent sm:border-gray-200 dark:sm:border-dark-border',
          body: 'p-0',
          footer: 'border-t border-gray-200 dark:border-dark-border px-4 py-4',
        }}
      >
        <DrawerContent>
          <DrawerHeader></DrawerHeader>
          <DrawerBody>
            <ScrollShadow className='h-[calc(100vh-12rem)]'>
              <div className='px-4'>
                <NewVehicleFilters
                  brands={brands}
                  initialOpenAccordion={filters.color ? 'color' : undefined}
                  availableYears={availableYears}
                  maxPrice={maxPrice}
                />
              </div>
            </ScrollShadow>
          </DrawerBody>
          <DrawerFooter>
            <Button color='primary' onPress={onClose} className='w-full'>
              {t('vehicles.filters.applyFilters')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default NewVehiclesSection;
