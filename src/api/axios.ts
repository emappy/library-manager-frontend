import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  // baseURL: "http://localhost:3000",
  // baseURL: "https://back-end-for-assessment.vercel.app/",

  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
