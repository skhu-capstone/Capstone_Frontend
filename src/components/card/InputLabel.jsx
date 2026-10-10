function InputLabel({
  label = "라벨",
  value = "내용",
  className = "",
  multiline = false, // 긴 텍스트 표시용
}) {
  const displayValue = value ?? ""; // null이나 undefined 값이 와도 안 깨지겠끔 공백으로 처리

  return (
    <div className={`flex w-full min-w-0 flex-col items-start justify-start gap-1 ${className}`}>
      {/* 라벨 */}
      <div className="self-stretch text-gray-900 dark:text-theme-text text-xs font-medium leading-4 line-clamp-1">
        {label}
      </div>

      {/* 값 영역 */}
      <div className={`inline-flex min-h-11 self-stretch rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-theme-border dark:bg-theme-subtle ${multiline ? "min-h-30 items-start" : "items-center"}`}>
        <div className={`min-w-0 flex-1 break-words text-sm font-normal leading-5 text-black [overflow-wrap:anywhere] dark:text-theme-text sm:text-base ${multiline ? "whitespace-pre-wrap" : ""}`}>
          {displayValue}
        </div>
      </div>
    </div>
  );
}

export default InputLabel;
