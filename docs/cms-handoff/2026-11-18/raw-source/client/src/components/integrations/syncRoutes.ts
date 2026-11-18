export type SyncPoint = Readonly<{ x: number; y: number }>;

export type SyncRoute = Readonly<{
  id: string;
  direction: 'to-right' | 'to-left';
  path: string;
  points: readonly SyncPoint[];
}>;

export const SYNC_VIEWBOX = { width: 1000, height: 650 } as const;

function createRoute(id: string, direction: SyncRoute['direction'], points: readonly SyncPoint[]): SyncRoute {
  const path = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return point.x === points[index - 1].x ? `V ${point.y}` : `H ${point.x}`;
  }).join(' ');

  return { id, direction, path, points };
}

// Static roads, animated trails and dots share this geometry. The top 150 units
// stay clear of the title. Keep the first six routes in order to retain their timing.
export const SYNC_ROUTES: readonly SyncRoute[] = [
  createRoute('upper-express', 'to-right', [
    { x: 250, y: 355 },
    { x: 285, y: 355 },
    { x: 285, y: 170 },
    { x: 435, y: 170 },
    { x: 435, y: 205 },
    { x: 650, y: 205 },
    { x: 650, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('upper-detour', 'to-right', [
    { x: 250, y: 355 },
    { x: 320, y: 355 },
    { x: 320, y: 220 },
    { x: 500, y: 220 },
    { x: 500, y: 150 },
    { x: 700, y: 150 },
    { x: 700, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('upper-local', 'to-right', [
    { x: 250, y: 355 },
    { x: 365, y: 355 },
    { x: 365, y: 280 },
    { x: 570, y: 280 },
    { x: 570, y: 245 },
    { x: 675, y: 245 },
    { x: 675, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-local', 'to-left', [
    { x: 250, y: 355 },
    { x: 305, y: 355 },
    { x: 305, y: 425 },
    { x: 460, y: 425 },
    { x: 460, y: 455 },
    { x: 650, y: 455 },
    { x: 650, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-detour', 'to-left', [
    { x: 250, y: 355 },
    { x: 340, y: 355 },
    { x: 340, y: 485 },
    { x: 535, y: 485 },
    { x: 535, y: 520 },
    { x: 705, y: 520 },
    { x: 705, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-express', 'to-left', [
    { x: 250, y: 355 },
    { x: 280, y: 355 },
    { x: 280, y: 550 },
    { x: 420, y: 550 },
    { x: 420, y: 585 },
    { x: 670, y: 585 },
    { x: 670, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('upper-outer', 'to-right', [
    { x: 250, y: 355 },
    { x: 268, y: 355 },
    { x: 268, y: 150 },
    { x: 390, y: 150 },
    { x: 390, y: 185 },
    { x: 725, y: 185 },
    { x: 725, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('upper-middle', 'to-right', [
    { x: 250, y: 355 },
    { x: 345, y: 355 },
    { x: 345, y: 250 },
    { x: 470, y: 250 },
    { x: 470, y: 190 },
    { x: 625, y: 190 },
    { x: 625, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-inner', 'to-left', [
    { x: 250, y: 355 },
    { x: 375, y: 355 },
    { x: 375, y: 395 },
    { x: 490, y: 395 },
    { x: 490, y: 430 },
    { x: 620, y: 430 },
    { x: 620, y: 355 },
    { x: 750, y: 355 },
  ]),
  createRoute('lower-outer', 'to-left', [
    { x: 250, y: 355 },
    { x: 260, y: 355 },
    { x: 260, y: 590 },
    { x: 395, y: 590 },
    { x: 395, y: 620 },
    { x: 730, y: 620 },
    { x: 730, y: 355 },
    { x: 750, y: 355 },
  ]),
];

