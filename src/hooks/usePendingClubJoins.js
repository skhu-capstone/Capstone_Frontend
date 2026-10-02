import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

export default function usePendingClubJoins() {
  const { user } = useAuth();
  const userId = user?.userId ?? user?.id;
  const queryClient = useQueryClient();
  const queryKey = ["clubJoinResults", userId];
  // 조회 API가 연결되기 전까지 현재 실행 중 수신한 응답만 보관한다.
  // 영구 브라우저 기록으로 거절/탈퇴 후 재신청을 막지 않는다.
  const { data = {} } = useQuery({ queryKey, enabled: false, initialData: {} });
  return {
    pendingClubIds: new Set(Object.keys(data).filter((id) => data[id] === "PENDING")),
    recordResult: (clubId, status) => {
      queryClient.setQueryData(queryKey, (old) => ({ ...old, [clubId]: status }));
    },
  };
}
