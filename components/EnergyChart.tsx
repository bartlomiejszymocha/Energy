import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnergyLog, CompletedActionLog, ChartPoint } from '../types';
import { useSheetsActionsOptimized } from '../hooks/useSheetsActionsOptimized';
import { useTheme } from '../hooks/useTheme';

interface EnergyChartProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
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
        
        return (
            <div 
                className="bg-white dark:bg-space-800 p-3 border border-gray-200 dark:border-white/20 rounded-lg shadow-lg z-50"
                style={{
                    position: 'relative',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}
            >
                <p className="text-gray-900 dark:text-cloud-white font-medium text-sm">{`Czas: ${time}`}</p>
                <p className="text-blue-600 dark:text-blue-400 text-sm">{`Energia: ${data.rating}`}</p>
                {data.actionTitle && (
                    <p className="text-gray-600 dark:text-system-grey text-sm">{`Akcja: ${data.actionTitle}`}</p>
                )}
                {data.note && (
                    <p className="text-gray-600 dark:text-system-grey text-sm">{`Notatka: ${data.note}`}</p>
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
    
    if (payload.isNoteOnly) {
        return <circle cx={cx} cy={cy} r={5} fill="#FF9500" stroke={fillColor} strokeWidth={2} />;
    }
    
    // Render action icon if it's an action
    if (payload.isAction && payload.icon) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={9} fill="#007AFF" stroke={fillColor} strokeWidth={2} />
                <text 
                    x={cx} 
                    y={cy + 2} 
                    textAnchor="middle" 
                    fontSize="12" 
                    fill={fillColor}
                    style={{ pointerEvents: 'none' }}
                >
                    {payload.icon}
                </text>
            </g>
        );
    }
    
    return <circle cx={cx} cy={cy} r={6} fill="#007AFF" stroke={fillColor} strokeWidth={2} />;
};

const CustomActiveDot = (props: { cx: number; cy: number; payload: ChartPoint }) => {
    const { cx, cy, payload } = props;
    const { isDark } = useTheme();
    const strokeColor = isDark ? '#F4F6F8' : '#374151';
    if (payload.isNoteOnly) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={8} stroke={strokeColor} strokeWidth={2} fill="#FF9500" />
            </g>
        );
    }
    if (payload.isAction) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={12} stroke={strokeColor} strokeWidth={1} fill="rgba(0,122,255,0.2)" />
                <text x={cx} y={cy} dy={6} textAnchor="middle" fontSize="20px" fill={strokeColor}>
                    {payload.icon}
                </text>
            </g>
        );
    }
    return <circle cx={cx} cy={cy} r={6} stroke={strokeColor} strokeWidth={2} fill="#007AFF" />;
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
    
    return (
        <YAxis 
            key={`yaxis-${isDark}`}
            domain={[0.5, 5.5]} 
            ticks={[1, 2, 3, 4, 5]} 
            stroke={textColor} 
            allowDecimals={false} 
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

export const EnergyChart: React.FC<EnergyChartProps> = ({ logs, completedActions }) => {
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
                        isNoteOnly: false,
                        isAction: false
                    });
                } else {
                    processedData.push({
                        timestamp: event.timestamp,
                        rating: lastRating || 3,
                        note: event.note,
                        isNoteOnly: true,
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
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-system-grey">Brak dzisiejszych wpisów do wyświetlenia na wykresie.</p>
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
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const time = new Date(label).toLocaleTimeString('pl-PL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            });
                            const energy = payload[0].value;
                            return (
                                <div className="bg-white/90 dark:bg-electric-500/10 border border-gray-200/50 dark:border-electric-500/20 rounded-xl shadow-lg p-3 backdrop-blur-sm">
                                    <p className="text-gray-600 dark:text-cloud-white text-sm">{time}</p>
                                    <p className="text-gray-900 dark:text-cloud-white font-semibold">Energia: {energy}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
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