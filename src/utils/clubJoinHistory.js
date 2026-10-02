const PREFIX = "clubJoinHistory:";
export const CLUB_JOIN_CHANGED = "club-join-changed";

export function getJoinHistoryUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.userId ?? user?.id;
  } catch {
    return null;
  }
}

export function readJoinHistory(userId) {
  if (userId == null) return "[]";
  return localStorage.getItem(`${PREFIX}${userId}`) ?? "[]";
}

export function parseJoinHistory(value) {
  try {
    const ids = JSON.parse(value);
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

export function hasPendingClubJoin(userId, clubId) {
  return parseJoinHistory(readJoinHistory(userId)).includes(String(clubId));
}

export function recordClubJoin(userId, clubId, pending) {
  if (userId == null) return;
  const ids = new Set(parseJoinHistory(readJoinHistory(userId)));
  if (pending) ids.add(String(clubId));
  else ids.delete(String(clubId));
  localStorage.setItem(`${PREFIX}${userId}`, JSON.stringify([...ids]));
  window.dispatchEvent(new Event(CLUB_JOIN_CHANGED));
}
