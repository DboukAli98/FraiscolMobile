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

  const timeout = parseInt(process.env.EXPO_API_TIMEOUT ?? "15000"); // Increased timeout

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
      // Add retry configuration
      validateStatus: (status) => {
        // Consider 2xx and 3xx as successful
        return status >= 200 && status < 400;
      },
    });

    //#region Request Interceptor

    const requestInterceptorId = instance.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request logging
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        if (config.params) {
          console.log('📋 Request Params:', config.params);
        }

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
        // Log successful responses
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        // Enhanced error logging
        console.error('❌ Response Interceptor Error:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });

        // Handle specific error cases
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          console.error('🌐 Network connectivity issue detected');
          // You might want to show a toast or handle this globally
        }

        if (error.code === 'ECONNABORTED') {
          console.error('⏱️ Request timeout detected');
        }

        if (
          error.response &&
          error.response.status === HttpStatusCode.Unauthorized
        ) {
          console.log('🔐 Unauthorized access - clearing credentials');
          // Clear credentials from Redux store (this will trigger redux-persist to clear AsyncStorage)
          dispatch(clearCredentials());

          // Navigate to login screen using Expo Router
          router.replace("/(auth)/login");
        }

        // For 5xx errors, you might want to implement retry logic
        if (error.response?.status >= 500) {
          console.error('🔥 Server error detected:', error.response.status);
        }

        return Promise.reject(error);
      }
    );

    //#endregion

    // Store interceptor IDs for cleanup
    (instance as any)._requestInterceptorId = requestInterceptorId;
    (instance as any)._responseInterceptorId = responseInterceptorId;

    return instance;
  }, [headers, responseType, withCredentials, dispatch, token, timeout]);

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