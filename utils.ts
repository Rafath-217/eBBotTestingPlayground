// ─── Currency helpers ────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', KRW: '₩', INR: '₹',
  AUD: 'A$', CAD: 'C$', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr',
  NZD: 'NZ$', SGD: 'S$', HKD: 'HK$', MXN: 'MX$', BRL: 'R$', ZAR: 'R',
  TRY: '₺', PLN: 'zł', THB: '฿', IDR: 'Rp', MYR: 'RM', PHP: '₱',
  AED: 'د.إ', SAR: '﷼', ILS: '₪', TWD: 'NT$', CZK: 'Kč', HUF: 'Ft',
  CLP: 'CL$', COP: 'COL$', ARS: 'AR$', VND: '₫', EGP: 'E£', NGN: '₦',
  KES: 'KSh', PKR: '₨', BDT: '৳', UAH: '₴', RON: 'lei', BGN: 'лв',
  HRK: 'kn', ISK: 'kr', RUB: '₽', PEN: 'S/.', QAR: 'QR', KWD: 'KD',
  BHD: 'BD', OMR: 'OMR', JOD: 'JD', LKR: 'Rs',
}

/** Get the symbol for a currency code (defaults to $ if unknown) */
export function currencySymbol(code?: string | null): string {
  if (!code) return '$'
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code
}

/** Human-readable relative time (e.g. "3 hours ago") */
export function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
