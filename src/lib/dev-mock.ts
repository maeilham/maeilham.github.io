// 개발 서버(pnpm dev)에서만 쓰는 UI 테스트용 가짜 서버. 호출하는 쪽은 모두 `import.meta.env.DEV` 조건 안에 있어서
// 운영 빌드에서는 이 파일의 코드가 번들에서 빠진다(빌드 뒤 `DEV_MOCK_MARKER` 문자열이 남아 있지 않은지 확인할 수 있다).
//
// 주소에 쿼리를 붙여서 쓴다.
//   ?mock            서버를 부르지 않고 구독자 상태 + 가짜 데이터로 화면을 연다. 화면을 옮겨도 유지되고(sessionStorage), ?mock=off로 끈다.
//   ?delay=1500      응답을 그만큼 늦춘다(스피너, 로딩 상태 확인). mock이 아니어도 실제 서버 호출에 적용된다.
//   ?fail=rotate     그 동작을 실패시킨다(서버를 부르지 않음). 동작: me, list, toggle, rotate, unsub, session.
//                    ?fail만 쓰면 toggle. 상태 코드는 &status=401처럼 정하고 기본은 500이다.
// 예) /settings?mock&fail=rotate&status=500  → 링크 새로 받기 실패 토스트 확인
export const DEV_MOCK_MARKER = '__dev_mock__';

const STORAGE_KEY = 'maeilham.devmock';

type Action = 'me' | 'list' | 'toggle' | 'rotate' | 'unsub' | 'session';

function query(): URLSearchParams {
	return typeof location === 'undefined' ? new URLSearchParams() : new URLSearchParams(location.search);
}

export function isMock(): boolean {
	const q = query();
	try {
		if (q.has('mock')) sessionStorage.setItem(STORAGE_KEY, q.get('mock') === 'off' ? '0' : '1');
		return sessionStorage.getItem(STORAGE_KEY) === '1';
	} catch {
		return q.has('mock') && q.get('mock') !== 'off';
	}
}

// mock 모드에서 저장된 토큰이 없어도 구독자로 보이게 하는 가짜 토큰.
export function fakeToken(): string | null {
	// 64자 hex. 형식만 맞춘 가짜 값이다. 최상위 상수로 두면 호출식이라 운영 빌드에 남아서 함수 안에 둔다.
	return isMock() ? '0123456789abcdef'.repeat(4) : null;
}

function classify(path: string, method: string): Action | null {
	if (path === '/api/session') return 'session';
	if (path === '/api/me') return 'me';
	if (path === '/api/me/subscriptions') return 'list';
	if (path.startsWith('/api/me/subscriptions/') && method === 'PUT') return 'toggle';
	if (path === '/api/me/rotate-link') return 'rotate';
	if (path === '/api/me/unsubscribe') return 'unsub';
	return null;
}

function json(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function successBody(action: Action): unknown {
	switch (action) {
		case 'session':
			return { status: 'subscriber', newly_confirmed: false };
		case 'me':
			return { status: 'subscriber', email: 'me@example.com' };
		case 'list':
			return {
				items: [
					{ repo: 'backend-ops', name: '백엔드 · 인프라', description: '서버, 네트워크, 런타임', enabled: true },
					{ repo: 'frontend', name: '프론트엔드', description: '브라우저, 렌더링, 프레임워크', enabled: true },
					{ repo: 'cs-basics', name: 'CS 기초', description: 'OS, 자료구조, 네트워크 기본기', enabled: false }
				]
			};
		case 'toggle':
			return { ok: true };
		case 'rotate':
			return { message: '새 링크를 메일로 보냈습니다' };
		case 'unsub':
			return { message: '구독이 해지되었습니다' };
	}
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		const t = setTimeout(resolve, ms);
		signal?.addEventListener('abort', () => {
			clearTimeout(t);
			reject(new DOMException('aborted', 'AbortError'));
		});
	});
}

// 실제 요청 대신 돌려줄 가짜 응답. null이면 실제 서버로 보낸다.
export async function devResponse(path: string, method: string, signal?: AbortSignal): Promise<Response | null> {
	const q = query();
	const mock = isMock();
	const failParam = q.get('fail');
	if (!mock && failParam === null && !q.has('delay')) return null;

	const delay = Number(q.get('delay')) || 0;
	if (delay > 0) await sleep(delay, signal);

	const action = classify(path, method);
	if (action && failParam !== null) {
		const failAction = failParam === '' ? 'toggle' : failParam;
		if (failAction === action) {
			const status = Number(q.get('status')) || 500;
			return json(status, { error: 'dev: forced failure' });
		}
	}
	if (mock && action) return json(200, successBody(action));
	return null;
}

// 화면 구석에 "MOCK" 표시를 단다. 돌려주는 함수를 부르면 지운다.
export function mountMockBadge(): () => void {
	const el = document.createElement('div');
	el.textContent = 'MOCK';
	el.setAttribute('aria-hidden', 'true');
	el.style.cssText =
		'position:fixed;top:8px;right:8px;z-index:40;padding:2px 8px;border-radius:6px;background:#7c3aed;color:#fff;' +
		'font:700 11px/1.6 system-ui,sans-serif;letter-spacing:.5px;pointer-events:none';
	document.body.appendChild(el);
	return () => el.remove();
}
