# 프로젝트 다크모드 구현 보고서

## 구조 분석

- 설치된 버전: React 19.2.5, TailwindCSS 4.2.2, Vite 8.0.8. `package.json`의 버전 범위 및 잠금 파일은 변경하지 않았다.
- Tailwind는 `vite.config.js`의 `@tailwindcss/vite` 플러그인과 `src/index.css`의 CSS import로 구성된다. 별도 Tailwind 설정 파일은 필요하지 않다.
- `main.jsx`에서 Google OAuth → React Query → BrowserRouter → AuthProvider → App을 구성한다. 인증 상태는 Context API를 사용하고 서버 상태는 React Query로 관리한다. Zustand는 의존성에 있지만 실제 사용 코드는 없다.
- App은 공통 Header/Footer와 Routes를 렌더링한다. 전역 스타일은 index.css, 캘린더 전용 스타일은 ClubCalendar.css다. App.css는 이번 테마 적용 대상이 아닌 초기 예제 스타일이다.
- 기존 색상은 Tailwind 유틸리티 중심이며, 헤더·푸터·채팅 아바타·캘린더에는 고정 색상이 별도로 있다. 기존 의미 기반 테마 토큰은 없었다.
- 헤더 오른쪽 버튼 묶음에 64×40px 슬라이드 스위치를 추가했다. 모바일에서도 드롭다운 없이 한 번 눌러 전환한다.

## 구현 방식

`ThemeProvider`는 기존 Context 방식으로 `theme`, `resolvedTheme`, `setTheme`를 공유한다. `useTheme()`으로 재사용한다. 사용자가 선택할 수 있는 모드는 `light`, `dark` 두 가지다. 최초 접속처럼 저장된 설정이 없거나 잘못된 값이면 내부적으로 시스템 테마를 따른다. 기존에 저장된 `system` 값도 같은 초기 자동 처리로 호환한다. 시스템은 UI의 선택지로 제공하지 않는다.

`useSyncExternalStore`로 운영체제의 `prefers-color-scheme` 변경을 구독한다. 명시적 Light/Dark 선택은 OS 설정보다 우선한다. 최신 및 기존 MediaQueryList 이벤트 등록 방식을 지원하고 언마운트 시 리스너를 제거한다.

선택 즉시 `capstone-theme` 키로 localStorage에 저장하고 `<html>`의 `.dark`, `data-theme`, `color-scheme`을 갱신한다. 저장소 접근 실패 시 현재 세션에서는 선택을 유지한다. 다른 탭의 설정 변경 또는 저장소 초기화도 storage 이벤트로 동기화한다. matchMedia가 없거나 접근에 실패하면 System을 Light로 처리한다.

`index.html`의 head 스크립트가 CSS와 React 렌더링 전에 저장된 설정을 적용한다. [TailwindCSS 4 공식 다크모드 방식](https://tailwindcss.com/docs/dark-mode)에 맞춰 `@custom-variant dark`를 선언하고, `@theme inline`으로 CSS 변수를 Tailwind 색상 유틸리티에 연결했다.

## 색상 및 UI

- `src/theme.css`에서 페이지/표면/보조 표면, 텍스트/보조 텍스트, 테두리, 링크, 포커스, 그림자, 비활성화, 성공/오류/경고 색상을 관리한다.
- 다크모드 기본 배경은 네이비 계열이며 파란색 브랜드 버튼을 유지한다. 상태 메시지는 밝은 상태 색상과 어두운 상태 배경을 조합한다.
- 기존 라이트모드 Tailwind 클래스는 유지하고 `dark:*` 변형만 추가했다. 헤더/푸터 등의 기존 고정 색상은 동일한 라이트 값의 CSS 변수로 옮겼다.
- 입력창, placeholder, select/option, hover/focus/disabled 상태, 모달, 드롭다운, 카드, 테이블, 목록, 로딩/빈 화면/오류 화면을 적용했다.
- FullCalendar의 자체 배경/테두리 변수와 버튼/오늘/일정/팝오버도 테마를 따른다. 채팅 아바타와 양방향 메시지 버블, 입력창도 테마를 따른다.
- 스위치를 누르면 라이트/다크가 즉시 전환된다. 해/달 아이콘과 손잡이가 약 280ms 동안 슬라이드하고 아이콘이 교차 전환된다. 화면 배경/글자/테두리 색상도 부드럽게 바뀌며 초기 렌더링에는 애니메이션을 적용하지 않는다. 연속 클릭 시 기존 타이머를 정리하고 언마운트 시에도 정리한다.
- 접근성 레이블, `role="switch"`, `aria-checked`, Space/Enter 키보드 조작을 지원한다. `prefers-reduced-motion` 사용자는 애니메이션 없이 전환된다.
- 헤더 로고는 다크모드에서 헤더와 같은 배경색을 사용하고 흰색 받침 그림자를 제거했다. 로그인·푸터 로고는 흰색 받침을 사용한다. 원본 이미지와 SVG 파일은 변경하지 않았다. 사진 위 흰색 아이콘, 캐러셀 표시점, 어두운 이미지/모달 오버레이는 유지했다.
- 서비스, API 요청, 인증/채팅 로직, 라우팅, 환경변수, 패키지는 변경하지 않았다.

## 라우팅 범위

현재 존재하는 다음 라우트의 화면 및 관련 컴포넌트를 적용했다. 없는 회원가입/설정/토스트 화면은 새로 만들지 않았다.

| 영역 | 라우트 |
| --- | --- |
| 홈 | `/` |
| 인증 | `/login`, `/email-verify` |
| 협업/모집 | `/cooperation`, `/cooperation/:type/:id` |
| 커피챗 | `/coffee-chat`, `/coffee-chat/profile/:userId`, `/coffee-chat/user-list` |
| 내 동아리 | `/club/main`, `/club/main/:clubId` |
| 동아리 신청/생성 | `/club/apply`, `/club/apply/:clubId`, `/club/create` |
| 동아리 게시물 | `/club/post`, `/clubs/:clubId/posts/create`, `/clubs/:clubId/posts/:postId`, `/club/posts/:id` |
| 동아리 관리 | `/club/president/:clubId` |
| 마이페이지 | `/my-page` |

## 추가한 파일

- `src/context/ThemeContext.js`
- `src/context/ThemeProvider.jsx`
- `src/hooks/useTheme.js`
- `src/utils/theme.js`
- `src/utils/theme.test.js`
- `src/theme.css`
- `src/components/common/ThemeSwitcher.jsx`
- `scripts/check-theme-browser.mjs`
- `docs/dark-mode.md`

## 수정한 파일

- `index.html`
- `src/main.jsx`
- `src/index.css`
- `src/components/common/Header.jsx`
- `src/components/common/Footer.jsx`
- `src/components/common/ImageFilePicker.jsx`
- `src/components/card/ClubCalendar.css`
- `src/components/card/ClubCalendar.jsx`
- `src/components/card/ClubPostOrderEditor.jsx`
- `src/components/card/CoffeeChatCard.jsx`
- `src/components/card/CoffeeChatListCard.jsx`
- `src/components/card/CollaboCard.jsx`
- `src/components/card/EditInputLabel.jsx`
- `src/components/card/FeedCard.jsx`
- `src/components/card/InputLabel.jsx`
- `src/components/card/MyPageCard.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/EmailVerifyPage.jsx`
- `src/pages/home/MainPage.jsx`
- `src/pages/myPage/MyPage.jsx`
- `src/pages/club/ClubApplicationPage.jsx`
- `src/pages/club/ClubCreationPage.jsx`
- `src/pages/club/ClubDetailPage.jsx`
- `src/pages/club/ClubMainPage.jsx`
- `src/pages/club/ClubPostCreatePage.jsx`
- `src/pages/club/ClubPostDetail.jsx`
- `src/pages/club/ClubPostPage.jsx`
- `src/pages/club/PresidentPage.jsx`
- `src/pages/coffeeChat/ChatRoom.jsx`
- `src/pages/coffeeChat/CoffeeChatPage.jsx`
- `src/pages/coffeeChat/CoffeeChatProfilePage.jsx`
- `src/pages/coffeeChat/CoffeeChatUserListPage.jsx`
- `src/pages/cooperation/CooperationPage.jsx`
- `src/pages/cooperation/PostDetailPage.jsx`
- `src/pages/cooperation/RecruitmentActions.jsx`

## 검증 결과

| 검증 | 결과 |
| --- | --- |
| `npm run build` | 성공. 기존 대형 JS 청크 경고는 남아 있다. |
| `node --test src/utils/*.test.js src/services/*.test.js` | 기존 12개 + 테마 6개, 총 18개 통과. |
| 신규 테마 코드·헤더·푸터·브라우저 검사 스크립트 ESLint | 통과. |
| `npm run lint` | 기존 오류 4개, 경고 5개. HEAD의 원본 파일과 비교해 동일한 규칙/개수임을 확인했다. |
| `git diff --check` | 통과. |
| 실제 headless Chrome에서 초기 시스템 테마/두 가지 선택 | 첫 접속 OS 적용, 라이트/다크 토글, 수동 모드 우선 적용 통과. |
| 스위치 애니메이션/접근성 | 280ms 이동, 양방향 이동 거리, Space 키 조작, aria-checked, reduced motion 확인. 드롭다운 없음. |
| 설정 유지 | SPA 페이지 이동, 새로고침, storage 이벤트 동기화 통과. 초기 head 스크립트도 저장/OS 조합 테스트 통과. |
| 헤더 반응형 | 320/768/1024px에서 버튼들이 화면 안에 배치되는지 확인. |
| 페이지 렌더링 | 375/1440px에서 18개 라우트/뷰와 로그인·이메일 인증 화면 확인. 큰 흰색 패널이 남지 않는지 검사. |
| 상태별 화면 | 모집 모달의 입력/포커스, 캘린더/일정 모달, 수신/발신 채팅 버블과 입력창, 목록 빈 화면/오류 화면 통과. |
| 유저 리스트 | 모바일 가로 넘침 없음. 모바일/데스크톱 캡처 육안 확인. |
| 색상 대비 | 주요 다크 텍스트/상태 메시지/아바타/활성 버튼 색상 조합의 일반 텍스트 WCAG AA 4.5:1 자동 검사 통과. |
| 브라우저 예외 | 검사 중 처리되지 않은 JavaScript 예외 없음. |

브라우저 검사는 Node 22의 내장 WebSocket과 설치된 Chrome/Edge로 실행하며 새 패키지가 필요 없다. API는 테스트 데이터로 대체한다. 테스트 과정에서 실서버에 쓰기 요청을 보내지 않는다.

```sh
npm run build
node --test src/utils/*.test.js src/services/*.test.js
node scripts/check-theme-browser.mjs
```

Windows PowerShell이 npm.ps1 실행을 차단하는 환경에서는 `npm.cmd` / `npx.cmd`를 사용한다. 브라우저 자동 발견이 안 되면 `THEME_TEST_BROWSER`에 실행 파일 경로를 지정한다.

## 남은 문제 및 검증 한계

- 기존 전체 ESLint 오류: AuthContext의 컴포넌트 외 export, ClubPostPage 및 MyPage의 effect 내부 동기 setState. 기존 경고: ChatRoom, CooperationPage, MyPage의 effect 의존성. 테마와 무관한 로직은 수정하지 않았다.
- 모바일 가로 넘침이 기존 `/coffee-chat`, `/coffee-chat/profile/2`, `/club/main/1`, `/club/main/1?tab=calendar` 화면에 남아 있다. 기존 채팅 2단 너비, 프로필 고정 너비 카드, 동아리/캘린더 레이아웃을 유지했으며 이번 작업에서는 색상만 변경했다. 해당 화면의 모바일 레이아웃은 별도 개선이 필요하다.
- 실제 iOS/Android 기기, Safari/Firefox, 스크린리더 전체 탐색은 미검증이다. Chromium에서 화면 크기와 OS 테마를 에뮬레이션했다.
- 실제 Google OAuth, 실서버 API, WebSocket 메시지 송수신 및 모든 데이터/권한 조합은 미검증이다. API/비즈니스 코드는 그대로 유지하고 기존 단위 테스트를 실행했다. 테스트의 의도적인 API 오류와 외부 리소스 차단은 운영 콘솔 검증을 대체하지 않는다.
- native alert/confirm 및 Google이 제공하는 외부 로그인 UI는 브라우저/제공자의 테마 처리 범위다.
- 대비 검사는 공통 토큰의 주요 조합에 대한 검사이며, 모든 사용자 이미지/텍스트/배경 조합의 접근성 감사를 대체하지 않는다.
- 추가 개선 후보는 기존 모바일 고정 너비 해소, 기존 lint 오류 정리, 라우트별 코드 분할을 통한 청크 경고 완화다.
