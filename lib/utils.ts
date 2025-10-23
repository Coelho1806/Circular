import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes === 0) return "Just now";
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  }

  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export const PRIORITY_OPTIONS = [
  { value: "none", label: "No priority", icon: "⚪" },
  { value: "urgent", label: "Urgent", icon: "🔴" },
  { value: "high", label: "High", icon: "🟠" },
  { value: "medium", label: "Medium", icon: "🟡" },
  { value: "low", label: "Low", icon: "🔵" },
] as const;

export function getPriorityIcon(priority: string) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.icon || "⚪";
}

export function getPriorityLabel(priority: string) {
  return PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || "No priority";
}
