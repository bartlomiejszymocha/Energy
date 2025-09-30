import React, { useState, useEffect } from 'react';

/**
 * Panel deweloperski do zarządzania trybem ConvertKit
 * Widoczny tylko na localhost
 */
export const ConvertKitDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    // Pokaż panel tylko na localhost
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
    setIsVisible(isDev);

    // Sprawdź stan z localStorage
    const useRealAPI = localStorage.getItem('convertkit_use_real_api') === 'true';
    setUseMock(!useRealAPI);
  }, []);

  const toggleMode = () => {
    const newUseMock = !useMock;
    setUseMock(newUseMock);
    
    if (newUseMock) {
      localStorage.removeItem('convertkit_use_real_api');
      console.log('🎭 Switched to MOCK mode');
    } else {
      localStorage.setItem('convertkit_use_real_api', 'true');
      console.log('🌐 Switched to REAL API mode');
    }
    
    // Informuj o konieczności przeładowania
    alert(`ConvertKit mode changed to: ${newUseMock ? 'MOCK' : 'REAL'}\n\nPrzeładuj stronę aby zmiana zadziałała.`);
  };

  const clearLocalStorage = () => {
    if (confirm('Czy na pewno chcesz wyczyścić localStorage?\n\nTo sprawi, że ConvertKit będzie próbować dodać Cię ponownie przy następnym logowaniu.')) {
      // Wyczyść tylko klucze związane z ConvertKit
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('convertkit') || key.includes('pendingNewsletterSubscription')) {
          localStorage.removeItem(key);
        }
      });
      console.log('🧹 Cleared ConvertKit localStorage keys');
      alert('localStorage wyczyszczony!');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[999999] bg-purple-600 text-white p-4 rounded-lg shadow-2xl border-2 border-purple-400 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">🔧 ConvertKit Debug</h3>
        <span className="text-xs bg-purple-800 px-2 py-1 rounded">DEV ONLY</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Mode:</span>
          <button
            onClick={toggleMode}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
              useMock 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {useMock ? '🎭 MOCK' : '🌐 REAL'}
          </button>
        </div>

        <div className="text-xs bg-purple-800 p-2 rounded">
          {useMock ? (
            <p>✅ Lokalna symulacja (bez prawdziwych requestów)</p>
          ) : (
            <p>⚠️ Prawdziwe API ConvertKit będzie użyte!</p>
          )}
        </div>

        <button
          onClick={clearLocalStorage}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded transition-colors"
        >
          🧹 Wyczyść ConvertKit Cache
        </button>

        <div className="text-[10px] text-purple-200 leading-tight">
          Tip: Użyj MOCK dla testów lokalnych,<br/>
          REAL gdy testujesz prawdziwą integrację
        </div>
      </div>
    </div>
  );
};
