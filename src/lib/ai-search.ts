interface ParsedFilters {
  brand?: string;
  model?: string;
  category?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  features?: string[];
  searchTerms?: string[];
}

interface AISearchResponse {
  filters: ParsedFilters;
  originalQuery: string;
  error?: string;
}

interface AvailableFilters {
  brands?: { id: number; name: string }[];
  categories?: { id: number; name: string }[];
  fuelTypes?: { id: number; name: string }[];
  colors?: { id: number; name: string }[];
}

// Cache para evitar llamadas repetidas
const searchCache = new Map<string, AISearchResponse>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cacheTimestamps = new Map<string, number>();

export async function parseSearchQuery(
  query: string,
  availableFilters?: AvailableFilters
): Promise<AISearchResponse> {
  // Query vacío o muy corto
  if (!query || query.trim().length < 3) {
    return {
      filters: {},
      originalQuery: query,
    };
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Verificar cache
  const cacheKey = normalizedQuery;
  const cachedResult = searchCache.get(cacheKey);
  const cachedTimestamp = cacheTimestamps.get(cacheKey);

  if (cachedResult && cachedTimestamp && Date.now() - cachedTimestamp < CACHE_TTL) {
    return cachedResult;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/parse-vehicle-search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          query: normalizedQuery,
          availableFilters,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result: AISearchResponse = await response.json();

    // Guardar en cache
    searchCache.set(cacheKey, result);
    cacheTimestamps.set(cacheKey, Date.now());

    return result;
  } catch (error) {
    console.warn('AI search fallback to local:', error);

    // Fallback: búsqueda local básica
    return {
      filters: {},
      originalQuery: query,
      error: 'AI search unavailable, using local search',
    };
  }
}

// Limpiar cache antiguo periódicamente
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of cacheTimestamps.entries()) {
      if (now - timestamp > CACHE_TTL) {
        searchCache.delete(key);
        cacheTimestamps.delete(key);
      }
    }
  }, 60000); // Limpiar cada minuto
}
