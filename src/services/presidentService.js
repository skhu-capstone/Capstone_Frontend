import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 동아리 가입 신청자 목록 조회
export const getClubJoinRequests = async (clubId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/join`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.data;
};

// 동아리 가입 신청 승인
export const approveClubJoinRequest = async ({ clubId, applicantUserId }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/join/${applicantUserId}/approve`,
    null,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.data;
};

// 동아리 정보 수정
export const updateClubInfo = async ({ clubId, clubInfo }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}`,
    clubInfo,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// 동아리 대표 권한 이전
export const transferClubPresident = async ({ clubId, newPresidentUserId }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/president`,
    {
      newPresidentUserId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// 동아리 멤버 역할 변경
export const updateClubMemberRole = async ({ clubId, targetUserId, role }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/members/${targetUserId}/role`,
    {
      role,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// 동아리 가입 신청 거절
export const rejectClubJoinRequest = async ({ clubId, applicantUserId }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/join/${applicantUserId}/reject`,
    null,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.data;
};

// 동아리 멤버 내보내기
export const removeClubMember = async ({ clubId, targetUserId }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.delete(
    `${BASE_URL}/api/clubs/${clubId}/members/${targetUserId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data.data;
};
