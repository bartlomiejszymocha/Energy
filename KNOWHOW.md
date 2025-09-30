# 🚀 ENERGY PLAYBOOK - PODRĘCZNIK SYSTEMU

## 📋 CO TO JEST

**Energy Playbook** to aplikacja webowa do zarządzania energią i produktywnością. Użytkownicy mogą:
- Logować swoją energię (ocena 1-10)
- Wykonywać akcje energetyczne (oddech, trening, medytacja)
- Śledzić postępy na wykresach
- Otrzymywać spersonalizowane wskazówki

---

## 🏗️ ARCHITEKTURA SYSTEMU

### **Frontend (React + Vite)**
- **Lokalizacja:** `/Users/bartlomiejszymocha/Energy`
- **Port lokalny:** `http://localhost:3000`
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Wykresy:** Recharts

### **Backend (Vercel Serverless)**
- **Hosting:** Vercel (https://www.resetujenergie.pl)
- **Funkcje:** Serverless Functions (API endpoints)
- **Baza danych:** Firebase Firestore
- **Autentykacja:** Firebase Auth (Google)

### **Zewnętrzne API**
- **Google Sheets API** - dane akcji i ćwiczeń
- **ConvertKit API** - newsletter i subskrypcje
- **Firebase** - użytkownicy i dane

---

## 📊 ŹRÓDŁA DANYCH

### **1. Google Sheets - "Energy Playbook - Actions & Exercises"**
- **ID arkusza:** `1R2tYsahFnyFDCmbOwf9Ckxr-HQVHNR5gwg4RtGmGhs4`
- **Zakładka:** "Actions & Exercises"
- **Kolumny A-J:** Akcje (idA, title, type, duration, icon, content, breathing, workout, actionUrl, tags)
- **Kolumny K-N:** Ćwiczenia (idE, name, videourl, note)

### **2. Google Sheets - "Energy Playbook Clients"**
- **ID arkusza:** `1R2tYsahFnyFDCmbOwf9Ckxr-HQVHNR5gwg4RtGmGhs4`
- **Zakładka:** "Clients"
- **Kolumny A-E:** Dane klientów (uid, email, displayName, role, createdAt, lastLogin)

### **3. Firebase Firestore**
- **Kolekcja:** `users/{uid}/logs` - wpisy energii
- **Kolekcja:** `users/{uid}/completedActions` - wykonane akcje
- **Kolekcja:** `users/{uid}/favorites` - ulubione akcje

---

## 🔧 API ENDPOINTS (Vercel)

### **1. `/api/sheets-to-actions-optimized.js`**
- **Funkcja:** Pobiera akcje z Google Sheets
- **Zakres:** `Actions & Exercises!A:J`
- **Cache:** 5 minut TTL
- **Zwraca:** Tablicę akcji z polami (id, name, type, duration, icon, description, etc.)

### **2. `/api/sheets-to-exercises.js`**
- **Funkcja:** Pobiera ćwiczenia z Google Sheets
- **Zakres:** `Actions & Exercises!K:N`
- **Cache:** 5 minut TTL
- **Zwraca:** Obiekt ćwiczeń {ex001: {id, name, videoUrl, note}}

### **3. `/api/sheets-to-clients.js`**
- **Funkcja:** Pobiera dane klientów z Google Sheets
- **Zakres:** `Clients!A:E`
- **Zwraca:** Tablicę klientów z rolami (admin, pro, public)

### **4. `/api/add-client.js`**
- **Funkcja:** Dodaje nowego klienta do Google Sheets
- **Method:** POST
- **Body:** {uid, email, displayName, role, createdAt, lastLogin}

### **5. `/api/convertkit-subscribe.js`**
- **Funkcja:** Dodaje subskrybentów do ConvertKit
- **Method:** POST
- **Body:** {email, firstName, tags, fields, subscribeToNewsletter}
- **Formularze:**
  - Product: `693f8d6049` (auto-confirm)
  - Newsletter: `8eed27a04c` (wymaga potwierdzenia)

---

## 🔐 BEZPIECZEŃSTWO

### **Environment Variables (Vercel)**
```
GOOGLE_CLIENT_EMAIL=sheets-api@energy-playbook.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
SHEETS_ID=1R2tYsahFnyFDCmbOwf9Ckxr-HQVHNR5gwg4RtGmGhs4
SHEETS_CLIENTS_ID=1R2tYsahFnyFDCmbOwf9Ckxr-HQVHNR5gwg4RtGmGhs4
CONVERTKIT_API_KEY=your_convertkit_api_key
```

### **Content Security Policy (CSP)**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://cdn.tailwindcss.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://www.googleapis.com https://sheets.googleapis.com https://firebase.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://www.gstatic.com https://api.convertkit.com https://securetoken.googleapis.com;
  frame-src 'self' https://www.google.com https://iframe.mediadelivery.net https://energy-playbook.firebaseapp.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
" />
```

### **Firebase Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🎯 SYSTEM UPRAWNIEŃ

### **Role użytkowników:**
- **admin** - widzi wszystkie akcje (w tym "Reboot - BrainFlow")
- **pro** - widzi akcje publiczne i pro (w tym "Więcej tlenu")
- **public** - widzi tylko akcje publiczne

### **Logika uprawnień:**
```typescript
// W useUserPermissions.ts
if (rule === 'admin') return userRole === 'admin';
if (rule === 'pro') return userRole === 'pro' || userRole === 'admin';
if (rule === 'public') return true;
```

---

## 📱 KONWERSJA I NEWSLETTER

### **ConvertKit Integration**
- **Product Form:** `693f8d6049` - automatyczne potwierdzenie
- **Newsletter Form:** `8eed27a04c` - wymaga potwierdzenia przez email
- **Automatyzacje:** Przenoszą subskrybentów z formularzy do sekwencji

### **Newsletter Text (Login Screen)**
```
🚀 Chcę dołączyć do energyNotes i co tydzień dostać praktyczne wskazówki, które realnie pomogą mi kontrolować swoją energię i pokonać prokrastynację!
```

---

## 🔄 WORKFLOW UŻYTKOWNIKA

### **1. Logowanie**
- Google OAuth przez Firebase
- Sprawdzenie roli w Google Sheets
- Automatyczne dodanie do ConvertKit (jeśli zaznaczył newsletter)

### **2. Dashboard**
- Wykres energii (Recharts)
- Wpisy energii (ocena + notatka + tagi)
- Wykonane akcje
- Ulubione akcje

### **3. Akcje Energetyczne**
- **Oddech:** BreathingModal z breathingPattern
- **Trening:** WorkoutPage z parsowaniem workout string
- **Filmy:** VideoModal z actionUrl
- **Inne:** Instrukcje w modalach

### **4. Historia**
- FullSummaryModal - pełne podsumowanie dnia
- DaySummaryCard - karty dni
- HistoryDaySelector - wybór dnia

---

## 🛠️ ROZWIĄZYWANIE PROBLEMÓW

### **1. "Invalid JWT Signature"**
- **Przyczyna:** Nieprawidłowy GOOGLE_PRIVATE_KEY w Vercel
- **Rozwiązanie:** Sprawdź klucz w Vercel Environment Variables

### **2. "Quota exceeded"**
- **Przyczyna:** Przekroczenie limitu Google Sheets API (100 req/min)
- **Rozwiązanie:** Czekaj na reset lub zwiększ limity w Google Cloud

### **3. "Actions API zwraca []"**
- **Przyczyna:** Nieprawidłowy SHEETS_ID lub zakres
- **Rozwiązanie:** Sprawdź ID arkusza i zakres w API

### **4. "CSP violation"**
- **Przyczyna:** Blokada zewnętrznych zasobów przez CSP
- **Rozwiązanie:** Dodaj domain do odpowiedniej dyrektywy w index.html

### **5. "User permissions nie działają"**
- **Przyczyna:** Błąd w API sheets-to-clients lub nieprawidłowa rola
- **Rozwiązanie:** Sprawdź dane w Google Sheets i logikę uprawnień

---

## 📈 MONITORING

### **Logi do sprawdzenia:**
- **Vercel Functions:** Dashboard → Functions → Logs
- **Browser Console:** F12 → Console
- **Firebase:** Console → Firestore → Usage

### **Metryki:**
- **API Usage:** Google Cloud Console → APIs & Services → Quotas
- **ConvertKit:** Dashboard → Subscribers → Sequences
- **Vercel:** Dashboard → Analytics

---

## 🚀 DEPLOYMENT

### **Proces:**
1. **Lokalne zmiany:** `git add . && git commit -m "message"`
2. **Push:** `git push`
3. **Vercel:** Automatyczny build i deploy
4. **Test:** Sprawdź https://www.resetujenergie.pl

### **Debug Mode (Localhost):**
```javascript
// W DevTools Console
localStorage.setItem('forceConvertKitProcess', 'true');
location.reload();
```

---

## 📞 KONTAKT I WSPARCIE

**Właściciel:** Bartłomiej Szymocha  
**Email:** bartlomiej.szymocha@gmail.com  
**Strona:** https://www.resetujenergie.pl  
**GitHub:** https://github.com/bartlomiejszymocha/Energy

---

*Ostatnia aktualizacja: Styczeń 2025*
