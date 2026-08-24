import api from "./api";

// 동아리 생성
export const createClub = async (payload) => {
  const response = await api.post("/api/clubs", payload);

  return response.data.data;
};

// 동아리 가입 신청
export const requestClubJoin = async (clubId, joinMessage) => {
  const response = await api.post(`/api/clubs/${clubId}/join`, {
    joinMessage,
  });

  return response.data.data;
};

// 동아리 가입 신청 취소
export const cancelClubJoin = async (clubId) => {
  const response = await api.delete(`/api/clubs/${clubId}/join/me`);

  return response.data.data;
};
