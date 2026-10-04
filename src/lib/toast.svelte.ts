// 화면 하단에 잠깐 떴다 사라지는 오류 안내. 성공은 토스트 대신 그 자리(스위치 옆 표시)에서 알린다.
// 한 번에 하나만 보여주고, 새로 띄우면 이전 것을 바꾼다. 그리는 쪽은 ToastHost.svelte이고
// (app)/+layout.svelte에 한 번 둔다.

// seq는 메시지가 새로 보일 때마다 늘어난다. 화면이 이 값으로 "내용이 바뀌었다"는 걸 알아본다.
export const toast = $state<{ visible: boolean; message: string; seq: number }>({
	visible: false,
	message: '',
	seq: 0
});

const DURATION = 2500;

let timer: ReturnType<typeof setTimeout> | undefined;

export function showError(message: string): void {
	clearTimeout(timer);
	toast.message = message;
	toast.seq += 1;
	toast.visible = true;
	timer = setTimeout(() => {
		toast.visible = false;
	}, DURATION);
}
