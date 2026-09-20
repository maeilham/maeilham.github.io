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

// 서버가 오류 상태 코드를 돌려준 경우. 404(없음)와 그 밖의 오류를 화면에서 구분하는 데 쓴다.
export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

export async function getContent(repo: string, id: string, signal?: AbortSignal): Promise<ContentDetail> {
	const url = `${API_URL}/api/contents/${encodeURIComponent(repo)}/${encodeURIComponent(id)}`;
	const res = await fetch(url, { signal });
	if (!res.ok) {
		let message = `HTTP ${res.status}`;
		try {
			const body = await res.json();
			if (typeof body?.error === 'string') message = body.error;
		} catch {
			// 본문이 JSON이 아니면 상태 코드 메시지를 그대로 쓴다
		}
		throw new ApiError(res.status, message);
	}
	return res.json();
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
