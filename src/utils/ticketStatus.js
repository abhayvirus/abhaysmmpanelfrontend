export const ticketStatusClass = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'closed') return 'ticket-badge--closed';
  if (s === 'answered') return 'ticket-badge--answered';
  if (s === 'waiting') return 'ticket-badge--waiting';
  return 'ticket-badge--open';
};

export const formatTicketTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};
