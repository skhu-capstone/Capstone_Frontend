export const isUsableAccessToken = (token) => {
  if (!token) return false;

  const [, payload] = token.split(".");
  if (!payload) return true;

  try {
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (!decoded.exp) return true;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
