/**
 * Converts decimal hours to a friendly Indonesian readable string (e.g. 1.5 -> "1 Jam 30 Menit", 0.25 -> "15 Menit")
 */
export function formatTimeSaved(hours: number | '' | undefined): string {
  if (hours === '' || hours === undefined || isNaN(Number(hours))) return '0 Jam';
  const val = Number(hours);
  if (val <= 0) return '0 Jam';

  const totalMinutes = Math.round(val * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  const parts: string[] = [];
  if (h > 0) {
    parts.push(`${h} Jam`);
  }
  if (m > 0) {
    parts.push(`${m} Menit`);
  }

  return parts.join(' ');
}
