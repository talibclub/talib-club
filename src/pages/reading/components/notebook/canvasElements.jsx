import React from 'react';
import { Image as KonvaImage, Path, Group, Circle } from 'react-konva';
import useImage from 'use-image';
import getStroke from 'perfect-freehand';

// One PDF/raster page drawn onto the Konva stage.
export const PDFPageImage = ({ src, width, height }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={width} height={height} />;
};

// Ruled / grid / dotted paper background.
export const PaperPattern = ({ width, height, type, color }) => {
  const lineGap = 40;
  const isDark = color === 'dark';
  const strokeColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  const lines = [];
  if (type === 'lines' || type === 'grid') {
    for (let y = lineGap; y < height; y += lineGap) {
      lines.push(<Path key={`h-${y}`} data={`M 0 ${y} L ${width} ${y}`} stroke={strokeColor} strokeWidth={1} />);
    }
  }
  if (type === 'grid') {
    for (let x = lineGap; x < width; x += lineGap) {
      lines.push(<Path key={`v-${x}`} data={`M ${x} 0 L ${x} ${height}`} stroke={strokeColor} strokeWidth={1} />);
    }
  }
  if (type === 'dots') {
    for (let y = lineGap; y < height; y += lineGap) {
      for (let x = lineGap; x < width; x += lineGap) {
        lines.push(<Circle key={`d-${x}-${y}`} x={x} y={y} radius={2} fill={strokeColor} />);
      }
    }
  }

  return <Group>{lines}</Group>;
};

export const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return "";
  const d = stroke.reduce((acc, [x0, y0], i, arr) => {
    const [x1, y1] = arr[(i + 1) % arr.length];
    acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    return acc;
  }, ["M", ...stroke[0], "Q"]);
  d.push("Z");
  return d.join(" ");
};

// What actually distinguishes one pen from another. `stroke` goes to
// perfect-freehand and shapes the outline; the rest controls how it is painted.
//
//  pen         ballpoint — near-constant width, fully opaque
//  fountain    strong width response and tapered ends, like a flexible nib
//  pencil      graphite: light, grainy, and it darkens where strokes overlap
//  marker      chisel tip — flat width, slightly translucent
//  highlighter wide, flat, multiplied so text stays readable underneath
export const PEN_STYLES = {
  pen: {
    // Higher thinning so real stylus pressure (and velocity, for mouse) visibly
    // changes the line weight — at 0.22 the response was too small to notice.
    stroke: { thinning: 0.5, smoothing: 0.5, streamline: 0.5 },
    opacity: 1, composite: 'source-over',
  },
  fountain: {
    stroke: {
      thinning: 0.78, smoothing: 0.62, streamline: 0.42,
      start: { taper: 14, cap: true }, end: { taper: 32, cap: true },
    },
    opacity: 1, composite: 'source-over',
  },
  pencil: {
    stroke: { thinning: 0.55, smoothing: 0.4, streamline: 0.32 },
    opacity: 0.62, composite: 'multiply', grain: true,
  },
  marker: {
    stroke: { thinning: 0.05, smoothing: 0.55, streamline: 0.5, start: { cap: true }, end: { cap: true } },
    sizeScale: 1.7, opacity: 0.9, composite: 'source-over',
  },
  highlighter: {
    stroke: { thinning: 0, smoothing: 0.6, streamline: 0.6, start: { cap: false }, end: { cap: false } },
    sizeScale: 3, opacity: 0.42, composite: 'multiply',
  },
  eraser: {
    stroke: { thinning: 0, smoothing: 0.5, streamline: 0.5 },
    opacity: 1, composite: 'destination-out',
  },
};

// Graphite grain, one tile per colour, built once and reused. Without this the
// pencil is just a thin translucent line and reads as a weak pen.
const grainCache = new Map();
const getGrainTile = (color) => {
  if (grainCache.has(color)) return grainCache.get(color);
  const c = document.createElement('canvas');
  c.width = c.height = 48;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  for (let i = 0; i < 1100; i++) {
    ctx.globalAlpha = 0.2 + Math.random() * 0.6;
    ctx.fillRect(Math.random() * 48, Math.random() * 48, 1, 1);
  }
  grainCache.set(color, c);
  return c;
};

// One rendered stroke. Pulled out of the component (and memoised at the layer
// level) so that drawing a new stroke does not re-run getStroke for every stroke
// already on the page — that was the source of the lag as a page filled up.
export const StrokeShape = ({ line, faded }) => {
  const style = PEN_STYLES[line.tool] || PEN_STYLES.pen;
  const color = line.color || '#111827';

  // Feed real stylus pressure to perfect-freehand when we captured it; fall back
  // to its velocity simulation for strokes drawn with a mouse or saved earlier.
  const hasPressure = Array.isArray(line.pressures) && line.pressures.length === line.points.length / 2;
  const pointPairs = [];
  for (let p = 0; p < line.points.length; p += 2) {
    pointPairs.push(hasPressure
      ? [line.points[p], line.points[p + 1], line.pressures[p / 2]]
      : [line.points[p], line.points[p + 1]]);
  }

  const baseSize = line.tool === 'eraser' ? (line.size || 24) : (line.size || 4) * (style.sizeScale || 1);
  const outline = getStroke(pointPairs, {
    size: baseSize,
    ...style.stroke,
    simulatePressure: !hasPressure,
  });
  const pathData = getSvgPathFromStroke(outline);

  const common = {
    data: pathData,
    opacity: (line.opacity ?? 1) * style.opacity * (faded ? 0.2 : 1),
    globalCompositeOperation: style.composite,
    lineCap: 'round',
    lineJoin: 'round',
  };

  if (style.grain) {
    return <Path {...common} fillPriority="pattern" fillPatternImage={getGrainTile(color)} fillPatternRepeat="repeat" />;
  }
  return <Path {...common} fill={line.tool === 'eraser' ? 'black' : color} />;
};

// Committed ink. Re-renders only when the stroke list itself changes.
export const CommittedStrokes = React.memo(({ lines, playbackTime, nowPlayingId }) => (
  <>
    {lines.map((line, i) => {
      const isPlayingThis = nowPlayingId && (line.recordingId === nowPlayingId || (!line.recordingId && line.startTime != null));
      const inFuture = isPlayingThis && line.startTime !== undefined && line.startTime !== null && line.startTime > playbackTime * 1000;
      return <StrokeShape key={i} line={line} faded={inFuture} />;
    })}
  </>
));

// Little visual swatch of each sticky-note frame style, so the picker shows what
// you get instead of only a Thai word for it.
export const StickyStyleThumb = ({ id, color = '#FEF3C7' }) => {
  const base = { width: 28, height: 24, position: 'relative', background: color, boxShadow: '0 1px 2px rgba(0,0,0,0.2)', boxSizing: 'border-box' };
  if (id === 'round') return <div style={{ ...base, borderRadius: 8 }} />;
  if (id === 'polaroid') return (
    <div style={{ width: 26, height: 24, background: '#fff', border: '1px solid #E5E7EB', padding: 2, paddingBottom: 7, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', height: '100%', background: color }} />
    </div>
  );
  if (id === 'bubble') return (
    <div style={{ ...base, borderRadius: 8, background: '#DBEAFE' }}>
      <div style={{ position: 'absolute', bottom: -4, left: 6, width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '5px solid #DBEAFE' }} />
    </div>
  );
  if (id === 'pin') return (
    <div style={base}>
      <div style={{ position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#EF4444', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />
    </div>
  );
  if (id === 'tape') return (
    <div style={base}>
      <div style={{ position: 'absolute', top: -3, left: 5, width: 18, height: 7, background: 'rgba(148,163,184,0.55)', transform: 'rotate(-8deg)' }} />
    </div>
  );
  if (id === 'torn') return <div style={{ ...base, clipPath: 'polygon(0 0,100% 0,100% 82%,87% 100%,74% 86%,61% 100%,48% 86%,35% 100%,22% 86%,9% 100%,0 82%)' }} />;
  if (id === 'lined') return <div style={{ ...base, backgroundImage: 'repeating-linear-gradient(' + color + ' 0 5px, rgba(0,0,0,0.12) 5px 6px)' }} />;
  // classic
  return <div style={base} />;
};
