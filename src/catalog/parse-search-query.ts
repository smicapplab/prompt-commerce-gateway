export interface ParsedQuery {
  keywords:     string;
  maxPrice?:    number;
  minPrice?:    number;
  inStockOnly?: boolean;
}

/**
 * Natural-language query parser.
 * Extracts price constraints and stock intent from free-form text.
 * Examples:
 *   "laptop less than 50k"   → { keywords: "laptop", maxPrice: 50000 }
 *   "shoes between 500-2000" → { keywords: "shoes", minPrice: 500, maxPrice: 2000 }
 *   "in stock headphones"    → { keywords: "headphones", inStockOnly: true }
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  let text = raw.trim();
  let maxPrice: number | undefined;
  let minPrice: number | undefined;
  let inStockOnly = false;

  // Parse "50k" / "1.5k" shorthand → numeric value
  const toNum = (s: string): number => {
    const n = parseFloat(s.replace(/,/g, ''));
    return /k$/i.test(s) ? n * 1000 : n;
  };

  // ── Price range: "between X and Y" / "X to Y" / "X-Y" ──────────────────
  const rangeRe = /\b(?:between\s+)?([\d,.]+k?)\s*(?:to|-|and)\s*([\d,.]+k?)\b/i;
  const rangeM  = text.match(rangeRe);
  if (rangeM) {
    const a = toNum(rangeM[1]);
    const b = toNum(rangeM[2]);
    // IMP-8: Require both values to be finite and positive — prevents product codes
    // like "USB3.0 to USB-A" or "2-in-1" from corrupting the keywords field.
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0) {
      minPrice = Math.min(a, b);
      maxPrice = Math.max(a, b);
      text = text.replace(rangeM[0], '').trim();
    }
  }

  if (!maxPrice) {
    // ── Max price: "less than", "under", "below", "cheaper than", "max", "up to", "within", "≤" ──
    const maxRe = /\b(?:less\s+than|under|below|cheaper\s+than|max(?:imum)?|at\s+most|up\s+to|within|not\s+more\s+than)\s+([\d,.]+k?)\b|[≤<]=?\s*([\d,.]+k?)/i;
    const maxM  = text.match(maxRe);
    if (maxM) {
      maxPrice = toNum(maxM[1] ?? maxM[2]);
      text = text.replace(maxM[0], '').trim();
    }
  }

  if (!minPrice) {
    // ── Min price: "more than", "above", "over", "min", "at least", "≥" ──
    const minRe = /\b(?:more\s+than|above|over|min(?:imum)?|at\s+least|starting\s+(?:from|at))\s+([\d,.]+k?)\b|[≥>]=?\s*([\d,.]+k?)/i;
    const minM  = text.match(minRe);
    if (minM) {
      minPrice = toNum(minM[1] ?? minM[2]);
      text = text.replace(minM[0], '').trim();
    }
  }

  // ── In-stock filter ──────────────────────────────────────────────────────
  if (/\bin[\s-]?stock\b|\bavailable\b/i.test(text)) {
    inStockOnly = true;
    text = text.replace(/\bin[\s-]?stock\b|\bavailable\b/gi, '').trim();
  }

  // ── Strip intent words that add no search value ──────────────────────────
  text = text
    .replace(/\b(find\s+me|show\s+me|i\s+want|i('m)?\s+(looking\s+for|need)|get\s+me|search\s+for|looking\s+for|give\s+me)\b/gi, '')
    .replace(/\b(a|an|the|some|any|please|cheap|cheapest|affordable)\b/gi, '')
    .replace(/\b(for|with|color|colour|size|and)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { keywords: text, maxPrice, minPrice, inStockOnly };
}
