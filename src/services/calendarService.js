import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

// 동아리 월별 일정 조회
export const getClubMonthlyEvents = async ({ clubId, year, month }) => {
  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/events`, {
    params: {
      year,
      month,
    },
    headers: getAuthHeaders(),
  });

  return response.data.data;
};

// 동아리 일정 생성
export const createClubEvent = async ({ clubId, event }) => {
  const response = await axios.post(
    `${BASE_URL}/api/clubs/${clubId}/events`,
    event,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};

// 동아리 일정 상세 조회
export const getClubEventDetail = async ({ clubId, eventId }) => {
  const response = await axios.get(
    `${BASE_URL}/api/clubs/${clubId}/events/${eventId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
};

// 동아리 일정 삭제
export const deleteClubEvent = async ({ clubId, eventId }) => {
  const response = await axios.delete(
    `${BASE_URL}/api/clubs/${clubId}/events/${eventId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data.data;
};

// 동아리 일정 수정
export const updateClubEvent = async ({ clubId, eventId, event }) => {
  const response = await axios.patch(
    `${BASE_URL}/api/clubs/${clubId}/events/${eventId}`,
    event,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
};
