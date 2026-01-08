# Code Snipper — snippet manager (React + TypeScript + Vite)

Code Snipper is a lightweight web application to create, share and manage code snippets.
It is built with modern front-end tooling, focused on developer experience, good DX and simple deployment.
This README describes the project's purpose, architecture, tech stack and how to develop, test and deploy it.

---

## Project overview

The application allows users to:
- Create, edit and delete code snippets with metadata (title, description, language, tags).
- Browse and search snippets using full-text queries, filters and tag selection.
- Mark snippets as favorites and maintain a personal favorites list.
- View other users and their public snippets (community page).
- Authenticate (Supabase auth providers) and store extended profile data.

The UI focuses on accessibility, theming (light/dark), responsive layout and an IDE-like code preview with syntax highlighting.

---

## Architecture & conventions

- Project uses FCD (Feature-Centric Design) methodology: features, pages and widgets are grouped by domain under `src/`.
- Components are split into public `index.ts` exports for easy imports (public API for folders/widgets).
- Pages are lazy-loaded (code-splitting) with separate entrypoints to keep initial bundle small.
- State management: RTK (Redux Toolkit) + RTK Query for server data fetching and caching.
- Supabase is used as the primary backend for auth and Postgres storage (snippets, profiles, favorites).
- i18n: i18next with JSON translations in `public/locales` (en/ru). Namespaces are used for chunked translations.

Directory highlights (top-level under `src/`):
- `app/` — application providers and routing.
- `pages/` — lazy-loaded page components.
- `widgets/` — reusable UI widgets (navbar, sidebar, snippets list/card/modal...).
- `features/` — domain-specific logic, API slices (RTK Query) and services.
- `shared/` — UI primitives, utils, constants and global configs (i18n, supabase client).

---

## Technology stack

Frontend
- React 19 (functional components, hooks)
- TypeScript
- Vite for bundling and dev server
- React Router for routing
- Redux Toolkit (RTK) + RTK Query for data fetching and caching
- react-i18next (i18next) for internationalization
- react-hook-form + zod for forms and schema validation
- react-syntax-highlighter (and/or PrismJS) for code highlighting
- Tailwind CSS + custom CSS modules for styling
- Lucide icons (lucide-react)

Testing & Quality
- Jest + @testing-library/react for unit and component tests
- babel-jest for JSX support in tests
- ESLint (config included) for linting rules

Other
- Supabase (Postgres + Auth) for backend storage and auth
- Docker + Nginx for containerized static hosting
- GitHub Actions workflows for CI/CD (build, test, docker push)

---

## Features (user-facing)

- Snippet CRUD: create, update, delete snippets with tags and language selection.
- Favorites: mark/unmark snippets as favorites; favorites are stored server-side per user.
- Search & Filters: text search, language filter and multi-tag filter.
- User profiles: view other users and their snippets; add others' snippets to personal favorites (with attribution).
- Modal editor: snippet creation/editing is performed in a modal with validation and code editing/preview.
- Responsive layout: desktop and mobile friendly; sidebar collapses on small screens and opens via a burger button.
- Theming: light and dark theme with persistent preference (stored in local storage).
- i18n: English / Russian translations with namespace chunking.

---

## Development

Available npm scripts (defined in `package.json`):
- `npm run dev` — start development server (runs runtime config generation then Vite dev server)
- `npm run build` — TypeScript build + Vite production build
- `npm run preview` — preview production build locally (Vite preview)
- `npm run lint` — run ESLint
- `npm run lint:fix` — run ESLint with `--fix`
- `npm run test` — run Jest tests (config in `config/jest`)

Environment variables
- Local development relies on a `.env` or `.env.local` (not committed). Key variables include:
  - `VITE_SUPABASE_URL` — your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — your Supabase anon (publishable) key
  - `VITE_CURRENCYLAYER_API_KEY` — API key for currency rates (optional)

Runtime configuration injection
- For Docker/production, the app supports runtime injection of env values into `public/runtime-config.js` so the same image can be reused across environments.
- The `scripts/gen-runtime-config.js` and `docker-entrypoint.sh` are used during local dev and container startup respectively to populate runtime config.

Note: do not commit real secrets. Use GitHub repository secrets for CI/CD.

---

## Data fetching & state

- RTK Query powers all server interactions (snippetsApi, favoritesApi, usersApi, currencyApi).
- Queries are cached and invalidated selectively; optimistic updates are used for interactions such as toggling favorites to improve responsiveness.
- Important: avoid storing non-serializable values in Redux state (RTK warns when such values are used). Keep payloads serializable (arrays, objects, primitives).

---

## Forms & Validation

- react-hook-form is used for form state with Zod as an optional resolver for runtime schema validation.
- The codebase keeps schemas separate from UI (FCD approach): validation schemas live near the feature's model code and the form components import them.

Notes on Zod + react-hook-form
- Using Zod together with react-hook-form is a common pattern: Zod performs schema validation while react-hook-form provides performant form state handling.
- It is recommended to use Zod for schema definitions (types + validation) and `@hookform/resolvers` to connect them.

---

## Internationalization (i18n)

- The project uses `react-i18next` with `i18next-http-backend` to load JSON translation files from `public/locales/{lng}/{ns}.json`.
- Translations are split into namespaces (for example `common`, `translation`) and can be loaded per-page for faster initial load.
- When adding new UI text, add keys to the appropriate locale JSON files for all supported languages.

---

## Lazy loading and code-splitting

- Pages are lazy-loaded using React.lazy and Suspense. Each page has a small wrapper that will be code-split by Vite, improving the initial bundle size.
- Translation namespaces are also loaded on-demand where appropriate.

---

## Testing

- Unit & component tests are written with Jest and React Testing Library.
- Mocks: Supabase and API slices are mocked in test suites where needed.
- Tests live alongside components or in `__tests__` folders (see `widgets/*/__tests__`).
- There is Jest configuration under `config/jest` with setup files and custom mocks.

Test commands:
- `npm run test` — run all tests once
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage report

---

## Linting & static checks

- ESLint is configured for TypeScript and React. Follow the lint rules and run `npm run lint` or `npm run lint:fix` before committing.
- The project enforces code style and prevents common pitfalls; adapt or extend the ESLint config in the repository root if needed.

---

## Docker & Deployment

- A production Dockerfile is present which builds the Vite app and serves static files with Nginx.
- The project contains GitHub Actions workflows for building, testing and publishing Docker images to a registry (for example GHCR).

Secrets and environment for CI/CD
- Store runtime secrets as GitHub repository secrets and pass them to the deployment workflow. Typical secrets:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_CURRENCYLAYER_API_KEY` (if used)
  - `IMAGE_NAME` / `REGISTRY` (for image publish)

Runtime config generation
- At container startup the entrypoint script writes `runtime-config.js` into `/usr/share/nginx/html/` with actual values from environment variables so the client can read them at runtime.

---

## Contributing

- Follow the FCD structure: add new features under `features/` or `widgets/` depending on scope, and expose a small public API via `index.ts` where appropriate.
- Keep translations in `public/locales/*` and update both `en` and `ru` when adding UI text.
- Add tests for new logic and components. Ensure ESLint passes.

---

## Troubleshooting & tips

- If you see runtime errors about missing Supabase config in production, check that `public/runtime-config.js` is present and populated.
- For Docker issues, inspect container logs (`docker logs`) and verify that `runtime-config.js` was written by the entrypoint.
- If translations show raw keys instead of text, ensure the JSON files exist and the i18n backend can fetch them; check network requests for `/locales/...`.

---

## License

This repository does not include a license by default. Add a `LICENSE` file if you intend to publish or share the project.

---

If you want, I can also:
- Add a brief CONTRIBUTING.md with commit & PR guidelines;
- Create a minimal `.env.example` (without secrets) and a `deploy/` guide with GitHub Actions secrets required;
- Generate a short developer quickstart section with exact commands for Windows (PowerShell) and Unix shells.

Feel free to tell me which of these you'd like next and I will add it to the repo.
