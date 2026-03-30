import axios from "axios";

let authTokenGetter = null;

export function setAuthTokenGetter(getter) {
  authTokenGetter = typeof getter === "function" ? getter : null;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(async (config) => {
  try {
    const token = await authTokenGetter?.();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error attaching Clerk token:", error);
  }

  return config;
});

export default axiosInstance;
