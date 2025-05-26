import { router } from "expo-router";
import { useCallback } from "react";
import useApiInstance from "./apiClient";
import { School } from "./childrenServices";


//#region Types
interface LoginParams {
  countryCode: string;
  mobileNumber: string;
  password: string;
  civilId?: string;
  loginByType?: string;
}

interface RegisterDeviceParams {
  UserId: string;
  Role: string;
  DevicePushToken: string | null;

}


interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  data: T | null;
  error: any;
}

interface LoginResponse {
  token: string;
  userId: string;
  refreshToken?: string;
  expiresIn?: number;
  userInfo?: {
    name: string;
    email: string;

  };
}

interface RegisterDeviceResponse {
  message: string;
}

interface GetParentChildrensParams {
  parentId: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

interface GetParentSchoolsParams {
  parentId: number;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}


interface Children {
  childId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  schoolName: string;
  schoolGradeName: string;
  fK_ParentId: number;
  fK_SchoolId: number;
  fK_StatusId: number;
  createdOn: string;
  modifiedOn: string | null;
}

interface GetParentChildrensResponse {
  data: Children[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  status: string;
  error: any | null;
  message: string | null;
}

interface GetParentSchoolsResponse {
  data: School[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  status: string;
  error: any | null;
  message: string | null;
}




//#endregion


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

      console.log("usrl :: ", process.env.EXPO_PUBLIC_API_BASE_URL);

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

export const useRegisterUserDeviceToNotification = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const registerUserDeviceToNotification = useCallback(
    async ({
      UserId = "",
      Role = "",
      DevicePushToken = "",

    }: RegisterDeviceParams): Promise<ApiResponse<RegisterDeviceResponse>> => {
      const requestData = {
        UserId,
        Role,
        DevicePushToken,

      };

      console.log("usrl :: ", process.env.EXPO_PUBLIC_API_BASE_URL);

      try {
        const response = await api.post<RegisterDeviceResponse>(
          "/api/Authentication/RegisterDevicePushToken",
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

  return registerUserDeviceToNotification;
};

export const useGetParentChildrens = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getParentChildrens = useCallback(
    async ({
      parentId,
      pageNumber = 1,
      pageSize = 10,
      search = "",
    }: GetParentChildrensParams): Promise<ApiResponse<GetParentChildrensResponse>> => {
      const params = new URLSearchParams({
        ParentId: parentId.toString(),
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        Search: search,
      }).toString();

      try {
        const response = await api.get<GetParentChildrensResponse>(
          `/api/Parents/GetParentChildrens?${params}`
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

        console.error("Get parent childrens error:", error);

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred while fetching parent childrens",
        };
      }
    },
    [api]
  );

  return getParentChildrens;
};


export const useGetParentSchools = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getParentSchools = useCallback(
    async ({
      parentId,
      pageNumber = 1,
      pageSize = 10,
      search = "",
    }: GetParentSchoolsParams): Promise<ApiResponse<GetParentSchoolsResponse>> => {
      const params = new URLSearchParams({
        ParentId: parentId.toString(),
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        Search: search,
      }).toString();

      try {
        const response = await api.get<GetParentSchoolsResponse>(
          `/api/Parents/GetParentSchools?${params}`
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

        console.error("Get parent childrens error:", error);

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred while fetching parent childrens",
        };
      }
    },
    [api]
  );

  return getParentSchools;
};

