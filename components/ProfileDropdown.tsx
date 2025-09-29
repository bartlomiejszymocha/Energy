import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { User } from 'firebase/auth';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface ProfileDropdownProps {
    user: User;
    onSignOut: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            setButtonRect(buttonRef.current.getBoundingClientRect());
        }
    }, [isOpen]);

    const displayName = user.displayName || 'Użytkownik';
    const photoURL = user.photoURL;

    return (
        <>
            <button 
                ref={buttonRef}
                onClick={() => {
                    console.log('ProfileDropdown clicked, current isOpen:', isOpen);
                    setIsOpen(!isOpen);
                }} 
                className="flex items-center justify-center h-12 w-12 sm:h-8 sm:w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-space-900 focus:ring-electric-500 p-2 sm:p-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors touch-manipulation"
                aria-label="Menu użytkownika"
            >
                {photoURL ? (
                    <img
                        className="h-8 w-8 sm:h-6 sm:w-6 rounded-full"
                        src={photoURL}
                        alt="User avatar"
                    />
                ) : (
                    <UserCircleIcon className="h-8 w-8 sm:h-6 sm:w-6 text-system-grey" />
                )}
            </button>
            {isOpen && buttonRect && createPortal(
                <div 
                    ref={dropdownRef}
                    className="fixed w-56 rounded-md shadow-lg py-1 bg-white dark:bg-space-800 border border-gray-200 dark:border-space-700 focus:outline-none z-[9999]"
                    style={{
                        top: buttonRect.bottom + 8,
                        left: buttonRect.right - 224, // 224px = width of dropdown (w-56 = 14rem = 224px)
                    }}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                >
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-space-700">
                        <p className="text-sm text-gray-500 dark:text-system-grey" role="none">
                            Zalogowany jako
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-cloud-white truncate" role="none">
                            {displayName}
                        </p>
                    </div>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onSignOut();
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-system-grey hover:bg-gray-100 dark:hover:bg-space-700 hover:text-gray-900 dark:hover:text-cloud-white"
                        role="menuitem"
                        id="user-menu-item-2"
                    >
                        Wyloguj
                    </a>
                </div>,
                document.body
            )}
        </>
    );
};