export function isOwnRecruitment(post, user) {
  if (!post || !user) return false;
  const userId = user.userId ?? user.id;
  if (post.writerId != null && userId != null) {
    return String(post.writerId) === String(userId);
  }
  // 작성자 ID가 없는 상세 응답은 작성자 전용 수정·삭제 권한으로 확인한다.
  return post.canUpdate === true || post.canDelete === true;
}
