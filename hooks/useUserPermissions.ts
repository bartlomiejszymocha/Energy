import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type UserRole = 'public' | 'pro' | 'admin';
export type ActionRule = 'priv' | 'public' | 'pro';

interface UserPermissions {
    role: UserRole;
    canViewAction: (rule: ActionRule) => boolean;
    isLoading: boolean;
    isAdmin: boolean;
    isPro: boolean;
    isPublic: boolean;
}

export const useUserPermissions = (): UserPermissions => {
    console.log('🔍 useUserPermissions: Hook called');
    const { user, loadingAuth } = useAuth();
    const [userRole, setUserRole] = useState<UserRole>('public');
    const [isLoading, setIsLoading] = useState(true);
    
    // TEMPORARY: Force admin role for debugging
    console.log('🔍 useUserPermissions: user email:', user?.email);
    if (user?.email === 'bartlomiej.szymocha@gmail.com') {
        console.log('🔍 useUserPermissions: FORCING ADMIN ROLE FOR DEBUG');
        setUserRole('admin');
        setIsLoading(false);
    }

    useEffect(() => {
        const determineUserRole = async () => {
            console.log('🔍 useUserPermissions: determineUserRole called', { loadingAuth, user: user?.email });
            
            if (loadingAuth) return;
            
            if (!user) {
                console.log('🔍 useUserPermissions: No user, setting public role');
                setUserRole('public');
                setIsLoading(false);
                return;
            }

            try {
                // 1. Check if user is admin (your email)
                const adminEmails = [
                    'bartlomiejszymocha@gmail.com', // Twój email
                    // Dodaj inne admin emails tutaj
                ];

                if (adminEmails.includes(user.email || '')) {
                    console.log('🔍 Admin email detected:', user.email, 'setting role to admin');
                    setUserRole('admin');
                    setIsLoading(false);
                    return;
                }

                // 2. Check if we're in development (localhost)
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('🔍 Development mode - defaulting to admin role for testing');
                    setUserRole('admin'); // Admin role for local testing
                    setIsLoading(false);
                    return;
                }

                // 3. Check user role from Google Sheets API (production only)
                const response = await fetch('/api/sheets-to-clients');
                
                if (response.ok) {
                    const clients = await response.json();
                    const currentUserClient = clients.find((client: any) => 
                        client.uid === user.uid || client.email === user.email
                    );

                    if (currentUserClient) {
                        setUserRole(currentUserClient.role || 'public');
                    } else {
                        // 3. User not in clients sheet - add them as public
                        await addUserToClientsSheet(user);
                        setUserRole('public');
                    }
                } else {
                    // 4. API error - default to public
                    console.warn('Failed to fetch user permissions, defaulting to public');
                    setUserRole('public');
                }
            } catch (error) {
                console.error('Error determining user role:', error);
                setUserRole('public');
            } finally {
                setIsLoading(false);
            }
        };

        determineUserRole();
    }, [user, loadingAuth]);

    // Helper function to add user to clients sheet
    const addUserToClientsSheet = async (user: any) => {
        try {
            const response = await fetch('/api/add-client', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || '',
                    role: 'public',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                console.warn('Failed to add user to clients sheet');
            }
        } catch (error) {
            console.error('Error adding user to clients sheet:', error);
        }
    };

    // Permission checking function
    const canViewAction = (rule: ActionRule): boolean => {
        console.log('🔍 canViewAction check:', { rule, userRole, isLoading });
        
        // If still loading permissions, default to showing public actions
        if (isLoading) {
            console.log('⏳ Still loading permissions, defaulting to public only');
            return rule === 'public' || rule === undefined;
        }
        
        if (rule === 'priv') {
            const canSee = userRole === 'admin';
            console.log('🔒 Private action check:', { canSee, userRole, isAdmin: userRole === 'admin' });
            return canSee; // Only admin can see private actions
        }
        
        if (rule === 'pro') {
            return userRole === 'pro' || userRole === 'admin'; // Pro and admin can see pro actions
        }
        
        if (rule === 'public' || rule === undefined) {
            return true; // Everyone can see public actions
        }
        
        console.log('⚠️ Unknown rule:', rule, 'defaulting to true for safety');
        return true; // Default to showing action if rule is unknown
    };

    return {
        role: userRole,
        canViewAction,
        isLoading: isLoading || loadingAuth,
        isAdmin: userRole === 'admin',
        isPro: userRole === 'pro',
        isPublic: userRole === 'public',
    };
};
