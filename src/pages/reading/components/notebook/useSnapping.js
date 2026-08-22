import { useState, useCallback } from 'react';

const SNAP_THRESHOLD = 5; // pixels (unscaled)

export function useSnapping(scale) {
  const [alignmentGuides, setAlignmentGuides] = useState([]);

  // Get bounding boxes of all page objects
  const getObjectBoxes = (page, excludeId) => {
    const boxes = [];
    if (!page) return boxes;
    
    const addBox = (obj) => {
      if (!obj || obj.id === excludeId) return;
      // Rough bounding box. Assume x, y is top-left, and width/height exist, or it's centered.
      // Texts, icons, images, pdfs.
      // Since texts might be centered, we should use their rendered dimensions if available, 
      // but for simplicity, we use stored x, y, width, height (or defaults).
      const w = obj.width || (obj.size ? obj.size * 2 : 100);
      const h = obj.height || (obj.size ? obj.size * 2 : 100);
      
      const x = obj.x || 0;
      const y = obj.y || 0;
      
      // Calculate 3 snap points for each axis: start, center, end
      boxes.push({
        id: obj.id,
        vertical: [x, x + w / 2, x + w],
        horizontal: [y, y + h / 2, y + h],
        bounds: { minX: x, maxX: x + w, minY: y, maxY: y + h }
      });
    };

    (page.images || []).forEach(addBox);
    (page.pdfs || []).forEach(addBox);
    (page.shapes || []).forEach(addBox);
    (page.texts || []).forEach(addBox);

    return boxes;
  };

  const handleDragMove = useCallback((e, page, objectId) => {
    // Only snap if we are dragging a single object (not a lasso group)
    if (!page) return;
    
    const node = e.target;
    // We get the object's current dragging position
    const x = node.x();
    const y = node.y();
    const w = node.width() * node.scaleX() || 100;
    const h = node.height() * node.scaleY() || 100;

    const myVertical = [x, x + w / 2, x + w];
    const myHorizontal = [y, y + h / 2, y + h];
    
    const otherBoxes = getObjectBoxes(page, objectId);
    
    let snapX = null;
    let snapY = null;
    const guides = [];

    const threshold = SNAP_THRESHOLD / (scale || 1);

    // Find closest vertical lines (X coords)
    let minDiffX = Infinity;
    otherBoxes.forEach(box => {
      box.vertical.forEach(targetX => {
        myVertical.forEach((myX, index) => {
          const diff = Math.abs(targetX - myX);
          if (diff < threshold && diff < minDiffX) {
            minDiffX = diff;
            // offset depends on which part of 'my' box snapped
            snapX = targetX - (index === 0 ? 0 : index === 1 ? w / 2 : w);
            guides.push({
              type: 'vertical',
              pos: targetX,
              min: Math.min(y, box.bounds.minY) - 50,
              max: Math.max(y + h, box.bounds.maxY) + 50
            });
          }
        });
      });
    });

    // Find closest horizontal lines (Y coords)
    let minDiffY = Infinity;
    otherBoxes.forEach(box => {
      box.horizontal.forEach(targetY => {
        myHorizontal.forEach((myY, index) => {
          const diff = Math.abs(targetY - myY);
          if (diff < threshold && diff < minDiffY) {
            minDiffY = diff;
            snapY = targetY - (index === 0 ? 0 : index === 1 ? h / 2 : h);
            guides.push({
              type: 'horizontal',
              pos: targetY,
              min: Math.min(x, box.bounds.minX) - 50,
              max: Math.max(x + w, box.bounds.maxX) + 50
            });
          }
        });
      });
    });

    // Apply snap
    if (snapX !== null) node.x(snapX);
    if (snapY !== null) node.y(snapY);

    // Keep only the closest guides
    const finalGuides = [];
    if (snapX !== null) {
       const vGuide = guides.slice().reverse().find(g => g.type === 'vertical');
       if (vGuide) finalGuides.push(vGuide);
    }
    if (snapY !== null) {
       const hGuide = guides.slice().reverse().find(g => g.type === 'horizontal');
       if (hGuide) finalGuides.push(hGuide);
    }

    setAlignmentGuides(finalGuides);
  }, [scale]);

  const handleDragEnd = useCallback(() => {
    setAlignmentGuides([]);
  }, []);

  return { alignmentGuides, handleDragMove, handleDragEnd };
}
