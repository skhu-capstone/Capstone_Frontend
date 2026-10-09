import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

function ImagePreview({ file }) {
  const [preview] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);

  return <img src={preview} alt="선택한 사진 미리보기" className="max-h-48 rounded-lg object-contain" />;
}

export default function ImageFilePicker({ file, onChange, disabled }) {
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (previewRef.current) previewRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <div className="space-y-2">
      <label className={`group relative flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center text-sm transition-colors focus-within:border-blue-500 dark:focus-within:border-theme-focus focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-theme-border ${
        disabled
          ? "cursor-not-allowed border-gray-200 dark:border-theme-border bg-gray-50 dark:bg-theme-subtle text-gray-400 dark:text-theme-muted opacity-60"
          : "cursor-pointer border-gray-300 dark:border-theme-border-strong bg-slate-50/50 dark:bg-theme-subtle text-gray-600 dark:text-theme-secondary hover:border-blue-400 dark:hover:border-theme-focus hover:bg-blue-50/60 dark:hover:bg-theme-accent-hover"
      }`}>
        <span className={`mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-theme-surface text-blue-500 dark:text-theme-link shadow-sm dark:shadow-theme-shadow transition-colors ${disabled ? "" : "group-hover:bg-blue-100 dark:group-hover:bg-theme-accent-hover"}`}>
          <Plus size={23} aria-hidden="true" />
        </span>
        <span className="font-semibold">{file ? "사진 변경" : "사진 첨부 (선택)"}</span>
        <span className="text-xs text-gray-400 dark:text-theme-muted">클릭하여 사진 선택 · PNG, JPG · 최대 20MB</span>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" disabled={disabled}
          aria-label={file ? "사진 변경" : "사진 첨부 (선택)"}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (!selected) return;
            if (!["image/png", "image/jpeg"].includes(selected.type) || selected.size > MAX_IMAGE_SIZE) {
              setError("20MB 이하의 PNG 또는 JPG 파일을 선택해주세요.");
              event.target.value = "";
              return;
            }
            setError("");
            onChange(selected);
          }} />
      </label>
      {file && <div className="space-y-2">
        <img ref={previewRef} alt="선택한 사진 미리보기" className="max-h-48 rounded-lg object-contain" />
        <p className="break-all text-xs text-gray-500 dark:text-theme-muted">{file.name}</p>
        <button type="button" disabled={disabled} className="cursor-pointer rounded-md px-2 py-1 text-xs text-red-500 dark:text-theme-danger transition-colors hover:bg-red-50 dark:hover:bg-theme-danger-bg focus-visible:outline-2 focus-visible:outline-red-400 dark:focus-visible:outline-theme-danger-border disabled:cursor-not-allowed disabled:opacity-50" onClick={() => {
          onChange(null); setError("");
          if (inputRef.current) inputRef.current.value = "";
        }}>선택 취소</button>
      </div>}
      {error && <p role="alert" className="text-xs text-red-500 dark:text-theme-danger">{error}</p>}
    </div>
  );
}
