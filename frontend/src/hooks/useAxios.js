import { useEffect, useContext } from "react";
import axiosInstance from "../api/axiosSetup";
import { AuthContext } from "../context/AuthContext";

const useAxiosAuth = () => {
  const { accessToken, setAccessToken } = useContext(AuthContext);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          error.response?.data?.message === "Access token expired" &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            // Gọi API refresh token
            const res = await axiosInstance.post(
              "/v1/auth/refresh",
              {},
              { withCredentials: true },
            );
            const newToken = res.data.accessToken;

            // Lưu vào context
            setAccessToken(newToken);

            // Gắn token mới vào request và gọi lại
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, setAccessToken]);

  return axiosInstance;
};

export default useAxiosAuth;
