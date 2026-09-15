import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("로그인이 필요합니다.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

// 동아리 가입 신청자 목록 조회
export const getClubJoinRequests = async (clubId) => {
  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/join`, {
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 가입 신청 승인
export const approveClubJoinRequest = async ({ clubId, applicantUserId }) => {
  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/join/${applicantUserId}/approve`,
    null,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
};

// 동아리 정보 수정
export const updateClubInfo = async ({ clubId, clubInfo }) => {
  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}`,
    clubInfo,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// 동아리 대표 권한 이전
export const transferClubPresident = async ({ clubId, newPresidentUserId }) => {
  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/president`,
    {
      newPresidentUserId,
    },
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// 동아리 멤버 역할 변경
export const updateClubMemberRole = async ({ clubId, targetUserId, role }) => {
  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/members/${targetUserId}/role`,
    {
      role,
    },
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// 동아리 가입 신청 거절
export const rejectClubJoinRequest = async ({ clubId, applicantUserId }) => {
  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/join/${applicantUserId}/reject`,
    null,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
};

// 동아리 멤버 내보내기
export const removeClubMember = async ({ clubId, targetUserId }) => {
  const response = await axios.delete(
    `${BASE_URL}/api/clubs/${clubId}/members/${targetUserId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
};
