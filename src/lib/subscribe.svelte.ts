import { ApiError, subscribe } from './api';

// /subscribe 이메일 폼의 상태.
// idle → sending → sent(성공) 또는 error(실패, 다시 제출할 수 있음)로 움직인다.
export type SubscribeStatus = 'idle' | 'sending' | 'sent' | 'error';

const GENERIC_ERROR = '메일을 보내지 못했어요. 잠시 후 다시 시도해주세요.';

// 이메일 형식이 맞을 때만 제출하게 하는 느슨한 검사. 서버가 최종 검증한다.
export function isEmail(v: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export class SubscribeForm {
	email = $state('');
	status = $state<SubscribeStatus>('idle');
	error = $state('');

	valid = $derived(isEmail(this.email));

	// 형식 검사(valid)는 버튼 활성화용이고, 여기서는 막지 않는다. 브라우저 검사를 통과한 값은 서버가 최종 판단하고,
	// 서버가 400으로 돌려주는 메시지(예: 형식 오류)는 사용자에게 보여줘도 되는 문구다.
	// 그 밖의 오류(500, 네트워크 끊김)는 내부 사정이라 일반 문구를 쓴다.
	submit = async (e: SubmitEvent) => {
		e.preventDefault();
		if (this.status === 'sending') return;

		this.status = 'sending';
		this.error = '';
		try {
			await subscribe(this.email.trim());
			this.status = 'sent';
		} catch (err) {
			this.status = 'error';
			this.error = err instanceof ApiError && err.status === 400 ? err.message : GENERIC_ERROR;
		}
	};
}
