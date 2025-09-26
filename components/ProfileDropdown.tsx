import React, { useState, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface ProfileDropdownProps {
    user: User;
    onSignOut: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onSignOut }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const displayName = user.displayName || 'Użytkownik';
    const photoURL = user.photoURL;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-space-900 focus:ring-electric-500">
                {photoURL ? (
                    <img
                        className="h-9 w-9 rounded-full"
                        src={photoURL}
                        alt="User avatar"
                    />
                ) : (
                    <UserCircleIcon className="h-9 w-9 text-system-grey" />
                )}
            </button>
            {isOpen && (
                <div 
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-space-800 ring-1 ring-space-700 ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                >
                    <div className="px-4 py-2 border-b border-space-700">
                        <p className="text-sm text-system-grey" role="none">
                            Zalogowany jako
                        </p>
                        <p className="text-sm font-medium text-cloud-white truncate" role="none">
                            {displayName}
                        </p>
                    </div>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onSignOut();
                        }}
                        className="block px-4 py-2 text-sm text-system-grey hover:bg-space-700 hover:text-cloud-white"
                        role="menuitem"
                        id="user-menu-item-2"
                    >
                        Wyloguj
                    </a>
                </div>
            )}
        </div>
    );
};