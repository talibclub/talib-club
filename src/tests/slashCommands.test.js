import { describe, expect, it } from 'vitest';
import { filterSlashCommands, matchSlashCommand, SLASH_COMMANDS } from '../pages/reading/components/notebook/slashCommands.js';

describe('matchSlashCommand', () => {
  it('opens on a slash at the start of a line', () => {
    expect(matchSlashCommand('/')).toEqual({ start: 0, query: '' });
    expect(matchSlashCommand('/หัว')).toEqual({ start: 0, query: 'หัว' });
  });

  it('opens on a slash after a space', () => {
    expect(matchSlashCommand('เขียนว่า /bo')).toEqual({ start: 9, query: 'bo' });
  });

  it('stays shut inside a date or a path', () => {
    expect(matchSlashCommand('12/05')).toBeNull();
    expect(matchSlashCommand('src/pages')).toBeNull();
    expect(matchSlashCommand('และ/หรือ')).toBeNull();
  });

  it('closes once the query contains a space', () => {
    expect(matchSlashCommand('/หัวข้อ ใหญ่')).toBeNull();
  });

  it('tracks the last slash, not the first', () => {
    expect(matchSlashCommand('/a /b')).toEqual({ start: 3, query: 'b' });
  });

  it('returns nothing for text with no slash at all', () => {
    expect(matchSlashCommand('ธรรมดา')).toBeNull();
    expect(matchSlashCommand('')).toBeNull();
    expect(matchSlashCommand(null)).toBeNull();
  });
});

describe('filterSlashCommands', () => {
  it('lists everything before anything is typed', () => {
    expect(filterSlashCommands('')).toHaveLength(SLASH_COMMANDS.length);
  });

  it('matches Thai labels', () => {
    expect(filterSlashCommands('หนา').map((c) => c.id)).toEqual(['bold']);
  });

  it('matches English keywords', () => {
    expect(filterSlashCommands('bullet').map((c) => c.id)).toEqual(['bullet']);
    expect(filterSlashCommands('align').map((c) => c.id)).toEqual(['left', 'center', 'right']);
  });

  it('is case-insensitive', () => {
    expect(filterSlashCommands('BOLD').map((c) => c.id)).toEqual(['bold']);
  });

  it('returns nothing when nothing matches', () => {
    expect(filterSlashCommands('zzzz')).toEqual([]);
  });

  it('gives every command a unique id and a label', () => {
    const ids = SLASH_COMMANDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SLASH_COMMANDS.every((c) => c.label && c.icon)).toBe(true);
  });
});
