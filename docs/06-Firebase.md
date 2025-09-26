## Firebase

Źródło: `firebase.ts`

Eksporty:
- **firebaseConfig**: konfiguracja projektu (podmień na własną w środowisku produkcyjnym)
- **auth**: `getAuth(app)`
- **db**: `getFirestore(app)`
- **googleAuthProvider**: `new GoogleAuthProvider()`

Uwaga bezpieczeństwa: Nie commituj kluczy/sekretów produkcyjnych do repo. Korzystaj z mechanizmów środowiskowych i sekretów CI/CD.

