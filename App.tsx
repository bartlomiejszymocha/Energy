import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useEnergyData } from './hooks/useEnergyData';
import { useUserSettings } from './hooks/useUserSettings';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './hooks/useAuth';
import type { ActionItem, Exercise } from './types';
import { fetchExerciseLibrary } from './services/exerciseService';

// Components
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ActionHub } from './components/ActionHub';
import { FavoritesBar } from './components/FavoritesBar';
import { LogEnergyModal } from './components/LogEnergyModal';
import { VideoModal } from './components/VideoModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { InstructionsModal } from './components/InstructionsModal';
import { ResetDataModal } from './components/ResetDataModal';
import { BreathingModal } from './components/BreathingModal';
import { FullSummaryModal } from './components/FullSummaryModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { ConfirmationToast } from './components/ConfirmationToast';
import { TidyCalModal } from './components/TidyCalModal';
import { LoginScreen } from './components/LoginScreen';
import { HistoryPage } from './components/HistoryPage';
import { WorkoutModal } from './components/WorkoutPage';
import { PlusIcon, CalendarDaysIcon, ChartBarIcon } from './components/icons/Icons';

function App() {
  const { user, loadingAuth, signInWithGoogle, signOut } = useAuth();
  const { 
    logs, addLog, removeLog,
    completedActions, addCompletedAction, removeCompletedAction,
    favoriteActions, addFavoriteAction, removeFavoriteAction,
    streak, resetAllData, migrateLocalToFirestore
  } = useEnergyData(user?.uid ?? null);

  const { settings, saveSettings } = useUserSettings();
  const { 
    permission, 
    settings: notificationSettings, 
    requestPermission, 
    updateSettings: updateNotificationSettings,
    addReminder,
    removeReminder
  } = useNotifications();

  // State
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
  const [isLogEnergyModalOpen, setIsLogEnergyModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isResetDataModalOpen, setIsResetDataModalOpen] = useState(false);
  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [breathingAction, setBreathingAction] = useState<ActionItem | null>(null);
  const [isFullSummaryModalOpen, setIsFullSummaryModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [selectedActionForVideo, setSelectedActionForVideo] = useState<ActionItem | null>(null);
  const [workoutAction, setWorkoutAction] = useState<ActionItem | null>(null);
  const [isTidyCalModalOpen, setIsTidyCalModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exerciseLibrary, setExerciseLibrary] = useState<Record<string, Exercise> | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const userRef = useRef(user);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Effect to fetch exercise library
  useEffect(() => {
    fetchExerciseLibrary()
      .then(library => {
        setExerciseLibrary(library);
      })
      .catch(error => {
        console.error(error);
        setLibraryError("Nie udało się załadować biblioteki ćwiczeń. Treningi mogą nie działać poprawnie.");
      });
  }, []);

  useEffect(() => {
    if (libraryError) {
      showToast(libraryError);
    }
  }, [libraryError, showToast]);


  // Data Migration Effect
  useEffect(() => {
    // Check if user state changed from null to a user object
    if (user && !userRef.current) {
        // Check if there's data in localStorage to migrate
        if (localStorage.getItem('energy_os_logs_anonymous') || localStorage.getItem('energy_os_actions_anonymous')) {
            migrateLocalToFirestore(user.uid).then(() => {
                showToast("Dane zsynchronizowane z Twoim kontem!");
            });
        }
    }
    userRef.current = user;
  }, [user, migrateLocalToFirestore, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsLogEnergyModalOpen(true);
      }
      if (event.key === 'Escape') {
        if (workoutAction) setWorkoutAction(null);
        else if (isTidyCalModalOpen) setIsTidyCalModalOpen(false);
        else if (selectedActionForVideo) setSelectedActionForVideo(null);
        else if (breathingAction) setBreathingAction(null);
        else if (isLogEnergyModalOpen) setIsLogEnergyModalOpen(false);
        else if (isFullSummaryModalOpen) setIsFullSummaryModalOpen(false);
        else if (isInstructionsModalOpen) setIsInstructionsModalOpen(false);
        else if (isNotificationsModalOpen) setIsNotificationsModalOpen(false);
        else if (isResetDataModalOpen) setIsResetDataModalOpen(false);
        else if (isUserSettingsModalOpen) setIsUserSettingsModalOpen(false);
        else if (view === 'history') setView('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
      isTidyCalModalOpen, selectedActionForVideo, breathingAction, isLogEnergyModalOpen, 
      isFullSummaryModalOpen, isInstructionsModalOpen, isNotificationsModalOpen, 
      isResetDataModalOpen, isUserSettingsModalOpen, view, workoutAction
  ]);

  const completionCounts = useMemo(() => completedActions.reduce((acc, action) => {
    acc.set(action.actionId, (acc.get(action.actionId) || 0) + 1);
    return acc;
  }, new Map<string, number>()), [completedActions]);

  const todayCompletedActionIds = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return new Set(completedActions.filter(log => log.timestamp >= startOfToday).map(log => log.actionId));
  }, [completedActions]);

  const handleSaveLog = (rating: number | undefined, note: string, timestamp: number) => {
    const tags = new Date(timestamp).getHours() < 12 ? ['Poranek'] : new Date(timestamp).getHours() < 17 ? ['Południe'] : ['Wieczór'];
    addLog(rating, note, tags, timestamp);
    setIsLogEnergyModalOpen(false);
    showToast('Wpis energii zapisany!');
  };

  const handleCompleteAction = useCallback((actionId: string) => {
    addCompletedAction(actionId);
    showToast('Akcja zaliczona!');
  }, [addCompletedAction, showToast]);

  const handlePlayAction = useCallback((action: ActionItem) => {
    if (action.videoUrl) setSelectedActionForVideo(action);
    else if (action.workout && action.workout.length > 0) setWorkoutAction(action);
    else if (action.breathingPattern) setBreathingAction(action);
    else handleCompleteAction(action.id);
  }, [handleCompleteAction]);

  const handleToggleFavorite = useCallback((actionId: string) => {
    if (favoriteActions.has(actionId)) removeFavoriteAction(actionId);
    else addFavoriteAction(actionId);
  }, [favoriteActions, addFavoriteAction, removeFavoriteAction]);

  const handleConfirmReset = () => {
    resetAllData();
    setIsResetDataModalOpen(false);
    showToast("Wszystkie dane zostały zresetowane.");
  };

  const handleRemoveCompletedAction = (logId: string) => {
    removeCompletedAction(logId);
    showToast("Usunięto wpis akcji.");
  };

  const handleRemoveLog = (logId: string) => {
    removeLog(logId);
    showToast("Usunięto wpis energii.");
  };

  if (loadingAuth) {
    return (
      <div className="bg-space-950 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-system-grey">Ładowanie...</div>
      </div>
    );
  }

  // Always show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="bg-space-950 text-cloud-white min-h-screen font-sans">
      <Header 
        user={user}
        onSignOut={signOut}
        onLoginClick={() => {}} 
        title="Energy Playbook" 
        streak={streak} 
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
      />
      <FavoritesBar
        favoriteActionIds={favoriteActions}
        completedActionIds={todayCompletedActionIds}
        onActionClick={handlePlayAction}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {view === 'dashboard' ? (
          <>
            <Dashboard 
              logs={logs}
              completedActions={completedActions}
              onLogEnergyClick={() => setIsLogEnergyModalOpen(true)}
              onInstructionsClick={() => setIsInstructionsModalOpen(true)}
              onResetDataClick={() => setIsResetDataModalOpen(true)}
              onRemoveCompletedAction={handleRemoveCompletedAction}
              onRemoveLog={handleRemoveLog}
              onOpenSummaryModal={() => setIsFullSummaryModalOpen(true)}
              onShowHistory={() => setView('history')}
            />
            <ActionHub 
              onCompleteAction={handleCompleteAction}
              completionCounts={completionCounts}
              onPlayAction={handlePlayAction}
              favoriteActionIds={favoriteActions}
              onToggleFavorite={handleToggleFavorite}
              onOpenBreathingModal={(action) => setBreathingAction(action)}
              todayCompletedActionIds={todayCompletedActionIds}
            />
            <div className="bg-space-900 rounded-xl shadow-lg p-6 sm:p-8 text-center animate-fade-in-up animation-delay-400">
              <h2 className="text-2xl font-bold text-cloud-white">Gotowy na prawdziwą transformację?</h2>
              <p className="text-system-grey mt-3 max-w-2xl mx-auto">
                Ten playbook to fundament. Prawdziwa transformacja wymaga wdrożenia, personalizacji i konsekwencji w chaosie codziennych obowiązków.
              </p>
              <p className="text-cloud-white mt-4 max-w-2xl mx-auto font-semibold">
                W moim programie 'Energy CEO' pomagam Ci zbudować system, który da Ci energię do skalowania biznesu bez wypalenia.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsTidyCalModalOpen(true)}
                  className="inline-flex items-center gap-3 bg-electric-500 text-cloud-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-electric-600 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Aplikuj na strategiczną konsultację</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <HistoryPage 
            logs={logs} 
            completedActions={completedActions} 
            onBack={() => setView('dashboard')}
            onRemoveCompletedAction={handleRemoveCompletedAction}
            onRemoveLog={handleRemoveLog}
          />
        )}
      </main>
      
      {view === 'dashboard' && (
        <button
          onClick={() => setIsLogEnergyModalOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-electric-500 sm:bg-space-800 text-cloud-white font-bold shadow-lg hover:bg-electric-600 sm:hover:bg-space-700 transition-all duration-200 hover:scale-105 active:scale-95 z-40 flex items-center justify-center animate-fade-in-up animation-delay-500 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-auto md:h-auto md:rounded-lg md:px-4 md:py-2"
          aria-label="Oceń poziom energii"
          title="Oceń poziom energii (Cmd/Ctrl + K)"
        >
          <PlusIcon className="h-6 w-6 sm:hidden" />
          <span className="hidden sm:flex items-baseline font-mono text-electric-500 font-bold">
            <span className="text-lg">⌘</span>
            <span className="text-base ml-1">K</span>
          </span>
        </button>
      )}

      <ConfirmationToast message={toastMessage} />
      {isLogEnergyModalOpen && <LogEnergyModal onClose={() => setIsLogEnergyModalOpen(false)} onSave={handleSaveLog} />}
      {selectedActionForVideo && <VideoModal action={selectedActionForVideo} onClose={() => setSelectedActionForVideo(null)} onMarkComplete={() => { if (selectedActionForVideo) { handleCompleteAction(selectedActionForVideo.id); } setSelectedActionForVideo(null); }} />}
      {isInstructionsModalOpen && <InstructionsModal isOpen={isInstructionsModalOpen} onClose={() => setIsInstructionsModalOpen(false)} />}
      {isResetDataModalOpen && <ResetDataModal isOpen={isResetDataModalOpen} onClose={() => setIsResetDataModalOpen(false)} onConfirm={handleConfirmReset} />}
      {breathingAction && <BreathingModal isOpen={!!breathingAction} onClose={() => setBreathingAction(null)} action={breathingAction} onComplete={() => { if(breathingAction) { handleCompleteAction(breathingAction.id); } setBreathingAction(null); }} />}
      {isFullSummaryModalOpen && <FullSummaryModal isOpen={isFullSummaryModalOpen} onClose={() => setIsFullSummaryModalOpen(false)} logs={logs} completedActions={completedActions} onRemoveCompletedAction={handleRemoveCompletedAction} onRemoveLog={handleRemoveLog} />}
      {isNotificationsModalOpen && <NotificationSettingsModal isOpen={isNotificationsModalOpen} onClose={() => setIsNotificationsModalOpen(false)} permission={permission} settings={notificationSettings} requestPermission={requestPermission} updateSettings={updateNotificationSettings} addReminder={addReminder} removeReminder={removeReminder} />}
      {isTidyCalModalOpen && <TidyCalModal isOpen={isTidyCalModalOpen} onClose={() => setIsTidyCalModalOpen(false)} />}
      {isUserSettingsModalOpen && <UserSettingsModal isOpen={isUserSettingsModalOpen} onClose={() => setIsUserSettingsModalOpen(false)} onSave={saveSettings} currentSettings={settings} />}
      {workoutAction && exerciseLibrary && <WorkoutModal user={user} action={workoutAction} onClose={() => setWorkoutAction(null)} onComplete={() => { if (workoutAction) { handleCompleteAction(workoutAction.id); setWorkoutAction(null); } }} exerciseLibrary={exerciseLibrary} />}
      
      <footer className="text-center py-6 px-4">
        <p className="text-sm text-system-grey">
          © 2025 Bartłomiej Szymocha | Wszelkie prawa zastrzeżone
        </p>
      </footer>
    </div>
  );
}

export default App;