import api from "./api"; // 프로젝트에서 쓰는 axios instance 경로에 맞게 수정

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
