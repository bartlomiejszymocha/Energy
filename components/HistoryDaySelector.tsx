import React, { useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/LucideIcons';

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
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as first day
        const monday = new Date(today);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    });
    
    const daysWithEntries = useMemo(() => new Set(availableDays), [availableDays]);

    // Automatyczne przełączanie widoku na podstawie rozmiaru ekranu
    const [isMobile, setIsMobile] = useState(false);
    
    React.useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const tileClassName: CalendarProps['tileClassName'] = ({ date, view }) => {
        if (view === 'month' || view === 'week') {
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

    // Funkcje nawigacji tygodniami
    const goToPreviousWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newWeekStart);
    };

    const goToNextWeek = () => {
        const newWeekStart = new Date(currentWeekStart);
        newWeekStart.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newWeekStart);
    };

    // Generowanie dni tygodnia
    const weekDays = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            days.push(day);
        }
        return days;
    }, [currentWeekStart]);
    
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

    // Formatowanie tytułu dla widoku tygodniowego
    const getWeekTitle = () => {
        const startDay = currentWeekStart.getDate();
        const startMonth = new Intl.DateTimeFormat('pl-PL', { month: 'short' }).format(currentWeekStart);
        const endDate = new Date(currentWeekStart);
        endDate.setDate(currentWeekStart.getDate() + 6);
        const endDay = endDate.getDate();
        const endMonth = new Intl.DateTimeFormat('pl-PL', { month: 'short' }).format(endDate);
        
        if (currentWeekStart.getMonth() === endDate.getMonth()) {
            return `${startDay}-${endDay} ${startMonth}`;
        } else {
            return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
        }
    };

    // Widok tygodniowy na mobile
    if (isMobile) {
        return (
            <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-4 h-full border border-gray-200 dark:border-transparent">
                {/* Nagłówek z nawigacją */}
                <div className="flex items-center justify-between mb-4">
                    <button onClick={goToPreviousWeek} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition">
                        <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-system-grey" />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-cloud-white">
                        {getWeekTitle()}
                    </h3>
                    <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition">
                        <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-system-grey" />
                    </button>
                </div>

                {/* Dni tygodnia */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Po', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Ni'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-system-grey py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Kalendarz tygodniowy */}
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => {
                        const dayIdentifier = getDayIdentifier(day);
                        const isSelected = selectedDay === dayIdentifier;
                        const hasEntry = daysWithEntries.has(dayIdentifier);
                        const isToday = day.toDateString() === new Date().toDateString();
                        
                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => onSelectDay(dayIdentifier)}
                                className={`
                                    relative p-3 text-center rounded-lg transition-all duration-200
                                    ${isSelected 
                                        ? 'bg-electric-500 text-white shadow-lg' 
                                        : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-cloud-white'
                                    }
                                    ${isToday && !isSelected ? 'ring-2 ring-electric-500/50' : ''}
                                `}
                            >
                                <div className="text-sm font-medium">{day.getDate()}</div>
                                {hasEntry && (
                                    <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                                        isSelected ? 'bg-white' : 'bg-electric-500'
                                    }`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Widok miesięczny na desktop
    return (
        <div className="bg-white dark:bg-space-900 rounded-xl shadow-lg p-4 h-full border border-gray-200 dark:border-transparent">
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
