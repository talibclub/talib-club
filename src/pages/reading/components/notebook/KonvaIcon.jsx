import React, { useMemo, useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { renderToString } from 'react-dom/server';
import { ICON_MAP } from './icons.js';

export default function KonvaIcon({ iconName, color, width, height, ...props }) {
  const IconComponent = ICON_MAP[iconName] || ICON_MAP['Star'];
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Render the lucide icon to an SVG string
    const svgString = renderToString(<IconComponent size={Math.max(width, height)} color={color} strokeWidth={1.5} />);
    // Create an image element
    const img = new window.Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      setImage(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [iconName, color, width, height, IconComponent]);

  if (!image) return null;

  return (
    <KonvaImage
      image={image}
      width={width}
      height={height}
      {...props}
    />
  );
}
