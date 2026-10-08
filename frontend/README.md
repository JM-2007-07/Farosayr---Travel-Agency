# FaroSayr — Frontend

React 19 + Vite + react-router. Styling: the project's own CSS design
system (`src/styles/tokens.css`, `src/styles/global.css`) plus MUI with a
Farosayr theme (`src/theme/muiTheme.js`), mostly in the admin panel.

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev            # http://localhost:5173
npm run lint
npm run build
npm run preview
```

## Environment

Every `VITE_*` variable is compiled into the public bundle — only public
values belong there (`VITE_API_URL`, `VITE_YANDEX_MAPS_API_KEY`). Never put
secrets in the frontend. See [../docs/SECURITY.md](../docs/SECURITY.md).

## Notes

- API access goes through `src/services/api/client.js` only
  (`credentials: 'include'`, JSON bodies).
- Security headers for the deployed site are set in `vercel.json`.
- Setup and checks: [../docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md);
  deployment: [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).
