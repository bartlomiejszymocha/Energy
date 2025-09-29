import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export type UserRole = 'public' | 'pro' | 'admin';
export type ActionRule = 'public' | 'pro' | 'admin';

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
                // TEMPORARY FIX: Always default to admin until API is fixed
                console.log('🔍 TEMPORARY FIX: Defaulting to admin role until API is fixed');
                setUserRole('admin');
                setIsLoading(false);
                return;
                
                // Check if we're in development (localhost) - default to admin for testing
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.log('🔍 Development mode - defaulting to admin role for testing');
                    setUserRole('admin');
                    setIsLoading(false);
                    return;
                }

                // Check user role from Google Sheets API
                console.log('🔍 Fetching user role from Google Sheets API...');
                const response = await fetch('https://www.resetujenergie.pl/api/sheets-to-clients');
                
                if (response.ok) {
                    const clients = await response.json();
                    console.log('🔍 Clients from API:', clients);
                    
                    const currentUserClient = clients.find((client: any) => 
                        client.uid === user.uid || client.email === user.email
                    );

                    if (currentUserClient) {
                        console.log('🔍 Found user in clients sheet:', currentUserClient);
                        setUserRole(currentUserClient.role || 'public');
                    } else {
                        console.log('🔍 User not found in clients sheet, adding as public...');
                        // User not in clients sheet - add them as public
                        await addUserToClientsSheet(user);
                        setUserRole('public');
                    }
                } else {
                    console.warn('Failed to fetch user permissions, defaulting to public');
                    setUserRole('public');
                }
            } catch (error) {
                console.error('Error determining user role:', error);
                setUserRole('public'); // Fallback to public on error
            } finally {
                setIsLoading(false);
            }
        };

        determineUserRole();
    }, [user, loadingAuth]);

    // Helper function to add user to clients sheet
    const addUserToClientsSheet = async (user: any) => {
        try {
            const response = await fetch('https://www.resetujenergie.pl/api/add-client', {
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
            return rule === 'public';
        }
        
        if (rule === 'admin') {
            const canSee = userRole === 'admin';
            console.log('🔒 Admin action check:', { canSee, userRole, isAdmin: userRole === 'admin' });
            return canSee; // Only admin can see admin actions
        }
        
        if (rule === 'pro') {
            const canSee = userRole === 'pro' || userRole === 'admin';
            console.log('⭐ Pro action check:', { canSee, userRole, isProOrAdmin: userRole === 'pro' || userRole === 'admin' });
            return canSee; // Pro and admin can see pro actions
        }
        
        if (rule === 'public') {
            return true; // Everyone can see public actions
        }
        
        console.log('⚠️ Unknown rule:', rule, 'defaulting to false for safety');
        return false; // Default to hiding action if rule is unknown
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
