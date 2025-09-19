import React, { useState, useMemo, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { ActionHub } from './components/ActionHub';
import { Header } from './components/Header';
import { useEnergyData } from './hooks/useEnergyData';
import type { AppView, EnergyLog, Insight, CompletedActionLog } from './types';
import { generateDailyInsight } from './services/geminiService';
import { InsightModal } from './components/InsightModal';
import { VideoModal } from './components/VideoModal';
import { ACTION_LIBRARY } from './constants/actions';


function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const { logs, addLog, getLogsForDate, completedActions, addCompletedAction, getCompletedActionsForDate } = useEnergyData();
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);


  const handleAnalyzeDay = useCallback(async (date: Date) => {
    setIsInsightLoading(true);
    setError(null);
    setInsight(null);
    try {
      const logsForDay = getLogsForDate(date);
      if (logsForDay.length < 2) {
          setError("Potrzebujesz co najmniej 2 zapisów, aby przeanalizować dzień.");
          setIsInsightLoading(false);
          return;
      }
      const completedActionsForDay = getCompletedActionsForDate(date);
      const generatedInsight = await generateDailyInsight(logsForDay, completedActionsForDay);
      setInsight(generatedInsight);
    } catch (e) {
      console.error(e);
      setError("Wystąpił błąd podczas generowania analizy. Spróbuj ponownie.");
    } finally {
      setIsInsightLoading(false);
    }
  }, [getLogsForDate, getCompletedActionsForDate]);

  const recommendedAction = useMemo(() => {
    if (!insight?.recommendedActionId) return null;
    return ACTION_LIBRARY.find(a => a.id === insight.recommendedActionId) || null;
  }, [insight]);
  
  const completedTodayIds = useMemo(() => {
    const todayActions = getCompletedActionsForDate(new Date());
    return new Set(todayActions.map(a => a.actionId));
  }, [completedActions, getCompletedActionsForDate]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                  logs={logs} 
                  completedActions={completedActions}
                  addLog={addLog} 
                  onAnalyzeDay={handleAnalyzeDay} 
                  addCompletedAction={addCompletedAction}
                  completedActionIds={completedTodayIds}
                  onPlayVideo={setPlayingVideoUrl}
                />;
      case 'actionHub':
        return <ActionHub 
                  addCompletedAction={addCompletedAction}
                  completedActionIds={completedTodayIds}
                  onPlayVideo={setPlayingVideoUrl}
                />;
      default:
        return <Dashboard 
                  logs={logs} 
                  completedActions={completedActions}
                  addLog={addLog} 
                  onAnalyzeDay={handleAnalyzeDay} 
                  addCompletedAction={addCompletedAction}
                  completedActionIds={completedTodayIds}
                  onPlayVideo={setPlayingVideoUrl}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-space-950 font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      {(isInsightLoading || insight || error) && (
        <InsightModal
          isLoading={isInsightLoading}
          insight={insight}
          recommendedAction={recommendedAction}
          error={error}
          onClose={() => {
            setInsight(null);
            setError(null);
          }}
          onPlayVideo={setPlayingVideoUrl}
        />
      )}
      {playingVideoUrl && (
        <VideoModal videoUrl={playingVideoUrl} onClose={() => setPlayingVideoUrl(null)} />
      )}
    </div>
  );
}

export default App;