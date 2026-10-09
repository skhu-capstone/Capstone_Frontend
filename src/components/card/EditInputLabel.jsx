function EditInputLabel({
  label = "라벨", // 입력 필드 이름
  value = "", // 입력 값
  placeholder = "내용을 입력해주세요",
  onChange, // 입력 변경 핸들러
  textarea = false, // textarea 여부
  className = "", // 외부 스타일 확장 -> 2열인지 1열인지에 따라 값을 추가
  disabled = false,
}) {
  const inputValue = value ?? ""; // null이나 undefined 값이 와도 안 깨지겠끔 공백으로 처리

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      
      {/* 라벨 */}
      <label className="text-gray-900 dark:text-theme-text text-xs font-medium leading-4">
        {label}
      </label>

      {textarea ? (
        <textarea // 길게 입력
          value={inputValue}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          className="w-full min-h-30 px-3.5 py-2.5 bg-blue-900/10 dark:bg-theme-accent rounded-[10px]
          outline-none border-none text-black dark:text-theme-text text-base leading-5 resize-none
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-theme-focus disabled:cursor-not-allowed disabled:opacity-60"
        />
      ) : ( 
        <input // 한 줄 입력
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          className="min-h-11 w-full px-3.5 py-2.5 bg-blue-900/10 dark:bg-theme-accent rounded-[10px] outline-none border-none
          text-black dark:text-theme-text text-base leading-5 focus:ring-2 focus:ring-blue-500 dark:focus:ring-theme-focus disabled:cursor-not-allowed disabled:opacity-60"
        />
      )}
    </div>
  );
}

export default EditInputLabel;
