// hooks/useUserRole.ts
import type { RootState } from "@/redux/store";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";

// Define the JWT payload structure for the role claim
interface JWTPayload {
  [key: string]: any;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

/**
 * A hook that reads the JWT from Redux, decodes it,
 * and returns the user's role (or null if unavailable).
 */
const useUserRole = (): string | null => {
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    return role || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export default useUserRole;