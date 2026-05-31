function InputLabel({
  label = "라벨",
  value = "내용",
  className = "",
  multiline = false, // 긴 텍스트 표시용
}) {
  return (
    <div className={`w-full inline-flex flex-col justify-start items-start gap-1 ${className}`}>
      {/* 라벨 */}
      <div className="self-stretch text-gray-900 text-xs font-medium leading-4 line-clamp-1">
        {label}
      </div>

      {/* 값 영역 */}
      <div className="self-stretch px-3.5 py-2.5 bg-blue-900/10 rounded-[10px] 
      outline-[1.5px] outline-offset-[-1.5px] outline-black/0 inline-flex justify-start items-start 
      gap-2 ${multiline ? 'min-h-30' : 'items-center'}">
        <div className="flex-1 text-black text-base font-normal leading-5
        ${multiline ? 'whitespace-pre-wrap' : 'line-clamp-1'}">
          {value}
        </div>
      </div>
    </div>
  );
}

export default InputLabel;