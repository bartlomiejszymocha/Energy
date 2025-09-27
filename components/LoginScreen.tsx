
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
            setError('Zgoda na otrzymywanie aktualizacji narzędzia jest wymagana.');
            return;
        }
        
        // Store newsletter preference in localStorage for useAuth to read
        if (typeof window !== 'undefined') {
            console.log('🔍 LoginScreen: Storing newsletter preference:', {
                subscribeToNewsletter,
                isEmailConsentChecked,
                stringValue: subscribeToNewsletter.toString()
            });
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
        <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden bg-[#101113]">
            {/* Background gradient overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1E1C3A]/80 via-transparent to-[#1E1C3A]/50 z-0"></div>
            
            {/* Stardust pattern background */}
            <div className="absolute inset-0 z-[-1] opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
            }}></div>
            
            <div className="w-full max-w-md mx-auto z-10">
                <div className="text-center">
                    <div className="text-7xl mb-6 text-white animate-pulse">🚀</div>
                    <h1 className="text-4xl font-bold text-white mb-3">Witaj w Energy Playbook!</h1>
                    <p className="text-lg text-gray-300 mb-8">Proste i sprawdzone narzędzie, dzięki któremu odzyskasz 2h produktywności dziennie. Przejmij kontrolę nad swoją energią już dziś!</p>
                    
                    <button
                        onClick={handleSignInClick}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#259dff] border border-[#259dff] rounded-xl hover:bg-[#1a7acc] transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        <GoogleIcon className="w-6 h-6" />
                        <span className="text-base font-medium text-white">{isLoading ? 'Logowanie...' : 'Zaloguj się z Google'}</span>
                    </button>
                    
                    {error && (
                        <p className="text-red-400 mt-4 text-sm animate-fade-in-up">
                            {error}
                        </p>
                    )}
                    
                    {/* Email consent checkboxes */}
                    <div className="mt-10 space-y-6">
                        {/* App notifications (required) */}
                        <div className="flex items-start p-4 rounded-xl bg-white/5 border border-white/10">
                            <input
                                type="checkbox"
                                id="email-consent"
                                checked={isEmailConsentChecked}
                                onChange={(e) => setIsEmailConsentChecked(e.target.checked)}
                                className="h-5 w-5 rounded-md border-white/30 bg-white/10 text-[#259dff] focus:ring-[#259dff] focus:ring-2 mt-0.5 flex-shrink-0"
                            />
                            <label htmlFor="email-consent" className="ml-3 text-sm text-[#A1A1AA] cursor-pointer leading-relaxed">
                                <span className="text-[#259dff] font-medium">(*)</span> Będę Cię informować o nowych funkcjach, abyś był zawsze na bieżąco i mógł w pełni wykorzystać narzędzie.
                                <span className="block mt-1 text-xs text-[#A1A1AA]/70">
                                    Zawsze możesz się wypisać jednym kliknięciem. 📧
                                </span>
                            </label>
                        </div>

                        {/* Newsletter (optional) */}
                        <div className="flex items-start p-4 rounded-xl bg-white/5 border border-white/10">
                            <input
                                type="checkbox"
                                id="newsletter-consent"
                                checked={subscribeToNewsletter}
                                onChange={(e) => setSubscribeToNewsletter(e.target.checked)}
                                className="h-5 w-5 rounded-md border-white/30 bg-white/10 text-[#259dff] focus:ring-[#259dff] focus:ring-2 mt-0.5 flex-shrink-0"
                            />
                            <label htmlFor="newsletter-consent" className="ml-3 text-sm text-[#A1A1AA] cursor-pointer leading-relaxed">
                                <span className="font-semibold text-white">✅ Zapisz się na 14 hacków energetycznych.</span> Odzyskaj 2h produktywności każdego dnia!
                                <span className="block mt-1 text-xs text-[#A1A1AA]/70">
                                    Wymaga potwierdzenia emailem. ✨
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="text-center mt-12">
                        <p className="text-xs text-gray-500">© 2025 Energy Playbook | Wszelkie prawa zastrzeżone</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
