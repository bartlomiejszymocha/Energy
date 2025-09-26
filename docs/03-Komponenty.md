## Komponenty UI

Poniżej opis publicznych komponentów, ich propsów i przykładowego użycia.

### `ActionCard`
Źródło: `components/ActionCard.tsx`

Props:
- **action**: `ActionItem`
- **onComplete?**: `(actionId: string) => void`
- **completionCount?**: number
- **onPlayAction?**: `(action: ActionItem) => void`
- **isFavorite?**: boolean
- **onToggleFavorite?**: `(actionId: string) => void`
- **onOpenBreathingModal?**: `(action: ActionItem) => void`
- **isExpanded**: boolean
- **onToggleExpand**: `(actionId: string) => void`
- **isCompletedToday**: boolean

Przykład:
```tsx
<ActionCard 
  action={action}
  onComplete={id => addCompletedAction(id)}
  completionCount={3}
  onPlayAction={setSelectedAction}
  isFavorite={favoriteActions.has(action.id)}
  onToggleFavorite={handleToggleFavorite}
  onOpenBreathingModal={setBreathingAction}
  isExpanded={expandedId === action.id}
  onToggleExpand={setExpandedId}
  isCompletedToday={todayIds.has(action.id)}
/>
```

### `ActionHub`
Źródło: `components/ActionHub.tsx`

Props:
- **onCompleteAction(actionId)**
- **completionCounts**: `Map<string, number>`
- **onPlayAction(action)**
- **favoriteActionIds**: `Set<string>`
- **onToggleFavorite(actionId)**
- **onOpenBreathingModal(action)**
- **todayCompletedActionIds**: `Set<string>`

Przykład (z `App.tsx`):
```tsx
<ActionHub 
  onCompleteAction={handleCompleteAction}
  completionCounts={completionCounts}
  onPlayAction={handlePlayAction}
  favoriteActionIds={favoriteActions}
  onToggleFavorite={handleToggleFavorite}
  onOpenBreathingModal={setBreathingAction}
  todayCompletedActionIds={todayCompletedActionIds}
/>
```

### `BreathingModal`
Źródło: `components/BreathingModal.tsx`

Props:
- **isOpen**: boolean
- **onClose()**
- **action**: `ActionItem` (z `breathingPattern`)
- **onComplete()**

### `BreathingTimer`
Źródło: `components/BreathingTimer.tsx`

Props:
- **isExpanded**: boolean
- **size?**: `'normal' | 'large'` (domyślnie `normal`)
- **pattern**: `'478' | '4784'`
- **onStopClick?()**
- **onCompleteClick?()**

### `ConfirmationToast`
Źródło: `components/ConfirmationToast.tsx`

Props: **message**: string | null

### `Dashboard`
Źródło: `components/Dashboard.tsx`

Props: `logs`, `completedActions`, callbacki do modali i usuwania wpisów.

### `DaySummaryCard`
Źródło: `components/DaySummaryCard.tsx`
Props: `logs`, `completedActions`, `onRemoveCompletedAction`, `onRemoveLog`.

### `EnergyChart`
Źródło: `components/EnergyChart.tsx`
Props: `logs: EnergyLog[]`, `completedActions: CompletedActionLog[]`.

Przykład:
```tsx
<div style={{ height: 300 }}>
  <EnergyChart logs={logs} completedActions={completedActions} />
</div>
```

### `FavoritesBar`
Źródło: `components/FavoritesBar.tsx`
Props: `favoriteActionIds`, `completedActionIds`, `onActionClick(action)`.

Przykład:
```tsx
<FavoritesBar 
  favoriteActionIds={favoriteActions}
  completedActionIds={todayCompletedIds}
  onActionClick={handlePlayAction}
/>
```

### `FullSummaryModal`
Źródło: `components/FullSummaryModal.tsx`
Props: `isOpen`, `onClose`, `logs`, `completedActions`, `onRemoveCompletedAction`, `onRemoveLog`.

Przykład:
```tsx
{isFullSummaryModalOpen && (
  <FullSummaryModal 
    isOpen
    onClose={() => setIsFullSummaryModalOpen(false)}
    logs={logs}
    completedActions={completedActions}
    onRemoveCompletedAction={removeCompletedAction}
    onRemoveLog={removeLog}
  />
)}
```

### `Header`
Źródło: `components/Header.tsx`
Props: `user`, `onSignOut`, `onLoginClick`, `title`, `streak`, `onOpenNotifications`.

Przykład:
```tsx
<Header 
  user={user}
  onSignOut={signOut}
  onLoginClick={() => setIsLogin(true)}
  title="Energy Playbook"
  streak={streak}
  onOpenNotifications={() => setIsNotificationsOpen(true)}
/>
```

### `HistoryDaySelector`
Źródło: `components/HistoryDaySelector.tsx`
Props: `availableDays`, `selectedDay`, `onSelectDay`.

### `HistoryPage`
Źródło: `components/HistoryPage.tsx`
Props: `logs`, `completedActions`, `onBack`, `onRemoveCompletedAction`, `onRemoveLog`.

Przykład:
```tsx
<HistoryPage 
  logs={logs} 
  completedActions={completedActions}
  onBack={() => setView('dashboard')}
  onRemoveCompletedAction={removeCompletedAction}
  onRemoveLog={removeLog}
/>
```

### `InstructionsModal`, `IntelligentPomodoroModal`, `LogEnergyModal`, `LoginScreen`, `NotificationSettingsModal`, `ProfileDropdown`, `ResetDataModal`, `SyncStatus`, `TidyCalModal`, `UserSettingsModal`, `VideoModal`, `WorkoutModal`
Źródła: `components/*.tsx`

Każdy komponent przyjmuje jawnie zdefiniowane propsy widoczne w pliku źródłowym. Zobacz przykłady w `App.tsx`.

Przykład `VideoModal`:
```tsx
{selected && (
  <VideoModal 
    action={selected} 
    onClose={() => setSelected(null)} 
    onMarkComplete={() => addCompletedAction(selected.id)} 
  />
)}
```

