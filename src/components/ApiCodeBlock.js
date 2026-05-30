import React, { useState, useCallback } from 'react';
import { splitHighlightedLines } from '../utils/jsonHighlight';

const ApiCodeBlock = ({ code, language = 'json', title }) => {
  const [copied, setCopied] = useState(false);
  const lines = splitHighlightedLines(code);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [code]);

  return (
    <div className="api-code-block">
      {(title || language) && (
        <div className="api-code-block__bar">
          {title && <span className="api-code-block__title">{title}</span>}
          {language && !title && <span className="api-code-block__lang">{language}</span>}
        </div>
      )}
      <div className="api-code-block__wrap">
        <button
          type="button"
          className="api-code-block__copy"
          onClick={copy}
          aria-label="Copy code"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre className="api-code-block__pre">
          <code>
            {lines.map((line) => (
              <div key={line.lineNumber} className="api-code-block__line">
                <span className="api-code-block__ln" aria-hidden="true">
                  {line.lineNumber}
                </span>
                <span className="api-code-block__content">
                  {line.spans.map((span, i) => (
                    <span key={i} className={`api-tok api-tok--${span.type}`}>
                      {span.text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default ApiCodeBlock;
