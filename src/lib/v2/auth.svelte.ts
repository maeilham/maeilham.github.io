// UI 목업용 구독자 상태. 실제 연동 시 이 파일만 바꾼다:
//   메일 링크의 #t=<token>을 읽어 localStorage에 저장 → GET /api/me(Authorization: Bearer)로 확인 →
//   응답이 200이면 'subscriber', 401이면 토큰을 지우고 'visitor'.
//
// 'unknown'은 서버 확인이 끝나기 전 상태다. 이때 구독 버튼을 보여주면 구독자에게 잠깐 깜빡이므로
// 화면은 'visitor'일 때만 구독 UI를 그린다.
//
// 개발 중 확인용 전환: 주소에 ?sub=1 (구독자) 또는 ?sub=0 (비구독자)을 붙이면 localStorage에 유지된다.
export type AuthStatus = 'unknown' | 'subscriber' | 'visitor';

const KEY = 'maeilham.mock.subscriber';

export const auth = $state<{ status: AuthStatus }>({ status: 'unknown' });

export function initAuth(url: URL) {
	try {
		const q = url.searchParams.get('sub');
		if (q === '1' || q === '0') localStorage.setItem(KEY, q);
		auth.status = localStorage.getItem(KEY) === '1' ? 'subscriber' : 'visitor';
	} catch {
		auth.status = 'visitor';
	}
}
