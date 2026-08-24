import axios from "axios";

const API_BASE_URL = "https://skhucapstone.duckdns.org";

// 로그인 토큰 헤더
const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

// 동아리 목록 및 검색
// GET /api/clubs
export const getClubs = async ({
  keyword = "",
  category = "",
  page = 0,
  size = 100,
} = {}) => {
  const response = await axios.get(`${API_BASE_URL}/api/clubs`, {
    params: {
      keyword: keyword || undefined,
      category: category || undefined,
      page,
      size,
    },
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 상세 조회
// GET /api/clubs/{clubId}
export const getClubDetail = async (clubId) => {
  const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}`, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 생성
// POST /api/clubs
export const createClub = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/api/clubs`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 가입 신청
// POST /api/clubs/{clubId}/join
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
// DELETE /api/clubs/{clubId}/join/me
export const cancelClubJoin = async (clubId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/api/clubs/${clubId}/join/me`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};
