import { useState } from "react";

function SafeImage({
  src,
  fallbackSrc = "",
  fallback,
  alt = "",
  className = "",
  getSrc = (value, fallbackValue) => value || fallbackValue,
  referrerPolicy,
  ...props
}) {
  const [failedSrc, setFailedSrc] = useState("");
  const imageSrc = getSrc(src, fallbackSrc);
  const shouldShowImage = imageSrc && imageSrc !== failedSrc;

  if (!shouldShowImage) {
    return fallback ?? null;
  }

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      className={className}
      referrerPolicy={referrerPolicy}
      onError={() => setFailedSrc(imageSrc)}
    />
  );
}

export default SafeImage;
