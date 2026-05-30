import React, { useRef, useEffect } from 'react';

const TicketReplyBar = ({ value, onChange, onSend, sending }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="ticket-reply-bar" role="region" aria-label="Reply to ticket">
      <div className="ticket-reply-bar__inner">
        <div className="ticket-reply-bar__row">
          <textarea
            ref={textareaRef}
            className="textarea ticket-reply-bar__input"
            rows={1}
            placeholder="Type your reply…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            aria-label="Reply message"
          />
          <button
            type="button"
            className="btn btn-primary ticket-reply-bar__send"
            onClick={onSend}
            disabled={sending || !value.trim()}
          >
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketReplyBar;
