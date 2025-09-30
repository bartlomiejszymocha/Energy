# 🧪 Testowanie Integracji ConvertKit

> 💡 **Nowe!** Aplikacja ma teraz **tryb MOCK** dla localhost - nie musisz konfigurować API podczas rozwoju!  
> Zobacz: [CONVERTKIT_LOCAL.md](./CONVERTKIT_LOCAL.md)

## Przygotowanie

### 1. Zainstaluj zależności
```bash
npm install
```

### 2. Skopiuj plik konfiguracyjny
```bash
cp .env.local.example .env.local
```

### 3. Dodaj klucz API ConvertKit
1. Otwórz plik `.env.local`
2. Wejdź na: https://app.convertkit.com/account_settings/advanced_settings
3. Skopiuj **API Secret** (nie API Key!)
4. Wklej do `.env.local`:
```
CONVERTKIT_API_KEY=twoj_api_secret_tutaj
```

## Testowanie

### Test podstawowy (tylko app notifications)
```bash
npm run test:convertkit
```

### Test z własnym emailem
```bash
npm run test:convertkit -- --email=twoj@email.com
```

### Test z newsletterem
```bash
npm run test:convertkit -- --email=twoj@email.com --newsletter
```

## Co sprawdza test?

1. ✅ Czy klucz API jest skonfigurowany
2. ✅ Czy połączenie z ConvertKit działa
3. ✅ Czy można dodać subskrybenta do formy "App Notifications"
4. ✅ (Opcjonalnie) Czy można dodać subskrybenta do newslettera

## Weryfikacja w ConvertKit

Po udanym teście:
1. Wejdź na: https://app.convertkit.com/subscribers
2. Znajdź testowego subskrybenta (email z testu)
3. Sprawdź:
   - ✅ Czy ma tagi: "Energy Playbook User", "App Notifications"
   - ✅ Czy jest przypisany do właściwej formy
   - ✅ Czy pola custom są wypełnione (login_method, signup_date)

## Testowanie produkcyjne

### Sposób 1: Debug w aplikacji
1. Otwórz devtools w przeglądarce (F12)
2. Idź do Console
3. Wyloguj się (jeśli jesteś zalogowany)
4. Ustaw tryb debug w Console:
```javascript
localStorage.setItem('forceConvertKitProcess', 'true')
```
5. Zaloguj się ponownie
6. Sprawdź logi w Console - powinny zawierać:
   - `🔍 ConvertKit check:` - status przed wywołaniem
   - `🔍 Processing ConvertKit subscription` - rozpoczęcie
   - `✅ ConvertKit result:` - wynik

### Sposób 2: Nowy użytkownik
1. Wyloguj się
2. Wyczyść localStorage: `localStorage.clear()`
3. Zaloguj się nowym kontem Google
4. Sprawdź Console i ConvertKit dashboard

## Rozwiązywanie problemów

### Błąd: "CONVERTKIT_API_KEY not found"
- Sprawdź czy plik `.env.local` istnieje
- Sprawdź czy używasz `API Secret`, nie `API Key`
- Zrestartuj serwer dev (`npm run dev`)

### Błąd: "Failed to subscribe"
- Sprawdź klucz API w ConvertKit
- Sprawdź ID formularzy w pliku `api/convertkit-subscribe.js`:
  - APP_FORM_ID: `693f8d6049`
  - NEWSLETTER_FORM_ID: `8eed27a04c`
- Sprawdź czy formy istnieją w ConvertKit dashboard

### Subskrybent nie pojawia się w ConvertKit
- Sprawdź zakładkę "Subscribers" w ConvertKit
- Użyj wyszukiwarki (może być na innej stronie)
- Sprawdź czy API zwróciło sukces w logach

## Konfiguracja na Vercel

Pamiętaj aby dodać zmienną środowiskową na Vercel:
1. Vercel Dashboard → Twój projekt → Settings → Environment Variables
2. Dodaj: `CONVERTKIT_API_KEY` = `twoj_api_secret`
3. Redeploy aplikacji

## Formularze ConvertKit

### Energy Playbook - Product (App Notifications)
- **ID**: `693f8d6049`
- **Typ**: Auto-confirm (bez potwierdzenia email)
- **Przeznaczenie**: Notyfikacje aplikacji, ważne aktualizacje
- **Tagi**: Energy Playbook User, App Notifications

### Energy Playbook - Newsletter
- **ID**: `8eed27a04c`
- **Typ**: Double opt-in (wymaga potwierdzenia email)
- **Przeznaczenie**: Newsletter "energyNotes"
- **Tagi**: Energy Playbook User, Newsletter Subscriber
