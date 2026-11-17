export type SyncPoint = Readonly<{ x: number; y: number }>;

export type SyncRoute = Readonly<{
  id: string;
  path: string;
  points: readonly SyncPoint[];
}>;

export const SYNC_VIEWBOX = { width: 1000, height: 650 } as const;

function createRoute(id: string, points: readonly SyncPoint[]): SyncRoute {
  const path = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return point.x === points[index - 1].x ? `V ${point.y}` : `H ${point.x}`;
  }).join(' ');

  return { id, path, points };
}

// Keep the background paths in /bgs/vortex-sync-bg.svg in sync with these points.
// Each journey follows six square corners; the top 150 units stay clear of the title.
export const SYNC_ROUTES: readonly SyncRoute[] = [
  createRoute('upper-express', [
    { x: 250, y: 355 },
    { x: 285, y: 355 },
    { x: 285, y: 170 },
    { x: 435, y: 170 },
    { x: 435, y: 205 },
    { x: 650, y: 205 },
    { x: 650, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('upper-detour', [
    { x: 250, y: 355 },
    { x: 320, y: 355 },
    { x: 320, y: 220 },
    { x: 500, y: 220 },
    { x: 500, y: 150 },
    { x: 700, y: 150 },
    { x: 700, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('upper-local', [
    { x: 250, y: 355 },
    { x: 365, y: 355 },
    { x: 365, y: 280 },
    { x: 570, y: 280 },
    { x: 570, y: 245 },
    { x: 675, y: 245 },
    { x: 675, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-local', [
    { x: 250, y: 355 },
    { x: 305, y: 355 },
    { x: 305, y: 425 },
    { x: 460, y: 425 },
    { x: 460, y: 455 },
    { x: 650, y: 455 },
    { x: 650, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-detour', [
    { x: 250, y: 355 },
    { x: 340, y: 355 },
    { x: 340, y: 485 },
    { x: 535, y: 485 },
    { x: 535, y: 520 },
    { x: 705, y: 520 },
    { x: 705, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-express', [
    { x: 250, y: 355 },
    { x: 280, y: 355 },
    { x: 280, y: 550 },
    { x: 420, y: 550 },
    { x: 420, y: 585 },
    { x: 670, y: 585 },
    { x: 670, y: 355 },
    { x: 750, y: 355 },
  ]),
];

