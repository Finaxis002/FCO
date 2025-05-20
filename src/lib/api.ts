// src/lib/api.ts
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { navigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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
  (error) => {
    if (error.response?.status === 401) {
      toast({
        title: "Session Expired",
        description: "Please login again",
        variant: "destructive",
      });
      navigate("/login");
    }
    return Promise.reject(error);
  }
);

export default api;