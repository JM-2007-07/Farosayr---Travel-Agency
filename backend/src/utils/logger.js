function timestamp() {
  return new Date().toISOString();
}

// Defence in depth: whatever ends up in a log line (an error message from
// a library, a stack trace), credentials embedded in it are masked —
// passwords inside URLs ("scheme://user:password@host") and Telegram bot
// tokens ("bot<digits>:<secret>" in Bot API URLs, or a bare token).
const REDACTIONS = [
  [/(\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]+:)[^\s@/]+@/gi, '$1***@'],
  [/\bbot\d{5,}:[A-Za-z0-9_-]{20,}/g, 'bot***'],
  [/\b\d{8,10}:[A-Za-z0-9_-]{30,}\b/g, '***'],
];

function redact(value) {
  let text = value instanceof Error ? value.stack || `${value.name}: ${value.message}` : value;
  if (typeof text !== 'string') return value;
  for (const [pattern, replacement] of REDACTIONS) text = text.replace(pattern, replacement);
  return text;
}

export const logger = {
  info: (...args) => console.log(`[${timestamp()}] INFO`, ...args.map(redact)),
  warn: (...args) => console.warn(`[${timestamp()}] WARN`, ...args.map(redact)),
  error: (...args) => console.error(`[${timestamp()}] ERROR`, ...args.map(redact)),
};
