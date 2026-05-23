export async function fetchHeyGenToken(): Promise<string> {
  const res = await fetch("/api/heygen/token", { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch HeyGen token");
  const { token } = await res.json();
  if (!token) throw new Error("No token returned from HeyGen");
  return token;
}

export const DEFAULT_AVATAR_ID =
  process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID ?? "Wayne_20240711";

export const DEFAULT_VOICE_ID =
  process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID ?? "";
