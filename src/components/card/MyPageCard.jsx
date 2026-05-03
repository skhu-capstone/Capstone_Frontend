const roleText = { // 추후 백엔드랑 정확한 값을 이야기해야 할듯
  PRESIDENT: "대표",
  MANAGER: "운영진",
  MEMBER: "동아리 부원",
};

function MyPageCard({
  name = "이름", // name 받아옴
  email, // email 받아옴
  schoolEmail, // schoolEmail 받아옴
  clubName = "소속 동아리 없음", // clubName 받아옴
  role = "MEMBER", // role 받아옴
  image = "https://placehold.co/250x250", // profileImage 받아옴
}) {
  return (
    <div className="w-225 px-16 py-12 bg-slate-50 rounded-2xl shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]
    inline-flex justify-start items-center gap-12 overflow-hidden">
      
      {/* 프로필 이미지 */}
      <img
        className="w-62.5 h-62.5 rounded-full border-[1.5px] border-black/0 object-cover"
        src={image}
        alt={`${name} 프로필 이미지`}
      />

      <div className="inline-flex flex-col justify-center items-start gap-6">

        {/* 이름 */}
        <div className="text-black text-3xl font-normal leading-10">
          {name}
        </div>

        {/* 이메일 */}
        {email && ( // 이메일 무조건 받을 거라 이 조건이 필요한지 고민해야 함
          <div className="text-black text-3xl font-normal leading-10">
            {email}
          </div>
        )}

        {/* 학교 이메일 */}
        {schoolEmail && ( // 학교 이메일도 무조건 받을 거라 이 조건이 필요한지 고민해야 함 (인증에 필요)
          <div className="text-black text-3xl font-normal leading-10">
            {schoolEmail}
          </div>
        )}

        {/* 동아리 / 역할(대표, 동아리부원 등) */}
        <div className="text-black text-3xl font-normal leading-10">
          {/* 동아리 소속되어 있을 땐 동아리랑 역할 다 출력하고 아니면 '소속 동아리 없음'으로 출력 */}
          {clubName ? `${clubName} / ${roleText[role] || role}` : "소속 동아리 없음"}
        </div>
      </div>
    </div>
  );
}

export default MyPageCard;