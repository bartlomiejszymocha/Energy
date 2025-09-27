
import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';

interface LoginScreenProps {
    onSignIn: () => Promise<void>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEmailConsentChecked, setIsEmailConsentChecked] = useState(false);
    const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);

    const handleSignInClick = async () => {
        if (!isEmailConsentChecked) {
            setError('Musisz wyrazić zgodę na otrzymywanie emaili marketingowych, aby kontynuować. 📧');
            return;
        }
        
        // Store newsletter preference in localStorage for useAuth to read
        if (typeof window !== 'undefined') {
            localStorage.setItem('pendingNewsletterSubscription', subscribeToNewsletter.toString());
        }
        
        setIsLoading(true);
        setError(null);
        try {
            await onSignIn();
            // On success, the onAuthStateChanged listener in useAuth will handle the redirect.
        } catch (e: any) {
            console.error("Błąd podczas procesu logowania Google:", e);
            setError(e.message || 'Wystąpił nieznany błąd podczas logowania.');
            setIsLoading(false);
            // Clear localStorage on error
            if (typeof window !== 'undefined') {
                localStorage.removeItem('pendingNewsletterSubscription');
            }
        }
    };
    
    return (
        <div className="bg-space-950 min-h-screen flex flex-col items-center justify-center p-4">
            <main className="text-center w-full max-w-2xl">
                <span className="text-6xl animate-fade-in-up">🎯</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-cloud-white mt-4 animate-fade-in-up animation-delay-100">
            Witaj w Energy Playbook
          </h1>
                <p className="text-system-grey max-w-md mx-auto mt-4 text-lg animate-fade-in-up animation-delay-200">
                    Odzyskaj kontrolę nad swoją energią, aby osiągać więcej bez wypalenia.
                </p>
                <div className="mt-10 animate-fade-in-up animation-delay-300">
                    <button
                        onClick={handleSignInClick}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-3 bg-cloud-white text-space-950 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 text-lg disabled:bg-space-700 disabled:text-system-grey/70 disabled:cursor-wait disabled:scale-100"
                    >
                        <GoogleIcon className="h-6 w-6" />
                        <span>{isLoading ? 'Logowanie...' : 'Zaloguj się z Google'}</span>
                    </button>
                    
                    {/* Email consent checkboxes */}
                    <div className="mt-6 space-y-4 max-w-md mx-auto">
                        {/* App notifications (required) */}
                        <div className="flex items-start gap-3 text-left">
                            <input
                                type="checkbox"
                                id="email-consent"
                                checked={isEmailConsentChecked}
                                onChange={(e) => setIsEmailConsentChecked(e.target.checked)}
                                className="mt-1 h-4 w-4 text-electric-500 bg-space-800 border-space-600 rounded focus:ring-electric-500 focus:ring-2"
                            />
                            <label htmlFor="email-consent" className="text-sm text-system-grey cursor-pointer">
                                <span className="text-electric-500 font-medium">Wymagane:</span> Otrzymywanie powiadomień o aktualizacjach aplikacji Energy Playbook.
                                <span className="block mt-1 text-xs text-system-grey/70">
                                    Zawsze możesz się wypisać jednym kliknięciem. 📧
                                </span>
                            </label>
                        </div>

                        {/* Newsletter (optional) */}
                        <div className="flex items-start gap-3 text-left">
                            <input
                                type="checkbox"
                                id="newsletter-consent"
                                checked={subscribeToNewsletter}
                                onChange={(e) => setSubscribeToNewsletter(e.target.checked)}
                                className="mt-1 h-4 w-4 text-electric-500 bg-space-800 border-space-600 rounded focus:ring-electric-500 focus:ring-2"
                            />
                            <label htmlFor="newsletter-consent" className="text-sm text-system-grey cursor-pointer">
                                <span className="text-warning-yellow font-medium">Opcjonalne:</span> Newsletter z tipami o produktywności i zarządzaniu energią.
                                <span className="block mt-1 text-xs text-system-grey/70">
                                    Wymaga potwierdzenia emailem. ✨
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    {error && (
                        <p className="text-danger-red mt-4 text-sm animate-fade-in-up">
                            {error}
                        </p>
                    )}
                </div>
            </main>
            <footer className="absolute bottom-0 text-center py-6 px-4">
                 <p className="text-sm text-system-grey animate-fade-in-up animation-delay-500">
                    © 2025 Bartłomiej Szymocha | Wszelkie prawa zastrzeżone
                </p>
            </footer>
        </div>
    );
};
