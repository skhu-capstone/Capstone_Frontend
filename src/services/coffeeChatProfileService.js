import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getCoffeeChatProfile = async (userId) => {
  const response = await axios.get(
    `${BASE_URL}/api/coffeechat/profiles/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      }
    }
  );
  return response.data.data;
}

export const getCoffeeChatUserList = async ({keyword, page, size}) => {
  const response = await axios.get(
    `${BASE_URL}/api/coffeechat/profiles`,
    {
      params: {
        keyword,
        page,
        size,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      }
    },
  )
  return response.data.data;
}