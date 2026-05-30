const KEYWORDS = new Set(['balance', 'services', 'add', 'status', 'refill', 'cancel']);

/**
 * Tokenize a single line of JSON-like API example for syntax highlighting.
 */
export function tokenizeLine(line) {
  const spans = [];
  let i = 0;
  let expectActionValue = false;

  while (i < line.length) {
    const rest = line.slice(i);

    if (rest.startsWith('//')) {
      spans.push({ type: 'comment', text: rest });
      break;
    }

    if (rest[0] === '"') {
      let j = 1;
      while (j < rest.length) {
        if (rest[j] === '\\') j += 2;
        else if (rest[j] === '"') break;
        else j += 1;
      }
      const quoted = rest.slice(0, j + 1);
      const after = rest.slice(j + 1);
      const colonMatch = after.match(/^(\s*:)/);
      const isKey = Boolean(colonMatch);

      if (isKey) {
        const keyName = quoted.slice(1, -1);
        spans.push({ type: 'key', text: quoted });
        spans.push({ type: 'plain', text: colonMatch[1] });
        i += quoted.length + colonMatch[1].length;
        expectActionValue = keyName === 'action';
        continue;
      }

      const inner = quoted.slice(1, -1);
      let type = 'string';
      if (expectActionValue && KEYWORDS.has(inner)) type = 'keyword';
      else if (/^\d+(\.\d+)?$/.test(inner)) type = 'number';
      spans.push({ type, text: quoted });
      expectActionValue = false;
      i += quoted.length;
      continue;
    }

    const numMatch = rest.match(/^(\d+\.?\d*)/);
    if (numMatch) {
      spans.push({ type: 'number', text: numMatch[1] });
      i += numMatch[1].length;
      expectActionValue = false;
      continue;
    }

    const plainMatch = rest.match(/^[\s{}\[\],:]+/);
    if (plainMatch) {
      spans.push({ type: 'plain', text: plainMatch[0] });
      i += plainMatch[0].length;
      continue;
    }

    spans.push({ type: 'plain', text: rest[0] });
    i += 1;
    expectActionValue = false;
  }

  return spans.length ? spans : [{ type: 'plain', text: line }];
}

export function splitHighlightedLines(source) {
  return String(source || '').split('\n').map((line, idx) => ({
    lineNumber: idx + 1,
    spans: tokenizeLine(line),
  }));
}
