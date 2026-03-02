import { useRef, useEffect, useCallback } from "react";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7", "#f97316", "#06b6d4"];
const GRID_RANGE = 5;

interface Arrow {
  x: number;
  y: number;
  color?: string;
  label?: string;
  dashed?: boolean;
}

interface GridLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}

export interface Canvas2DProps {
  width?: number;
  height?: number;
  arrows?: Arrow[];
  transformedArrows?: Arrow[];
  gridLines?: GridLine[];
  extraLines?: GridLine[];
  range?: number;
  className?: string;
}

export function Canvas2D({
  width = 400,
  height = 400,
  arrows = [],
  transformedArrows = [],
  gridLines = [],
  extraLines = [],
  range: viewRange = GRID_RANGE,
  className,
}: Canvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toX = useCallback(
    (mx: number) => (width / 2) + (mx / viewRange) * (width / 2),
    [width, viewRange]
  );
  const toY = useCallback(
    (my: number) => (height / 2) - (my / viewRange) * (height / 2),
    [height, viewRange]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // clear
    ctx.clearRect(0, 0, width, height);

    // default grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    for (let i = -viewRange; i <= viewRange; i++) {
      ctx.beginPath();
      ctx.moveTo(toX(i), 0);
      ctx.lineTo(toX(i), height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, toY(i));
      ctx.lineTo(width, toY(i));
      ctx.stroke();
    }

    // custom grid lines (transformed grid)
    for (const gl of gridLines) {
      ctx.strokeStyle = gl.color ?? "rgba(59,130,246,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(toX(gl.x1), toY(gl.y1));
      ctx.lineTo(toX(gl.x2), toY(gl.y2));
      ctx.stroke();
    }

    // extra lines (e.g. reflection/projection line)
    for (const el of extraLines) {
      ctx.strokeStyle = el.color ?? "#a855f7";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(toX(el.x1), toY(el.y1));
      ctx.lineTo(toX(el.x2), toY(el.y2));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // axes
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toY(0));
    ctx.lineTo(width, toY(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX(0), 0);
    ctx.lineTo(toX(0), height);
    ctx.stroke();

    // tick labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    for (let i = -viewRange + 1; i < viewRange; i++) {
      if (i === 0) continue;
      ctx.fillText(String(i), toX(i), toY(0) + 12);
      ctx.fillText(String(i), toX(0) - 10, toY(i) + 4);
    }

    // draw arrow helper
    const drawArrow = (a: Arrow, fromOrigin: boolean) => {
      const ox = toX(0), oy = toY(0);
      const ax = toX(a.x), ay = toY(a.y);
      const headLen = 8;
      const dx = ax - (fromOrigin ? ox : 0);
      const dy = ay - (fromOrigin ? oy : 0);
      const angle = Math.atan2(dy, dx);

      ctx.strokeStyle = a.color ?? COLORS[0];
      ctx.fillStyle = a.color ?? COLORS[0];
      ctx.lineWidth = 2;

      if (a.dashed) {
        ctx.setLineDash([4, 4]);
      }

      ctx.beginPath();
      if (fromOrigin) {
        ctx.moveTo(ox, oy);
      }
      ctx.lineTo(ax, ay);
      ctx.stroke();
      ctx.setLineDash([]);

      // arrowhead
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - headLen * Math.cos(angle - Math.PI / 6), ay - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ax - headLen * Math.cos(angle + Math.PI / 6), ay - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // label
      if (a.label) {
        ctx.fillStyle = a.color ?? COLORS[0];
        ctx.font = "12px sans-serif";
        ctx.fillText(a.label, ax + 6, ay - 6);
      }
    };

    // original arrows
    for (const a of arrows) drawArrow(a, true);
    // transformed arrows
    for (const a of transformedArrows) drawArrow(a, true);
  }, [width, height, arrows, transformedArrows, gridLines, extraLines, viewRange, toX, toY]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}
    />
  );
}

/** Build a set of grid lines from a 2×2 transform matrix (float). */
export function buildTransformedGrid(M: number[][], range = GRID_RANGE): GridLine[] {
  const lines: GridLine[] = [];
  const color = "rgba(59,130,246,0.3)";
  for (let i = -range; i <= range; i++) {
    // vertical lines: x = i, y varies
    const x1 = M[0][0] * i + M[0][1] * (-range);
    const y1 = M[1][0] * i + M[1][1] * (-range);
    const x2 = M[0][0] * i + M[0][1] * range;
    const y2 = M[1][0] * i + M[1][1] * range;
    lines.push({ x1, y1, x2, y2, color });
    // horizontal lines: y = i, x varies
    const hx1 = M[0][0] * (-range) + M[0][1] * i;
    const hy1 = M[1][0] * (-range) + M[1][1] * i;
    const hx2 = M[0][0] * range + M[0][1] * i;
    const hy2 = M[1][0] * range + M[1][1] * i;
    lines.push({ x1: hx1, y1: hy1, x2: hx2, y2: hy2, color });
  }
  return lines;
}
