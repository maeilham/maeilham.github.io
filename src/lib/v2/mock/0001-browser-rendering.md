HTML은 DOM으로, CSS는 CSSOM으로 파싱됩니다. 둘을 합쳐 **렌더 트리**를 만들고, 각 요소의 크기와 위치를 계산(Layout)한 뒤 화면에 그립니다(Paint).

1. HTML 파싱 → DOM
2. CSS 파싱 → CSSOM
3. 렌더 트리 생성
4. Layout → Paint → Composite

## 렌더링을 막는 것

`<script>`는 기본적으로 HTML 파싱을 멈춥니다. `defer`나 `async`로 이를 피할 수 있습니다.

```html
<script src="app.js" defer></script>
```

> CSS도 렌더링을 막는 자원(render-blocking)입니다.
