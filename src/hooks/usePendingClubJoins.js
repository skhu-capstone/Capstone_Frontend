import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getClubJoinState } from "../utils/clubJoinStatus";
import { getMyClubJoins } from "../services/clubService";

export default function usePendingClubJoins() {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;
  const queryClient = useQueryClient();
  const queryKey = ["myClubJoins", userId];
  const isAuthenticated = !!user && !!localStorage.getItem("accessToken");
  const query = useQuery({
    queryKey,
    queryFn: getMyClubJoins,
    enabled: isAuthenticated,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
  const data = {};
  // 서버는 최근 신청 순으로 반환한다. 같은 동아리는 첫 번째 기록을 사용한다.
  for (const item of isAuthenticated ? query.data ?? [] : []) {
    if (!Object.hasOwn(data, String(item.clubId))) data[String(item.clubId)] = item.clubJoinStatus;
  }
  return {
    isChecking: isAuthenticated && query.isPending,
    hasError: isAuthenticated && query.isError,
    refetch: query.refetch,
    pendingClubIds: new Set(Object.keys(data).filter((id) => data[id] === "PENDING")),
    getJoinState: (clubId, isMember = false) => getClubJoinState(data[String(clubId)], isMember),
    recordResult: async (clubId, status) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, (old = []) => [
        ...(status == null ? [] : [{ clubId, clubJoinStatus: status }]),
        ...old.filter((item) => String(item.clubId) !== String(clubId)),
      ]);
      await queryClient.invalidateQueries({ queryKey });
    },
  };
}
