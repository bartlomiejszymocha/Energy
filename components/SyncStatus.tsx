import React from 'react';
import { ArrowUpTrayIcon, ArrowPathCircularIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons/Icons';
import type { SyncState } from '../hooks/useEnergyData';

interface SyncStatusProps {
    status: SyncState;
    lastSync: number | null;
    onSync: () => void;
}

const STATUS_CONFIG = {
    idle: {
        icon: ArrowUpTrayIcon,
        text: 'Sync',
        color: 'text-system-grey',
        hoverColor: 'hover:text-cloud-white',
        title: (timestamp: number | null) => timestamp ? `Ostatni sync: ${new Date(timestamp).toLocaleString('pl-PL')}` : 'Gotowy do sync',
    },
    syncing: {
        icon: ArrowPathCircularIcon,
        text: 'Syncing...',
        color: 'text-electric-500',
        hoverColor: '',
        title: () => 'Trwa sync danych...',
    },
    success: {
        icon: CheckCircleIcon,
        text: 'Zapisano',
        color: 'text-success-green',
        hoverColor: '',
        title: (timestamp: number | null) => `Zsynchronizowano pomyślnie o ${new Date(timestamp!).toLocaleString('pl-PL')}`,
    },
    error: {
        icon: ExclamationTriangleIcon,
        text: 'Błąd sync',
        color: 'text-danger-red',
        hoverColor: 'hover:text-danger-red/80',
        title: () => 'Wystąpił błąd. Kliknij, aby spróbować ponownie.',
    },
};

export const SyncStatus: React.FC<SyncStatusProps> = ({ status, lastSync, onSync }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    const isSyncing = status === 'syncing' || status === 'success';

    return (
        <button
            onClick={onSync}
            disabled={isSyncing}
            title={config.title(lastSync)}
            className={`flex items-center gap-2 bg-space-800 px-3 py-1.5 rounded-full transition-colors animate-fade-in-up disabled:cursor-wait ${config.hoverColor}`}
        >
            <Icon className={`h-5 w-5 ${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
        </button>
    );
};