import axios from "axios";

const API_BASE_URL = "https://skhucapstone.duckdns.org";

// 공통 요청 헤더
const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

// 동아리 생성
export const createClub = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/api/clubs`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 가입 신청
export const requestClubJoin = async (clubId, joinMessage) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/clubs/${clubId}/join`,
    {
      joinMessage,
    },
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// 동아리 가입 신청 취소
export const cancelClubJoin = async (clubId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/clubs/${clubId}/join/me`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};
