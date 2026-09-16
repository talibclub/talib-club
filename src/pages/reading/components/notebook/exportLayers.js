// Explicitly tagged content layers include ink while excluding selection handles,
// lasers and rulers. Never infer content from its position in the stage.
export function notebookExportLayers(stage) {
  const layers = stage.getLayers().filter(layer => layer.hasName('notebook-export'));
  if (!layers.length) throw new Error('ไม่พบเนื้อหาสำหรับส่งออก กรุณาลองเปิดสมุดใหม่');
  return layers;
}
