import React from 'react';
import { API_BASE } from '../api';

const TicketMessageBubble = ({ message }) => {
  const isAdmin = Boolean(message.is_admin);
  const attachUrl = message.attachment_path
    ? `${API_BASE}${message.attachment_path}`
    : null;
  const isImage = message.attachment_mime?.startsWith('image/');

  return (
    <div className={`ticket-bubble ticket-bubble--${isAdmin ? 'admin' : 'user'}`}>
      <div className="ticket-bubble__meta">
        {message.sender_name}
        {isAdmin ? ' · Admin' : ' · You'}
        {' · '}
        {new Date(message.created_at).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      {message.message && (
        <p className="ticket-bubble__text">{message.message}</p>
      )}
      {attachUrl && (
        <div className="ticket-attachment">
          {isImage ? (
            <a href={attachUrl} target="_blank" rel="noreferrer">
              <img
                src={attachUrl}
                alt={message.attachment_name || 'Attachment'}
                className="ticket-attachment__img"
                loading="lazy"
              />
            </a>
          ) : (
            <a href={attachUrl} download={message.attachment_name} className="ticket-attachment__link">
              📎 {message.attachment_name || 'Download attachment'}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketMessageBubble;
