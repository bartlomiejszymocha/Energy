## Stałe i biblioteki danych

### `ACTION_LIBRARY: ActionItem[]`
Źródło: `constants/actions.ts`

Zbiór akcji dostępnych w aplikacji. Pozycje mogą mieć: `videoUrl`, `breathingPattern`, `workout`.

Przykład filtrowania:
```ts
import { ACTION_LIBRARY } from '../constants/actions';

const breathingOnly = ACTION_LIBRARY.filter(a => a.type === 'Technika oddechowa');
```

### `EXERCISE_LIBRARY: Record<string, Exercise>`
Źródło: `constants/exerciseLibrary.ts`

Mapa identyfikatorów ćwiczeń do metadanych (nazwa, wideo, opcjonalna notatka).

### `DEFAULT_TAGS: Tag[]`
Źródło: `constants/tags.ts`

Domyślne etykiety czasu dnia: `Poranek`, `Południe`, `Po południu`, `Wieczór`.

