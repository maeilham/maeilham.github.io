// 구독자 상태. 메일 링크의 #t=<token>을 읽어 sessionStorage에 저장하고, 처음 여는 링크면
// POST /api/session(가입 완료, 멱등), 저장된 토큰이 있으면 GET /api/me(조회만)로 확인한다.
// 401이면 토큰을 지우고 방문자로 본다.
//
// 저장소로 sessionStorage를 쓰는 이유: 링크(북마크)가 원본이고, 저장소는 같은 탭 안에서 화면을
// 이동하거나 새로고침해도 기록이 끊기지 않게 하는 보조 역할만 한다. 그냥 주소로 들어온 사람은
// 매번 방문자이고, 메일의 개인 링크로 들어오도록 안내한다(localStorage로 기기에 남기지 않는다).
//
// 'unknown'은 서버 확인이 끝나기 전 상태다. 이때 구독 버튼을 보여주면 구독자에게 잠깐 깜빡이므로
// 화면은 'visitor'일 때만 구독 UI를 그린다. 네트워크 오류 등 401이 아닌 실패는 상태를 바꾸지
// 않는다('unknown' 유지) — 잘못 방문자로 단정해서 구독 유도 문구를 잘못 보여주는 것보다 안전하다.
import { ApiError, establishSession, fetchMe } from './api';

export type AuthStatus = 'unknown' | 'subscriber' | 'visitor';

const STORAGE_KEY = 'maeilham.token';
const TOKEN_RE = /^[0-9a-f]{64}$/;

// sessionStorage가 막힌 환경(시크릿 모드 등)의 대체용. 새로고침하면 사라진다.
let memoryToken: string | null = null;

function getToken(): string | null {
	try {
		return sessionStorage.getItem(STORAGE_KEY) ?? memoryToken;
	} catch {
		return memoryToken;
	}
}

function setToken(token: string) {
	memoryToken = token;
	try {
		sessionStorage.setItem(STORAGE_KEY, token);
	} catch {
		// 저장이 막힌 환경. 메모리로만 유지한다.
	}
}

function clearToken() {
	memoryToken = null;
	try {
		sessionStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}

// 주소의 #t=<64자 hex>를 읽는다. 다른 목적의 해시(예: 브라우저 확장이 붙인 값)는 무시한다.
function readTokenFromHash(url: URL): string | null {
	if (!url.hash) return null;
	const t = new URLSearchParams(url.hash.slice(1)).get('t');
	return t && TOKEN_RE.test(t) ? t : null;
}

export const auth = $state<{ status: AuthStatus }>({ status: 'unknown' });

// 서버 호출에 붙일 개인 링크 토큰. 방문자(링크 없이 들어온 사람)면 null이다.
export function getAccessToken(): string | null {
	return getToken();
}

// 토큰을 버리고 방문자로 돌린다. 서버가 401을 줬거나(링크가 무효), 구독을 해지한 직후에 쓴다.
export function endSession(): void {
	clearToken();
	auth.status = 'visitor';
}

// 링크를 "처음" 열어서(서버가 newly_confirmed:true를 준 바로 그 순간) 가입이 막 완료된 상태를
// 1회성으로 알린다. 홈 화면이 이걸 보고 "지금 홈 화면에 추가하세요" 안내를 딱 한 번 띄운다.
// 링크를 다시 열거나(멱등) 저장된 토큰으로 재방문한 경우엔 절대 true가 안 된다.
export const linkJustConfirmed = $state<{ value: boolean }>({ value: false });

export function dismissJustConfirmed(): void {
	linkJustConfirmed.value = false;
}

export async function initAuth(url: URL): Promise<void> {
	const fromHash = readTokenFromHash(url);
	if (fromHash) {
		try {
			const result = await establishSession(fromHash);
			setToken(fromHash);
			auth.status = 'subscriber';
			linkJustConfirmed.value = result.newlyConfirmed;
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				clearToken();
				auth.status = 'visitor';
			}
			// 그 외 오류는 상태를 바꾸지 않는다(위 주석 참고).
		}
		return;
	}

	// 라우트를 이동할 때마다 이 함수가 다시 불리므로(주소가 바뀌면 실행됨), 판정이 이미 끝났으면
	// 매번 GET /api/me를 다시 부르지 않는다. #t가 있는 경우는 위에서 항상 처리한다(서버가 멱등).
	if (auth.status !== 'unknown') return;

	const stored = getToken();
	if (!stored) {
		auth.status = 'visitor';
		return;
	}
	try {
		await fetchMe(stored);
		auth.status = 'subscriber';
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) {
			clearToken();
			auth.status = 'visitor';
		}
	}
}
