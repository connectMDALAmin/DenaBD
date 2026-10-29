# DenaPawna (দেনাপাওনা) — Digital Ledger & Accounting Khata (Windows XP Edition)

A complete, production-grade financial ledger and khata application built with **React**, **TypeScript**, **Tailwind CSS**, and **Capacitor**, designed with an authentic **Windows XP** visual identity.

---

## 1. Visual Design — Windows XP Nostalgia & Modern Usability

- **Classic Luna Blue, Silver, and Olive themes** with authentic window title bars, beveled 3D borders, and minimize/maximize/close controls.
- **Windows XP Start Menu** with 2-column layout (pinned accounting operations on left, system utilities on right).
- **Desktop Workspace** with the Bliss green hills landscape background, desktop shortcut icons, and draggable/resizable window layout.
- **Taskbar with System Tray** displaying real-time clock, online/offline/syncing indicator, audio icon, and bilingual Bengali/English toggle.
- **Mobile Responsive Layout**: When accessed on mobile devices or Android screens, the desktop windows gracefully collapse into mobile-optimized full-screen cards with a native bottom navigation bar.

---

## 2. Core Accounting Semantics

DenaPawna enforces strict, immutable double-entry style accounting rules to prevent debt miscalculations:

| Transaction Type | Description | Accounting Effect |
| :--- | :--- | :--- |
| **Given (টাকা দেওয়া হলো)** | User gives money to contact; contact owes user | **Receivable (পাওনা) increases** |
| **Received (টাকা পাওয়া গেলো)** | User receives money from contact | **Receivable (পাওনা) decreases** |
| **Borrowed (টাকা নেওয়া হলো)** | User borrows money from contact; user owes contact | **Payable (দেনা) increases** |
| **Repaid (টাকা ফেরত দেওয়া হলো)** | User pays back money to contact | **Payable (দেনা) decreases** |

### Integer Minor Currency Units
All amounts are represented internally in **integer minor currency units** (Paisa / Cents, e.g., 500.25 BDT = `50025`), completely eliminating JavaScript floating-point arithmetic errors (`0.1 + 0.2 !== 0.3`).

---

## 3. Key Feature Modules

1. **Dashboard & Financial Summary**:
   - Total Receivables, Total Payables, Net Position, and 30-Day Cash Inflow/Outflow.
   - Interactive **Recharts**: Cash-flow trend, aging breakdown, payment channel volume, and receivables vs. payables.
   - Daily curated business quotes in Bangla and English.
2. **Contact Directory**:
   - Categorized by Customer, Supplier, Friend/Family, Employee, and Other.
   - Separate Receivable and Payable balance calculation per contact.
   - Detailed ledger view with transaction history, PDF printable statements, and one-click reminders.
3. **Due Dates & One-Click Reminders**:
   - Automated overdue and due-today badges.
   - Installment scheduler with automated equal payment breakdowns.
   - One-click **WhatsApp** and **SMS** pre-filled message generator in Bangla and English.
4. **Public Balance Lookup Portal**:
   - Allows customers to check their authorized statement without logging in.
   - Privacy-first: requires registered phone number **and** 4-digit security token.
   - Rate limiting and anti-enumeration generic responses.
5. **Data Backup, Restore & CSV Export**:
   - Full JSON backup export with schema versioning (`v2.4.0`).
   - Conflict-aware restore with preview (Merge vs. Full Replace).
   - Excel-compatible CSV export with UTF-8 BOM encoding for proper Bengali font rendering.
6. **Security & 4-Digit Device PIN**:
   - Web Crypto API salted SHA-256 PIN hashing (plain-text PINs are never stored).
   - Progressive rate limiting and lockout backoff after repeated incorrect attempts.

---

## 4. Android APK & Google Play AAB Build Instructions

DenaPawna is configured with **Capacitor 6+** (`capacitor.config.ts`) under the package ID `com.denapawna.app`.

### Build Commands:

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Android native platform (first time only)
npx cap add android

# 3. Synchronize web assets to native Android project
npx cap sync android

# 4. Generate standalone Debug APK
cd android && ./gradlew assembleDebug
# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk

# 5. Generate Google Play Release App Bundle (AAB)
cd android && ./gradlew bundleRelease
# Output AAB location:
# android/app/build/outputs/bundle/release/app-release.aab

# 6. Open project in Android Studio
npx cap open android
```

---

## 5. Firebase Configuration & Security Rules

- **`firestore.rules`**: Production rules enforcing strict per-user data isolation (`users/{userId}`), type validation on transaction amounts and types, and token-restricted access for public lookup.
- **`storage.rules`**: File size limits (max 5MB) and MIME-type restrictions for receipt photos.
- **`firebase.json`**: Multi-region hosting rewrites and index configuration.

---

## 6. Automated Testing

Run the automated Vitest accounting test suite:

```bash
npm test
```

Verifies:
- Decimal safety and minor currency unit conversions.
- Given, Received, Borrowed, and Repaid balance arithmetic.
- Installment schedules and overdue date detection.
- JSON backup schema validation and error handling.
