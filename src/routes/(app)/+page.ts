import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// 서버는 구독 확인 뒤 `/?status=confirmed|invalid`로 보내고, 메일의 해지 링크는
// `/?action=unsubscribe&token=...`이다(이미 발송된 메일에도 이 주소가 들어 있다).
// 서버 주소를 그대로 두고 여기서 각 안내 화면으로 넘긴다.
export const load: PageLoad = ({ url }) => {
	const status = url.searchParams.get('status');
	if (status) redirect(307, `/confirm?status=${encodeURIComponent(status)}`);

	if (url.searchParams.get('action') === 'unsubscribe') {
		const token = url.searchParams.get('token') ?? '';
		redirect(307, `/unsubscribe?token=${encodeURIComponent(token)}`);
	}
};
