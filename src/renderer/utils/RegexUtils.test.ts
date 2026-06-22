import { describe, expect, it } from 'vitest';
import { escapeRegExp } from './RegexUtils';

describe('escapeRegExp', () => {
  it('leaves plain text unchanged', () => {
    expect(escapeRegExp('Newtonsoft.Json')).toBe('Newtonsoft\\.Json');
  });

  it('escapes every regex special character', () => {
    const specialChars = '.*+?^' + '$' + '{}()|[]\\';

    expect(escapeRegExp(specialChars)).toBe(
      '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\',
    );
  });

  it('produces a pattern that no longer throws when used in a RegExp', () => {
    const query = '(';

    expect(() => new RegExp(`(${escapeRegExp(query)})`, 'gi')).not.toThrow();
  });

  it('still matches the literal substring it was built from', () => {
    const query = 'Sample.ProjectRef(beta)';
    const pattern = new RegExp(`(${escapeRegExp(query)})`, 'gi');

    expect('Sample.ProjectRef(beta) v1.0.0'.match(pattern)?.[0]).toBe(query);
  });
});
