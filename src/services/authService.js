import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 인증코드 보내는 기능
export const sendSchoolEmailCode = async (schoolEmail) => {
  const response = await axios.post(
    `${BASE_URL}/api/auth/email/send`,
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

// 인증코드 확인 기능
export const verifySchoolEmailCode = async ({ schoolEmail, code}) => {
  const response = await axios.post(
    `${BASE_URL}/api/auth/email/verify`,
    {
      schoolEmail,
      code,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    }
  );
  return response.data.data;
}

export const resendSchoolEmailCode = async (schoolEmail) => {
  const response = await axios.post(
    `${BASE_URL}/api/auth/email/resend`,
    {
      schoolEmail,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    }
  )
  return response.data.data;
}