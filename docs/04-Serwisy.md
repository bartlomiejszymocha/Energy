## Serwisy

### `exerciseService`
Źródło: `services/exerciseService.ts`

#### `fetchExerciseLibrary(): Promise<Record<string, Exercise>>`
Zwraca lokalną bibliotekę ćwiczeń (`EXERCISE_LIBRARY`). Forma async dla zgodności z ewentualnym zewnętrznym źródłem.

Przykład:
```ts
import { fetchExerciseLibrary } from './services/exerciseService';

const library = await fetchExerciseLibrary();
const ex = library['ex001'];
```

### `geminiService`
Źródło: `services/geminiService.ts`

Inicjalizacja klienta Google GenAI przy użyciu `process.env.API_KEY` (wymagany klucz). Plik eksportuje skonfigurowany klient przez side-effect (import wystarczy do inicjalizacji). Upewnij się, że zmienna środowiskowa jest ustawiona.

