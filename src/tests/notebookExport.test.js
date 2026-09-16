import { expect, it } from 'vitest';
import { notebookExportLayers } from '../pages/reading/components/notebook/exportLayers.js';

it('exports ink after text and images, regardless of intervening tool layers', () => {
  const layer = (id, content) => ({ id, hasName: name => content && name === 'notebook-export' });
  const paper = layer('paper', true), text = layer('text', true), ink = layer('ink', true);
  const stage = { getLayers: () => [paper, layer('ruler', false), text, ink, layer('selection', false)] };
  expect(notebookExportLayers(stage)).toEqual([paper, text, ink]);
});

it('reports missing content instead of silently exporting a white page', () => {
  expect(() => notebookExportLayers({ getLayers: () => [] })).toThrow();
});
