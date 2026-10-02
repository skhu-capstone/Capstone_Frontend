const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "";

export async function mutateRecruitment(type, id, method, payload) {
  const resources = { club: "club-collaborations", project: "project-recruitments" };
  if (!resources[type] || !["PATCH", "DELETE"].includes(method)) {
    throw new Error("잘못된 모집글 요청입니다.");
  }
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("다시 로그인해주세요.");
  const response = await fetch(`${API_BASE_URL}/api/${resources[type]}/${id}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === "PATCH" ? { "Content-Type": "application/json" } : {}),
    },
    ...(method === "PATCH" ? { body: JSON.stringify(payload) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (response.status === 401) throw new Error("로그인이 만료되었습니다. 다시 로그인해주세요.");
  if (response.status === 403) throw new Error("모집글 작성자만 수정하거나 삭제할 수 있습니다.");
  if (!response.ok || result?.success !== true) {
    throw new Error(result?.message || "요청에 실패했습니다. 다시 시도해주세요.");
  }
  return result.data;
}
