import { clearCredentials } from "@/redux/slices/authSlice";
import type { AppDispatch, RootState } from "@/redux/store";
import axios, { HttpStatusCode } from "axios";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

// Types for the hook parameters
interface UseApiInstanceProps {
  headers?: Record<string, string>;
  responseType?: "json" | "text" | "blob" | "arraybuffer" | "document" | "stream";
  withCredentials?: boolean;
}

const useApiInstance = ({
  headers,
  responseType = "json",
  withCredentials = true,
}: UseApiInstanceProps = {}) => {
  //#region Global Hooks

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  const timeout = parseInt(process.env.EXPO_API_TIMEOUT ?? "10000");

  //#endregion

  const apiInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: "https://schoolfeesapi.azurewebsites.net/",
      headers: {
        ...headers,
      },
      responseType: responseType,
      withCredentials: withCredentials,
      timeout: timeout,
    });

    //#region Request Interceptor

    const requestInterceptorId = instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    //#endregion

    //#region Response Interceptor

    const responseInterceptorId = instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (
          error.response &&
          error.response.status === HttpStatusCode.Unauthorized
        ) {
          // Clear credentials from Redux store (this will trigger redux-persist to clear AsyncStorage)
          dispatch(clearCredentials());

          // Navigate to login screen using Expo Router
          router.replace("/(auth)/login");

        }
        console.error("Response interceptor error:", error);
        return Promise.reject(error);
      }
    );

    //#endregion

    // Store interceptor IDs for cleanup
    (instance as any)._requestInterceptorId = requestInterceptorId;
    (instance as any)._responseInterceptorId = responseInterceptorId;

    return instance;
  }, [headers, responseType, withCredentials, dispatch, token]);

  useEffect(() => {
    return () => {
      // Eject interceptors on unmount to avoid memory leaks
      const requestId = (apiInstance as any)._requestInterceptorId;
      const responseId = (apiInstance as any)._responseInterceptorId;

      if (requestId !== undefined) {
        apiInstance.interceptors.request.eject(requestId);
      }
      if (responseId !== undefined) {
        apiInstance.interceptors.response.eject(responseId);
      }
    };
  }, [apiInstance]);

  return apiInstance;
};

export default useApiInstance;