import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// 지금 배포된 게 어느 커밋인지 브라우저 콘솔에서 바로 확인하려는 용도(__BUILD_INFO__).
// 배포가 실제로 반영됐는지 헷갈릴 때 devtools에서 `__BUILD_INFO__` 쳐보면 됨.
// GitHub Actions가 모든 워크플로에 GITHUB_SHA를 기본으로 채워주므로 git을 직접 실행하지 않고
// 그 값을 읽기만 한다(빌드 환경에 git이 있어야 할 필요가 없어지고, 서브프로세스도 안 뜬다).
// 로컬 dev 빌드처럼 그 환경변수가 없으면 'dev'로 표시한다.
const buildSha = (process.env.GITHUB_SHA ?? 'dev').slice(0, 7);

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		include: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links'],
	},
	define: {
		__BUILD_INFO__: JSON.stringify({ sha: buildSha, builtAt: new Date().toISOString() }),
	},
});
