# Salesforce Admin Hub

A Salesforce-style enterprise admin platform for managing employees, CRM data
and organization settings. Frontend only: all data lives in the Redux store,
seeded with realistic dummy data and saved to `localStorage`, so every action
(create, edit, delete, bulk updates) persists across reloads.

## Getting started

```bash
yarn install
yarn dev        # http://localhost:5173
```

Sign in with **admin@adminhub.dev / Admin@123** (or click **Use demo account**).
Other demo users: `hr@adminhub.dev` and `sales@adminhub.dev`, same password.

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `yarn dev`       | Start the Vite dev server                      |
| `yarn build`     | Type-check (`tsc -b`) and build for production |
| `yarn preview`   | Serve the production build locally             |
| `yarn lint`      | Lint with oxlint (`yarn lint:fix` to auto-fix) |
| `yarn typecheck` | Type-check only                                |

To start over with the original demo data, use **Settings → Data → Reset demo data**.

## Modules

| Module      | Highlights                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Dashboard   | KPI cards, headcount growth, department and status charts, recent activity, quick actions         |
| Employees   | Full CRUD with page forms, filters, bulk actions, and details tabs: overview, activity, tasks, documents, notes, permissions |
| Customers   | Pipeline statuses, page forms, and details tabs: contacts, activities, tasks, notes, documents    |
| Accounts / Contacts | Drawer forms, related contacts/customers, activity, tasks, notes, documents               |
| Departments | Headcount stats, and employees, managers, teams, tasks and documents tabs                         |
| Teams       | Member management (add/remove, team lead) and tasks                                               |
| Tasks       | Table and Kanban views (drag and drop), filters, bulk status and assignment changes               |
| Activities  | Chronological timeline grouped by day, with filters and activity logging                          |
| Reports     | Employee, department, customer, task and activity reports, with date ranges, filters, charts and CSV export |
| Documents   | Upload (with preview for images, PDFs and text), download and delete, linked to records           |
| Users / Settings | User management, profile, preferences, organization, roles, permission matrix, data reset    |

The header provides global search (⌘K or `/`), notifications, help, a theme toggle and the profile menu.

## Tech stack

React 19 · TypeScript · Vite · Yarn · React Router · Redux Toolkit · Ant Design 6 ·
SCSS modules · React Hook Form + Zod · Lucide icons · Recharts · Day.js

## Architecture

### Data flow

```text
Page / component
  ↓  data hooks: useEntityList · useEntityRecord · useEntityCrud · useLookups   (src/hooks)
Redux entity slices (createEntityAdapter)                                       (src/store/entities)
  ↓  listeners: persistence · reference cleanup · activity log · notifications  (src/store/listeners)
localStorage  ←  seeded from src/data/seed on first run / reset
```

- **UI code never touches seed data or slices directly.** It uses the data hooks only.
  Replacing the store with a real backend later means reimplementing those hooks
  (for example with RTK Query) without changing pages.
- **One generic slice factory** (`createEntitySlice`) gives every collection the same
  reducers: `added`, `updated`, `updatedMany`, `removed`, `removedMany`.
- **Referential integrity:** deleting a record broadcasts `recordsRemoved`, and every
  slice cleans up its references. For example, deleting an employee removes them
  from teams and clears manager, head, owner and assignee fields.
- **Automatic audit trail:** every create, update and delete on business data is
  written to the activity timeline, and new tasks raise a notification.
- **Authentication** is simulated against the Users collection. Suspended or invited
  users can't sign in, and the session stores only the user id.

### State

| Where                     | What                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `store/entities/*`        | All business data (13 collections), persisted                 |
| `store/organizationSlice` | Organization profile, persisted                               |
| `store/authSlice`         | Signed-in user id and session                                 |
| `store/uiSlice`           | Sidebar, theme, table density, hidden columns (persisted)     |
| `store/filterSlice`       | Global reporting date range                                   |
| URL search params         | List search, filters, sort, pagination, tabs, open drawers    |

### Generic entity architecture

Each entity is described by an `EntityConfig` (`src/components/entity/types.ts`).
The config covers columns, filters, bulk actions, a Zod schema with form sections,
cross-record validation, details sections and details tabs. Generic components
render everything from it:

```text
EntityListPage   search · filters · column picker · export · bulk actions · table · drawer
EntityTable      sortable, paginated, selectable table
EntityForm       config-driven React Hook Form + Zod form (create and edit)
EntityFormPage / EntityFormDrawer
EntityDetailsPage header · status toggle · delete · overview · tabs
```

Adding a new entity means adding a seed file and a slice, then writing a config
and three one-line pages. See `src/features/employees/config/employeeConfig.tsx`
for a complete example.

### Theming

`styles/theme.ts` is the single source of truth for design tokens. antd reads the
`ThemeConfig`, and `styles/applyCssVariables.ts` publishes the resolved tokens as
`--app-*` CSS custom properties for SCSS modules (light and dark).

### Project structure

```text
src/
├── app/                 store, typed hooks, router, providers, ThemeProvider
├── components/
│   ├── common/          PageHeader, Breadcrumbs, StatusTag, PersonCell, RelatedLink …
│   ├── entity/          generic list/table/form/details architecture
│   ├── feedback/        loaders, empty states, error boundary
│   ├── forms/           RHF ↔ antd bridge, field controls, Zod helpers
│   ├── charts/          chart theme and containers
│   ├── layout/          AppLayout, Sidebar, AppHeader, search, notifications, help, user menu
│   └── routing/         route guards and root layout
├── data/seed/           realistic seed data (read only by the store)
├── features/<module>/   config/, components/, pages/ per module
├── hooks/               data-access and utility hooks
├── store/               slices, entity factory, listeners
├── styles/              theme tokens, global styles, breakpoints
├── types/               domain and shared types
└── utils/               formatting, CSV, storage, dates
```
