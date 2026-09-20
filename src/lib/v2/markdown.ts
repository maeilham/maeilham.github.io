// 콘텐츠 마크다운 → 살균된 HTML 문자열.
// 프레임워크에 의존하지 않는다: Svelte는 {@html}, React는 dangerouslySetInnerHTML로 그대로 쓸 수 있다.
//
// 파이프라인 순서가 중요하다.
//   1) 원시 HTML은 remark-rehype가 버리고, rehype-sanitize가 위험한 속성·프로토콜을 한 번 더 걸러낸다.
//   2) sanitize는 class 등을 지우므로, 클래스를 붙이는 단계(하이라이트·표 래퍼·외부 링크)는 그 뒤에 온다.
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import { createLowlight } from 'lowlight';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeStringify from 'rehype-stringify';
import { SKIP, visit } from 'unist-util-visit';
import type { Element, ElementContent, Root } from 'hast';

import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

// 하이라이트 언어는 필요한 것만 싣는다 (지하철 네트워크에서 번들 크기가 곧 로딩 시간).
// 여기 없는 언어(```text 포함)는 하이라이트 없이 그대로 보여준다.
const lowlight = createLowlight({ bash, css, dockerfile, go, java, javascript, json, python, sql, typescript, xml, yaml });

// rehype-highlight는 기본 언어 37개(common)를 무조건 import해서 위에서 고른 언어와 무관하게 번들이 커진다.
// 그래서 lowlight를 직접 써서 등록한 언어만 하이라이트한다.
function rehypeHighlightLite() {
	return (tree: Root) => {
		visit(tree, 'element', (node, _index, parent) => {
			if (node.tagName !== 'code' || parent?.type !== 'element' || parent.tagName !== 'pre') return;
			const className = node.properties?.className;
			const lang = Array.isArray(className)
				? String(className.find((c) => String(c).startsWith('language-')) ?? '').slice('language-'.length)
				: '';
			if (!lang || !lowlight.registered(lang)) return;
			// sanitize를 거친 뒤라 code 안에는 텍스트 노드만 있다.
			const text = node.children.map((c) => (c.type === 'text' ? c.value : '')).join('');
			node.children = lowlight.highlight(lang, text).children as ElementContent[];
			node.properties.className = ['hljs', `language-${lang}`];
		});
	};
}

// 페이지 제목이 이미 h1이므로 본문의 h1은 h2로 내린다.
function rehypeDemoteH1() {
	return (tree: Root) => {
		visit(tree, 'element', (node) => {
			if (node.tagName === 'h1') node.tagName = 'h2';
		});
	};
}

// MVP 정책: 이미지는 절대 URL(http/https)만 허용한다. repo 상대 경로 이미지는 웹에서 깨지므로
// 제거하고 alt 텍스트만 남긴다.
function rehypeAbsoluteImagesOnly() {
	return (tree: Root) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'img' || !parent || index === undefined) return;
			const src = String(node.properties?.src ?? '');
			if (/^https?:\/\//i.test(src)) {
				node.properties.loading = 'lazy';
				return;
			}
			const alt = String(node.properties?.alt ?? '');
			if (alt) {
				parent.children[index] = { type: 'text', value: alt };
			} else {
				parent.children.splice(index, 1);
				return index;
			}
		});
	};
}

// 이미지를 지우고 나면 빈 문단이 남아 불필요한 여백이 생기므로 함께 지운다.
function rehypeDropEmptyParagraphs() {
	return (tree: Root) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'p' || !parent || index === undefined) return;
			const empty = node.children.every((c) => c.type === 'text' && c.value.trim() === '');
			if (!empty) return;
			parent.children.splice(index, 1);
			return index;
		});
	};
}

// 표는 폰에서 가로로 넘치므로 스크롤 래퍼로 감싼다.
function rehypeWrapTables() {
	return (tree: Root) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'table' || !parent || index === undefined) return;
			const wrapper: Element = {
				type: 'element',
				tagName: 'div',
				properties: { className: ['table-wrap'] },
				children: [node]
			};
			parent.children[index] = wrapper;
			return SKIP;
		});
	};
}

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype) // allowDangerousHtml 미사용: 본문의 원시 HTML은 버려진다
	.use(rehypeSanitize)
	.use(rehypeHighlightLite)
	.use(rehypeDemoteH1)
	.use(rehypeAbsoluteImagesOnly)
	.use(rehypeDropEmptyParagraphs)
	.use(rehypeWrapTables)
	.use(rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] })
	.use(rehypeStringify)
	.freeze();

export function renderMarkdown(markdown: string): string {
	return String(processor.processSync(markdown));
}
