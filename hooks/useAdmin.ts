import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

// Lista emaili administratorów
const ADMIN_EMAILS = [
    'bartlomiej.szymocha@gmail.com',
    'bartlomiej@bartlomiejszymocha.com'
];

export const useAdmin = () => {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (user?.email) {
            setIsAdmin(ADMIN_EMAILS.includes(user.email));
        } else {
            setIsAdmin(false);
        }
    }, [user?.email]);

    return { isAdmin };
};
