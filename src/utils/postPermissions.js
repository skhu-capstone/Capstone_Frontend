// 서버가 명시적으로 허용한 작업만 제공한다.
export function canEditClubPost(post, user, accessToken) {
  return !!user && !!accessToken && post?.canUpdate === true;
}

export function canDeletePost(post, user, accessToken) {
  return !!user && !!accessToken && post?.canDelete === true;
}
