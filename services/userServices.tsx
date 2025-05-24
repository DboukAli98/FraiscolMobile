import { router } from "expo-router";
import { useCallback } from "react";
import useApiInstance from "./apiClient";


// Types for login parameters
interface LoginParams {
  countryCode: string;
  mobileNumber: string;
  password: string;
  civilId?: string;
  loginByType?: string;
}

// Types for API responses
interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  data: T | null;
  error: any;
}

interface LoginResponse {
  token: string;
  userId: string;
  // Add other fields that your API returns
  refreshToken?: string;
  expiresIn?: number;
  userInfo?: {
    name: string;
    email: string;
    // Add other user fields
  };
}

export const useLogin = () => {
  const api = useApiInstance({
    headers: { 
      "Content-Type": "application/json", 
      "Accept-Language": "en" 
    },
  });

  const authenticate = useCallback(
    async ({
      countryCode,
      mobileNumber,
      password,
      civilId = "",
      loginByType = "",
    }: LoginParams): Promise<ApiResponse<LoginResponse>> => {
      const requestData = {
        countryCode,
        mobileNumber,
        password,
        civilId,
        loginByType,
      };

      console.log("usrl :: " , process.env.EXPO_PUBLIC_API_BASE_URL);

      try {
        const response = await api.post<LoginResponse>(
          "/api/Authentication/login",
          requestData
        );

        return {
          success: true,
          status: response.status,
          data: response.data,
          error: null,
        };
      } catch (error: any) {
        const status = error.response ? error.response.status : 0;
        const errorData = error.response ? error.response.data : null;
        
        console.error("Login error:", error);
        
        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred during login",
        };
      }
    },
    [api]
  );

  return authenticate;
};

export const useLogout = () => {
  const api = useApiInstance({
    headers: { 
      "Content-Type": "application/json", 
      "Accept-Language": "en" 
    },
  });

  const logoutUser = useCallback(async (): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/Authentication/Logout");

  
      // Navigate to login screen
      router.replace("/login");

      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null,
      };
    } catch (error: any) {
      const status = error.response ? error.response.status : 0;
      const errorData = error.response ? error.response.data : null;
      
      return {
        success: false,
        status: status,
        data: null,
        error: errorData || "An error occurred during logout",
      };
    }
  }, [api]);

  return logoutUser;
};
