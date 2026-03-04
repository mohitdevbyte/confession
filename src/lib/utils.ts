export function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const ACCENTS = [
  "border-zinc-800 hover:border-zinc-700",
  "border-indigo-900/50 hover:border-indigo-800/80",
  "border-rose-900/50 hover:border-rose-800/80",
  "border-emerald-900/50 hover:border-emerald-800/80",
  "border-amber-900/50 hover:border-amber-800/80",
];

export interface Confession {
  id: number;
  content: string;
  color: string;
  likes: number;
  skull: number;
  fire: number;
  comment_count: number;
  created_at: string;
}

export interface Comment {
  id: number;
  confession_id: number;
  content: string;
  created_at: string;
}

export function getDeviceId(): string {
  let deviceId = localStorage.getItem("campus_whisper_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("campus_whisper_device_id", deviceId);
  }
  return deviceId;
}
