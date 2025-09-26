## Typy

Opis najważniejszych typów eksportowanych z `types.ts`.

### `EnergyLog`
- **id**: string — identyfikator wpisu
- **timestamp**: number — znacznik czasu (ms)
- **rating?**: number — ocena 1..5
- **note?**: string — notatka
- **tags?**: string[] — etykiety

### `ActionType`
Literał typu: `'Reset Energetyczny' | 'Protokół Ruchowy' | 'Technika oddechowa'`.

### `Exercise`
- **name**: string
- **videoUrl?**: string
- **note?**: string

### `WorkoutStep`
Unia:
- `{ type: 'exercise'; exerciseId: string; duration: number }`
- `{ type: 'rest'; duration: number }`

### `EnrichedWorkoutStep`
Rozszerzony krok treningu, uwzględniający dane z biblioteki ćwiczeń oraz odpoczynek.

### `ActionItem`
- **id**: string
- **triggerTags**: string[]
- **type**: `ActionType`
- **duration**: number (minuty)
- **title**: string
- **content**: string (może zawierać HTML)
- **videoUrl?**: string
- **icon?**: string (emoji)
- **breathingPattern?**: `'478' | '4784'`
- **workout?**: `WorkoutStep[]`

### `CompletedActionLog`
- **id**: string
- **timestamp**: number
- **actionId**: string

### `Theme`
Literał: `'light' | 'dark'`

### `UserSettings`
- **name**: string
- **theme**: `Theme`

