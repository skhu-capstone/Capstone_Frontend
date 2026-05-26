import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 인증코드 보내는 기능
export const sendSchoolEmailCode = async (schoolEmail) => {
  const response = await axios.post(
    `${Base_URL}/api/auth/email/send`,
    {
      schoolEmail,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    },
  );
  return response.data.data;
}