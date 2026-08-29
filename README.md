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

## Adding an Integration Branch

The integrations network is client-only and is built from the `integrations` array in
`client/src/components/integrations/integrationData.ts`. Each array item renders one
`IntegrationBranch`: its logo node, grey wire, and animated orange energy pulse.

To add another integration:

1. Put its logo in `client/public/imgs/integrations/`. Use PNG, JPG, or SVG and keep
   the artwork tightly cropped so it sits neatly inside the circular node.
2. Add an image preload to `client/index.html`:

   ```html
   <link rel="preload" as="image" href="/imgs/integrations/new-logo.png">
   ```

3. Add an object to the `integrations` array:

   ```ts
   {
     name: 'New supplier',
     imageSrc: '/imgs/integrations/new-logo.png',
     x: 24,
     y: 64,
     size: 'large',
     animationDelay: 360,
   },
   ```

The `x` and `y` values are percentages of the network canvas. `x: 0, y: 0` is the
top-left corner and `x: 100, y: 100` is the bottom-right corner. Use `large` for an
outer supplier and `small` for a node near the center. `animationDelay` is a
millisecond offset that prevents all energy pulses from travelling at once. The wire
automatically connects the new coordinates to `INTEGRATION_HUB_POSITION`, so no SVG
path or CSS needs to be added manually.

After adding a branch, check it at mobile, laptop, and wide-screen widths. Keep enough
space between its coordinates and neighboring nodes for the larger desktop circle,
then run:

```bash
npm run build
```
