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
  Cookies.remove("token", { path: "/" });
  Cookies.remove("role_name", { path: "/" });
  Cookies.remove("user_onboarding", { path: "/" });
  Cookies.remove("instructor_onboarding", { path: "/" });
  Cookies.remove("profileStatus", { path: "/" });
};

Api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const currentLocale = Cookies.get("NEXT_LOCALE") || "en";
    config.headers["Accept-Language"] = currentLocale;
    return config;
  },
  (error) => Promise.reject(error)
);

Api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const headers = error.config?.headers;
      const authHeader = headers?.Authorization || headers?.authorization;
      const sentToken =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ");
      const path = window.location.pathname;
      const onPublicPage =
        path === "/" ||
        path.startsWith("/browse") ||
        path.startsWith("/homepage") ||
        path.startsWith("/certificate");

      if (sentToken && !onPublicPage) {
        clearAuthCookies();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
