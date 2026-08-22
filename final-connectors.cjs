const fs = require('fs');
let code = fs.readFileSync('src/pages/reading/components/notebook/connectors.js', 'utf8');

code = code.replace(
  'export function makeConnectors({ pagesRef, currentPageIndex, getPage }) {',
  'export function makeConnectors({ pagesRef, currentPageIndex, getPage, stageRef }) {'
);

const liveCoordLogic = `
      let liveX = o.x;
      let liveY = o.y;
      let liveScaleX = o.scaleX || 1;
      let liveScaleY = o.scaleY || 1;
      if (stageRef && stageRef.current) {
         const node = stageRef.current.findOne('#' + id);
         if (node) {
            liveX = node.x();
            liveY = node.y();
            liveScaleX = node.scaleX();
            liveScaleY = node.scaleY();
         }
      }
`;

code = code.replace(
  '      if (kind === \'images\') return { minX: o.x, minY: o.y, maxX: o.x + (o.width || 0) * (o.scaleX || 1), maxY: o.y + (o.height || 0) * (o.scaleY || 1) };',
  liveCoordLogic + '      if (kind === \'images\') return { minX: liveX, minY: liveY, maxX: liveX + (o.width || 0) * liveScaleX, maxY: liveY + (o.height || 0) * liveScaleY };'
);

code = code.replace(
  '      if (kind === \'stickers\') {\n        const w = o.audioUrl ? 130 : (o.width || 150);\n        const h = o.audioUrl ? 44 : (o.height || 150);\n        return { minX: o.x, minY: o.y, maxX: o.x + w * (o.scaleX || 1), maxY: o.y + h * (o.scaleY || 1) };\n      }',
  '      if (kind === \'stickers\') {\n        const w = o.audioUrl ? 130 : (o.width || 150);\n        const h = o.audioUrl ? 44 : (o.height || 150);\n        return { minX: liveX, minY: liveY, maxX: liveX + w * liveScaleX, maxY: liveY + h * liveScaleY };\n      }'
);

code = code.replace(
  '        const width = textVisualWidth(o, body);\n        const height = Math.max(1, rows.length) * size * LINE_HEIGHT;\n        return { minX: o.x, minY: o.y, maxX: o.x + width, maxY: o.y + height };',
  '        const width = textVisualWidth(o, body);\n        const height = Math.max(1, rows.length) * size * LINE_HEIGHT;\n        return { minX: liveX, minY: liveY, maxX: liveX + width, maxY: liveY + height };'
);

fs.writeFileSync('src/pages/reading/components/notebook/connectors.js', code);
