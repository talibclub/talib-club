export function getShelfBook(item, books) {
  return books.find(book => String(book.id) === String(item.bookId)) || item.customBook || null
}

export function visibleShelf(shelfItems, books, uid) {
  return shelfItems.filter(item => item.uid === uid)
    .map(item => ({ ...item, book: getShelfBook(item, books) }))
    .filter(item => item.book)
}
