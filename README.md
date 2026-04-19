# ☕ 커피 추출 일지 PWA — 완전 초보자용 가이드

안녕하세요! 이 문서는 **개발 경험이 전혀 없는 Windows 사용자**가 이 커피 앱을 직접 PWA로 만들어서 친구에게 공유할 수 있도록 작성되었습니다.

**예상 소요 시간: 1~2시간**

하나씩 따라 해보시면 분명히 완성하실 수 있어요. 막히는 부분이 있으면 Claude에게 에러 메시지를 복사해서 물어보세요.

---

## 📋 전체 흐름 한눈에 보기

```
[1단계] Node.js 설치  (한 번만)          — 15분
[2단계] VS Code 설치 (한 번만, 선택)      — 10분
[3단계] 프로젝트 압축 해제               — 1분
[4단계] 터미널에서 npm install          — 5분
[5단계] 로컬에서 실행해보기              — 1분
[6단계] GitHub 계정 만들기 (한 번만)     — 10분
[7단계] Vercel로 배포                   — 15분
[8단계] 친구에게 링크 공유! 🎉
```

---

# 🔧 1단계: Node.js 설치

**Node.js가 뭔가요?**  
JavaScript를 컴퓨터에서 실행하게 해주는 프로그램이에요. 우리 앱의 "엔진" 같은 거예요.

### 설치 방법

1. **공식 사이트 접속**: [https://nodejs.org](https://nodejs.org)
2. 큰 초록색 버튼 중 **"LTS"** 버전 클릭 (LTS = 안정 버전)
3. 다운로드된 `.msi` 파일 실행
4. **설치 옵션**은 전부 기본값으로 두고 **"Next" 계속 클릭** → **"Install"**
5. 중간에 "Tools for Native Modules" 창이 나오면 **체크하지 말고** Next (시간 많이 걸림)
6. 완료되면 **"Finish"**

### 설치 확인

1. 키보드 `Windows 키 + R` → **`cmd`** 입력 → Enter
2. 검은 창(명령 프롬프트)이 열리면 아래 명령어를 차례로 입력:

```
node --version
```
→ `v20.11.0` 같은 숫자가 나오면 성공! ✅

```
npm --version
```
→ `10.2.4` 같은 숫자가 나오면 성공! ✅

❌ **"인식할 수 없는 명령"이라고 뜨면?**  
→ 컴퓨터를 재부팅한 후 다시 확인해보세요.

---

# 💻 2단계: VS Code 설치 (선택, 추천)

**VS Code가 뭔가요?**  
코드를 보기 편하게 만들어주는 에디터입니다. 메모장보다 훨씬 편해요.

### 설치 방법

1. [https://code.visualstudio.com](https://code.visualstudio.com) 접속
2. **"Download for Windows"** 클릭 → 설치 파일 실행
3. 약관 동의 → **"다음" 계속** → 설치 완료

---

# 📂 3단계: 프로젝트 압축 해제

1. 같이 드린 **`coffee-journal-pwa.zip`** 파일을 원하는 위치에 압축 해제
   - 추천 위치: `C:\projects\coffee-journal-pwa`
2. 압축 해제 후 폴더를 열어보면 이런 파일들이 있어야 해요:
   ```
   ├── public/
   │   ├── icon-192.png
   │   └── icon-512.png
   ├── src/
   │   ├── App.jsx
   │   ├── main.jsx
   │   └── index.css
   ├── index.html
   ├── package.json
   ├── vite.config.js
   └── README.md  ← 지금 보고 있는 이 파일
   ```

---

# ⚙️ 4단계: 라이브러리 설치 (`npm install`)

**이게 무엇인가요?**  
앱이 작동하는 데 필요한 부품들(React, Vite 등)을 자동으로 다운로드하는 과정입니다.

### 방법

1. 압축 해제한 **폴더를 열어주세요** (예: `C:\projects\coffee-journal-pwa`)
2. 폴더 빈 공간에서 **Shift 키를 누른 채 마우스 우클릭**
3. **"여기서 터미널 열기"** 또는 **"여기서 PowerShell 열기"** 클릭
   - 만약 이 옵션이 없으면:
     - 주소창 클릭 → `cmd` 입력 → Enter
4. 열린 터미널에 아래 명령어 입력:

```
npm install
```

5. Enter 누르고 **2~5분 대기** (진행 바가 왔다갔다 하고 글자들이 쭉쭉 나옴 — 정상입니다)
6. 완료되면 `node_modules` 라는 새 폴더가 생겼을 거예요 ✅

❌ **에러가 뜨면?**  
→ 메시지 복사해서 Claude에게 보여주세요

---

# 🚀 5단계: 로컬에서 실행해보기

배포 전에 내 컴퓨터에서 잘 작동하는지 확인해봅시다!

### 방법

터미널에 이어서 입력:

```
npm run dev
```

2~3초 후 이런 메시지가 나옵니다:

```
  VITE v5.3.1  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

1. **`http://localhost:5173/`** 를 **Ctrl+클릭** 하거나, 브라우저에서 직접 주소창에 입력
2. 🎉 커피 앱이 나타납니다!

### 테스트해볼 것

- [ ] 새 원두 등록 후 기록 저장
- [ ] 브라우저를 닫았다가 다시 열어도 **데이터가 유지되는지** 확인 (localStorage 작동 확인)
- [ ] 백업 내보내기로 JSON 파일이 잘 다운로드되는지
- [ ] 원두별 탭에서 잘 그룹화되는지

### 터미널 끄는 법

터미널에서 **`Ctrl + C`** → 서버 종료

---

# 🌐 6단계: GitHub 계정 만들기

**GitHub이 뭔가요?**  
코드를 온라인에 올려놓는 창고입니다. Vercel에 배포하려면 필요해요.

### 가입 방법

1. [https://github.com](https://github.com) 접속
2. **"Sign up"** 클릭
3. 이메일, 비밀번호, 사용자명 입력
4. 이메일로 온 인증 코드 입력
5. 간단한 설문 (스킵 가능)

### GitHub Desktop 설치 (가장 쉬운 방법)

터미널로 Git 명령어 쓰기 어려우니, GUI 프로그램을 쓰면 편해요.

1. [https://desktop.github.com](https://desktop.github.com) 접속
2. **"Download for Windows"** → 설치
3. 실행 후 GitHub 계정으로 **로그인**

### 프로젝트를 GitHub에 업로드

1. GitHub Desktop 열기
2. 메뉴 **"File" → "Add Local Repository"**
3. 우리 프로젝트 폴더(`C:\projects\coffee-journal-pwa`) 선택
4. "This directory does not appear to be a Git repository" 메시지 → **"create a repository"** 클릭
5. 팝업에서:
   - Name: `coffee-journal-pwa` (또는 원하는 이름)
   - Description: `나의 커피 추출 일지 앱`
   - **"Create Repository"**
6. 상단 **"Publish repository"** 버튼 클릭
7. **"Keep this code private"** 체크 해제 (공개로 해야 Vercel 무료 배포 가능)
8. **"Publish Repository"** 클릭

→ GitHub에 올라갔습니다! ✅

---

# 🎯 7단계: Vercel로 배포하기

**Vercel이 뭔가요?**  
우리 앱을 **인터넷에 공개된 주소로 올려주는 서비스**입니다. 무료이고, GitHub과 연동되어 매우 쉽습니다.

### 배포 방법

1. [https://vercel.com](https://vercel.com) 접속
2. **"Sign Up"** → **"Continue with GitHub"** 선택
3. GitHub 권한 허용
4. 로그인 후 대시보드에서 **"Add New..." → "Project"** 클릭
5. 방금 만든 `coffee-journal-pwa` 저장소 옆의 **"Import"** 클릭
6. 설정 화면에서:
   - Framework Preset: **Vite** (자동 감지됨)
   - 나머지는 기본값 그대로
7. **"Deploy"** 클릭!
8. 1~2분 대기... 🎊 완료되면 폭죽 애니메이션이 나옵니다
9. **"Visit"** 또는 URL 클릭 → 내 앱이 인터넷에!

### 내 앱 주소

예: `https://coffee-journal-pwa-abc123.vercel.app`

**이 주소를 친구한테 보내면 끝!** 🎉

---

# 📱 8단계: 홈 화면에 설치하기 (PWA!)

드디어 PWA의 마법을 경험할 시간입니다.

### 📲 안드로이드 스마트폰

1. Chrome 브라우저로 앱 주소 접속
2. 주소창 옆 **"⋮" 메뉴** → **"앱 설치"** 또는 **"홈 화면에 추가"**
3. 홈 화면에 커피잔 아이콘이 생김 ✨
4. 아이콘 탭하면 **전체 화면 앱**으로 열림!

### 📲 아이폰

1. Safari로 앱 주소 접속
2. 하단 **공유 버튼** (네모에 화살표) 탭
3. 스크롤 내려서 **"홈 화면에 추가"** 탭
4. **"추가"** 탭
5. 홈 화면에 앱 아이콘 생김 ✨

### 🖥️ 컴퓨터 (Chrome, Edge)

1. 브라우저로 앱 주소 접속
2. 주소창 오른쪽에 **설치 아이콘(➕ 또는 💻)** 클릭
3. **"설치"** 클릭
4. 바탕화면에 아이콘 생김!

---

# 👥 친구와 공유하는 법

### 방법 1: URL 링크 공유 (가장 간단)
```
https://coffee-journal-pwa-abc123.vercel.app
```
카톡, 메시지 등으로 주소 보내면 끝.

### 방법 2: QR 코드 만들기
1. [https://qr-code-generator.com](https://qr-code-generator.com) 접속
2. 앱 주소 붙여넣기
3. QR 코드 생성 → 이미지 다운로드
4. 친구한테 보내면 카메라로 스캔해서 접속!

**⚠️ 중요 참고사항**  
친구 각자의 브라우저에 **각자의 데이터**가 저장됩니다. 내 기록이 친구에게 보이거나 하지 않아요. 개인 일지처럼 작동합니다.

---

# 🔄 나중에 앱을 수정하고 싶다면?

Claude에게 "이 기능 추가해줘" 라고 요청하면 수정된 코드를 받을 수 있어요.

### 수정 사항 반영 방법

1. 받은 새 코드로 해당 파일 덮어쓰기
2. GitHub Desktop 열기 → 변경사항이 자동 감지됨
3. 하단 **"Summary"** 칸에 "기능 추가" 같은 간단한 메모 입력
4. **"Commit to main"** → 상단 **"Push origin"** 클릭
5. **Vercel이 자동으로 재배포** (1~2분)
6. 끝! 

→ 이게 바로 현대 개발의 위력입니다 ✨

---

# ❓ 자주 겪는 문제

### Q1. `npm install`이 에러로 끝나요
- 인터넷 연결 확인
- 터미널을 **관리자 권한으로** 열어서 재시도
- `npm cache clean --force` 후 재시도

### Q2. 앱은 켜졌는데 화면이 흰색이에요
- 브라우저 **F12** → **Console** 탭 → 빨간 에러 메시지 확인
- 에러 메시지 Claude에게 복사해서 문의

### Q3. Vercel 배포 시 **"Build failed"**
- Vercel 로그의 에러 메시지 Claude에게 보여주세요
- 대부분 `package.json` 의존성 문제

### Q4. 친구 폰에서 앱이 작동 안 해요
- HTTPS 주소인지 확인 (`https://`로 시작)
- 브라우저가 Chrome/Safari인지 확인
- Private/시크릿 모드에서는 일부 기능 제한될 수 있음

### Q5. localStorage 데이터가 사라졌어요
- 브라우저 쿠키/캐시 삭제하면 함께 지워져요
- **꼭 주기적으로 "백업 내보내기"** 로 JSON 백업해두세요!

---

# 📚 더 공부하고 싶다면

- **React 기초**: [https://ko.react.dev](https://ko.react.dev)
- **Vite**: [https://vitejs.dev](https://vitejs.dev)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **PWA 공식 가이드**: [https://web.dev/progressive-web-apps](https://web.dev/progressive-web-apps)

---

# 💬 도움이 필요하면?

막히는 부분이 있으면 Claude에게 이렇게 물어보세요:

> "커피 앱 PWA 배포 중 [단계 이름]에서 막혔어요. 에러 메시지: [복사해서 붙여넣기]"

화이팅! ☕✨
