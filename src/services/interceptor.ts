import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const BaseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!BaseUrl) {
  throw new Error(
    "❌ CRITICAL CONFIGURATION ERROR: NEXT_PUBLIC_BACKEND_API_URL is not defined in the frontend environment! Please specify it in .env.local."
  );
}

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error(
    "❌ CRITICAL CONFIGURATION ERROR: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined in the frontend environment! Please specify it in .env.local."
  );
}

const Api = axios.create({
  timeout: 1000000,
  baseURL: BaseUrl,
});

Api.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";

const clearAuthCookies = () => {
  Cookies.remove("token");
  Cookies.remove("role_name");
  Cookies.remove("user_onboarding");
  Cookies.remove("instructor_onboarding");
  Cookies.remove("profileStatus");
};

Api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthCookies();
      if (typeof window !== "undefined") {
        window.location.href = "/homepage";
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
