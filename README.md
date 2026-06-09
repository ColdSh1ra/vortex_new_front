# Vortex Learning Project

This is a learning-friendly fullstack project with:

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express with MVC structure

It includes a basic website with three pages and dynamic navigation links in a reusable header component.

## Project Structure

```text
vortex_new_front/
  client/
    src/
      components/
        layout/
          HeaderMain.tsx
      pages/
        MainPage.tsx
        ContactPage.tsx
        FaqPage.tsx
      routes/
        AppRouter.tsx
      types/
        navigation.ts
      styles/
        global.css
      App.tsx
      main.tsx
    index.html
    vite.config.ts
    tsconfig.json

  server/
    src/
      config/
        constants.js
      models/
        contentModel.js
      services/
        contentService.js
      controllers/
        contentController.js
      routes/
        contentRoutes.js
      app.js
      server.js
    data/
      vortex.json
```

## How to Install

From the project root:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

## How to Run Frontend Only

```bash
npm run client
```

Frontend starts at `http://localhost:5173`.

## How to Run Backend Only

```bash
npm run server
```

Backend starts at `http://localhost:5001`.

Available API endpoints:

- `GET /api/content`
- `POST /api/content`

## How to Run Frontend + Backend Together

```bash
npm run dev
```

This runs both servers in parallel.

## Learning Notes

- React routing is defined in `client/src/routes/AppRouter.tsx`.
- Dynamic header links are mapped from a typed array in `client/src/components/layout/HeaderMain.tsx`.
- MVC flow on backend:
  - route -> controller -> service -> model
  - file data source is `server/data/vortex.json`
