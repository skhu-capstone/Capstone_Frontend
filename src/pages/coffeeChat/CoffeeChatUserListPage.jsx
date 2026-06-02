import { useState } from "react";
import CoffeeChatListCard from "../../components/card/CoffeeChatListCard";

const dummyUsers = Array.from({ length: 45 }, (_, index) => ({
  id: index + 1,
  name: "윤현승",
  introduction: "이 텍스트는 한 줄 자기소개를 작성한 겁니다",
  interests: ["Frontend", "Design"],
  preferredMethod: ["대면", "비대면"],
  club: "멋쟁이사자처럼",
  profileImage: "",
}));

export default function CoffeeChatUserListPage() {
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;
  const totalPage = Math.ceil(dummyUsers.length / itemsPerPage);

  const startIndex = (page - 1) * itemsPerPage;
  const currentUsers = dummyUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-12 py-14">
      <section className="mx-auto max-w-360">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Coffee Chat User List
          </h1>

          <input
            type="text"
            className="h-12 w-80 rounded-lg border border-blue-400 bg-white px-4 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-10">
          {currentUsers.map((user) => (
            <CoffeeChatListCard key={user.id} user={user} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPage }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-9 w-9 rounded-full text-sm ${
                  page === pageNumber
                    ? "bg-blue-600 text-white"
                    : "text-gray-500"
                }`}
              >
                {pageNumber}
              </button>
            ),
          )}

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
            className="ml-2 text-2xl text-gray-600"
          >
            ›
          </button>
        </div>
      </section>
    </main>
  );
}