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
  const [failures, setFailures] = useState({ source: null, urls: [] });
  const requestedSrc = getSrc(src, fallbackSrc);
  const failedUrls = failures.source === requestedSrc ? failures.urls : [];
  const imageSrc = failedUrls.includes(requestedSrc) ? fallbackSrc : requestedSrc;
  const shouldShowImage = imageSrc && !failedUrls.includes(imageSrc);

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
      onError={() => setFailures({ source: requestedSrc, urls: [...failedUrls, imageSrc] })}
    />
  );
}

export default SafeImage;
