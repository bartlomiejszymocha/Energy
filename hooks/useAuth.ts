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
            // ConvertKit integration with enhanced debugging
            if (currentUser && !user) {
                console.log('🔍 New user login detected:', currentUser.email);
                console.log('🔍 Environment check:', {
                    hasApiKey: !!process.env.CONVERTKIT_API_KEY,
                    hasSequenceId: !!process.env.CONVERTKIT_SEQUENCE_ID,
                    hasFormId: !!process.env.CONVERTKIT_FORM_ID
                });
                
                try {
                    if (addSubscriber && currentUser.email) {
                        const firstName = currentUser.displayName?.split(' ')[0] || '';
                        console.log('🔍 Attempting to add to ConvertKit:', {
                            email: currentUser.email,
                            firstName,
                            hasAddSubscriber: !!addSubscriber
                        });
                        
                        const result = await addSubscriber(currentUser.email, firstName, {
                            tags: ['Energy Playbook User', 'Google Login'],
                            fields: { 'login_method': 'Google', 'signup_date': new Date().toISOString() }
                        });
                        
                        console.log('✅ ConvertKit result:', result);
                    } else {
                        console.warn('⚠️ ConvertKit add failed:', {
                            hasAddSubscriber: !!addSubscriber,
                            hasEmail: !!currentUser.email
                        });
                    }
                } catch (error) {
                    console.error('❌ ConvertKit error:', error);
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