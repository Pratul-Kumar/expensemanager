# MySpace — Notes, Reminders & Expenses PWA

A mobile-first personal productivity PWA built with Next.js, TypeScript, Tailwind CSS, and Firebase.

---

## Features

- 📝 **Notes** — Create, edit, pin, search notes with optional reminders
- 💸 **Expenses** — Quick expense entry, monthly grouped view, totals
- 🔔 **Reminders** — Upcoming / Today / Overdue status on notes
- 🔐 **Auth** — Google Sign-In + Email/Password via Firebase Auth
- 📱 **PWA** — Installable, works offline for cached pages
- 🔒 **Secure** — Firestore rules enforce user-scoped data access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Icons | Lucide React |
| Dates | date-fns |
| Deployment | Vercel |

---

## Firebase Setup (Step by Step)

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name (e.g. `myspace-app`)
4. Optionally enable Google Analytics
5. Click **Create project**

### 2. Register a Web App

1. In your project, click the **Web** icon (`</>`) on the project overview
2. Enter an app nickname (e.g. `myspace-web`)
3. Click **Register app**
4. Copy the `firebaseConfig` object — you'll need it for environment variables

### 3. Enable Firestore

1. In the left sidebar: **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a region (e.g. `asia-south1` for India)
5. Click **Enable**

### 4. Enable Google Authentication

1. In the sidebar: **Build → Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Click **Google** → Toggle **Enable** → Set support email → **Save**

### 5. Enable Email/Password Authentication

1. In **Authentication → Sign-in method**
2. Click **Email/Password** → Toggle **Enable** → **Save**

### 6. Add Authorized Domains

1. In **Authentication → Settings → Authorized domains**
2. Add your Vercel domain (e.g. `myspace.vercel.app`)
3. `localhost` is added by default for development

### 7. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in values from your Firebase web app config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234:web:abcdef
```

### 8. Deploy Firestore Security Rules

Install Firebase CLI:

```bash
npm install -g firebase-tools
```

Login and initialize:

```bash
firebase login
firebase init firestore
# When prompted, choose your project
# Use existing rules file: firestore.rules
```

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

### 9. Run Locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 10. Deploy to Vercel

**Option A — Vercel CLI:**

```bash
npm install -g vercel
vercel
```

**Option B — Vercel Dashboard:**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your repository
4. Add all `NEXT_PUBLIC_FIREBASE_*` environment variables in **Settings → Environment Variables**
5. Click **Deploy**

---

## Project Structure

```
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
  (dashboard)/
    layout.tsx        ← Auth guard + shell
    page.tsx          ← Home dashboard
    notes/page.tsx
    expenses/page.tsx
    settings/page.tsx
  layout.tsx          ← Root (AuthProvider)
  globals.css
  manifest.ts
components/
  ui/                 ← Button, Input, Modal, Toast, Skeleton, ConfirmDialog
  notes/              ← NoteCard, NoteEditor
  expenses/           ← ExpenseForm, ExpenseItem, MonthlyView
  layout/             ← Sidebar, BottomNav
hooks/
  useAuth.ts
  useNotes.ts
  useExpenses.ts
  useToast.ts
lib/
  firebase.ts
  firestore/
    notes.ts
    expenses.ts
  utils.ts
types/
  index.ts
public/
  icons/              ← PWA icons
firestore.rules
.env.example
```

---

## Build & Quality Checks

```bash
npm run build      # Production build
npx tsc --noEmit   # TypeScript check
npx eslint .       # Lint
```

---

## Architecture

```
Phone / Laptop
      ↓
   Vercel
      ↓
Next.js PWA (App Router)
      ↓
   Firebase
   ├── Authentication (Google + Email/Password)
   └── Firestore (notes, expenses — user-scoped)
```

---

## Security

Firestore security rules enforce:

- Authentication required for all reads/writes
- Users can only access documents where `userId == request.auth.uid`
- Create operations validate that the submitted `userId` matches the authenticated user
- All other documents are denied

Never rely solely on frontend filtering — all data access is enforced server-side by Firestore rules.

---

## License

MIT
