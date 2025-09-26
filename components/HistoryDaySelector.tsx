import React, { useMemo } from 'react';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface HistoryDaySelectorProps {
    availableDays: number[];
    selectedDay: number | null;
    onSelectDay: (timestamp: number) => void;
}

const getDayIdentifier = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const formatYear = (locale: string | undefined, date: Date): string => {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
    }).format(date);
};

export const HistoryDaySelector: React.FC<HistoryDaySelectorProps> = ({ availableDays, selectedDay, onSelectDay }) => {
    
    const daysWithEntries = useMemo(() => new Set(availableDays), [availableDays]);

    const tileClassName: CalendarProps['tileClassName'] = ({ date, view }) => {
        if (view === 'month') {
            const dayIdentifier = getDayIdentifier(date);
            if (daysWithEntries.has(dayIdentifier)) {
                return 'day-with-entry';
            }
        }
        return null;
    };
    
    const handleDateChange: CalendarProps['onChange'] = (value) => {
        if (value instanceof Date) {
            onSelectDay(getDayIdentifier(value));
        }
    };
    
    const navigationLabel: CalendarProps['navigationLabel'] = ({ date, label, view }) => {
        if (view === 'month') {
            const month = new Intl.DateTimeFormat('pl-PL', { month: 'long' }).format(date);
            const year = date.getFullYear();
            const currentYear = new Date().getFullYear();
            // Pokazuj rok tylko, jeśli nie jest to bieżący rok
            return year === currentYear ? month : `${month} ${year}`;
        }
        if (view === 'year') {
            return formatYear('pl-PL', date);
        }
        return label;
    };

    return (
        <div className="bg-space-900 rounded-xl shadow-lg p-4 h-full">
            <div className="calendar-container">
                 <Calendar
                    onChange={handleDateChange}
                    value={selectedDay ? new Date(selectedDay) : new Date()}
                    tileClassName={tileClassName}
                    locale="pl-PL"
                    showNeighboringMonth={false}
                    navigationLabel={navigationLabel}
                    prevLabel={<ChevronLeftIcon className="h-5 w-5" />}
                    prev2Label={null}
                    nextLabel={<ChevronRightIcon className="h-5 w-5" />}
                    next2Label={null}
                    formatShortWeekday={(locale, date) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date).slice(0, 2)}
                />
            </div>
        </div>
    );
};
