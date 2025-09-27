import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithPopup,
    type User
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebase';
import { useConvertKit } from './useConvertKit';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const { addSubscriber } = useConvertKit();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // If user just logged in (currentUser exists and previous user was null)
            if (currentUser && !user) {
                // Add to ConvertKit only for new logins (safely)
                try {
                    if (addSubscriber && currentUser.email) {
                        const firstName = currentUser.displayName?.split(' ')[0] || '';
                        await addSubscriber(
                            currentUser.email, 
                            firstName,
                            {
                                tags: ['Energy Playbook User', 'Google Login'],
                                fields: {
                                    'login_method': 'Google',
                                    'signup_date': new Date().toISOString()
                                }
                            }
                        );
                        console.log('User successfully added to ConvertKit');
                    }
                } catch (error) {
                    console.error('Failed to add user to ConvertKit:', error);
                    // Don't prevent login if ConvertKit fails
                }
            }
            
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [user, addSubscriber]);

    const signInWithGoogle = async (): Promise<void> => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
        } catch (error) {
            const authError = error as { code: string; message: string; };
            console.error("Firebase sign in error", authError);

            if (authError.code === 'auth/operation-not-allowed') {
                throw new Error("Logowanie Google jest wyłączone. Włącz je w konsoli Firebase.");
            } else if (authError.code === 'auth/popup-blocked') {
                throw new Error("Okienko logowania zostało zablokowane przez przeglądarkę.");
            } else if (authError.code === 'auth/cancelled-popup-request') {
                // User closed the popup, don't show a scary error
                throw new Error("Proces logowania został anulowany.");
            }
            throw new Error(`Błąd podczas logowania do Firebase.`);
        }
    };
    
    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Błąd podczas wylogowywania:", error);
        }
    };

    return { user, loadingAuth, signInWithGoogle, signOut };
};