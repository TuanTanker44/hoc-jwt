import axiosInstance from "./axiosInstance";

export const getMyProfile = () => axiosInstance.get("/v1/user/me");

export const updateProfile = (data) => axiosInstance.put("/v1/user/me", data);
