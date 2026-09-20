import axios from "axios";
import { API_URL } from "@/lib/config";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      );

      // бэкенд отдаёт новый access-токен в поле `token`
      const accessToken = data.token;

      localStorage.setItem("token", accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("token");

      return Promise.reject(refreshError);
    }
  },
);
