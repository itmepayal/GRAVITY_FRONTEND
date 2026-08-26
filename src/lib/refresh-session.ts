import axios from "axios";

export type RefreshSessionResult = {
  accessToken: string;
  refreshToken: string;
};

export async function refreshAuthSession(
  refreshToken: string,
): Promise<RefreshSessionResult> {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
    { refreshToken },
    { withCredentials: true },
  );

  return data.data;
}
