# 매일함 웹

 배포 주소: <https://maeilham.github.io>

## 시작하기

Node 22, pnpm 9 기준입니다(CI와 같음).

```sh
pnpm install
cp .env.example .env.local   # API 서버 주소가 다르면 VITE_API_URL 수정
pnpm dev
```

API 서버가 떠 있어야 화면에 데이터가 나옵니다. 실행 방법은 서버 저장소의 README를 참고하세요(기본 `http://localhost:8080`).

| 명령 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 프로덕션 빌드(`build/`) |
| `pnpm preview` | 빌드 결과 미리보기 |
| `pnpm check` | 타입·Svelte 검사(`svelte-check`) |

### 환경변수

| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | API 서버 주소(끝의 `/` 없이) |
