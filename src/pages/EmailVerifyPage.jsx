import { useRef, useState } from "react";
import { sendSchoolEmailCode, verifySchoolEmailCode, resendSchoolEmailCode } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

export default function EmailVerifyPage() {
  const navigate = useNavigate();

  const [schoolEmail, setSchoolEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const inputRefs = useRef([]);

  const isCodeComplete = code.every((digit) => digit !== "");
  
  const isValidSchoolEmail = schoolEmail.endsWith("@office.skhu.ac.kr");

  // 인증코드 발송
  const sendCodeMutation = useMutation({
    mutationFn: sendSchoolEmailCode,

    onSuccess: () => {
      setIsCodeSent(true);
      alert("인증번호가 발송되었습니다.");
    },

    onError: (error) => {
      console.error(error);
      alert("인증번호 발송에 실패했습니다.");
    }
  })

  // 인증코드 인증
  const verifyCodeMutation = useMutation({
    mutationFn: verifySchoolEmailCode,

    onSuccess: () => {
      alert("학교 이메일 인증이 완료되었습니다.");
      navigate("/");
    },
    onError: (error) => {
      console.error(error);
      alert("인증번호가 올바르지 않거나 만료되었습니다.");
    }
  })

  // 인증코드 재발송
  const resendCodeMutation = useMutation({
    mutationFn: resendSchoolEmailCode,

    onSuccess: () => {
      alert("인증번호가 재전송되었습니다.");
    },
    onError: (error) => {
      console.error(error);
      alert("인증번호 재전송에 실패했습니다.");
    }
  })

  const handleCodeChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextCode = [...code];
    nextCode[index] = value;
    setCode(nextCode);

    if (value && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = () => {
    sendCodeMutation.mutate(schoolEmail);
  };

  const handleSubmit = () => {
    verifyCodeMutation.mutate({
      schoolEmail,
      code: code.join(""),
    })
  };

  const handleResendCode = () => {
    resendCodeMutation.mutate(schoolEmail);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 flex justify-center">
      <div className="w-full max-w-100 flex flex-col items-center">
        <section className="w-full flex flex-col items-center gap-10">
          <h1 className="text-center text-gray-900 text-3xl font-bold leading-8">
            학생 인증을 위해
            <br />
            학교 이메일을 작성해주세요
          </h1>

          <input
            value={schoolEmail}
            onChange={(e) => setSchoolEmail(e.target.value)}
            placeholder="학교 이메일 입력"
            className="w-full h-10 px-4 bg-blue-900/10 rounded-2xl outline-none text-base text-slate-900 placeholder:text-slate-900/40"
          />

          <button
            onClick={handleSendCode}
            disabled={!isValidSchoolEmail || isCodeSent}
            className="w-full h-10 rounded-2xl bg-blue-600 text-slate-50 text-base font-medium transition
            enabled:hover:cursor-pointer disabled:opacity-50 disabled:hover:cursor-not-allowed"
          >
            {isCodeSent ? "인증번호 전송 완료" : "인증번호 발송"}
          </button>
        </section>

        <section className="w-full mt-5 flex flex-col items-center">
          <h2 className="text-center text-gray-900 text-3xl font-bold leading-8">
            인증코드
          </h2>

          <p className="mt-2.5 text-center text-gray-900 text-base leading-5">
            이메일로 전송된 코드를 아래에 작성해주세요
          </p>

          <div className="mt-10 flex justify-center items-center gap-3.5">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(index, e)}
                maxLength={1}
                inputMode="numeric"
                className="w-14 h-16 bg-blue-900/10 rounded-2xl outline-none text-center text-slate-900 text-xl placeholder:text-slate-900/40"
                placeholder=""
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isCodeComplete}
            className="w-full h-10 mt-10 rounded-2xl bg-blue-600 text-slate-50 text-base font-medium transition
            enabled:hover:cursor-pointer disabled:opacity-50 disabled:hover:cursor-not-allowed"
          >
            Submit
          </button>

          {isCodeSent && (
            <button
              type="button"
              onClick={handleResendCode}
              className="mt-10 text-blue-600 text-base hover:cursor-pointer"
            >
              메일을 받지 못하셨나요? 인증번호 재전송
            </button>
          )}
        </section>
      </div>
    </main>
  );
}