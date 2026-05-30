export function parseTimeToMinutes(time) {
  if (!time || !time.includes(":")) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  return hours * 60 + minutes;
}

export function formatMinutesAsTime(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "--:--";
  const dayMinutes = 24 * 60;
  const normalized = ((Math.round(totalMinutes) % dayMinutes) + dayMinutes) % dayMinutes;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "0h 0m";
  const abs = Math.max(0, Math.round(minutes));
  const hours = Math.floor(abs / 60);
  const remaining = abs % 60;
  return `${hours}h ${remaining}m`;
}
