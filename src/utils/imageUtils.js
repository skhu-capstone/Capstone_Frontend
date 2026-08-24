export const DEFAULT_PROFILE_IMAGE = "https://placehold.co/250x250";
export const DEFAULT_FEED_IMAGE = "https://placehold.co/600x250";

const LEGACY_PRIVATE_UPLOAD_PATH = "/uploads/";
const RENDERABLE_IMAGE_PROTOCOLS = ["http:", "https:", "data:", "blob:"];

export const isPrivateUploadImageUrl = (url) => {
  if (typeof url !== "string") return false;

  const trimmedUrl = url.trim();

  try {
    const parsedUrl = new URL(
      trimmedUrl,
      globalThis.location?.origin ?? "http://localhost"
    );
    return parsedUrl.pathname.startsWith(LEGACY_PRIVATE_UPLOAD_PATH);
  } catch {
    return trimmedUrl.startsWith(LEGACY_PRIVATE_UPLOAD_PATH);
  }
};

export const isValidImageUrl = (url) => {
  if (typeof url !== "string") return false;

  const trimmedUrl = url.trim();
  if (!trimmedUrl || isPrivateUploadImageUrl(trimmedUrl)) return false;

  try {
    const parsedUrl = new URL(
      trimmedUrl,
      globalThis.location?.origin ?? "http://localhost"
    );

    return RENDERABLE_IMAGE_PROTOCOLS.includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

export const getProfileImageUrl = (image, fallback = DEFAULT_PROFILE_IMAGE) => {
  if (!image) return fallback;

  if (typeof image === "string") {
    return isValidImageUrl(image) ? image : fallback;
  }

  return [
    image.coffeeChatProfileImageUrl,
    image.coffeeChatProfileImage,
    image.coffeeChatProfile?.profileImageUrl,
    image.coffeeChatProfile?.profileImage,
    image.profileImageUrl,
    image.profileImage,
    image.googleProfileImageUrl,
    image.googleProfileImage,
    image.oauthProfileImageUrl,
    image.oauthProfileImage,
    image.imageUrl,
    image.url,
  ].find(isValidImageUrl) ?? fallback;
};

export const getUploadedImageUrl = (responseData) => {
  if (isValidImageUrl(responseData)) return responseData;

  if (!responseData || typeof responseData !== "object") return "";

  return [
    responseData.imageUrl,
    responseData.profileImageUrl,
    responseData.coffeeChatProfileImageUrl,
    responseData.profileImage,
    responseData.url,
    responseData.data?.imageUrl,
    responseData.data?.profileImageUrl,
    responseData.data?.coffeeChatProfileImageUrl,
    responseData.data?.profileImage,
    responseData.data?.url,
  ].find(isValidImageUrl) ?? "";
};

export const getContentImageUrl = (image, fallback = DEFAULT_FEED_IMAGE) => {
  if (isValidImageUrl(image)) return image;

  if (!image || typeof image !== "object") return fallback;

  return [
    image.imageUrl,
    image.url,
    image.src,
    image.fileUrl,
  ].find(isValidImageUrl) ?? fallback;
};
