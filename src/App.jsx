import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/home/MainPage";
import CooperationPage from "./pages/cooperation/CooperationPage";
import CoffeeChatPage from "./pages/coffeeChat/CoffeeChatPage";
import ClubMainPage from "./pages/club/ClubMainPage";
import MyPage from "./pages/myPage/MyPage";
import EmailVerifyPage from "./pages/EmailVerifyPage";
import Footer from "./components/common/Footer";
import CoffeeChatProfilePage from "./pages/coffeeChat/CoffeeChatProfilePage";
import CoffeeChatUserListPage from "./pages/coffeeChat/CoffeeChatUserListPage";
import ClubPostPage from "./pages/club/ClubPostPage";

import PostDetailPage from "./pages/cooperation/PostDetailPage";
import ClubPostDetail from "./pages/club/ClubPostDetail";
export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/cooperation" element={<CooperationPage />} />
        <Route path="/coffee-chat" element={<CoffeeChatPage />} />
        <Route path="/club/main" element={<ClubMainPage />} />
        <Route path="/my-page" element={<MyPage />} />
        <Route path="/email-verify" element={<EmailVerifyPage />} />
        <Route path="/coffee-chat/profile/:userId" element={<CoffeeChatProfilePage />} />
        <Route path="/coffee-chat/user-list" element={<CoffeeChatUserListPage />} />
        <Route path="/club/post" element={<ClubPostPage />} />
        {/* 추가 라우트는 여기에 */}
        <Route path="/post/:type/:id" element={<PostDetailPage />} />
        <Route path="/club/:id" element={<ClubPostDetail />} />
      </Routes>
      <Footer />
    </>
  );
}
