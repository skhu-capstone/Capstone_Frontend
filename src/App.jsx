import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/home/MainPage";
import CooperationPage from "./pages/cooperation/CooperationPage";
import CoffeeChatPage from "./pages/coffeeChat/CoffeeChatPage";
import ClubMainPage from "./pages/club/ClubMainPage";
import MyPage from "./pages/myPage/MyPage";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/cooperation" element={<CooperationPage />} />
        <Route path="/coffee-chat" element={<CoffeeChatPage />} />
        <Route path="/club" element={<ClubMainPage />} />
        <Route path="/my-page" element={<MyPage />} />
        {/* 추가 라우트는 여기에 */}
      </Routes>
    </>
  );
}
