import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 마이페이지 조회
export const getMyPage = async () => {
  const response = await axios.get(
    `${BASE_URL}/api/mypage`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  return response.data.data;
};

// 커피챗 프로필 수정
export const updateCoffeeChatProfile = async (profileData) => {
  const response = await axios.put(
    `${BASE_URL}/api/mypage/coffeechat-profile`,
    profileData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );
  return response.data.data;
};

// 공개 여부 수정
export const updateCoffeeChatVisibility = async (isPublic) => {
  const response = await axios.patch(
    `${BASE_URL}/api/mypage/coffeechat-profile/visibility`,
    {
      isPublic,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  return response.data.data;
};