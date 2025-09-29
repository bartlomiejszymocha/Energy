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
    const { user, loadingAuth } = useAuth();
    const [userRole, setUserRole] = useState<UserRole>('public');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const determineUserRole = async () => {
            if (loadingAuth) return;
            
            if (!user) {
                setUserRole('public');
                setIsLoading(false);
                return;
            }

            try {
                // Check if we're in development (localhost) - default to admin for testing
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    setUserRole('admin');
                    setIsLoading(false);
                    return;
                }

                // Check user role from Google Sheets API
                const response = await fetch('https://www.resetujenergie.pl/api/sheets-to-clients');
                
                if (response.ok) {
                    const clients = await response.json();
                    
                    const currentUserClient = clients.find((client: any) => 
                        client.uid === user.uid || client.email === user.email
                    );

                    if (currentUserClient) {
                        setUserRole(currentUserClient.role || 'public');
                    } else {
                        // User not in clients sheet - add them as public
                        await addUserToClientsSheet(user);
                        setUserRole('public');
                    }
                } else {
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
        // If still loading permissions, default to showing public actions
        if (isLoading) {
            return rule === 'public';
        }
        
        if (rule === 'admin') {
            return userRole === 'admin'; // Only admin can see admin actions
        }
        
        if (rule === 'pro') {
            return userRole === 'pro' || userRole === 'admin'; // Pro and admin can see pro actions
        }
        
        if (rule === 'public') {
            return true; // Everyone can see public actions
        }
        
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
