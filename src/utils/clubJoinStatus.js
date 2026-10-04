export function getClubJoinState(status, isMember = false) {
  const joined = isMember || status === "JOINED";
  const pending = !joined && status === "PENDING";
  const canReapply = !joined && ["REJECTED", "WITHDRAWN"].includes(status);
  const unknown = status != null && !["PENDING", "JOINED", "REJECTED", "WITHDRAWN"].includes(status);
  return { joined, pending, canReapply, blocked: joined || pending || unknown };
}
