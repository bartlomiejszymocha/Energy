import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EnergyLog, CompletedActionLog } from '../types';
import { ACTION_LIBRARY } from '../constants/actions';

interface EnergyChartProps {
    logs: EnergyLog[];
    completedActions: CompletedActionLog[];
}

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    
    switch (payload.markerType) {
        case 'protocol': // Protokół Ruchowy
            // Star shape for protocols (orange)
            return <svg x={cx - 6} y={cy - 6} width="12" height="12" fill="#FF9500" viewBox="0 0 1024 1024">
                <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00-7.6 36.2c1.6 7.3 5.1 14.1 10.2 19.5l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5.1-5.4 8.6-12.2 10.2-19.5a32.05 32.05 0 00-7.6-36.2c-4.9-5-11.3-8.3-18.3-9.3z"></path>
            </svg>;
        case 'reset': // Reset Energetyczny
            // Diamond shape for resets (yellow)
            return <svg x={cx - 6} y={cy - 6} width="12" height="12" fill="#FFCC00" viewBox="0 0 24 24">
                <path d="M12 .587l11.413 11.413L12 23.413.587 12 12 .587z" />
            </svg>;
        case 'log': // Energy Log
        default:
            // Standard circle for energy logs (blue)
            return <circle cx={cx} cy={cy} r={5} fill="#007AFF" />;
    }
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        let content;
        const formattedTime = new Date(label).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        if (data.isAction) {
            const actionType = data.markerType === 'reset' ? 'Reset' : 'Protokół';
            const color = data.markerType === 'reset' ? '#FFCC00' : '#FF9500';
            content = <p className="intro" style={{ color, fontWeight: 'bold' }}>{`Wykonano ${actionType}: ${data.title}`}</p>;
        } else {
            content = <p className="intro" style={{ color: '#007AFF', fontWeight: 'bold' }}>{`Poziom Energii: ${data['Poziom Energii']}`}</p>;
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
    const data = useMemo(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

        const todayLogs = logs
            .filter(log => log.timestamp >= startOfToday)
            .map(log => ({
                markerType: 'log',
                isAction: false,
                timestamp: log.timestamp,
                'Poziom Energii': log.rating,
                title: `Energia: ${log.rating}`,
            }));

        const todayCompletedActions = completedActions
            .filter(log => log.timestamp >= startOfToday)
            .map(action => {
                const actionDetails = ACTION_LIBRARY.find(a => a.id === action.actionId);
                const markerType = actionDetails?.type === 'Reset Energetyczny' ? 'reset' : 'protocol';
                return {
                    markerType,
                    isAction: true,
                    timestamp: action.timestamp,
                    'Poziom Energii': null,
                    title: actionDetails ? actionDetails.title : 'Wykonano',
                };
            });

        const sortedCombined = [...todayLogs, ...todayCompletedActions].sort((a, b) => a.timestamp - b.timestamp);

        let lastEnergyLevel: number | null = null;
        sortedCombined.forEach(item => {
            if (!item.isAction) {
                lastEnergyLevel = item['Poziom Energii'];
            } else if (lastEnergyLevel !== null) {
                item['Poziom Energii'] = lastEnergyLevel;
            }
        });

        return sortedCombined.filter(item => item['Poziom Energii'] !== null);

    }, [logs, completedActions]);

    if (data.length < 1) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-system-grey">Brak dzisiejszych wpisów do wyświetlenia na wykresie.</p>
            </div>
        )
    }

    const formatXAxis = (tickItem: number) => {
        return new Date(tickItem).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#35456A" />
                <XAxis 
                    dataKey="timestamp" 
                    type="number" 
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatXAxis}
                    stroke="#8A94A6"
                />
                <YAxis domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} stroke="#8A94A6" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#F4F6F8' }} />
                <Line
                    type="monotone"
                    dataKey="Poziom Energii"
                    stroke="#007AFF"
                    strokeWidth={3}
                    dot={<CustomDot />}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};