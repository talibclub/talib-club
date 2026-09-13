import { describe, expect, it } from 'vitest';
import { visibleShelf } from '../utils/bookshelf.js';

describe('visibleShelf', () => {
  it('counts only resolvable books owned by the reader, including custom and legacy books', () => {
    const shelf = visibleShelf([
      { uid: 'a', bookId: '1' },
      { uid: 'a', bookId: 2, status: 'reading' },
      { uid: 'a', customBook: { title: 'Private' } },
      { uid: 'a', bookId: 3, status: 'finished' },
      { uid: 'b', bookId: 1 },
      { uid: 'a', bookId: 404 },
      { uid: 'a', bookId: 405 },
      { uid: 'a', bookId: 406 },
    ], [{ id: 1 }, { id: 2 }, { id: 3 }], 'a');
    expect(shelf.filter(item => item.status !== 'finished')).toHaveLength(3);
    expect(shelf.filter(item => item.status === 'finished')).toHaveLength(1);
  });
});
