import { CalculationState, DurationResult, FavoriteItem, HistoryItem } from '../types';

export interface ExportCurrentResultData {
  durationResult: DurationResult;
  state: CalculationState;
  startFormatted: string;
  endFormatted: string;
}

export interface ExportPngOptions {
  theme?: 'dark' | 'light';
  includeCurrentResult?: boolean;
  includeFavorites?: boolean;
  includeHistory?: boolean;
  timezone?: string;
  currentResultData?: ExportCurrentResultData;
}

// Clean helper with accurate quadrant curves
function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

export async function generateExportCanvas(
  favorites: FavoriteItem[],
  history: HistoryItem[],
  options: ExportPngOptions = {}
): Promise<HTMLCanvasElement> {
  const isDark = (options.theme ?? 'dark') === 'dark';
  const includeCurrent = options.includeCurrentResult !== false && !!options.currentResultData;
  const includeFavorites = options.includeFavorites !== false;
  const includeHistory = options.includeHistory !== false;

  const targetFavorites = includeFavorites ? favorites : [];
  const targetHistory = includeHistory ? history : [];
  const currentResultData = options.currentResultData;

  // Theme palettes
  const colors = isDark
    ? {
        bg: '#0D0F12',
        cardBg: '#14171B',
        cardBgAlt: '#1A1E24',
        cardHighlight: '#1E232B',
        border: '#272B33',
        borderSubtle: '#1F242C',
        textPrimary: '#F3F4F6',
        textSecondary: '#9CA3AF',
        textMuted: '#6B7280',
        accent: '#EDEDEE',
        accentBg: '#22272E',
        badgeBg: '#1F242C',
        badgeBorder: '#2E3540',
        badgeText: '#94A3B8',
        tagGreen: '#10B981',
        tagGreenBg: 'rgba(16, 185, 129, 0.12)',
        tagGreenBorder: 'rgba(16, 185, 129, 0.25)',
        tagBlue: '#38BDF8',
        tagBlueBg: 'rgba(56, 189, 248, 0.12)',
        tagBlueBorder: 'rgba(56, 189, 248, 0.25)',
      }
    : {
        bg: '#F9FAFB',
        cardBg: '#FFFFFF',
        cardBgAlt: '#F3F4F6',
        cardHighlight: '#F8FAFC',
        border: '#E5E7EB',
        borderSubtle: '#F3F4F6',
        textPrimary: '#111827',
        textSecondary: '#4B5563',
        textMuted: '#9CA3AF',
        accent: '#111827',
        accentBg: '#E5E7EB',
        badgeBg: '#F3F4F6',
        badgeBorder: '#E5E7EB',
        badgeText: '#4B5563',
        tagGreen: '#059669',
        tagGreenBg: 'rgba(5, 150, 105, 0.08)',
        tagGreenBorder: 'rgba(5, 150, 105, 0.2)',
        tagBlue: '#0284C7',
        tagBlueBg: 'rgba(2, 132, 199, 0.08)',
        tagBlueBorder: 'rgba(2, 132, 199, 0.2)',
      };

  const canvasWidth = 920;
  const paddingX = 40;
  const contentWidth = canvasWidth - paddingX * 2;

  // Calculate dynamic content height
  let estimatedHeight = 50; // top padding
  estimatedHeight += 80; // Header & logo
  estimatedHeight += 100; // Summary metrics cards
  estimatedHeight += 24; // Spacing

  // Height for the full current result: År, Månader, Dagar, Tid & Statistik
  if (includeCurrent && currentResultData) {
    estimatedHeight += 50; // Section title & interval bar
    estimatedHeight += 110; // 4 Main result cards (År, Månader, Dagar, Tid)
    estimatedHeight += 54; // Exact sentence bar
    estimatedHeight += 95; // Totals & statistics breakdown grid
    estimatedHeight += 36; // Spacing
  }

  if (includeFavorites) {
    estimatedHeight += 40; // Section title
    if (targetFavorites.length === 0) {
      estimatedHeight += 66; // Empty card
    } else {
      estimatedHeight += targetFavorites.length * 76; // Each favorite item
    }
    estimatedHeight += 30; // Spacing
  }

  if (includeHistory) {
    estimatedHeight += 40; // Section title
    if (targetHistory.length === 0) {
      estimatedHeight += 66; // Empty card
    } else {
      estimatedHeight += targetHistory.length * 82; // Each history item
    }
    estimatedHeight += 30; // Spacing
  }

  estimatedHeight += 80; // Footer
  estimatedHeight += 30; // Bottom padding

  // High-DPI Canvas (2x Retina)
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = estimatedHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, canvasWidth, estimatedHeight);

  let currentY = 44;

  // --- 1. Header: Logo & Title ---
  // Logo square
  ctx.fillStyle = isDark ? '#FFFFFF' : '#111827';
  fillRoundedRect(ctx, paddingX, currentY, 44, 44, 10);

  // Clock icon inside square
  ctx.strokeStyle = isDark ? '#111827' : '#FFFFFF';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(paddingX + 22, currentY + 22, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(paddingX + 22, currentY + 14);
  ctx.lineTo(paddingX + 22, currentY + 22);
  ctx.lineTo(paddingX + 28, currentY + 22);
  ctx.stroke();

  // App title & badge
  ctx.fillStyle = colors.textPrimary;
  ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Eklund Chronos', paddingX + 56, currentY + 26);

  const titleWidth = ctx.measureText('Eklund Chronos').width;

  // Badge "DATA EXPORT"
  ctx.fillStyle = colors.badgeBg;
  fillRoundedRect(ctx, paddingX + 56 + titleWidth + 10, currentY + 11, 140, 20, 5);
  ctx.strokeStyle = colors.badgeBorder;
  ctx.lineWidth = 1;
  strokeRoundedRect(ctx, paddingX + 56 + titleWidth + 10, currentY + 11, 140, 20, 5);

  ctx.fillStyle = colors.badgeText;
  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.fillText('BERÄKNINGSRESULTAT', paddingX + 56 + titleWidth + 18, currentY + 25);

  // Subtitle
  const nowStr = new Date().toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  ctx.fillStyle = colors.textSecondary;
  ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    `Exporterad från webbläsare • ${nowStr} • ${options.timezone || 'Lokal tid'}`,
    paddingX + 56,
    currentY + 44
  );

  currentY += 64;

  // Divider
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, currentY);
  ctx.lineTo(paddingX + contentWidth, currentY);
  ctx.stroke();

  currentY += 22;

  // --- 2. Summary stats cards ---
  const statCardW = (contentWidth - 20) / 2;
  const statCardH = 68;

  // Card 1: Favoriter
  ctx.fillStyle = colors.cardBg;
  fillRoundedRect(ctx, paddingX, currentY, statCardW, statCardH, 12);
  ctx.strokeStyle = colors.border;
  strokeRoundedRect(ctx, paddingX, currentY, statCardW, statCardH, 12);

  ctx.fillStyle = colors.textSecondary;
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('SPARADE FAVORITER', paddingX + 18, currentY + 24);

  ctx.fillStyle = colors.textPrimary;
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(`${favorites.length}`, paddingX + 18, currentY + 52);

  ctx.fillStyle = colors.textMuted;
  ctx.font = '400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('objekt sparade', paddingX + 58, currentY + 50);

  // Card 2: Historik
  ctx.fillStyle = colors.cardBg;
  fillRoundedRect(ctx, paddingX + statCardW + 20, currentY, statCardW, statCardH, 12);
  ctx.strokeStyle = colors.border;
  strokeRoundedRect(ctx, paddingX + statCardW + 20, currentY, statCardW, statCardH, 12);

  ctx.fillStyle = colors.textSecondary;
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('BERÄKNINGSHISTORIK', paddingX + statCardW + 38, currentY + 24);

  ctx.fillStyle = colors.textPrimary;
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(`${history.length}`, paddingX + statCardW + 38, currentY + 52);

  ctx.fillStyle = colors.textMuted;
  ctx.font = '400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('tidigare poster', paddingX + statCardW + 78, currentY + 50);

  currentY += statCardH + 28;

  // --- 3. HELA RESULTATET: ÅR, MÅNADER, DAGAR, TID & STATISTIK ---
  if (includeCurrent && currentResultData) {
    const { durationResult: res, state, startFormatted, endFormatted } = currentResultData;

    // Header bar for Current Result
    ctx.fillStyle = colors.textPrimary;
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Aktuellt beräkningsresultat', paddingX, currentY);

    // Direction/Status badge
    const isPast = res.direction === 'past';
    const isSame = res.direction === 'same';
    const statusBg = isSame ? colors.badgeBg : isPast ? colors.tagBlueBg : colors.tagGreenBg;
    const statusBorder = isSame ? colors.badgeBorder : isPast ? colors.tagBlueBorder : colors.tagGreenBorder;
    const statusColor = isSame ? colors.badgeText : isPast ? colors.tagBlue : colors.tagGreen;
    const statusText = res.statusLabel ? res.statusLabel.toUpperCase() : 'BERÄKNING';

    ctx.font = '600 10px "JetBrains Mono", monospace';
    const badgeTextW = ctx.measureText(statusText).width;
    const badgeW = badgeTextW + 16;
    const badgeX = paddingX + contentWidth - badgeW;

    ctx.fillStyle = statusBg;
    fillRoundedRect(ctx, badgeX, currentY - 14, badgeW, 20, 5);
    ctx.strokeStyle = statusBorder;
    strokeRoundedRect(ctx, badgeX, currentY - 14, badgeW, 20, 5);

    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, badgeX + 8, currentY);

    // Interval text under title
    ctx.fillStyle = colors.textSecondary;
    ctx.font = '400 11px "JetBrains Mono", monospace';
    const intervalStr = `${startFormatted}   →   ${endFormatted}   •   ${state.timezone}`;
    ctx.fillText(truncateText(ctx, intervalStr, contentWidth - badgeW - 20), paddingX, currentY + 18);

    currentY += 34;

    // --- The 4 Result Cards: År, Månader, Dagar, Tid ---
    const gap = 12;
    const cardW = (contentWidth - gap * 3) / 4;
    const cardH = 92;

    const cardsData = [
      {
        value: String(res.breakdown.years),
        label: 'ÅR',
        sublabel: res.breakdown.years === 1 ? 'år' : 'år',
      },
      {
        value: String(res.breakdown.months),
        label: 'MÅNADER',
        sublabel: res.breakdown.months === 1 ? 'månad' : 'månader',
      },
      {
        value: String(res.breakdown.days),
        label: 'DAGAR',
        sublabel: res.breakdown.days === 1 ? 'dag' : 'dagar',
      },
      {
        value: res.timeFormatted || '00:00:00',
        label: 'TID',
        sublabel: 'tim : min : sek',
        isMonospace: true,
      },
    ];

    cardsData.forEach((item, index) => {
      const cardX = paddingX + index * (cardW + gap);

      // Card container
      ctx.fillStyle = colors.cardBg;
      fillRoundedRect(ctx, cardX, currentY, cardW, cardH, 12);
      ctx.strokeStyle = colors.border;
      strokeRoundedRect(ctx, cardX, currentY, cardW, cardH, 12);

      // Label (top)
      ctx.fillStyle = colors.textMuted;
      ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.label, cardX + 16, currentY + 22);

      // Value (large number)
      ctx.fillStyle = colors.textPrimary;
      if (item.isMonospace) {
        ctx.font = '600 20px "JetBrains Mono", monospace';
        ctx.fillText(item.value, cardX + 16, currentY + 54);
      } else {
        ctx.font = '700 32px "JetBrains Mono", monospace';
        ctx.fillText(item.value, cardX + 16, currentY + 56);
      }

      // Sublabel (bottom)
      ctx.fillStyle = colors.textSecondary;
      ctx.font = '400 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.sublabel, cardX + 16, currentY + 76);
    });

    currentY += cardH + 12;

    // Sentence Card
    const sentenceH = 42;
    ctx.fillStyle = colors.cardHighlight;
    fillRoundedRect(ctx, paddingX, currentY, contentWidth, sentenceH, 10);
    ctx.strokeStyle = colors.border;
    strokeRoundedRect(ctx, paddingX, currentY, contentWidth, sentenceH, 10);

    ctx.fillStyle = colors.textPrimary;
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const displaySentence = truncateText(ctx, res.exactSentence, contentWidth - 40);
    ctx.fillText(displaySentence, paddingX + 16, currentY + 26);

    currentY += sentenceH + 12;

    // --- Totals & Statistics Breakdown Grid ---
    const totalBoxW = (contentWidth - gap * 3) / 4;
    const totalBoxH = 68;

    const totalsData = [
      {
        label: 'TOTALA DAGAR',
        val: `${res.totals.totalDays.toLocaleString('sv-SE', { maximumFractionDigits: 1 })}`,
        unit: 'dagar',
      },
      {
        label: 'TOTALA TIMMAR',
        val: `${res.totals.totalHours.toLocaleString('sv-SE', { maximumFractionDigits: 1 })}`,
        unit: 'timmar',
      },
      {
        label: 'TOTALA MINUTER',
        val: `${res.totals.totalMinutes.toLocaleString('sv-SE')}`,
        unit: 'minuter',
      },
      {
        label: 'TOTALA SEKUNDER',
        val: `${res.totals.totalSeconds.toLocaleString('sv-SE')}`,
        unit: 'sekunder',
      },
    ];

    totalsData.forEach((item, idx) => {
      const boxX = paddingX + idx * (totalBoxW + gap);
      ctx.fillStyle = colors.cardBg;
      fillRoundedRect(ctx, boxX, currentY, totalBoxW, totalBoxH, 10);
      ctx.strokeStyle = colors.border;
      strokeRoundedRect(ctx, boxX, currentY, totalBoxW, totalBoxH, 10);

      ctx.fillStyle = colors.textMuted;
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText(item.label, boxX + 12, currentY + 20);

      ctx.fillStyle = colors.textPrimary;
      ctx.font = '600 15px "JetBrains Mono", monospace';
      const valStr = truncateText(ctx, item.val, totalBoxW - 24);
      ctx.fillText(valStr, boxX + 12, currentY + 44);

      ctx.fillStyle = colors.textSecondary;
      ctx.font = '400 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.unit, boxX + 12, currentY + 58);
    });

    currentY += totalBoxH + 28;
  }

  // --- 4. Favoriter Section ---
  if (includeFavorites) {
    ctx.fillStyle = colors.textPrimary;
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Favoriter', paddingX, currentY);

    ctx.fillStyle = colors.textMuted;
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillText(`(${targetFavorites.length})`, paddingX + ctx.measureText('Favoriter ').width + 4, currentY);

    currentY += 16;

    if (targetFavorites.length === 0) {
      ctx.fillStyle = colors.cardBg;
      fillRoundedRect(ctx, paddingX, currentY, contentWidth, 54, 10);
      ctx.strokeStyle = colors.border;
      strokeRoundedRect(ctx, paddingX, currentY, contentWidth, 54, 10);

      ctx.fillStyle = colors.textMuted;
      ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Inga favoriter sparade.', paddingX + 20, currentY + 32);
      currentY += 66;
    } else {
      for (const fav of targetFavorites) {
        const itemH = 64;
        ctx.fillStyle = colors.cardBg;
        fillRoundedRect(ctx, paddingX, currentY, contentWidth, itemH, 10);
        ctx.strokeStyle = colors.border;
        strokeRoundedRect(ctx, paddingX, currentY, contentWidth, itemH, 10);

        // Title
        ctx.fillStyle = colors.textPrimary;
        ctx.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const displayTitle = truncateText(ctx, fav.title, contentWidth - 140);
        ctx.fillText(displayTitle, paddingX + 18, currentY + 26);

        // Interval
        ctx.fillStyle = colors.textSecondary;
        ctx.font = '400 11px "JetBrains Mono", monospace';
        const startStr = fav.startIsNow ? 'Nu' : `${fav.startDate} ${fav.startTime || ''}`.trim();
        const endStr = fav.endIsNow ? 'Nu' : `${fav.endDate} ${fav.endTime || ''}`.trim();
        ctx.fillText(`${startStr}   →   ${endStr}`, paddingX + 18, currentY + 48);

        // Timezone pill
        ctx.fillStyle = colors.badgeBg;
        fillRoundedRect(ctx, paddingX + contentWidth - 110, currentY + 20, 94, 24, 6);
        ctx.strokeStyle = colors.badgeBorder;
        strokeRoundedRect(ctx, paddingX + contentWidth - 110, currentY + 20, 94, 24, 6);

        ctx.fillStyle = colors.badgeText;
        ctx.font = '500 10px "JetBrains Mono", monospace';
        const tzName = truncateText(ctx, fav.timezone, 80);
        ctx.fillText(tzName, paddingX + contentWidth - 100, currentY + 36);

        currentY += itemH + 12;
      }
    }

    currentY += 20;
  }

  // --- 5. Historik Section ---
  if (includeHistory) {
    ctx.fillStyle = colors.textPrimary;
    ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Beräkningshistorik', paddingX, currentY);

    ctx.fillStyle = colors.textMuted;
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.fillText(`(${targetHistory.length})`, paddingX + ctx.measureText('Beräkningshistorik ').width + 4, currentY);

    currentY += 16;

    if (targetHistory.length === 0) {
      ctx.fillStyle = colors.cardBg;
      fillRoundedRect(ctx, paddingX, currentY, contentWidth, 54, 10);
      ctx.strokeStyle = colors.border;
      strokeRoundedRect(ctx, paddingX, currentY, contentWidth, 54, 10);

      ctx.fillStyle = colors.textMuted;
      ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Ingen historik sparad.', paddingX + 20, currentY + 32);
      currentY += 66;
    } else {
      for (const item of targetHistory) {
        const itemH = 70;
        ctx.fillStyle = colors.cardBg;
        fillRoundedRect(ctx, paddingX, currentY, contentWidth, itemH, 10);
        ctx.strokeStyle = colors.border;
        strokeRoundedRect(ctx, paddingX, currentY, contentWidth, itemH, 10);

        // Result summary (bold display)
        ctx.fillStyle = colors.textPrimary;
        ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const displaySummary = truncateText(ctx, item.summary, contentWidth - 160);
        ctx.fillText(displaySummary, paddingX + 18, currentY + 26);

        // Date interval
        ctx.fillStyle = colors.textSecondary;
        ctx.font = '400 11px "JetBrains Mono", monospace';
        const startStr = item.startIsNow ? 'Nu' : `${item.startDate} ${item.startTime || ''}`.trim();
        const endStr = item.endIsNow ? 'Nu' : `${item.endDate} ${item.endTime || ''}`.trim();
        ctx.fillText(`${startStr}  →  ${endStr}`, paddingX + 18, currentY + 48);

        // Right side: created date and time
        const createdDate = new Date(item.createdAt);
        const createdStr = createdDate.toLocaleDateString('sv-SE', {
          month: 'short',
          day: 'numeric',
        });
        const createdTimeStr = createdDate.toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
        });

        ctx.fillStyle = colors.textMuted;
        ctx.font = '400 10px "JetBrains Mono", monospace';
        ctx.fillText(`${createdStr} ${createdTimeStr}`, paddingX + contentWidth - 110, currentY + 30);
        ctx.fillText(truncateText(ctx, item.timezone, 90), paddingX + contentWidth - 110, currentY + 48);

        currentY += itemH + 12;
      }
    }

    currentY += 20;
  }

  // --- 6. Footer ---
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, currentY);
  ctx.lineTo(paddingX + contentWidth, currentY);
  ctx.stroke();

  currentY += 24;

  ctx.fillStyle = colors.tagGreen;
  ctx.beginPath();
  ctx.arc(paddingX + 6, currentY + 6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.textSecondary;
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Alla tidsberäkningar sker lokalt • Inga datum lämnar din webbläsare', paddingX + 18, currentY + 10);

  ctx.fillStyle = colors.textMuted;
  ctx.font = '400 11px "JetBrains Mono", monospace';
  ctx.fillText('eklund-chronos • png-export', paddingX + contentWidth - 195, currentY + 10);

  return canvas;
}

export async function downloadDataAsPng(
  favorites: FavoriteItem[],
  history: HistoryItem[],
  options: ExportPngOptions = {}
): Promise<void> {
  const canvas = await generateExportCanvas(favorites, history, options);

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Kunde inte generera bildblob'));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      const suffix =
        options.includeCurrentResult && !options.includeHistory && !options.includeFavorites
          ? 'berakningsresultat'
          : options.includeFavorites && !options.includeHistory
          ? 'favoriter'
          : !options.includeFavorites && options.includeHistory
          ? 'historik'
          : 'export';

      link.download = `eklund-chronos-${suffix}-${dateStr}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
