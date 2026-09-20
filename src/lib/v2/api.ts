import type { ReaderItem } from './types';

// 서버(Go) API 주소. 터미널 화면과 같은 환경변수를 쓴다.
// import.meta.env는 vite가 채워주며, 없는 환경(예: node로 직접 실행)에서는 기본값을 쓴다.
export const API_URL = String(import.meta.env?.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

// GET /api/contents/{repo}/{id} 응답
export interface ContentDetail {
	repo: string;
	repoName: string;
	id: string;
	title: string;
	preview: string;
	tags: string[];
	body: string;
	discussionUrl?: string;
}

// GET /api/contents 응답의 항목 하나. 본문은 없다. 시각은 ISO 8601(UTC)이다.
export interface ContentSummary {
	repo: string;
	repoName: string;
	id: string;
	title: string;
	preview: string;
	tags: string[];
	authoredAt: string; // 글이 작성된 시각(GitHub 최초 커밋). 서버가 못 구했으면 sync한 시각으로 대체돼서 항상 있다
	sentAt?: string; // 마지막으로 발송된 시각. 로테이션으로 덮어써지고 발송 전이면 없다 (목록 화면은 쓰지 않는다)
}

// 서버가 오류 상태 코드를 돌려준 경우. 404(없음)와 그 밖의 오류를 화면에서 구분하는 데 쓴다.
export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

// 서버의 오류 응답({"error": "..."})을 ApiError로 바꾼다. 본문이 JSON이 아니면 상태 코드 메시지를 쓴다.
async function toApiError(res: Response): Promise<ApiError> {
	let message = `HTTP ${res.status}`;
	try {
		const body = await res.json();
		if (typeof body?.error === 'string') message = body.error;
	} catch {
		// JSON이 아님
	}
	return new ApiError(res.status, message);
}

export async function getContent(repo: string, id: string, signal?: AbortSignal): Promise<ContentDetail> {
	const url = `${API_URL}/api/contents/${encodeURIComponent(repo)}/${encodeURIComponent(id)}`;
	const res = await fetch(url, { signal });
	if (!res.ok) throw await toApiError(res);
	return res.json();
}

// GET /api/today 응답의 항목. 오늘 발송해야 할 글 하나이고 본문은 없다(본문은 getContent로 따로 가져온다).
export interface TodayItem {
	repo: string;
	repoName: string;
	id: string;
	title: string;
	preview: string;
	tags: string[];
}

// 보여줄 글이 하나도 없으면 서버가 404를 준다. 화면은 이를 "아직 없음"으로 처리한다.
export async function getToday(signal?: AbortSignal): Promise<TodayItem> {
	const res = await fetch(`${API_URL}/api/today`, { signal });
	if (!res.ok) throw await toApiError(res);
	const body = await res.json();
	return body.item;
}

// 구독 확인 메일을 요청한다. 성공해도 메일의 링크를 눌러야 구독이 확정된다.
// 서버는 이미 구독 중인 주소에도 같은 응답을 주므로, 화면에서 둘을 구분할 수 없다(주소 존재 여부가 새지 않는다).
export async function subscribe(email: string, signal?: AbortSignal): Promise<void> {
	const res = await fetch(`${API_URL}/api/subscribe`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
		signal
	});
	if (!res.ok) throw await toApiError(res);
}

// 메일 하단 해지 링크의 토큰으로 구독을 해지한다. 토큰이 잘못됐거나 만료됐으면 400이다.
export async function unsubscribe(token: string, signal?: AbortSignal): Promise<void> {
	const res = await fetch(`${API_URL}/api/unsubscribe?token=${encodeURIComponent(token)}`, {
		method: 'POST',
		signal
	});
	if (!res.ok) throw await toApiError(res);
}

export function toReaderItem(c: ContentDetail): ReaderItem {
	return {
		title: c.title,
		preview: c.preview,
		tags: c.tags ?? [],
		label: c.repoName,
		body: c.body,
		discussionUrl: c.discussionUrl || undefined
	};
}

export async function getContentList(signal?: AbortSignal): Promise<ContentSummary[]> {
	const res = await fetch(`${API_URL}/api/contents`, { signal });
	if (!res.ok) throw new ApiError(res.status, `HTTP ${res.status}`);
	const body = await res.json();
	return Array.isArray(body?.items) ? body.items : [];
}
