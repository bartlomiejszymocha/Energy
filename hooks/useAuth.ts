import { useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithPopup,
    type User
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebase';
import { useConvertKit } from './useConvertKit';

// Function to force dark mode
const forceDarkMode = () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const { addSubscriber } = useConvertKit();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // ConvertKit integration with enhanced debugging
            console.log('🔍 Auth state change:', {
                hasCurrentUser: !!currentUser,
                currentUserEmail: currentUser?.email,
                hasUser: !!user,
                userEmail: user?.email,
                isNewLogin: !!(currentUser && !user),
                userChanged: currentUser !== user
            });
            
            // Check if we should add user to ConvertKit
            if (currentUser && currentUser.email) {
                const convertKitKey = `convertkit_added_${currentUser.email}`;
                const alreadyAdded = localStorage.getItem(convertKitKey);
                const hasPendingSubscription = localStorage.getItem('pendingNewsletterSubscription');
                
                // DEBUG: Allow re-processing for testing
                const shouldForceProcess = window.location.hostname === 'localhost' && 
                    localStorage.getItem('forceConvertKitProcess') === 'true';
                
                console.log('🔍 ConvertKit check:', {
                    userEmail: currentUser.email,
                    alreadyAdded: !!alreadyAdded,
                    hasPendingSubscription: !!hasPendingSubscription,
                    shouldProcess: !alreadyAdded && hasPendingSubscription,
                    forceProcess: shouldForceProcess,
                    hostname: window.location.hostname
                });
                
                if ((!alreadyAdded && hasPendingSubscription) || shouldForceProcess) {
                    console.log('🔍 Processing ConvertKit subscription for:', currentUser.email);
                    
                    try {
                        if (addSubscriber && currentUser.email) {
                            const firstName = currentUser.displayName?.split(' ')[0] || '';
                            
                            // Read newsletter preference from localStorage
                            const wantsNewsletter = localStorage.getItem('pendingNewsletterSubscription') === 'true';
                            const storedValue = localStorage.getItem('pendingNewsletterSubscription');
                            
                            console.log('🔍 Newsletter preference check:', {
                                storedValue,
                                wantsNewsletter,
                                localStorageKeys: Object.keys(localStorage)
                            });
                            
                            console.log('🔍 Attempting to add to ConvertKit:', {
                                email: currentUser.email,
                                firstName,
                                hasAddSubscriber: !!addSubscriber,
                                subscribeToNewsletter: wantsNewsletter
                            });
                            
                            const result = await addSubscriber(currentUser.email, firstName, {
                                tags: ['Energy Playbook User', 'Google Login'],
                                fields: { 'login_method': 'Google', 'signup_date': new Date().toISOString() },
                                subscribeToNewsletter: wantsNewsletter
                            });
                            
                            console.log('✅ ConvertKit result:', result);
                            
                            // Mark user as added to ConvertKit
                            localStorage.setItem(convertKitKey, 'true');
                            
                            // Clear pending subscription
                            localStorage.removeItem('pendingNewsletterSubscription');
                        } else {
                            console.warn('⚠️ ConvertKit add failed:', {
                                hasAddSubscriber: !!addSubscriber,
                                hasEmail: !!currentUser.email,
                                addSubscriber: addSubscriber
                            });
                        }
                    } catch (error) {
                        console.error('❌ ConvertKit error:', error);
                    }
                }
                
                // Check if we should add user to Google Sheets clients (production only)
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                    const sheetsClientKey = `sheets_client_added_${currentUser.email}`;
                    const alreadyAddedToSheets = localStorage.getItem(sheetsClientKey);
                    
                    // Add user to clients sheet on first login
                    if (!alreadyAddedToSheets) {
                        console.log('🔍 Adding user to Google Sheets clients:', currentUser.email);
                    
                        try {
                        const clientData = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName || '',
                            role: 'public', // Default role
                            lastLogin: new Date().toISOString()
                        };
                        
                        const response = await fetch('/api/add-client', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(clientData)
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            console.log('✅ User added to Google Sheets clients:', result);
                            
                            // Mark user as added to prevent duplicate requests
                            localStorage.setItem(sheetsClientKey, 'true');
                        } else {
                            console.error('❌ Failed to add user to Google Sheets clients:', response.status);
                        }
                        } catch (error) {
                            console.error('❌ Error adding user to Google Sheets clients:', error);
                        }
                    }
                }
            } else {
                console.log('🔍 Development mode - skipping Google Sheets client addition');
            }
            
            setUser(currentUser);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [user, addSubscriber]);

    const signInWithGoogle = async (): Promise<void> => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
            // Force dark mode after successful login
            forceDarkMode();
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