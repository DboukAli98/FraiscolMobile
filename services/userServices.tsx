import { GetParentDetailsParams, GetParentDetailsResponse, UpdateParentParams, UpdateParentResponse } from "@/models/ParentDetailsInterfaces";
import { clearCredentials } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";
import { router } from "expo-router";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
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


interface GetParentCurrentMonthTotalFeesParams {
  parentId: number;

}

interface GetParentCurrentMonthTotalFeesResponse {
  data: string | null;

}

export interface ParentInstallmentDto {
  installmentId: number;
  fK_ChildCycleSelectionId: number;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  lateFee?: number;
  fK_ChildId: number;
  childName: string;
  className: string;
  schoolName: string;
  statusId: number;
}

export interface GetParentInstallmentsParams {
  parentId: number;
  childId?: number;
  schoolId?: number;
  schoolGradeSectionId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetParentInstallmentsResponse {
  data: ParentInstallmentDto[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  status: string;
  error: any | null;
  message: string | null;
}

// Filter Data Interfaces
export interface FilterOption {
  id: number;
  name: string;
}

export interface ChildrenFilterDto {
  childId: number;
  childName: string;
}

export interface SchoolFilterDto {
  schoolId: number;
  schoolName: string;
}

export interface SchoolGradeFilterDto {
  gradeSectionId: number;
  gradeSectionName: string;
}

export interface GetParentInstallmentFilterDataParams {
  parentId: number;
  filterName: 'childrens' | 'schools' | 'schoolgrades';
  pageNumber?: number;
  pageSize?: number;
}

export interface GetParentInstallmentFilterDataResponse {
  filterName: string;
  data: any[] | null;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  status: string;
  error: any | null;
  message: string | null;
}


interface GetRecentPaymentTransactionsParams {
  parentId: number;
  timePeriod?: string; // 'week', 'month', 'all'
  topCount?: number;
}

export interface RecentPaymentTransactionDto {
  paymentTransactionId: number;
  fK_InstallmentId: number;
  amountPaid: number;
  paidDate: string;
  paymentMethod: string;
  transactionReference: string;
  fK_StatusId: number;
  createdOn: string;
  modifiedOn: string | null;
  transactionMapId: string | null;
  statusName: string;
  installmentAmount: number;
  dueDate: string;
  isPaid: boolean;
  childId: number;
  childFirstName: string;
  childLastName: string;
  gradeName: string;
  schoolName: string;
  daysAgo: number;
  statusDescription: string;
  childFullName: string;
  formattedAmount: string;
  relativeTime: string;
}

export interface PaymentDateRange {
  from: string | null;
  to: string | null;
}

export interface PaymentTransactionsSummary {
  totalTransactions: number;
  totalAmountPaid: number;
  timePeriod: string;
  parentId: number;
  dateRange: PaymentDateRange;
}

export interface GetRecentPaymentTransactionsResponse {
  data: RecentPaymentTransactionDto[];
  summary: PaymentTransactionsSummary;
  status: string;
  error: any | null;
  message: string;
}

// Pending/Rejected Children Interfaces
export interface PendingRejectedChildDto {
  childId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  fatherName: string;
  fK_ParentId: number;
  fK_SchoolId: number;
  fK_StatusId: number;
  rejectionReason?: string;
  approvedDate?: string;
  approvedByUserId?: string;
  createdOn: string;
  modifiedOn?: string;
  school?: {
    schoolId: number;
    schoolName: string;
  };
}

export interface GetParentPendingRejectedChildrensParams {
  parentId: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetParentPendingRejectedChildrensResponse {
  data: PendingRejectedChildDto[] | null;
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

  const dispatch = useDispatch<AppDispatch>();

  const logoutUser = useCallback(async (): Promise<ApiResponse> => {
    try {
      const response = await api.post("/api/Authentication/Logout");

      // Clear credentials from Redux store (this will trigger redux-persist to clear AsyncStorage)
      dispatch(clearCredentials());

      // Navigate to login screen
      router.replace("/(auth)/login");

      return {
        success: true,
        status: response.status,
        data: response.data,
        error: null,
      };
    } catch (error: any) {
      const status = error.response ? error.response.status : 0;
      const errorData = error.response ? error.response.data : null;

      // Clear credentials even if API call fails
      dispatch(clearCredentials());
      router.replace("/(auth)/login");

      return {
        success: false,
        status: status,
        data: null,
        error: errorData || "An error occurred during logout",
      };
    }
  }, [api, dispatch]);

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

export const useGetParentCurrentMonthTotalFees = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getParentCurrentMonthTotalFees = useCallback(
    async ({
      parentId,

    }: GetParentCurrentMonthTotalFeesParams): Promise<ApiResponse<GetParentCurrentMonthTotalFeesResponse>> => {
      const params = new URLSearchParams({
        ParentId: parentId.toString(),

      }).toString();

      try {
        const response = await api.get<GetParentCurrentMonthTotalFeesResponse>(
          `/api/Parents/GetParentMonthPaymentFee?${params}`
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

  return getParentCurrentMonthTotalFees;
};

export const useGetParentInstallments = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getParentInstallments = useCallback(
    async ({
      parentId,
      childId,
      schoolId,
      schoolGradeSectionId,
      pageNumber = 1,
      pageSize = 10,
    }: GetParentInstallmentsParams): Promise<ApiResponse<GetParentInstallmentsResponse>> => {
      const params = new URLSearchParams({
        ParentId: parentId.toString(),
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
      });



      if (childId) params.append('ChildId', childId.toString());
      if (schoolId) params.append('SchoolId', schoolId.toString());
      if (schoolGradeSectionId) params.append('SchoolGradeSectionId', schoolGradeSectionId.toString());

      const queryString = params.toString();
      const fullUrl = `/api/Parents/GetParentInstallments?${queryString}`;

      // ✅ ENHANCED DEBUG LOGGING
      console.log('🔍 API Call Debug Info:');
      console.log('   URL:', fullUrl);
      console.log('   Parent ID:', parentId);
      console.log('   Filters:', { childId, schoolId, schoolGradeSectionId });
      console.log('   Base URL from apiClient:', api.defaults?.baseURL);

      try {
        const response = await api.get<GetParentInstallmentsResponse>(
          `/api/Parents/GetParentInstallments?${params.toString()}`
        );

        console.log('✅ API Success:', {
          status: response.status,
          dataCount: response.data?.data?.length,
          totalRecords: response.data?.totalCount
        });


        return {
          success: true,
          status: response.status,
          data: response.data,
          error: null,
        };
      } catch (error: any) {
        const status = error.response ? error.response.status : 0;
        const errorData = error.response ? error.response.data : null;
        const errorText = error.response ? await error.response.text?.() : null;

        // ✅ ENHANCED ERROR LOGGING
        console.error('❌ API Error Details:');
        console.error('   Status:', status);
        console.error('   URL:', fullUrl);
        console.error('   Error Data:', errorData);
        console.error('   Error Text:', errorText);
        console.error('   Full Error:', error.response);

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "Une erreur s'est produite lors de la récupération des versements parents",
        };
      }
    },
    [api]
  );

  return getParentInstallments;
};

export const useGetParentInstallmentFilterData = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getParentInstallmentFilterData = useCallback(
    async ({
      parentId,
      filterName,
      pageNumber = 1,
      pageSize = 100, // Large page size for filter options
    }: GetParentInstallmentFilterDataParams): Promise<ApiResponse<GetParentInstallmentFilterDataResponse>> => {
      const params = new URLSearchParams({
        ParentId: parentId.toString(),
        FilterName: filterName,
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
      });

      try {
        const response = await api.get<GetParentInstallmentFilterDataResponse>(
          `/api/Parents/GetParentInstallmentFilterData?${params.toString()}`
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

        console.error("Get parent installment filter data error:", error);

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred while fetching filter data",
        };
      }
    },
    [api]
  );

  return getParentInstallmentFilterData;
};

// Specific Filter Services using the unified API
export const useGetChildrenForFilter = () => {
  const getParentInstallmentFilterData = useGetParentInstallmentFilterData();

  const getChildrenForFilter = useCallback(
    async (parentId: number): Promise<ApiResponse<FilterOption[]>> => {
      try {
        const response = await getParentInstallmentFilterData({
          parentId,
          filterName: 'childrens',
        });

        if (response.success && response.data?.data) {
          const children: FilterOption[] = response.data.data.map((child: ChildrenFilterDto) => ({
            id: child.childId,
            name: child.childName,
          }));

          return {
            success: true,
            status: response.status,
            data: children,
            error: null,
          };
        }

        return {
          success: false,
          status: response.status,
          data: [],
          error: response.data?.error || response.error || "Failed to fetch children",
        };
      } catch (error: any) {
        console.error("Get children for filter error:", error);
        return {
          success: false,
          status: 0,
          data: [],
          error: "An error occurred while fetching children",
        };
      }
    },
    [getParentInstallmentFilterData]
  );

  return getChildrenForFilter;
};

export const useGetSchoolsForFilter = () => {
  const getParentInstallmentFilterData = useGetParentInstallmentFilterData();

  const getSchoolsForFilter = useCallback(
    async (parentId: number): Promise<ApiResponse<FilterOption[]>> => {
      try {
        const response = await getParentInstallmentFilterData({
          parentId,
          filterName: 'schools',
        });

        if (response.success && response.data?.data) {
          const schools: FilterOption[] = response.data.data.map((school: SchoolFilterDto) => ({
            id: school.schoolId,
            name: school.schoolName,
          }));

          return {
            success: true,
            status: response.status,
            data: schools,
            error: null,
          };
        }

        return {
          success: false,
          status: response.status,
          data: [],
          error: response.data?.error || response.error || "Failed to fetch schools",
        };
      } catch (error: any) {
        console.error("Get schools for filter error:", error);
        return {
          success: false,
          status: 0,
          data: [],
          error: "An error occurred while fetching schools",
        };
      }
    },
    [getParentInstallmentFilterData]
  );

  return getSchoolsForFilter;
};

export const useGetGradeSectionsForFilter = () => {
  const getParentInstallmentFilterData = useGetParentInstallmentFilterData();

  const getGradeSectionsForFilter = useCallback(
    async (parentId: number): Promise<ApiResponse<FilterOption[]>> => {
      try {
        const response = await getParentInstallmentFilterData({
          parentId,
          filterName: 'schoolgrades',
        });

        if (response.success && response.data?.data) {
          const gradeSections: FilterOption[] = response.data.data.map((grade: SchoolGradeFilterDto) => ({
            id: grade.gradeSectionId,
            name: grade.gradeSectionName,
          }));

          return {
            success: true,
            status: response.status,
            data: gradeSections,
            error: null,
          };
        }

        return {
          success: false,
          status: response.status,
          data: [],
          error: response.data?.error || response.error || "Failed to fetch grade sections",
        };
      } catch (error: any) {
        console.error("Get grade sections for filter error:", error);
        return {
          success: false,
          status: 0,
          data: [],
          error: "An error occurred while fetching grade sections",
        };
      }
    },
    [getParentInstallmentFilterData]
  );

  return getGradeSectionsForFilter;
};

export const useGetParentRecentTransactions = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getParentRecentTransactions = useCallback(
    async ({
      parentId,
      timePeriod = "week",
      topCount = 5,
    }: GetRecentPaymentTransactionsParams): Promise<ApiResponse<GetRecentPaymentTransactionsResponse>> => {
      const params = new URLSearchParams({
        ParentId: parentId.toString(),
        TimePeriod: timePeriod,
        TopCount: topCount.toString(),
      });
      console.log("parent idddd ::: ", parentId)

      try {
        const response = await api.get<GetRecentPaymentTransactionsResponse>(
          `api/Parents/GetParentRecentTrx?${params.toString()}`
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

        console.error("Get parent recent transactions error:", error);

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred while fetching recent transactions",
        };
      }
    },
    [api]
  );

  return getParentRecentTransactions;
};


export const useGetParentDetails = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getParentDetails = useCallback(
    async ({
      parentId
    }: GetParentDetailsParams): Promise<ApiResponse<GetParentDetailsResponse>> => {
      const params = new URLSearchParams({
        ParentId: parentId.toString(),
      }).toString();

      try {
        const response = await api.get<GetParentDetailsResponse>(
          `/api/Parents/GetSingleParentDetails?${params}`
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

        console.error("Get parent details error:", error);

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred while fetching parent details",
        };
      }
    },
    [api]
  );

  return getParentDetails;
};

// -----------------------------
// Register new user (parent) - module level
// -----------------------------
export const useRegisterUser = () => {
  const api = useApiInstance({
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
    },
    skipAuth: true, // Registration should not send auth token
  });

  const registerUser = useCallback(
    async ({
      firstName,
      lastName,
      password,
      civilId = '',
      countryCode = '242',
      phoneNumber,
      email = '',
    }: {
      firstName: string;
      lastName: string;
      password: string;
      civilId?: string;
      countryCode?: string; // expected without plus, e.g. '242'
      phoneNumber: string;
      email?: string;
    }): Promise<ApiResponse<any>> => {
      const payload = {
        firstName,
        lastName,
        role: 'Parent',
        password,
        schoolId: 0,
        civilId: civilId || '',
        countryCode: countryCode || '242',
        phoneNumber,
        email: email || '',
      };

      try {
        const response = await api.post('/api/Authentication/Register', payload);
        const data = response.data;

        if (data?.status === 'Success') {
          return {
            success: true,
            status: response.status,
            data: data,
            error: null,
          };
        }

        return {
          success: false,
          status: response.status,
          data: data,
          error: data || 'Registration failed',
        };
      } catch (error: any) {
        const status = error.response ? error.response.status : 0;
        const errorData = error.response ? error.response.data : null;
        console.error('Register user error:', error);

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || 'An error occurred during registration',
        };
      }
    },
    [api]
  );

  return registerUser;
};

export const useUpdateParent = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });
  const updateParent = useCallback(
    async ({
      parentId,
      firstName,
      lastName,
      email = "",
      civilId = "",
      fatherName = "",
      countryCode,
      phoneNumber,
      statusId
    }: UpdateParentParams): Promise<ApiResponse<UpdateParentResponse>> => {
      const requestData = {
        parentId,
        firstName,
        lastName,
        email,
        civilId,
        fatherName,
        countryCode,
        phoneNumber,
        statusId
      };



      try {
        const response = await api.put<UpdateParentResponse>(
          "/api/Parents/UpdateParent",
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

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred while updating parent",
        };
      }
    },
    [api]
  );

  return updateParent;
};

export const useGetParentPendingRejectedChildrens = () => {
  const api = useApiInstance({
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en"
    },
  });

  const getPendingRejectedChildrens = useCallback(
    async ({
      parentId,
      pageNumber = 1,
      pageSize = 10
    }: GetParentPendingRejectedChildrensParams): Promise<ApiResponse<GetParentPendingRejectedChildrensResponse>> => {
      try {
        const params = new URLSearchParams({
          ParentId: parentId.toString(),
          PageNumber: pageNumber.toString(),
          PageSize: pageSize.toString(),
        });

        const response = await api.get<GetParentPendingRejectedChildrensResponse>(
          `/api/Parents/GetParentPendingRejectedChildrens?${params.toString()}`
        );

        return {
          success: true,
          status: response.status,
          data: response.data,
          error: null,
        };
      } catch (error: any) {
        console.error('Error fetching pending/rejected childrens:', error);
        const status = error.response ? error.response.status : 0;
        const errorData = error.response ? error.response.data : null;

        return {
          success: false,
          status: status,
          data: null,
          error: errorData || "An error occurred while fetching pending/rejected childrens",
        };
      }
    },
    [api]
  );

  return getPendingRejectedChildrens;
};
