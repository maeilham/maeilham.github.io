// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// vite.config.ts의 define에서 빌드 시점에 값을 채운다. 배포된 커밋을 devtools에서 확인하는 용도.
	const __BUILD_INFO__: { sha: string; builtAt: string };
}

export {};
