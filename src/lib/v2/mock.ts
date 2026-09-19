// UI 검증용 mock 데이터. 실제 연동 시 서버 API 응답으로 교체한다.
// body/notes는 실제로는 마크다운 → HTML 렌더 결과가 들어올 자리.

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
		body: `
<p><strong>스케일업(Scale-up)</strong>은 기존 서버의 CPU·메모리·디스크를 증설하는 방식입니다. 구현이 단순하고 애플리케이션 변경 없이 성능을 올릴 수 있지만, 하드웨어 한계가 존재하고 단일 장애점(SPOF)이 생깁니다.</p>
<p><strong>스케일아웃(Scale-out)</strong>은 서버를 여러 대로 수평 확장하는 방식입니다. 이론적으로 무한 확장이 가능하고 가용성이 높지만, 로드밸런서·세션 공유·데이터 일관성 같은 분산 환경 복잡도가 따라옵니다.</p>
<h2>언제 무엇을 선택할까?</h2>
<div class="table-wrap"><table>
<thead><tr><th></th><th>스케일업</th><th>스케일아웃</th></tr></thead>
<tbody>
<tr><td>적합한 상황</td><td>DB, 레거시 앱처럼 수평 확장이 어려운 경우</td><td>웹 서버, API 서버처럼 무상태(stateless)한 경우</td></tr>
<tr><td>비용</td><td>고사양 장비는 비용이 급격히 증가</td><td>저사양 장비 여러 대로 비용 분산 가능</td></tr>
<tr><td>가용성</td><td>서버 1대 장애 = 서비스 중단</td><td>일부 서버 장애에도 서비스 유지 가능</td></tr>
</tbody></table></div>
<p>실무에서는 둘 중 하나만 선택하기보다 <strong>초기에 스케일업으로 빠르게 대응하고, 한계에 가까워지면 스케일아웃 구조로 전환</strong>하는 경우가 많습니다.</p>
<h2>더 알아보기</h2>
<ul>
<li><a href="https://docs.aws.amazon.com/autoscaling/" target="_blank" rel="noreferrer">AWS Auto Scaling 문서</a></li>
<li><a href="https://12factor.net/concurrency" target="_blank" rel="noreferrer">The Twelve-Factor App — Concurrency</a></li>
</ul>`,
		notes: `
<p>DB는 읽기 복제본을 붙여 읽기부터 분산하고, 쓰기는 스케일업으로 버티다가 샤딩을 검토한다는 경험담이 많았음. 스케일아웃 전에 세션을 외부 저장소로 빼는 작업이 먼저라는 의견도 있었음.</p>`
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
		body: `
<p>Pod는 재시작되면 IP가 바뀌기 때문에, 고정된 접근 지점이 필요합니다. Service가 셀렉터로 Pod들을 묶어 하나의 안정적인 주소를 제공합니다.</p>
<ul>
<li><strong>ClusterIP</strong> — 클러스터 내부에서만 접근 가능한 기본 타입</li>
<li><strong>NodePort</strong> — 각 노드의 특정 포트로 외부에서 접근</li>
<li><strong>LoadBalancer</strong> — 클라우드 로드밸런서를 붙여 외부에 노출</li>
<li><strong>ExternalName</strong> — 외부 DNS 이름으로 매핑</li>
</ul>`,
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
		body: `
<p>Goroutine은 OS가 아니라 Go 런타임이 스케줄링하는 경량 실행 단위입니다. 작은 스택에서 시작해 필요할 때 늘어나기 때문에 수십만 개도 띄울 수 있습니다.</p>
<p>런타임은 여러 goroutine을 소수의 OS 스레드 위에 얹어 실행합니다(M:N 스케줄링). 그래서 컨텍스트 스위칭 비용이 OS 스레드보다 훨씬 작습니다.</p>`,
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
		body: `
<p><strong>URI</strong>는 자원을 식별하는 문자열 전체를 가리키는 상위 개념입니다. <strong>URL</strong>은 그중에서도 자원의 <em>위치</em>와 접근 방법(프로토콜)까지 알려주는 URI입니다.</p>
<p>즉 모든 URL은 URI이지만, 모든 URI가 URL은 아닙니다. 이름만으로 자원을 가리키는 URN이 그 예입니다.</p>`,
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
		body: `
<p>프로세스는 독립된 주소 공간을 가집니다. 스레드는 한 프로세스 안에서 코드·데이터·힙을 공유하고, 스택과 레지스터만 따로 가집니다.</p>
<p>그래서 스레드 간 통신은 빠르지만 동기화 문제가 생기고, 프로세스 간에는 격리되는 대신 IPC가 필요합니다.</p>`,
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
		body: `
<p>HTML은 DOM으로, CSS는 CSSOM으로 파싱됩니다. 둘을 합쳐 렌더 트리를 만들고, 각 요소의 크기와 위치를 계산(Layout)한 뒤 화면에 그립니다(Paint).</p>
<p>마지막으로 여러 레이어를 합성(Composite)해 최종 화면이 만들어집니다.</p>`,
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
