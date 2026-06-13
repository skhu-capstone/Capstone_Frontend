import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getMain = async () => {
  const response = await axios.get(`${BASE_URL}/api/main`);
  return response.data.data;
};