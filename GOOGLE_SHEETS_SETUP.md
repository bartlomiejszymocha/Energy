# 🚀 Google Sheets Setup - Energy Playbook

## **📋 Krok 1: Stwórz Google Sheets**

1. **Idź do:** https://sheets.google.com
2. **Kliknij:** "Blank spreadsheet"
3. **Nazwij:** "Energy Playbook - Actions"
4. **Skopiuj dane** z pliku `data/actions.csv`

## **📊 Krok 2: Struktura arkusza**

### **Kolumny (A-L):**
- **A:** `id` - Unikalny identyfikator
- **B:** `title` - Tytuł akcji
- **C:** `type` - Typ (Reset Energetyczny, Protokół Ruchowy, Technika oddechowa)
- **D:** `duration` - Czas trwania w minutach
- **E:** `icon` - Emoji ikona
- **F:** `content` - Opis akcji
- **G:** `exercises` - JSON array z ćwiczeniami (opcjonalne)
- **H:** `triggerTags` - JSON array z tagami
- **I:** `category` - Kategoria (all, morning, evening)
- **J:** `difficulty` - Poziom trudności
- **K:** `equipment` - Wymagany sprzęt
- **L:** `workout` - JSON array z workout (opcjonalne)

### **Przykład wiersza:**
```
reset_cold_shower | Zimny prysznic | Reset Energetyczny | 2 | 🚿 | Opis... | [] | ["Stres","Zmęczenie"] | all | Łatwy | Brak | []
```

## **⚙️ Krok 3: Skonfiguruj Google Apps Script**

1. **W arkuszu:** Extensions → Apps Script
2. **Usuń** domyślny kod
3. **Wklej** kod z `google-apps-script/webhook-trigger.gs`
4. **Zaktualizuj** `CLOUD_FUNCTION_URL` na swój URL Vercel

## **🔑 Krok 4: Konfiguracja API**

### **Google Cloud Console:**
1. **Idź do:** https://console.cloud.google.com
2. **Utwórz projekt** lub wybierz istniejący
3. **Włącz** Google Sheets API
4. **Utwórz Service Account:**
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Download JSON key

### **Vercel Environment Variables:**
```bash
GOOGLE_CLIENT_EMAIL=sheets-api@energy-playbook.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDKJ8YWHFC6w+u6
4fdMXNx0ZS9/zUTr+QN4fW8sRCw0MjHzORpAYxdv1LVQwIM4JAPI3YhSSXFs3rB8
Q+MakXOuWmb7+NWfaQjcrmiWAvcNq5N9Fp+JR07DKp4vHdM137qv91z1LI6IoE/F
xfP7cNFqUzl2ekQ3DEJ2sWvu92az+9XeW2pHt+me049vYF01hdXWRtJVAcJQrQEe
nCnkmQWDkJZV8CsiwtQpZOFFO2hXH3A9W6/18Vdme4Bn0h+GzBzby1guRSwqrvPg
94WJ/r3oKXxJmI1Vezx9zHPOkK00wA59Nu9Br7xOfJ2h+elHENRDOq88AMPG0RC4
aK742nShAgMBAAECgf9lXhiLZWRe7S57EJ0ei/gLxwal1T89OOyZ71giGkocT/bO
XftzhLasnPNmuF7jXSvRzRNakUJkXkYOtGmdcg8GqrXOnYErtEWVuGUIckmCAhZL
RLR3w19Ea8gdAtqmB5MGETeCiHzL2x1JyJSwtFJmgX+bIyfm4EHthaJNfcdCHMLc
2op+vKjkWXL4Roq9TPFP7+koTDDec6s+4xvt5TuOyn2wdsVksj2Y0u8WjMahUgyO
9B/r92ggvcGwsqM2Osl1mzcytDfjA3LViSHaDF/8sh+b6zYvGsqN175e1aoAzuw8
NIMjdu8zpo4NCAzeHTrEgQt62rE0VA98IztiiJECgYEA7vbDqb6O0BH57lg3TnIL
MOOTyREmvrPEZTHa5vXl6lE32CD1mfaOXGQcrg3hap5PbjfdsMEKSiKz+p60Apko
IWsIjfLP3Yk70GBmZydenM8aGo7PUlnOCASdqTISqO8KMCCNxriWvm5H2kqTuvaJ
e8q/UibfW8NqhExCjzn1KXkCgYEA2JE7KfyU1jNmNVub5LxWpVcgXsINE/Jsmunp
soBv4YcmbvN42ohETBJ0RejfPHFfkaKhB5kxayOHXf1kNS6TfAx6UMh/hDMQ/TQC
dFa6LBcvl3D2RMXpy0rhtDnDY/a1L3ItHciy2smBn5bOOelau3IOk4FahDgo4xHk
1LPlgmkCgYEA5tu697hDHDzhqiPLepuuuBKEadGKDt55NBJQGqUg85h3TPO6kn2h
1xxYoMaEKY67yg1qvSIhoLGaEttTqNbx8CcJYqlbq/iysoMPK0TboL5rx5CENljQ
NOrQre7UHCSjQQ+SKJOX/m1oOTmnMw6Oj+u1ndY0HuDRfPJ3swsZEHECgYEAomqY
0m5JOTOnDZE8oxjUan+jGS2zHSiMZsnSqDpGrf7rxf32vv2/KsYUSXHSKcRlBhXP
aqFrPIySstycUH4zwa6h9P/JEl4x+ZMN3C5GxVZGLO9c4ksDgaEREFbZwJh/Xavl
RhcEe6zv973jv+7QSw/I+rriJZLwpwr+cL7R+zECgYBRPU7zv2cRVE1bD78SE1sy
WOm5rA1MRqH6WXXlLVVIVhZZ78c0IvdZn1qIoZLZ5XDTvy1gmcSj75CzK2L5bQmh
XYYNzRuwXzZNwPyMKTAMRxVMBYyk3e6034s+7wk3xsqg4yMI2VBb0Hp65kV0RMBhOayCA5zmP2rBUqo2Rld8PA==
-----END PRIVATE KEY-----
SHEETS_ID=1R2tYsahFnyFDCmbOwf9Ckxr-HQVHNR5gwg4RtGmGhs4
SHEETS_RANGE=A1:L44
CRON_SECRET=12345
```

## **📱 Krok 5: Udostępnij arkusz**

1. **Kliknij** "Share" w Google Sheets
2. **Dodaj** Service Account email jako "Editor"
3. **Skopiuj** ID arkusza z URL

## **🧪 Krok 6: Test**

1. **Otwórz** aplikację
2. **Sprawdź** czy dane się ładują z Google Sheets
3. **Edytuj** arkusz - zmiany powinny się pojawić w 5 sekund

## **📈 Krok 7: Monitorowanie**

- **Console logs** w Vercel Functions
- **Email notifications** z Google Apps Script
- **Status** w ActionHub (ikona synchronizacji)

## **🔧 Troubleshooting**

### **Błąd: "Permission denied"**
- Sprawdź czy Service Account ma dostęp do arkusza
- Sprawdź czy GOOGLE_PRIVATE_KEY jest poprawnie sformatowany

### **Błąd: "Sheet not found"**
- Sprawdź czy SHEETS_ID jest poprawny
- Sprawdź czy SHEETS_RANGE jest poprawny

### **Błąd: "API quota exceeded"**
- Dodaj cache do Cloud Function
- Zwiększ TTL cache

## **💡 Tips**

1. **Backup** - regularnie eksportuj arkusz
2. **Validation** - dodaj data validation w Google Sheets
3. **Testing** - używaj test arkusza przed produkcją
4. **Monitoring** - sprawdzaj logs regularnie



