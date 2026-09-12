# 🪑 학급 자리 배치 도우미 (Classroom Seat Helper)

초·중·고등학교 선생님들을 위한 직관적이고 모던한 교실 좌석 배치 웹 애플리케이션입니다.

🔗 **배포 주소:** [https://siyeonscience.github.io/hackthon/](https://siyeonscience.github.io/hackthon/)

---

## ✨ 주요 기능

1. **무작위 자리 섞기 (랜덤 배치)**
   - 애니메이션 및 축하 효과(Confetti)와 함께 부드럽게 좌석을 무작위로 배치합니다.
   - 효과음 On/Off 토글 지원

2. **좌석 고정 기능**
   - 시력, 키, 배려가 필요한 학생의 자리를 미리 정하고 자물쇠 아이콘으로 고정할 수 있습니다.
   - 자리 섞기를 실행해도 고정된 좌석은 유지됩니다.

3. **1:1 원클릭 자리 맞바꾸기**
   - 두 좌석을 순서대로 클릭하여 손쉽게 자리를 바꿀 수 있습니다.

4. **교실 크기 및 인원 설정**
   - 행/열 크기 (1~8행, 1~10열) 및 총 학생 수를 유연하게 설정할 수 있습니다.
   - 단독 책상 배치 및 2열 짝꿍 분단 레이아웃 지원

5. **학생 명단 관리**
   - 일괄 텍스트 붙여넣기(엑셀/한글 명단 호환)로 전체 학생 번호와 이름을 한 번에 등록/수정할 수 있습니다.
   - 좌석 카드에서 학생 이름 인라인 즉시 수정 가능

6. **교사 시점 / 학생 시점 전환**
   - 교탁 기준(교사 시점) 및 칠판 기준(학생 시점) 180도 반전 시점 지원

7. **실시간 자동 저장 및 인쇄 지원**
   - 브라우저 LocalStorage에 실시간 자동 저장되어 새로고침 후에도 유지
   - A4 가로/세로 최적화 깔끔한 인쇄(Print) 레이아웃 제공

---

## 🛠️ 기술 스택

- **Frontend**: React 19, Vite, Vanilla CSS
- **Icons**: Lucide React
- **Effects**: Canvas Confetti, Web Audio API
- **Storage**: Browser LocalStorage (서버/DB 불필요)
- **Deployment**: GitHub Pages (GitHub Actions 자동 배포)

---

## 🚀 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```
