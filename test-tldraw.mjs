import('tldraw').then(m => {
  try {
    const store = m.createTLStore({ shapeUtils: [] });
    store.put([{
      id: m.AssetRecordType.createId(),
      type: 'asset',
      typeName: 'asset',
      props: {
        type: 'image',
        src: '',
        w: 100,
        h: 100,
        name: 'test',
        isAnimated: false,
        mimeType: 'image/png'
      }
    }]);
    console.log('success put asset');
  } catch(e) {
    console.error('error put asset:', e);
  }
});
