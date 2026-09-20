// UI 검증용 mock 데이터. 실제 연동 시 서버 API 응답으로 교체한다.
// body/notes는 마크다운 원문이다(서버가 frontmatter를 뗀 본문을 내려주는 전제). 렌더는 markdown.ts가 한다.
import body0001 from './mock/0001-browser-rendering.md?raw';
import body0002 from './mock/0002-process-vs-thread.md?raw';
import body0003 from './mock/0003-url-vs-uri.md?raw';
import body0004 from './mock/0004-goroutine-vs-thread.md?raw';
import body0005 from './mock/0005-k8s-service-types.md?raw';
import body0006 from './mock/0006-scale-up-vs-out.md?raw';

export type Category = '백엔드' | '프론트엔드' | 'CS';

export interface Item {
	id: string;
	no: number;
	date: string;
	dateLabel: string;
	title: string;
	preview: string;
	tags: string[];
	category: Category;
	read: boolean;
	minutes: number;
	comments: number;
	body: string;
	notes: string | null;
	discussionUrl: string;
}

const discussion = (n: number) => `https://github.com/maeilham/backend-ops/discussions/${n}`;

export const items: Item[] = [
	{
		id: '0006-scale-up-vs-out',
		no: 6,
		date: '2026-09-18',
		dateLabel: '9월 18일 금요일',
		title: '스케일업 vs 스케일아웃, 어떻게 다른가?',
		preview:
			'서버 한계를 마주했을 때 떠올리는 두 가지 선택지. 단순해 보이지만 비용·가용성·운영 복잡도가 다르게 얽혀 있습니다.',
		tags: ['infra', 'scaling'],
		category: '백엔드',
		read: false,
		minutes: 3,
		comments: 12,
		discussionUrl: discussion(6),
		body: body0006,
		notes:
			'DB는 읽기 복제본을 붙여 읽기부터 분산하고, 쓰기는 스케일업으로 버티다가 샤딩을 검토한다는 경험담이 많았음. 스케일아웃 전에 **세션을 외부 저장소로 빼는 작업**이 먼저라는 의견도 있었음.'
	},
	{
		id: '0005-k8s-service-types',
		no: 5,
		date: '2026-09-17',
		dateLabel: '9월 17일 목요일',
		title: 'Kubernetes Service 타입의 종류와 차이점은?',
		preview:
			'Pod는 재시작될 때마다 IP가 바뀝니다. Service는 이 문제를 해결하는 안정적인 네트워크 엔드포인트입니다.',
		tags: ['k8s', 'network'],
		category: '백엔드',
		read: true,
		minutes: 4,
		comments: 7,
		discussionUrl: discussion(5),
		body: body0005,
		notes: null
	},
	{
		id: '0004-goroutine-vs-thread',
		no: 4,
		date: '2026-09-16',
		dateLabel: '9월 16일 수요일',
		title: 'Goroutine은 OS 스레드와 어떻게 다른가요?',
		preview:
			'Go가 수십만 개의 goroutine을 거뜬히 띄울 수 있는 이유는 OS 스레드와 근본적으로 다른 방식으로 동작하기 때문입니다.',
		tags: ['go', 'concurrency', 'runtime'],
		category: '백엔드',
		read: true,
		minutes: 4,
		comments: 3,
		discussionUrl: discussion(4),
		body: body0004,
		notes: null
	},
	{
		id: '0003-url-vs-uri',
		no: 3,
		date: '2026-09-15',
		dateLabel: '9월 15일 화요일',
		title: 'URL과 URI의 차이점은 무엇인가요?',
		preview: 'URL과 URI는 혼용되는 경우가 많지만 엄밀히는 다른 개념입니다.',
		tags: ['network', 'web', 'http'],
		category: 'CS',
		read: false,
		minutes: 2,
		comments: 5,
		discussionUrl: discussion(3),
		body: body0003,
		notes: null
	},
	{
		id: '0002-process-vs-thread',
		no: 2,
		date: '2026-09-14',
		dateLabel: '9월 14일 월요일',
		title: '프로세스와 스레드는 무엇이 다른가요?',
		preview: '같은 "실행 단위"처럼 보이지만 메모리를 나누는 방식이 다릅니다.',
		tags: ['os', 'concurrency'],
		category: 'CS',
		read: true,
		minutes: 3,
		comments: 9,
		discussionUrl: discussion(2),
		body: body0002,
		notes: null
	},
	{
		id: '0001-browser-rendering',
		no: 1,
		date: '2026-09-11',
		dateLabel: '9월 11일 목요일',
		title: '브라우저는 HTML을 어떻게 화면에 그리나요?',
		preview: '주소를 입력한 뒤 픽셀이 찍히기까지, 렌더링 파이프라인의 단계를 짚어봅니다.',
		tags: ['browser', 'rendering'],
		category: '프론트엔드',
		read: true,
		minutes: 4,
		comments: 11,
		discussionUrl: discussion(1),
		body: body0001,
		notes: null
	}
];

export const today = items[0];

export const getItem = (id: string) => items.find((i) => i.id === id);

export type DayState = 'done' | 'missed' | 'today' | 'future';

// 이번 주(월~일) 읽은 기록. 잔디 비전을 은근히 비치는 용도.
export const week: { label: string; state: DayState }[] = [
	{ label: '월', state: 'done' },
	{ label: '화', state: 'missed' },
	{ label: '수', state: 'done' },
	{ label: '목', state: 'done' },
	{ label: '금', state: 'today' },
	{ label: '토', state: 'future' },
	{ label: '일', state: 'future' }
];

export interface Source {
	repo: string;
	name: string;
	desc: string;
	enabled: boolean;
}

export const sources: Source[] = [
	{ repo: 'maeilham/backend-ops', name: '백엔드 · 인프라', desc: '서버, 네트워크, 런타임', enabled: true },
	{ repo: 'maeilham/frontend', name: '프론트엔드', desc: '브라우저, 렌더링, 프레임워크', enabled: true },
	{ repo: 'maeilham/cs-basics', name: 'CS 기초', desc: 'OS, 자료구조, 네트워크 기본기', enabled: false }
];
