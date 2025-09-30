# 🎭 ConvertKit - Tryb Lokalny (Mock)

## ✅ Rozwiązanie

**Nie musisz używać prawdziwego API ConvertKit podczas rozwoju lokalnego!**

Stworzyłem **tryb MOCK** który działa automatycznie na localhost.

## 🚀 Jak to działa?

### Automatyczny Tryb Mock (Localhost)

Gdy uruchamiasz aplikację lokalnie (`npm run dev`):
- ✅ Automatycznie używa **mock API** (bez prawdziwych requestów)
- ✅ Symuluje odpowiedzi ConvertKit
- ✅ Loguje wszystkie dane w konsoli
- ✅ NIE wysyła emaili
- ✅ NIE potrzebuje klucza API

### Panel Deweloperski

W prawym dolnym rogu (tylko na localhost) zobaczysz **fioletowy panel**:

```
🔧 ConvertKit Debug
Mode: [🎭 MOCK]
```

**Możesz przełączać między trybami:**
- 🎭 **MOCK** - Lokalnie, bez prawdziwych requestów (domyślnie)
- 🌐 **REAL** - Prawdziwe API ConvertKit (do testowania integracji)

## 📝 Przykład użycia

### 1. Tryb Mock (Domyślny)
```bash
npm run dev
# Aplikacja automatycznie używa MOCK API
# Możesz testować logowanie bez obaw
```

**Co się dzieje:**
```javascript
// W konsoli zobaczysz:
🎭 MOCK MODE: ConvertKit simulation
📧 Email: test@example.com
👤 Name: Test
🏷️  Tags: ['Energy Playbook User', 'Google Login']
✅ MOCK: Added to app notifications
```

### 2. Tryb Real API (Do testowania)
1. Kliknij panel w prawym dolnym rogu
2. Zmień na **REAL**
3. Przeładuj stronę
4. Teraz używa prawdziwego API (wymaga `.env.local` z kluczem)

## 🔍 Śledzenie w Konsoli

### Mock Mode
```
🔍 ConvertKit init: 🎭 MOCK MODE (localhost)
🔍 Auth state change: { hasCurrentUser: true, ... }
🔍 Processing ConvertKit subscription for: user@example.com
🔍 Calling ConvertKit API (MOCK): user@example.com
✅ ConvertKit MOCK success: { success: true, mock: true, ... }
```

### Real API Mode
```
🔍 ConvertKit init: 🌐 REAL API
🔍 Calling ConvertKit API (REAL): user@example.com
✅ ConvertKit API success: { subscription: { id: 123456 } }
```

## 🎯 Komendy przydatne w Console

### Wymuś ponowne wywołanie ConvertKit
```javascript
localStorage.setItem('forceConvertKitProcess', 'true')
// Następnie wyloguj się i zaloguj ponownie
```

### Przełącz na prawdziwe API
```javascript
localStorage.setItem('convertkit_use_real_api', 'true')
// Następnie przeładuj stronę
```

### Przełącz na mock
```javascript
localStorage.removeItem('convertkit_use_real_api')
// Następnie przeładuj stronę
```

### Wyczyść cache ConvertKit
```javascript
// Usuwa wszystkie klucze związane z ConvertKit
Object.keys(localStorage)
  .filter(k => k.includes('convertkit'))
  .forEach(k => localStorage.removeItem(k))
```

## 🧪 Testowanie integracji

### Scenariusz 1: Lokalnie bez prawdziwego API
```bash
npm run dev
# Zaloguj się - wszystko działa, nic nie jest wysyłane do ConvertKit
```

### Scenariusz 2: Lokalnie z prawdziwym API
1. Stwórz `.env.local`:
```env
CONVERTKIT_API_KEY=your_api_secret_here
```

2. W panelu deweloperskim zmień na **REAL**
3. Przeładuj stronę
4. Zaloguj się - teraz wysyła prawdziwe requesty

### Scenariusz 3: Produkcja (Vercel)
- Automatycznie używa **prawdziwego API**
- Wymaga zmiennej środowiskowej `CONVERTKIT_API_KEY` na Vercel

## 📊 Porównanie trybów

| Funkcja | Mock | Real API |
|---------|------|----------|
| Środowisko | Localhost | Localhost/Production |
| Requesty HTTP | ❌ Nie | ✅ Tak |
| Wymaga API Key | ❌ Nie | ✅ Tak |
| Wysyła emaile | ❌ Nie | ✅ Tak (jeśli newsletter) |
| Dodaje do ConvertKit | ❌ Nie | ✅ Tak |
| Loguje w konsoli | ✅ Tak | ✅ Tak |
| Symuluje opóźnienie | ✅ Tak (300ms) | ⏱️ Prawdziwe |

## 🎨 Panel Deweloperski - Funkcje

**🔧 ConvertKit Debug** (prawy dolny róg)

1. **Mode Toggle** - Przełączaj między MOCK/REAL
2. **🧹 Wyczyść ConvertKit Cache** - Resetuje localStorage
3. **Status** - Pokazuje aktualny tryb

## 💡 Kiedy używać którego trybu?

### 🎭 MOCK (Domyślny)
- ✅ Codzienne programowanie
- ✅ Testowanie UI
- ✅ Debugowanie logiki
- ✅ Demonstracje
- ✅ Gdy nie chcesz spamować ConvertKit

### 🌐 REAL API
- ✅ Testowanie prawdziwej integracji
- ✅ Weryfikacja przed deployem
- ✅ Sprawdzanie czy API działa
- ✅ Testowanie newslettera

## 🚨 Ważne

1. **Panel deweloperski widoczny tylko na localhost**
2. **Produkcja zawsze używa prawdziwego API**
3. **Mock nie wymaga klucza API**
4. **Real API wymaga `.env.local` z kluczem**

## 🔧 Rozwiązywanie problemów

### Panel nie jest widoczny
- Sprawdź czy jesteś na localhost (`http://localhost:5173`)
- Sprawdź konsolę czy nie ma błędów

### Mock nie działa
- Sprawdź konsolę - powinno być: `🎭 MOCK MODE`
- Wyczyść localStorage i przeładuj

### Real API nie działa
- Sprawdź `.env.local`
- Sprawdź klucz API w ConvertKit
- Sprawdź konsolę dla błędów

## 📚 Powiązane pliki

- `/api/convertkit-subscribe-mock.js` - Mock endpoint
- `/api/convertkit-subscribe.js` - Prawdziwy endpoint
- `/services/convertkitService.ts` - Logika wyboru trybu
- `/components/ConvertKitDebugPanel.tsx` - Panel deweloperski
