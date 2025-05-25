// hooks/useUserInfo.ts
import type { RootState } from "@/redux/store";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

// Define the JWT payload structure for better type safety
interface JWTPayload {
  [key: string]: any;
  sub?: string;
  phoneNumber?: string;
  Name?: string;
  Email?: string;
  School?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

// Define the return type for the hook
interface UserInfo {
  id: string | null;
  role: string | null;
  phoneNumber: string | null;
  name: string | null;
  email: string | null;
  schoolId: string | null;
  parentId?: string | null;
}

/**
 * A hook that reads the JWT from Redux, decodes it,
 * and returns an object with the user's Id, role,
 * phoneNumber, Name and Email (or null if unavailable).
 */
const useUserInfo = (): UserInfo | null => {
  const token = useSelector((state: RootState) => state.auth.token);
  
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);

    return {
      id:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        decoded.sub ||
        null,

      role:
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || null,

      phoneNumber: decoded["phoneNumber"] || null,
      name: decoded["Name"] || null,
      email: decoded["Email"] || null,
      schoolId: decoded["School"] || null,
      parentId: decoded["EntityUserId"] || null,
    };
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default useUserInfo;