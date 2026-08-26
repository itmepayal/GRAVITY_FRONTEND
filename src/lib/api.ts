import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const currentRefreshToken = useAuthStore.getState().refreshToken;

      if (!currentRefreshToken) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken },
          { withCredentials: true },
        );
        const { accessToken, refreshToken } = data.data;
        useAuthStore.getState().updateTokens(accessToken, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.log(err);
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);
