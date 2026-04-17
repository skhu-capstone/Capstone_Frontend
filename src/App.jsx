import CollaboCard from "./components/common/CollaboCard";

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold text-blue-500">Tailwind 작동 확인!</h1>
      <CollaboCard
        title="동아리 협업 모집"
        author="윤현승"
        time="3시간 전"
        content="디자인 파트와 협업할 프론트엔드 팀원을 모집합니다."
        dDay="D-03"
      />
    </>
  );
}
export default App;
