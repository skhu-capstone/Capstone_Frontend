import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getMyClubs } from "../services/clubService";

export default function useMyClubs() {
  const { user } = useAuth();
  const isAuthenticated = !!user && !!localStorage.getItem("accessToken");
  const query = useQuery({
    queryKey: ["myClubs", user?.userId ?? user?.id],
    queryFn: getMyClubs,
    enabled: isAuthenticated,
  });
  return {
    ...query,
    clubs: isAuthenticated ? query.data ?? [] : [],
    isAuthenticated,
    isChecking: isAuthenticated && query.isPending,
    hasError: isAuthenticated && query.isError,
  };
}
