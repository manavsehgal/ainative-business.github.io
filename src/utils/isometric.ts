// Isometric projection utilities — computed at build time in Astro frontmatter
// Standard isometric: 30° angle, cos(30°) ≈ 0.866, sin(30°) = 0.5

const COS30 = Math.cos(Math.PI / 6); // 0.866
const SIN30 = 0.5;

/** Project a 3D point (x, y, z) into 2D isometric coordinates */
export function isoProject(x: number, y: number, z: number): { x: number; y: number } {
  return {
    x: (x - y) * COS30,
    y: (x + y) * SIN30 - z,
  };
}

/** Single point projection — returns "x,y" string for SVG attributes */
export function isoPoint(x: number, y: number, z: number): string {
  const p = isoProject(x, y, z);
  return `${p.x},${p.y}`;
}

interface PlatformFaces {
  top: string;    // polygon points for the top face
  left: string;   // polygon points for the left face
  right: string;  // polygon points for the right face
}

/** Generate polygon point strings for a 3D box's three visible faces */
export function isoPlatform(
  px: number, py: number, pz: number,
  w: number, d: number, h: number
): PlatformFaces {
  // 8 corners of the box in 3D, projected to 2D
  const topFrontLeft = isoProject(px, py, pz + h);
  const topFrontRight = isoProject(px + w, py, pz + h);
  const topBackRight = isoProject(px + w, py + d, pz + h);
  const topBackLeft = isoProject(px, py + d, pz + h);
  const botFrontLeft = isoProject(px, py, pz);
  const botFrontRight = isoProject(px + w, py, pz);
  const botBackRight = isoProject(px + w, py + d, pz);

  const pt = (p: { x: number; y: number }) => `${p.x},${p.y}`;

  return {
    top: [topFrontLeft, topFrontRight, topBackRight, topBackLeft].map(pt).join(' '),
    left: [topFrontLeft, topBackLeft, isoProject(px, py + d, pz), botFrontLeft].map(pt).join(' '),
    right: [topFrontRight, topBackRight, botBackRight, botFrontRight].map(pt).join(' '),
  };
}

/** Generate grid line paths on a platform's top face */
export function isoGridLines(
  px: number, py: number, pz: number,
  w: number, d: number,
  divisions: number
): string[] {
  const paths: string[] = [];
  const z = pz;

  // Lines parallel to the X axis (varying y)
  for (let i = 0; i <= divisions; i++) {
    const t = (i / divisions) * d;
    const start = isoProject(px, py + t, z);
    const end = isoProject(px + w, py + t, z);
    paths.push(`M${start.x},${start.y} L${end.x},${end.y}`);
  }

  // Lines parallel to the Y axis (varying x)
  for (let i = 0; i <= divisions; i++) {
    const t = (i / divisions) * w;
    const start = isoProject(px + t, py, z);
    const end = isoProject(px + t, py + d, z);
    paths.push(`M${start.x},${start.y} L${end.x},${end.y}`);
  }

  return paths;
}

/** Connector line between two 3D points — returns SVG path d attribute */
export function isoLine(
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number
): string {
  const start = isoProject(x1, y1, z1);
  const end = isoProject(x2, y2, z2);
  return `M${start.x},${start.y} L${end.x},${end.y}`;
}

/** Isometric ellipse parameters for orbit rings lying on the XY plane at height z */
export function isoEllipse(
  cx: number, cy: number, cz: number, radius: number
): { cx: number; cy: number; rx: number; ry: number } {
  const center = isoProject(cx, cy, cz);
  return {
    cx: center.x,
    cy: center.y,
    rx: radius * COS30,
    ry: radius * SIN30,
  };
}
