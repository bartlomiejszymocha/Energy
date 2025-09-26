import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnergyLog, CompletedActionLog } from '../types';
import { ACTION_LIBRARY } from '../constants/actions';

interface EnergyChartProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
}

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isNoteOnly) {
        return <circle cx={cx} cy={cy} r={5} fill="#FF9500" />; // alert-orange
    }
    if (payload.isAction) {
        return (
            <text x={cx} y={cy} dy={5} textAnchor="middle" fontSize="16px" style={{ pointerEvents: 'none' }}>
                {payload.icon}
            </text>
        );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#007AFF" />;
};

const CustomActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
     if (payload.isNoteOnly) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={8} stroke="#F4F6F8" strokeWidth={2} fill="#FF9500" />
            </g>
        );
    }
    if (payload.isAction) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={12} stroke="#F4F6F8" strokeWidth={1} fill="rgba(0,122,255,0.2)" />
                <text x={cx} y={cy} dy={6} textAnchor="middle" fontSize="20px" fill="#F4F6F8">
                    {payload.icon}
                </text>
            </g>
        );
    }
    return <circle cx={cx} cy={cy} r={6} stroke="#F4F6F8" strokeWidth={2} fill="#007AFF" />;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const pointData = payload[0].payload;
        const formattedTime = new Date(label).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        let content;
        if (pointData.isAction) {
            const { icon, title } = pointData;
            content = <p className="intro text-cloud-white font-bold">{`${icon} ${title}`}</p>;
        } else if (pointData.isNoteOnly) {
             content = (
                <>
                    <p className="intro text-alert-orange font-bold">📝 Notatka</p>
                    {pointData.note && <p className="desc text-system-grey mt-1 max-w-[200px] break-words">{pointData.note}</p>}
                </>
            );
        } else {
            content = (
                 <>
                    <p className="intro text-electric-500 font-bold">{`Poziom Energii: ${pointData.rating}`}</p>
                    {pointData.note && <p className="desc text-system-grey mt-1 max-w-[200px] break-words">{pointData.note}</p>}
                 </>
            );
        }

        return (
            <div className="bg-space-950 p-3 border border-space-700 rounded-lg shadow-lg">
                <p className="label text-system-grey mb-1">{`${formattedTime}`}</p>
                {content}
            </div>
        );
    }
    return null;
};


export const EnergyChart: React.FC<EnergyChartProps> = ({ logs, completedActions }) => {
    const chartData = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        const todayLogs = logs.filter(log => log.timestamp >= startOfToday);
        const todayCompletedActions = completedActions.filter(log => log.timestamp >= startOfToday);

        const allEvents = [
            ...todayLogs.map(log => ({ ...log, type: 'log' as const })),
            ...todayCompletedActions.map(action => ({ ...action, type: 'action' as const }))
        ].sort((a, b) => a.timestamp - b.timestamp);

        let lastRating: number | null = null;
        const processedData: any[] = [];

        for (const event of allEvents) {
            if (event.type === 'log') {
                if (typeof event.rating === 'number') {
                    lastRating = event.rating;
                    processedData.push({
                        timestamp: event.timestamp,
                        rating: event.rating,
                        note: event.note,
                        isAction: false,
                        isNoteOnly: false,
                    });
                } else { // Note-only log
                    if (lastRating !== null) {
                        processedData.push({
                            timestamp: event.timestamp,
                            rating: lastRating, // Carry over the last rating for the line
                            note: event.note,
                            isAction: false,
                            isNoteOnly: true,
                        });
                    }
                }
            } else { // event.type === 'action'
                if (lastRating !== null) {
                    const actionDetails = ACTION_LIBRARY.find(a => a.id === event.actionId);
                    processedData.push({
                        timestamp: event.timestamp,
                        rating: lastRating,
                        isAction: true,
                        isNoteOnly: false,
                        title: actionDetails ? actionDetails.title : 'Wykonano',
                        icon: actionDetails?.icon || '❓',
                    });
                }
            }
        }

        return processedData;
    }, [logs, completedActions]);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-system-grey">Brak dzisiejszych wpisów do wyświetlenia na wykresie.</p>
            </div>
        )
    }

    const formatXAxis = (tickItem: number) => {
        return new Date(tickItem).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };
    
    const gridColor = '#35456A';
    const textColor = '#8A94A6';
    const cursorColor = '#F4F6F8';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                    dataKey="timestamp" 
                    type="number" 
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatXAxis}
                    stroke={textColor}
                    padding={{ left: 10, right: 10 }}
                />
                <YAxis domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} stroke={textColor} allowDecimals={false} />
                <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: cursorColor, strokeWidth: 1 }}
                />
                <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#007AFF"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    activeDot={<CustomActiveDot />}
                    connectNulls={false}
                    name="Poziom Energii"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};