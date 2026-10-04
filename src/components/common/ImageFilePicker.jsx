import { useEffect, useRef, useState } from "react";

export default function ImageFilePicker({ file, onChange, disabled }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <div className="space-y-2">
      <label className="flex flex-col gap-2 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-600">
        사진 첨부 (선택)
        <span className="text-xs text-gray-400">PNG, JPG · 최대 5MB</span>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" disabled={disabled}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (!selected) return;
            if (!["image/png", "image/jpeg"].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
              setError("5MB 이하의 PNG 또는 JPG 파일을 선택해주세요.");
              event.target.value = "";
              return;
            }
            setError("");
            onChange(selected);
          }} />
      </label>
      {file && <div className="space-y-2">
        {preview && <img src={preview} alt="선택한 사진 미리보기" className="max-h-48 rounded-lg object-contain" />}
        <p className="break-all text-xs text-gray-500">{file.name}</p>
        <button type="button" disabled={disabled} className="text-xs text-red-500" onClick={() => {
          onChange(null); setError(""); setPreview("");
          if (inputRef.current) inputRef.current.value = "";
        }}>선택 취소</button>
      </div>}
      {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
