// Reader가 그리는 콘텐츠 하나. mock과 서버 API 응답이 각자 이 모양으로 바꿔서 넘긴다.
// 서버에 아직 없는 값(발송일, 읽는 시간, 댓글 수, 노트, 읽음 여부)은 모두 선택 항목이며,
// 없으면 화면에서 해당 부분을 그리지 않는다.
export interface ReaderItem {
	title: string;
	preview: string;
	tags: string[];
	label: string; // 분야/repo 표시 이름 (예: 백엔드 · 인프라)
	body: string; // 마크다운 원문
	dateLabel?: string;
	minutes?: number;
	comments?: number;
	notes?: string | null;
	discussionUrl?: string; // 없으면 "내 답 남기기"를 숨긴다
	read?: boolean;
}
