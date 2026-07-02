// Render a relative "time ago" string in Arabic (best-effort, no external dep).
// Used by the admin dashboard activity feed and the admin bookings page.

export function timeAgo(dateStr: string | Date): string {
  const then = new Date(dateStr).getTime();
  if (!then) return "";
  const diffMs = Date.now() - then;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "قبل لحظات";
  const min = Math.floor(sec / 60);
  if (min < 60) return `قبل ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `قبل ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `قبل ${day} يوم`;
  const month = Math.floor(day / 30);
  if (month < 12) return `قبل ${month} شهر`;
  return `قبل ${Math.floor(month / 12)} سنة`;
}
