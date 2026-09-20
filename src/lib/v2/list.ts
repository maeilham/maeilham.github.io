import type { ContentSummary } from './api';

export const ALL_REPOS = '전체';

// 목록에 나온 repo 표시 이름들(중복 제거, 처음 나온 순서). 필터 칩을 만드는 데 쓴다.
export function repoNames(items: ContentSummary[]): string[] {
	return [...new Set(items.map((i) => i.repoName))];
}

export function filterByRepo(items: ContentSummary[], repoName: string): ContentSummary[] {
	return repoName === ALL_REPOS ? items : items.filter((i) => i.repoName === repoName);
}

// 시각을 "09.10" 형태(브라우저 시간대 기준)로. 값이 없거나 깨져 있으면 빈 문자열.
export function dateLabel(iso?: string): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

// 서비스의 "오늘"을 "2026.09.20" 형태로. 서버가 하루를 나누는 시간대(MAEILHAM_TZ 기본 Asia/Seoul)와 같게,
// 사용자의 기기 시간대와 무관하게 한국 시간으로 계산한다.
export function serviceDateLabel(now: Date = new Date()): string {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Asia/Seoul',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(now);
	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
	return `${get('year')}.${get('month')}.${get('day')}`;
}
