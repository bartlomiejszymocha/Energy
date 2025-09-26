import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithPopup,
    type User
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebase';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

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