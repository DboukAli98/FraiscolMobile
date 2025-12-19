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

  const timeout = parseInt(process.env.EXPO_API_TIMEOUT ?? "15000");

  // Memoize headers to prevent unnecessary re-creations
  const serializedHeaders = JSON.stringify(headers);
  const memoizedHeaders = useMemo(() => headers, [serializedHeaders]);

  //#endregion

  const apiInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: "https://schoolfeesapi.azurewebsites.net/",
      headers: {
        ...memoizedHeaders,
      },
      responseType: responseType,
      withCredentials: withCredentials,
      timeout: timeout,
      validateStatus: (status) => {
        return status >= 200 && status < 400;
      },
    });

    //#region Request Interceptor

    const requestInterceptorId = instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    );

    //#endregion

    //#region Response Interceptor

    const responseInterceptorId = instance.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Interceptor Error:', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
        });

        if (
          error.response &&
          error.response.status === HttpStatusCode.Unauthorized
        ) {
          console.log('🔐 Unauthorized access - clearing credentials');
          dispatch(clearCredentials());
          router.replace("/(auth)/login");
        }

        return Promise.reject(error);
      }
    );

    //#endregion

    (instance as any)._requestInterceptorId = requestInterceptorId;
    (instance as any)._responseInterceptorId = responseInterceptorId;

    return instance;
  }, [memoizedHeaders, responseType, withCredentials, dispatch, timeout, token]);

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