import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const response = await axios.get(`${BASE_URL}/api/clubs`, {
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
  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}`, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 생성
// POST /api/clubs
export const createClub = async (clubData) => {
  const response = await axios.post(`${BASE_URL}/api/clubs`, clubData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });

  return response.data.data;
};

// 동아리 대표 이미지 업로드
export const uploadClubImage = async (clubId, file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/api/clubs/${clubId}/image`,
    formData,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// 동아리 가입 신청
// POST /api/clubs/{clubId}/join
export const requestClubJoin = async (clubId, joinMessage) => {
  const response = await axios.post(
    `${BASE_URL}/api/clubs/${clubId}/join`,
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
    `${BASE_URL}/api/clubs/${clubId}/join/me`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// 내 동아리 목록
export const getMyClubs = async () => {
  const response = await axios.get(`${BASE_URL}/api/users/me/clubs`, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 멤버 목록
export const getClubMembers = async (clubId) => {
  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/members`, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 게시물 목록
export const getClubPosts = async ({ clubId, page = 0, size = 4 }) => {
  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/posts`, {
    params: {
      page,
      size,
    },
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 게시물 생성
export const createClubPost = async ({
  clubId,
  title,
  content,
  imageUrls = [],
}) => {
  const response = await axios.post(
    `${BASE_URL}/api/clubs/${clubId}/posts`,
    {
      title,
      content,
      imageUrls,
      postType: "NOTICE",
    },
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// 동아리 게시물 상세 조회
export const getClubPostDetail = async (postId) => {
  const response = await axios.get(`${BASE_URL}/api/posts/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 게시물 좋아요 토글
export const toggleClubPostLike = async (postId) => {
  const response = await axios.post(
    `${BASE_URL}/api/posts/${postId}/likes`,
    null,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// 게시물 삭제
export const deleteClubPost = async (postId) => {
  const response = await axios.delete(`${BASE_URL}/api/posts/${postId}`, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

// 게시물 이미지 업로드
export const uploadPostImage = async (postId, file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/api/posts/${postId}/image`,
    formData,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};
