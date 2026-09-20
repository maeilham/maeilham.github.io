import type { ContentSummary } from './api';

export const ALL_REPOS = '전체';

// 목록에 나온 repo 표시 이름들(중복 제거, 처음 나온 순서). 필터 칩을 만드는 데 쓴다.
export function repoNames(items: ContentSummary[]): string[] {
	return [...new Set(items.map((i) => i.repoName))];
}

export function filterByRepo(items: ContentSummary[], repoName: string): ContentSummary[] {
	return repoName === ALL_REPOS ? items : items.filter((i) => i.repoName === repoName);
}

// 발송 시각을 "09.10" 형태(브라우저 시간대 기준)로. 값이 없거나 깨져 있으면 빈 문자열.
export function sentDateLabel(sentAt?: string): string {
	if (!sentAt) return '';
	const d = new Date(sentAt);
	if (Number.isNaN(d.getTime())) return '';
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}
