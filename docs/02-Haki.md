## Hooki (React Hooks)

### `useAuth()`
Źródło: `hooks/useAuth.ts`

Zwraca:
- **user**: `firebase.auth.User | null`
- **loadingAuth**: boolean
- **signInWithGoogle()**: Promise<void>
- **signOut()**: Promise<void>

Przykład:
```tsx
const { user, loadingAuth, signInWithGoogle, signOut } = useAuth();
if (!user) {
  return <button onClick={signInWithGoogle}>Zaloguj przez Google</button>;
}
return <button onClick={signOut}>Wyloguj</button>;
```

### `useUserSettings()`
Źródło: `hooks/useUserSettings.ts`

Zwraca:
- **settings**: `UserSettings`
- **saveSettings(newSettings: Partial<UserSettings>)**

### `useNotifications()`
Źródło: `hooks/useNotifications.ts`

Zwraca:
- **permission**: NotificationPermission
- **settings**: NotificationSettings
- **requestPermission()**
- **updateSettings(partial)**
- **addReminder(time: string)**
- **removeReminder(time: string)**

Uwaga: Hook sam zarządza cyklem wysyłania powiadomień (interwał 60s) z poszanowaniem godzin ciszy.

### `useEnergyData(uid: string | null)`
- **migrateLocalToFirestore(newUid)**

Przykład:
```tsx
const { logs, addLog, completedActions, addCompletedAction, favoriteActions, addFavoriteAction } = useEnergyData(user?.uid ?? null);

const handleSave = () => {
  addLog(4, 'Dobry fokus', ['Południe'], Date.now());
};
```
Źródło: `hooks/useEnergyData.ts`

Zwraca m.in.:
- **logs**: `EnergyLog[]`
- **addLog(rating?, note, tags, timestamp)**
- **removeLog(id)**
- **completedActions**: `CompletedActionLog[]`
- **addCompletedAction(actionId)**
- **removeCompletedAction(id)**
- **favoriteActions**: `Set<string>`
- **addFavoriteAction(id)**, **removeFavoriteAction(id)**
- **streak**: number
- **resetAllData()**
- **migrateLocalToFirestore(newUid)**

Storage i sync:
- Dla `uid != null`: Firestore (`users/{uid}/logs`, `users/{uid}/completedActions` + `favoriteActions` w dokumencie użytkownika)
- Dla `uid == null`: `localStorage`

### `useWorkoutEngine(steps: EnrichedWorkoutStep[])`
Źródło: `hooks/useWorkoutEngine.ts`

Maszyna stanów treningu.

Zwraca m.in.:
- **currentStep**
- **timeLeftInStep**
- **isPaused** / **play()** / **pause()**
- **skipToNext()** / **skipToPrevious()**
- **isFinished**
- **totalTimeRemaining**
- **progressPercentage**
- **currentStepInfo: { number, total }**
- **nextStep**

Przykład:
```tsx
const steps = [
  { type: 'exercise', exerciseId: 'ex001', duration: 60, name: '4Point Knee Taps', videoUrl: '...'},
  { type: 'rest', duration: 30, name: 'Odpoczynek' }
];
const engine = useWorkoutEngine(steps);
useEffect(() => { engine.play(); }, []);
```

