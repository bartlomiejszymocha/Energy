import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<Theme>('dark'); // Default to dark during SSR

    // Mount effect - read from localStorage after hydration
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && savedTheme !== theme) {
            setTheme(savedTheme);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return; // Don't run during SSR
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update Tailwind classes
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme, isDark: theme === 'dark', isLight: theme === 'light', mounted };
};
