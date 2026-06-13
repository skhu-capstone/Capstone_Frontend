import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createClubPost } from "../../services/clubService";

export default function ClubPostCreatePage() {
  const navigate = useNavigate();
  const { clubId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreatePost = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    
    createPostMutation.mutate({
      clubId,
      title,
      content,
      imageUrls: [],
    });
  };

  const isFormValid = title.trim() && content.trim();

  const createPostMutation = useMutation({
    mutationFn: createClubPost,

    onSuccess: () => {
      alert("게시물이 등록되었습니다.");
      navigate("/club/main");
    },

    onError: (error) => {
      console.error(error);
      alert("게시물 등록에 실패했습니다.");
    },
  });

  return (
    <main className="min-h-screen bg-[#F7F8FA] px-16 py-14">
      <section className="max-w-295 mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#1F2937]">
            멋쟁이사자처럼
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            동아리 피드에 공유할 게시물을 작성해주세요.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.12)] p-8">
          <h2 className="text-2xl font-bold mb-8">게시물 작성</h2>

          <div className="mb-7">
            <label className="block mb-3 text-sm font-semibold">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시물 제목을 입력해주세요"
              className="w-full h-12 px-4 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-7">
            <label className="block mb-3 text-sm font-semibold">
              내용
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="동아리원들에게 공유할 내용을 작성해주세요"
              className="w-full h-64 px-4 py-4 border border-gray-300 rounded-lg resize-none outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-10">
            <label className="block mb-3 text-sm font-semibold">
              이미지 첨부
            </label>

            <label className="flex flex-col items-center justify-center h-52 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
              <span className="text-gray-500 text-sm">
                이미지를 클릭해서 업로드해주세요
              </span>
              <span className="mt-2 text-xs text-gray-400">
                PNG, JPG 파일 지원
              </span>
              <input type="file" className="hidden" />
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-24 h-11 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              취소
            </button>

            <button
              onClick={handleCreatePost}
              disabled={!isFormValid || createPostMutation.isPending}
              className="w-24 h-11 bg-[#0B72B9] text-white rounded-lg hover:bg-[#095f9b] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {createPostMutation.isPending ? "등록 중" : "등록"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}