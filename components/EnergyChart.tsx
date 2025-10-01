import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnergyLog, CompletedActionLog, ChartPoint } from '../types';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import { useTheme } from '../hooks/useTheme';
import { IconRenderer } from './IconRenderer';

const RATING_LABELS: { [key: number]: string } = {
    1: 'Przetrwanie',
    2: 'Autopilot',
    3: 'Stabilnie',
    4: 'Focus',
    5: 'Flow',
};

interface EnergyChartProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
    onAddEnergyClick?: () => void;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: any;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const time = new Date(label).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        
        // Określ kolor tła i obramowania na podstawie typu wpisu
        let bgColor = 'bg-blue-50 dark:bg-blue-900/20';
        let borderColor = 'border-blue-200 dark:border-blue-500/30';
        let accentColor = 'text-blue-600 dark:text-blue-400';
        
        if (data.isMeal) {
            bgColor = 'bg-gray-50 dark:bg-gray-900/20';
            borderColor = 'border-gray-200 dark:border-gray-500/30';
            accentColor = 'text-gray-600 dark:text-gray-400';
        } else if (data.isAction) {
            bgColor = 'bg-green-50 dark:bg-green-900/20';
            borderColor = 'border-green-200 dark:border-green-500/30';
            accentColor = 'text-green-600 dark:text-green-400';
        } else if (data.isNoteOnly) {
            bgColor = 'bg-orange-50 dark:bg-orange-900/20';
            borderColor = 'border-orange-200 dark:border-orange-500/30';
            accentColor = 'text-orange-600 dark:text-orange-400';
        }
        
        return (
            <div 
                className={`${bgColor} p-3 border-2 ${borderColor} rounded-lg shadow-lg z-50`}
                style={{
                    position: 'relative',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}
            >
                <p className="text-gray-900 dark:text-cloud-white font-medium text-sm">{`${time}`}</p>
                <p className={`${accentColor} text-sm font-semibold`}>
                    {data.rating}: {RATING_LABELS[data.rating] || `Energia ${data.rating}`}
                </p>
                {data.isMeal && (
                    <p className={`${accentColor} text-sm font-bold`}>Posiłek</p>
                )}
                {data.actionTitle && (
                    <div className="flex items-center gap-2">
                        <IconRenderer icon={data.icon} fallback={<span>⚡</span>} className="text-base" />
                        <p className={`${accentColor} text-sm font-semibold`}>{data.actionTitle}</p>
                    </div>
                )}
                {data.note && (
                    <p className="text-gray-600 dark:text-system-grey text-sm italic">{data.note}</p>
                )}
            </div>
        );
    }
    return null;
};

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const { isDark } = useTheme();
    const fillColor = isDark ? '#F4F6F8' : '#374151';
    
    // Szara kropka dla posiłków
    if (payload.isMeal) {
        return <circle cx={cx} cy={cy} r={6} fill="#6B7280" stroke={fillColor} strokeWidth={1} />;
    }
    
    if (payload.isNoteOnly) {
        return <circle cx={cx} cy={cy} r={6} fill="#FF9500" stroke={fillColor} strokeWidth={1} />;
    }
    
    // Zielona kropka dla wykonanych akcji
    if (payload.isAction) {
        return <circle cx={cx} cy={cy} r={6} fill="#10B981" stroke={fillColor} strokeWidth={1} />;
    }
    
    return <circle cx={cx} cy={cy} r={6} fill="#007AFF" stroke={fillColor} strokeWidth={1} />;
};

const CustomActiveDot = (props: { cx: number; cy: number; payload: ChartPoint }) => {
    const { cx, cy, payload } = props;
    const { isDark } = useTheme();
    const strokeColor = isDark ? '#F4F6F8' : '#374151';
    
    if (payload.isMeal) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={8} stroke={strokeColor} strokeWidth={1} fill="#6B7280" />
            </g>
        );
    }
    if (payload.isNoteOnly) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={8} stroke={strokeColor} strokeWidth={1} fill="#FF9500" />
            </g>
        );
    }
    if (payload.isAction) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={8} stroke={strokeColor} strokeWidth={1} fill="#10B981" />
            </g>
        );
    }
    return <circle cx={cx} cy={cy} r={8} stroke={strokeColor} strokeWidth={1} fill="#007AFF" />;
};

// KLUCZOWA ZMIANA: komponenty Recharts jako oddzielne komponenty z key
const ThemedCartesianGrid: React.FC = () => {
    const { isDark } = useTheme();
    const gridColor = isDark ? '#1E293B' : '#D1D5DB';
    return <CartesianGrid key={`grid-${isDark}`} strokeDasharray="3 3" stroke={gridColor} />;
};

const ThemedXAxis: React.FC = () => {
    const { isDark } = useTheme();
    const textColor = isDark ? '#64748B' : '#6B7280';
    const formatXAxis = (tickItem: number) => {
        return new Date(tickItem).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };
    
    return (
        <XAxis 
            key={`xaxis-${isDark}`}
            dataKey="timestamp" 
            type="number" 
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatXAxis}
            stroke={textColor}
            padding={{ left: 10, right: 10 }}
            fontSize={10}
        />
    );
};

const ThemedYAxis: React.FC = () => {
    const { isDark } = useTheme();
    const textColor = isDark ? '#64748B' : '#6B7280';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const fontSize = isMobile ? 10.8 : 12; // 12px * 0.9 = 10.8px on mobile
    
    return (
        <YAxis 
            key={`yaxis-${isDark}`}
            domain={[0.8, 5.2]} 
            ticks={[1, 2, 3, 4, 5]} 
            stroke={textColor} 
            allowDecimals={false}
            style={{ fontSize }}
        />
    );
};

const ThemedTooltip: React.FC = () => {
    const { isDark } = useTheme();
    const cursorColor = isDark ? '#F4F6F8' : '#D1D5DB';
    
    return (
        <Tooltip 
            key={`tooltip-${isDark}`}
            content={<CustomTooltip />} 
            cursor={{ stroke: cursorColor, strokeWidth: 1 }}
            offset={15}
            allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ 
                zIndex: 1000,
                pointerEvents: 'none',
                outline: 'none'
            }}
        />
    );
};

export const EnergyChart: React.FC<EnergyChartProps> = ({ logs, completedActions, onAddEnergyClick }) => {
    const { isDark, mounted } = useTheme();
    const { actions: sheetsActions } = useSheetsActionsOptimized();
    
    const chartData = useMemo<ChartPoint[]>(() => {
        const allEvents = [
            ...logs.map(log => ({ ...log, type: 'log' as const })),
            ...completedActions.map(action => ({ ...action, type: 'action' as const }))
        ].sort((a, b) => a.timestamp - b.timestamp);

        let lastRating: number | null = null;
        const processedData: ChartPoint[] = [];

        for (const event of allEvents) {
            if (event.type === 'log') {
                if (typeof event.rating === 'number') {
                    lastRating = event.rating;
                    processedData.push({
                        timestamp: event.timestamp,
                        rating: event.rating,
                        note: event.note,
                        isMeal: event.meal,
                        isNoteOnly: false,
                        isAction: false
                    });
                } else {
                    // Wpis bez oceny (notatka lub posiłek) - użyj poprzedniego poziomu
                    processedData.push({
                        timestamp: event.timestamp,
                        rating: lastRating || 3,
                        note: event.note,
                        isMeal: event.meal,
                        isNoteOnly: !event.meal, // Jeśli jest posiłek, to nie jest "note only"
                        isAction: false
                    });
                }
            } else if (event.type === 'action') {
                const actionDetails = sheetsActions.find(a => a.id === event.actionId);
                if (actionDetails && lastRating !== null) {
                    processedData.push({
                        timestamp: event.timestamp,
                        rating: lastRating,
                        actionId: event.actionId,
                        actionTitle: actionDetails.title,
                        icon: actionDetails.icon,
                        isNoteOnly: false,
                        isAction: true
                    });
                }
            }
        }

        return processedData;
    }, [logs, completedActions, sheetsActions]);

    // Wait for hydration
    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-system-grey">Ładowanie wykresu...</p>
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6">
                {/* Strzałka - ukośna w prawo-górę na mobile, w prawo na desktop */}
                <div className="flex items-center gap-4">
                    {/* Strzałka ukośna w prawo-górę (mobile) */}
                    <svg className="sm:hidden h-16 w-16 text-electric-500 animate-bounce ml-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7m0 0H7m10 0v10" />
                    </svg>
                    {/* Strzałka w prawo (desktop) */}
                    <svg className="hidden sm:block h-16 w-16 text-electric-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
                
                <div className="text-center max-w-sm">
                    <p className="text-lg font-semibold text-gray-900 dark:text-cloud-white mb-2">
                        Zacznij od określenia swojej energii
                    </p>
                    <p className="text-sm text-gray-600 dark:text-system-grey mb-3">
                        Dodaj pierwszy wpis, aby zobaczyć wykres swojej energii w ciągu dnia
                    </p>
                    {onAddEnergyClick && (
                        <div className="hidden sm:flex justify-center">
                            <button 
                                onClick={onAddEnergyClick}
                                className="text-xs text-gray-500 dark:text-system-grey/70 hover:text-electric-500 transition-colors"
                            >
                                Skrót: <kbd className="px-2 py-1 bg-gray-200 dark:bg-space-800 rounded text-electric-500 font-mono cursor-pointer hover:bg-gray-300 dark:hover:bg-space-700 transition-colors">⌘+K</kbd>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    console.log('🎨 EnergyChart render - isDark:', isDark, 'mounted:', mounted);

    // KLUCZOWA ZMIANA: ResponsiveContainer z key zmusza pełny restart
    return (
        <ResponsiveContainer key={`chart-container-${isDark}`} width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
                <ThemedCartesianGrid />
                <ThemedXAxis />
                <ThemedYAxis />
                <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#64748B', strokeWidth: 1 }}
                    allowEscapeViewBox={{ x: false, y: false }}
                    offset={10}
                    wrapperStyle={{
                        outline: 'none',
                        pointerEvents: 'none'
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#007AFF"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    activeDot={false}
                    connectNulls={false}
                    name="Poziom Energii"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};