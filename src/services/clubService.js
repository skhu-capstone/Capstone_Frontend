import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getMyClubs = async () => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(
    `${BASE_URL}/api/users/me/clubs`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    }
  );
  return response.data.data;
}

export const getClubMembers = async (clubId) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(
    `${BASE_URL}/api/clubs/${clubId}/members`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    }
  );
  return response.data.data;
}

export const getClubPosts = async ({ clubId, page = 0, size = 4 }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await axios.get(`${BASE_URL}/api/clubs/${clubId}/posts`,
    {
      params: {
        page,
        size,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return response.data.data;
};