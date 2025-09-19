import { GoogleGenAI, Type } from "@google/genai";
import type { EnergyLog, Insight, CompletedActionLog } from '../types';
import { ACTION_LIBRARY } from '../constants/actions';

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateDailyInsight = async (logs: EnergyLog[], completedActions: CompletedActionLog[]): Promise<Insight> => {
  if (!logs || logs.length === 0) {
    return {
      summary: "Brak danych do analizy na dziś.",
      recommendedActionId: null
    };
  }

  const formattedLogs = logs.map(log => ({
    time: new Date(log.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    rating: log.rating,
    note: log.note,
  }));

  const formattedCompletedActions = completedActions.map(log => {
      const actionDetails = ACTION_LIBRARY.find(a => a.id === log.actionId);
      return {
          time: new Date(log.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
          actionTitle: actionDetails ? actionDetails.title : 'Nieznana akcja'
      };
  });

  const actionLibraryForPrompt = ACTION_LIBRARY.map(({ id, title, triggerTags }) => ({ id, title, triggerTags }));

  const prompt = `
    Jesteś ekspertem-coachem od zarządzania energią. Twoim zadaniem jest analiza dziennika energii użytkownika, który jest liderem o wysokiej wydajności i ceni sobie zwięzłe, praktyczne porady.

    Oto dane z dziennika energii użytkownika na dziś. Zwróć szczególną uwagę na pole "note", które zawiera osobisty kontekst użytkownika do danego wpisu:
    ${JSON.stringify(formattedLogs, null, 2)}

    Oto lista akcji (resetów/protokołów), które użytkownik wykonał dzisiaj:
    ${JSON.stringify(formattedCompletedActions, null, 2)}

    Oto biblioteka dostępnych akcji (resetów i protokołów), które możesz polecić:
    ${JSON.stringify(actionLibraryForPrompt, null, 2)}

    Na podstawie tych danych (zarówno logów energii, notatek, jak i wykonanych akcji), przeanalizuj dzień użytkownika i wykonaj następujące zadania:
    1. Zidentyfikuj najważniejszy spadek energii i spróbuj skorelować go z notatkami zarejestrowanymi w tym czasie. Notatki dają kluczowy wgląd w przyczyny.
    2. Sprawdź, czy wykonane akcje miały pozytywny wpływ na poziom energii. Jeśli tak, wspomnij o tym w podsumowaniu, aby wzmocnić pozytywne zachowanie (np. "Wykonanie 'Protokołu Oddechowego' po spotkaniu pomogło Ci odzyskać energię. Świetna robota!").
    3. Napisz krótkie, motywujące podsumowanie w języku polskim (maksymalnie 2-3 zdania), które wskaże ten wzorzec.
    4. Z podanej biblioteki akcji wybierz JEDEN, najlepiej pasujący identyfikator akcji (id), aby pomóc użytkownikowi w zidentyfikowanym problemie. Jeśli nic nie pasuje, zwróć null dla ID.
    5. Zakończ podsumowanie wezwaniem do działania, sugerując konsultację 1-na-1 w celu zbudowania długoterminowej strategii, używając sformułowania: "Chcesz stworzyć kompletną strategię? Porozmawiajmy na konsultacji."
    
    Zwróć odpowiedź wyłącznie w formacie JSON, zgodnie z podanym schematem.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Krótkie, motywujące podsumowanie w języku polskim, identyfikujące wzorzec i zawierające CTA.",
            },
            recommendedActionId: {
              type: Type.STRING,
              description: "ID jednej, najlepiej pasującej akcji z biblioteki, lub null.",
            },
          },
          required: ['summary', 'recommendedActionId'],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    return {
        summary: parsedResponse.summary,
        recommendedActionId: parsedResponse.recommendedActionId || null,
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate insight from Gemini API.");
  }
};