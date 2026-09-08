# LMS Frontend — System Documentation (Source of Truth)

> **This document is the single source of truth for the Next.js frontend.**  
> Prefer this file over older context docs when they conflict with the codebase under `LMS-Frontend/src`.  
> Last aligned with the post-audit implementation (Phases 0–4).

---

## 1. Overview

Next.js App Router UI for the LMS. Talks to NestJS via Axios (`NEXT_PUBLIC_BACKEND_API_URL`) and Socket.IO for announcements + chat.

| Role | Route group | Home |
|------|-------------|------|
| Guest | `(public)` | `/homepage`, `/browse` |
| Student | `(user)` | `/dashboard` |
| Instructor | `(instructor)` | `/instructor-panel` |
| Teacher | `(teacher)/teacher/*` | `/teacher/dashboard` |
| Admin | `(admin)` | `/admin` |

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router (Turbopack), React 19, TypeScript |
| Styling | Tailwind CSS v4, Ant Design v5 |
| State | Redux Toolkit + `redux-persist` |
| HTTP | Axios (`src/services/interceptor.ts`, `collections.ts`, `methods.ts`) |
| Auth cookies | `js-cookie` — `token`, `role_name`, `user_onboarding`, `instructor_onboarding` |
| Social | `@react-oauth/google` (Facebook UI disabled) |
| Real-time | `socket.io-client` |
| Charts | Recharts |
| Package | `"type": "module"` (avoids Node typeless package warning for `tailwind.config.ts`) |

**Local ports:** Frontend Next default `3000`; backend typically `3288` (see `.env.local`).

---

## 3. App Router Map

### Public — `src/app/(public)/`
- `/homepage`, `/browse` (+ course-details)
- `/onboarding` (student)
- `/becomeInstructor`, `/becomeInstructor/onboarding`
- `/subscription`, `/setup-password`

### Student — `src/app/(user)/`
- `/dashboard`, `/my-courses`, `/my-explore`, `/my-schedule`, `/my-settings`
- `/saved-courses`, `/checkout` (+ `/checkout/success`, `/checkout/cancel`)
- `/chat`, `/my-certificate`

### Instructor — `src/app/(instructor)/`
- `/instructor-panel`, `/courses`, `/teachers`, `/students`
- `/assignments`, `/quizzes`, `/announcements`, `/live-classes`, `/schedule`
- `/settings`, `/instructor-chat`

### Teacher — `src/app/(teacher)/teacher/`
- Parallel surfaces under `/teacher/*` (no course create/delete mutations — backend blocks)

### Admin — `src/app/(admin)/`
- `/admin` — overview + user/course lists via `/admin/v1`

---

## 4. Middleware (`src/middleware.ts`)

Reads cookies: `token`, `role_name`, `user_onboarding`, `instructor_onboarding`.

**Onboarding completed cookie value:** `"undefined"` (set by `UserDataSlice` when steps done).  
Do **not** expect `"completed"` — that mismatch was fixed.

**Matcher includes:** student, instructor, teacher, admin, `saved-courses`, `subscription`, `instructor-chat`, `homepage/:path*`, `checkout/:path*`.

**Role homes:** student → `/dashboard`, instructor → `/instructor-panel`, teacher → `/teacher/dashboard`, admin → `/admin`.

---

## 5. Services Layer

| File | Role |
|------|------|
| `src/services/interceptor.ts` | Axios instance; Bearer token; on **401** clear auth cookies + redirect `/homepage` |
| `src/services/methods.ts` | `getApi` / `postApi` / `putApi` / `patchApi` / `deleteApi` |
| `src/services/collections.ts` | All domain API helpers (auth, courses, cart, Stripe checkout, assignments, quizzes, announcements, schedule, chat, certificates, dashboard stats) |

### Required env (throws if missing at load)
- `NEXT_PUBLIC_BACKEND_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Checkout / payments (FE contract)
| Helper | Backend |
|--------|---------|
| `cartList()` | `GET /auth/course/v1/add-to-cart/list` |
| `createCheckoutSessionApi` | `POST /auth/course/v1/checkout/create-session` |
| `confirmCheckoutSessionApi` | `GET /auth/course/v1/checkout/confirm` |

- Free cart → enroll response (`data.enrolled`)
- Paid → redirect to `data.url` (Stripe)
- Always send `batch_ids` with course selection
- Success/cancel pages: `/checkout/success`, `/checkout/cancel`

There is **no** working `GET /auth/course/v1/checkout` — do not reintroduce `courseCheckout` against that path.

---

## 6. Redux (`src/redux/`)

Persisted slices include: `userdata`, `categories`, `courseData`, `createCourse`, `teacherData`, tab slices (`coursetab`, `internaltab`, instructor/announcement tabs), `authmodal`.

`UserDataSlice.setUser` writes auth cookies including onboarding flags.

---

## 7. Real-time Hooks

### `useAnnouncementSocket`
- Connects to `{BACKEND}/announcements` with `auth: { token }`
- Emits `join` with course/batch IDs
- Listens `announcement:new` / `announcement:deleted`

### Chat pages
- Student `/chat`, instructor `/instructor-chat`
- REST: `chatRoom()`, `getChatMessagesApi(groupId)`
- Socket namespace `/communication` with JWT; `joinRoom`, `sendMessage`, `newMessage`

---

## 8. Role UX Rules

| Rule | Detail |
|------|--------|
| Teacher course mutate | UI should not offer create/delete; backend `InstructorOnlyGuard` rejects |
| Facebook login | Removed from auth option lists until BE supports it |
| Certificates | `/my-certificate` loads `getMyCertificatesApi()` — not mock grids |
| Live classes | Schedule API + meeting links; modal calls `createScheduleApi` |
| Instructor dashboard | `getDashboardStatsApi()` for InfoCards |

---

## 9. Environment Variables

File: `.env.local` (template: `.env.example`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BACKEND_API_URL` | Nest base URL (e.g. `http://localhost:3288`) |
| `NEXT_PUBLIC_BASE_URL` | Frontend origin (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Must match backend `GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | Optional / unused while FB disabled |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key when using client Stripe.js (Checkout redirect URL flow may not need it) |

Restart `next dev` after env changes.

---

## 10. Local Run

```bash
cd LMS-Frontend
cp .env.example .env.local
# fill NEXT_PUBLIC_* values
npm install
npm run dev
```

```bash
npm run build   # must pass typecheck
```

---

## 11. Important Paths

| Concern | Path |
|---------|------|
| Middleware | `src/middleware.ts` |
| API catalog | `src/services/collections.ts` |
| Axios / 401 | `src/services/interceptor.ts` |
| Auth cookies | `src/redux/slices/UserDataSlice.ts` |
| Announcement WS | `src/hooks/useAnnouncementSocket.ts` |
| Checkout | `src/app/(user)/checkout/`, `src/components/Checkout.tsx` |

---

## 12. Maintenance Rule

When changing routes, API helpers, env vars, auth cookies, or role UX:

1. Update this file in the same PR.
2. Update `LMS-Backend/docs/BACKEND.md` if the API contract changes.
3. Keep `.env.example` in sync with new `NEXT_PUBLIC_*` names.
4. Do not treat outdated audit/chat markdown as SSOT.
