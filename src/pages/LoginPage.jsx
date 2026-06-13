import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (googleAccessToken) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/google/login`,
        {
          googleAccessToken,
        },
      );
      return response.data.data;
    },

    onSuccess: (userData) => {
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);
      localStorage.setItem("user", JSON.stringify(userData));

      if (userData.isVerified) {
        window.location.href = "/";
      } else {
        navigate("/email-verify");
      }
    },

    onError: (error) => {
      console.error(error);
      alert("로그인에 실패했습니다.");
    },
  });

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      loginMutation.mutate(tokenResponse.access_token);
      console.log("로그인 성공");
    },

    onError: () => {
      alert("구글 로그인에 실패했습니다.");
    },
  });

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-slate-300 px-6 py-12 flex flex-col items-center overflow-hidden">
      <section className="text-center mb-10">
        <h1 className="text-neutral-800 text-6xl md:text-8xl font-bold leading-tight">
          같은 학교, 더 가까운 연결
        </h1>
        <p className="mt-6 text-zinc-500 text-2xl md:text-4xl font-semibold">
          동아리 관리와 커피챗을 통한 협업 제안을 더 쉽게 해보세요
        </p>
      </section>

      <section className="w-full max-w-127.5 min-h-180 bg-slate-50 rounded-[44px] border border-slate-600/20 flex flex-col items-center px-10 py-14">
        <img
          src={logo}
          alt="LOGO"
          className="h-40 w-auto mb-10 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <div className="w-full text-center mb-10">
          <h3 className="text-neutral-800 text-3xl font-bold mb-3">로그인</h3>
          <p className="text-neutral-800 text-sm">
            로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다
          </p>
        </div>

        {/* 구글 로그인 버튼 - 여기는 살짝 달라질 수도 있음 */}
        <button
          className="w-full h-12 rounded-full border border-zinc-900 flex items-center justify-center
          relative hover:bg-slate-100 transition"
          onClick={() => googleLogin()}
        >
          <img
            className="w-7 h-7 absolute left-3"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          <span className="text-black text-base font-medium">
            Google로 로그인
          </span>
        </button>

        <div className="mt-16 text-center">
          <h3 className="text-sky-950 text-5xl font-extrabold">CoffeeChat</h3>
          <p className="mt-4 text-neutral-800/80 text-base">
            쉽게 접근할 수 있는 커피챗을 활용해보세요!
          </p>
        </div>

        <div className="w-full mt-6 bg-slate-50 rounded-[20px] shadow-[0px_4px_12px_rgba(0,0,0,0.15)] p-5 flex flex-col gap-4">
          <ChatBubble align="left">
            안녕하세요~ 프로필 보고 연락드렸습니다~
          </ChatBubble>

          <ChatBubble align="right">
            안녕하세요! 어떤 부분이 궁금하신가요?
          </ChatBubble>

          <ChatBubble align="left">
            혹시 웹 서비스 프로젝트에 관심 있으신가요??
          </ChatBubble>
        </div>
      </section>
    </main>
  );
}

function ChatBubble({ children, align = "left" }) {
  const isRight = align === "right";

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] rounded-2xl bg-neutral-800/20 px-4 py-3 text-black text-sm md:text-base">
        {children}
      </div>
    </div>
  );
}
