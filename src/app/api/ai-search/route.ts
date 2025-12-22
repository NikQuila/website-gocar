import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Vehicle {
  id: string;
  brand?: { name: string };
  model?: { name: string };
  year?: number;
  price?: number;
  mileage?: number;
  category?: { name: string };
  condition?: { name: string };
  fuel_type?: { name: string };
  transmission?: string;
  color?: { name: string };
  features?: string[];
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { query, vehicles } = await request.json();

    if (!query || !vehicles || !Array.isArray(vehicles)) {
      return NextResponse.json({ error: 'Query y vehicles son requeridos' }, { status: 400 });
    }

    // Crear un resumen compacto de cada vehículo para el prompt
    const vehicleSummaries = vehicles.map((v: Vehicle) => ({
      id: v.id,
      info: `${v.brand?.name || ''} ${v.model?.name || ''} ${v.year || ''} - ${v.category?.name || ''} - ${v.condition?.name || ''} - ${v.color?.name || ''} - ${v.fuel_type?.name || ''} - ${v.transmission || ''} - $${v.price?.toLocaleString() || 'N/A'} - ${v.mileage?.toLocaleString() || 'N/A'}km${v.features?.length ? ' - ' + v.features.slice(0, 3).join(', ') : ''}`
    }));

    const systemPrompt = `Eres un asistente de búsqueda de vehículos. Tu trabajo es analizar la consulta del usuario y devolver los IDs de los vehículos que mejor coinciden.

REGLAS:
1. Interpreta la intención del usuario de forma inteligente
2. "Camioneta" puede significar SUV, Pickup, o Crossover
3. "Auto" puede ser Sedan, Hatchback, o Coupe
4. "Familiar" sugiere vehículos espaciosos como SUV, Van, o Wagon
5. "Económico" puede referirse a precio bajo, buen rendimiento, o híbridos/eléctricos
6. "Grande" sugiere SUV, Pickup, o Van
7. "Pequeño" o "compacto" sugiere Hatchback
8. Considera sinónimos y variaciones regionales (Chile/Latinoamérica)
9. Si el usuario menciona un presupuesto, filtra por precio
10. Si menciona kilometraje, considera eso también
11. Sé flexible e inclusivo en los resultados - es mejor mostrar más opciones relevantes

Responde SOLO con un JSON array de IDs de vehículos que coinciden, ordenados por relevancia (más relevante primero).
Si no hay coincidencias, devuelve un array vacío.
Ejemplo de respuesta: ["id1", "id2", "id3"]`;

    const userPrompt = `Consulta del usuario: "${query}"

Vehículos disponibles:
${vehicleSummaries.map((v: { id: string; info: string }) => `- ID: ${v.id} | ${v.info}`).join('\n')}

Devuelve los IDs de los vehículos que coinciden con la búsqueda:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';

    // Extraer el array JSON de la respuesta
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    let matchingIds: string[] = [];

    if (jsonMatch) {
      try {
        matchingIds = JSON.parse(jsonMatch[0]);
      } catch {
        console.error('Error parsing AI response:', responseText);
        matchingIds = [];
      }
    }

    return NextResponse.json({
      matchingIds,
      query,
      totalMatches: matchingIds.length
    });

  } catch (error) {
    console.error('AI Search error:', error);
    return NextResponse.json(
      { error: 'Error en la búsqueda', matchingIds: [] },
      { status: 500 }
    );
  }
}
