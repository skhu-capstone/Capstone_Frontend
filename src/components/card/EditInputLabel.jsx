function EditInputLabel({
  label = "라벨", // 입력 필드 이름
  value = "", // 입력 값
  placeholder = "내용을 입력해주세요",
  onChange, // 입력 변경 핸들러
  textarea = false, // textarea 여부
  className = "", // 외부 스타일 확장 -> 2열인지 1열인지에 따라 값을 추가
}) {
  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      
      {/* 라벨 */}
      <label className="text-gray-900 text-xs font-medium leading-4">
        {label}
      </label>

      {textarea ? (
        <textarea // 길게 입력
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className="w-full min-h-30 px-3.5 py-2.5 bg-blue-900/10 rounded-[10px] 
          outline-none border-none text-black text-base leading-5 resize-none
          focus:ring-2 focus:ring-blue-500"
        />
      ) : ( 
        <input // 한 줄 입력
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className="w-full px-3.5 py-2.5 bg-blue-900/10 rounded-[10px] outline-none border-none 
          text-black text-base leading-5 focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

export default EditInputLabel;