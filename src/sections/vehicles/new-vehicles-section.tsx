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
// MOTOR DE BÚSQUEDA - VERSIÓN CORREGIDA
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

// Stopwords - palabras comunes que no aportan a la búsqueda
const STOPWORDS = new Set([
  // Artículos
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  // Preposiciones
  'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'hacia',
  // Verbos comunes de búsqueda
  'busco', 'buscar', 'quiero', 'querer', 'necesito', 'necesitar', 'estoy', 'buscando',
  'me', 'interesa', 'gustaria', 'quisiera', 'deseo', 'encuentren', 'muestren', 'muestrame',
  'dame', 'ver', 'mostrar', 'encontrar',
  // Conjunciones y otros
  'y', 'o', 'e', 'u', 'que', 'como', 'pero', 'si', 'no', 'mas', 'muy', 'tan', 'algo',
  // Adjetivos genéricos
  'buen', 'buena', 'bueno', 'buenos', 'buenas', 'mejor', 'mejores', 'bonito', 'bonita',
  'lindo', 'linda', 'bien', 'ideal', 'perfecto', 'perfecta', 'excelente',
  // Otros
  'tipo', 'estilo', 'clase', 'modelo', 'version', 'ano', 'precio', 'costo',
  'tengan', 'tenga', 'sea', 'sean', 'este', 'esta', 'esten',
]);

// Stemming básico español: quitar plurales y variaciones de género
const stemWord = (word: string): string => {
  let stemmed = word;

  // Quitar plurales comunes
  if (stemmed.endsWith('es') && stemmed.length > 3) {
    // "nuevos" no termina en "es", pero "azules" sí
    const withoutEs = stemmed.slice(0, -2);
    // Verificar que no sea una palabra que naturalmente termina en "es"
    if (!['mercedes', 'andes'].includes(stemmed)) {
      stemmed = withoutEs;
    }
  } else if (stemmed.endsWith('s') && stemmed.length > 2) {
    stemmed = stemmed.slice(0, -1);
  }

  // Normalizar variaciones de género (solo para adjetivos comunes)
  // "automatica" -> "automatico", "hibrida" -> "hibrido", etc.
  if (stemmed.endsWith('a') && stemmed.length > 3) {
    const masculine = stemmed.slice(0, -1) + 'o';
    // Solo cambiar si la forma masculina es reconocida
    const knownMasculine = ['automatico', 'hibrido', 'electrico', 'mecanico', 'usado', 'nuevo', 'seminuevo', 'blanco', 'negro', 'rojo', 'azulo', 'plomo'];
    if (knownMasculine.includes(masculine)) {
      stemmed = masculine;
    }
  }

  return stemmed;
};

// Frases compuestas que deben tratarse como una sola unidad (incluir variaciones)
const COMPOUND_PHRASES: Record<string, string> = {
  'semi nuevo': 'seminuevo',
  'semi nueva': 'seminuevo',
  'semi nuevos': 'seminuevo',
  'semi nuevas': 'seminuevo',
  'semi-nuevo': 'seminuevo',
  'semi-nueva': 'seminuevo',
  'seminuevos': 'seminuevo',
  'seminuevas': 'seminuevo',
  'poco uso': 'seminuevo',
  'pocos km': 'seminuevo',
  'pocos kilometros': 'seminuevo',
  'como nuevo': 'seminuevo',
  'como nueva': 'seminuevo',
  'cero km': 'nuevo',
  'cero kilometros': 'nuevo',
  '0 km': 'nuevo',
  '0km': 'nuevo',
  'nuevos': 'nuevo',
  'nuevas': 'nuevo',
  'usados': 'usado',
  'usadas': 'usado',
  'segunda mano': 'usado',
  'doble cabina': 'pickup',
  'station wagon': 'wagon',
  'grand cherokee': 'grandcherokee',
  'santa fe': 'santafe',
  'great wall': 'greatwall',
  'bajo kilometraje': 'bajokilometraje',
  'pocos kms': 'seminuevo',
  // Eléctricos
  'cero emisiones': 'electrico',
  '100% electrico': 'electrico',
  'full electric': 'electrico',
  // Híbridos
  'plug in': 'hibrido',
  'mild hybrid': 'hibrido',
};

// Sinónimos EXACTOS - solo el término canónico y sus variantes
// IMPORTANTE: Incluir singular, plural, masculino y femenino
const EXACT_SYNONYMS: Record<string, string[]> = {
  // Condiciones (MUY IMPORTANTE: separados para no mezclar)
  'nuevo': ['nuevo', 'nueva', 'nuevos', 'nuevas', '0km', 'cero km', 'sin uso', 'recien salido'],
  'seminuevo': ['seminuevo', 'seminueva', 'seminuevos', 'seminuevas', 'semi nuevo', 'semi nueva', 'semi-nuevo', 'poco uso', 'como nuevo', 'como nueva', 'pocos km', 'pocos kms', 'bajo kilometraje'],
  'usado': ['usado', 'usada', 'usados', 'usadas', 'segunda mano', 'de uso', 'con uso'],

  // Transmisión
  'automatico': ['automatico', 'automatica', 'automaticos', 'automaticas', 'automatic', 'tiptronic', 'cvt', 'at'],
  'manual': ['manual', 'manuales', 'mecanico', 'mecanica', 'mecanicos', 'mt', 'stick'],

  // Combustible
  'diesel': ['diesel', 'diesels', 'petroleo', 'gasoil', 'petrolero', 'petrolera', 'td', 'tdi', 'hdi', 'cdti', 'crdi'],
  'bencina': ['bencina', 'bencinero', 'bencinera', 'gasolina', 'gasolinero', 'nafta', 'naftero', 'combustion'],
  'electrico': ['electrico', 'electrica', 'electricos', 'electricas', 'ev', 'evs', 'electric', 'electricity', 'electricidad', 'bateria', 'cero emisiones', '100% electrico', 'full electric', 'bev'],
  'hibrido': ['hibrido', 'hibrida', 'hibridos', 'hibridas', 'hybrid', 'hybrids', 'enchufable', 'enchufables', 'phev', 'hev', 'mild hybrid', 'plug-in', 'plugin'],

  // Categorías
  'suv': ['suv', 'suvs', 'todoterreno', 'todoterrenos', '4x4', 'crossover', 'crossovers'],
  'sedan': ['sedan', 'sedanes', 'sedans', 'berlina', 'berlinas'],
  'hatchback': ['hatchback', 'hatchbacks', 'compacto', 'compacta', 'compactos'],
  'pickup': ['pickup', 'pickups', 'pick up', 'pick-up', 'doble cabina'],
  'camioneta': ['camioneta', 'camionetas'],
  'van': ['van', 'vans', 'minivan', 'minivans', 'furgon', 'furgones', 'monovolumen'],
  'coupe': ['coupe', 'coupes', 'deportivo', 'deportiva', 'deportivos', 'sport', 'sporty'],
  'wagon': ['wagon', 'wagons', 'familiar', 'familiares', 'station wagon', 'estate'],

  // Colores
  'blanco': ['blanco', 'blanca', 'blancos', 'blancas', 'white', 'perla'],
  'negro': ['negro', 'negra', 'negros', 'negras', 'black'],
  'gris': ['gris', 'grises', 'plata', 'plateado', 'plateada', 'silver', 'grey', 'gray'],
  'rojo': ['rojo', 'roja', 'rojos', 'rojas', 'red', 'bordo', 'burdeo', 'carmesi'],
  'azul': ['azul', 'azules', 'blue', 'marino', 'celeste'],
  'verde': ['verde', 'verdes', 'green'],
  'cafe': ['cafe', 'marron', 'brown', 'chocolate', 'beige'],
  'amarillo': ['amarillo', 'amarilla', 'amarillos', 'yellow', 'dorado', 'dorada', 'gold'],
  'naranja': ['naranja', 'naranjo', 'orange'],
};

// Pre-procesar query: reemplazar frases compuestas
const preprocessQuery = (query: string): string => {
  let processed = normalizeText(query);

  // Reemplazar frases compuestas por su forma canónica
  for (const [phrase, replacement] of Object.entries(COMPOUND_PHRASES)) {
    const normalizedPhrase = normalizeText(phrase);
    if (processed.includes(normalizedPhrase)) {
      processed = processed.replace(new RegExp(normalizedPhrase, 'g'), replacement);
    }
  }

  return processed;
};

// Obtener el término canónico para un término de búsqueda
const getCanonicalTerm = (term: string): string | null => {
  const normalized = normalizeText(term);

  for (const [canonical, synonyms] of Object.entries(EXACT_SYNONYMS)) {
    if (synonyms.some(s => normalizeText(s) === normalized)) {
      return canonical;
    }
  }

  return null;
};

// Verificar si un valor de campo coincide con un término de búsqueda
const fieldMatchesTerm = (fieldValue: string, searchTerm: string): boolean => {
  const normalizedField = normalizeText(fieldValue);
  const normalizedTerm = normalizeText(searchTerm);

  // Si alguno está vacío, no hay match
  if (!normalizedField || !normalizedTerm) return false;

  // Aplicar stemming a ambos
  const stemmedField = stemWord(normalizedField);
  const stemmedTerm = stemWord(normalizedTerm);

  // 1. Match exacto (con o sin stemming)
  if (normalizedField === normalizedTerm) return true;
  if (stemmedField === stemmedTerm) return true;

  // 2. El campo contiene el término (substring match para términos largos)
  if (normalizedTerm.length >= 4 && normalizedField.includes(normalizedTerm)) return true;
  if (stemmedTerm.length >= 4 && stemmedField.includes(stemmedTerm)) return true;

  // 3. El campo contiene el término completo como palabra
  const fieldWords = normalizedField.split(' ');
  const stemmedFieldWords = fieldWords.map(stemWord);
  if (fieldWords.includes(normalizedTerm)) return true;
  if (stemmedFieldWords.includes(stemmedTerm)) return true;

  // 4. El término está al inicio del campo (ej: "toyo" -> "toyota")
  if (normalizedField.startsWith(normalizedTerm) && normalizedTerm.length >= 3) return true;
  if (stemmedField.startsWith(stemmedTerm) && stemmedTerm.length >= 3) return true;

  // 5. Alguna palabra del campo empieza con el término
  if (fieldWords.some(w => w.startsWith(normalizedTerm) && normalizedTerm.length >= 3)) return true;
  if (stemmedFieldWords.some(w => w.startsWith(stemmedTerm) && stemmedTerm.length >= 3)) return true;

  // 6. Buscar por sinónimos (usando término original y stemmed)
  const canonicalTerm = getCanonicalTerm(searchTerm) || getCanonicalTerm(stemmedTerm);
  if (canonicalTerm) {
    const canonicalField = getCanonicalTerm(fieldValue) || getCanonicalTerm(stemmedField);
    if (canonicalField === canonicalTerm) return true;
  }

  // 7. Match inverso: el campo está contenido en el término (para casos como "EV" en descripción)
  if (normalizedField.length >= 2 && normalizedTerm.includes(normalizedField)) return true;

  return false;
};

// Obtener campos buscables del vehículo con pesos
const getSearchableFields = (vehicle: Vehicle): { field: string; value: string; weight: number }[] => {
  return [
    { field: 'brand', value: vehicle.brand?.name || '', weight: 40 },
    { field: 'model', value: vehicle.model?.name || '', weight: 40 },
    { field: 'category', value: vehicle.category?.name || '', weight: 30 },
    { field: 'condition', value: vehicle.condition?.name || '', weight: 35 },
    { field: 'fuel_type', value: vehicle.fuel_type?.name || '', weight: 25 },
    { field: 'transmission', value: vehicle.transmission || '', weight: 25 },
    { field: 'color', value: vehicle.color?.name || '', weight: 20 },
    { field: 'year', value: vehicle.year?.toString() || '', weight: 20 },
    { field: 'title', value: vehicle.title || '', weight: 15 },
    { field: 'label', value: vehicle.label || '', weight: 15 },
    { field: 'description', value: vehicle.description || '', weight: 5 },
    ...(vehicle.features || []).map(f => ({ field: 'feature', value: f, weight: 10 })),
  ].filter(f => f.value);
};

// Calcular score de relevancia
const calculateRelevanceScore = (vehicle: Vehicle, searchTerms: string[]): number => {
  const fields = getSearchableFields(vehicle);
  let totalScore = 0;
  let matchedTermsCount = 0;

  for (const term of searchTerms) {
    let termMatched = false;
    let bestMatchScore = 0;

    for (const field of fields) {
      if (fieldMatchesTerm(field.value, term)) {
        bestMatchScore = Math.max(bestMatchScore, field.weight);
        termMatched = true;
      }
    }

    if (termMatched) {
      totalScore += bestMatchScore;
      matchedTermsCount++;
    }
  }

  // Si no coinciden todos los términos, penalizar fuertemente
  if (matchedTermsCount < searchTerms.length) {
    // Solo mostrar si coincide al menos la mitad de los términos
    if (matchedTermsCount < searchTerms.length / 2) {
      return 0;
    }
    // Penalización proporcional
    totalScore = Math.round(totalScore * (matchedTermsCount / searchTerms.length));
  }

  // Bonus por coincidencia completa
  if (matchedTermsCount === searchTerms.length && searchTerms.length > 1) {
    totalScore += 20;
  }

  return totalScore;
};

// Búsqueda inteligente
const smartSearch = (vehicles: Vehicle[], query: string): Vehicle[] => {
  if (!query.trim()) return vehicles;

  // Pre-procesar para detectar frases compuestas
  const processedQuery = preprocessQuery(query);

  // Extraer términos (palabras de 2+ caracteres, excluyendo stopwords)
  const allTerms = processedQuery
    .split(/\s+/)
    .filter(term => term.length >= 2);

  // Filtrar stopwords
  const searchTerms = allTerms.filter(term => !STOPWORDS.has(term));

  // Si después de filtrar no quedan términos, mostrar todos los vehículos
  if (searchTerms.length === 0) return vehicles;

  // Calcular scores
  const scoredVehicles = vehicles.map(vehicle => ({
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
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const activeView = 'grid'; // Fixed to grid view
  // Localized categories and sort options
  const vehicleCategories = [
    {
      id: 'all',
      name: t('vehicles.categories.all'),
      icon: CATEGORY_ICONS.all,
      description: t('vehicles.categoryDescriptions.all'),
    },
    {
      id: 'SUV',
      name: t('vehicles.categories.suv'),
      icon: CATEGORY_ICONS.SUV,
      description: t('vehicles.categoryDescriptions.suv'),
    },
    {
      id: 'Sedan',
      name: t('vehicles.categories.sedan'),
      icon: CATEGORY_ICONS.Sedan,
      description: t('vehicles.categoryDescriptions.sedan'),
    },
    {
      id: 'Hatchback',
      name: t('vehicles.categories.hatchback'),
      icon: CATEGORY_ICONS.Hatchback,
      description: t('vehicles.categoryDescriptions.hatchback'),
    },
    {
      id: 'Pickup',
      name: t('vehicles.categories.pickup'),
      icon: CATEGORY_ICONS.Pickup,
      description: t('vehicles.categoryDescriptions.pickup'),
    },
    {
      id: 'Van',
      name: t('vehicles.categories.van'),
      icon: CATEGORY_ICONS.Van,
      description: t('vehicles.categoryDescriptions.van'),
    },
    {
      id: 'Coupe',
      name: t('vehicles.categories.coupe'),
      icon: CATEGORY_ICONS.Coupe,
      description: t('vehicles.categoryDescriptions.coupe'),
    },
    {
      id: 'Wagon',
      name: t('vehicles.categories.wagon'),
      icon: CATEGORY_ICONS.Wagon,
      description: t('vehicles.categoryDescriptions.wagon'),
    },
  ];

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

  // Filtrado de vehículos usando el estado global con MOTOR DE BÚSQUEDA ULTRA PRO
  const filteredVehicles = useMemo(() => {
    // PASO 1: Aplicar búsqueda inteligente primero (si hay query)
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col gap-4'>
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
                <div className='flex gap-2 pb-2 min-w-max'>
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
                      className={`whitespace-nowrap hover:-translate-y-0.5 transition-transform

${selectedCategory === category.id && theme === 'dark' ? 'text-black' : ''}`}
                      startContent={
                        <Icon icon={category.icon} className='text-xl' />
                      }
                      size='sm'
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
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4'>
          {/* Buscador */}
          <div className='w-full sm:flex-[3] relative'>
            <Search
              className='absolute  left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={16}
            />
            <Input
              type='text'
              placeholder={t('pages.vehicles.searchPlaceholder')}
              className='
                pl-12 pr-3 py-2 min-h-[36px]
                rounded-xl
                border border-slate-300
                bg-slate-100
                text-sm text-gray-700
                shadow-md
                focus:border-primary focus:ring-2 focus:ring-primary
                transition-all
                w-full
                max-w-xxl
              '
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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

            {/* No Results State */}

            {!isLoading && filteredVehicles.length === 0 && (
              <div className='text-center py-12'>
                <Icon
                  icon='mdi:car-off'
                  className='text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4'
                />

                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  {t('vehicles.page.noResults')}
                </h3>

                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  {t('vehicles.page.noResultsDescription')}
                </p>

                <Button
                  color='primary'
                  variant='light'
                  onClick={clearAllFilters}
                  startContent={<Icon icon='mdi:filter-off' />}
                >
                  {t('vehicles.filters.clearFilters')}
                </Button>
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
