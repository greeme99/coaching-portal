---
name: workapp-design-system
version: 1.0.0
platform: Web (Desktop-first, responsive to 768px)
stack: React + Tailwind v4 + CSS Variables
theme: light | dark
density: comfortable | compact
scope: 업무용 웹앱 (Admin · Dashboard · Internal Tool)
updated: 2026-09-27

colors:
  # --- Raw: Brand (교체 지점 — 이 6단계만 바꾸면 전체 이식) ---
  brand-50: "#EEF4FE"
  brand-100: "#D8E6FD"
  brand-300: "#83B0F9"
  brand-500: "#4F8EF7"
  brand-600: "#2F6FE4"
  brand-700: "#1E56C4"
  # --- Raw: Neutral ---
  neutral-0: "#FFFFFF"
  neutral-50: "#F7F8FB"
  neutral-100: "#F0F2F7"
  neutral-200: "#E3E6EF"
  neutral-300: "#CBD1E0"
  neutral-400: "#8A90A8"
  neutral-600: "#5A6080"
  neutral-800: "#2A3040"
  neutral-900: "#111827"
  # --- Raw: Status ---
  success-100: "#C9F2E1"
  success-500: "#2ECC8A"
  success-700: "#0B7A4B"
  warning-100: "#FDEFCD"
  warning-500: "#F0B429"
  warning-700: "#8A5A00"
  danger-100: "#FDDCDC"
  danger-500: "#F75555"
  danger-600: "#D42B2B"
  info-500: "#06B6D4"
  # --- Raw: Dark canvas ---
  dark-canvas: "#0F1420"
  dark-surface: "#171D2B"
  dark-raised: "#1E2637"
  dark-border: "#2A3346"
  dark-ink: "#E8EAF2"
  dark-ink-2: "#A3AAC2"
  brand-on-dark: "#7CA9FA"
  # --- Raw: Chart series ---
  chart-1: "#4F8EF7"
  chart-2: "#2ECC8A"
  chart-3: "#F0B429"
  chart-4: "#F75555"
  chart-5: "#8B5CF6"
  chart-6: "#06B6D4"

typography:
  display:   { fontSize: 32px, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.4px }
  metric-lg: { fontSize: 32px, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.5px, numeric: tabular }
  metric-md: { fontSize: 24px, fontWeight: 700, lineHeight: 1.2,  letterSpacing: -0.3px, numeric: tabular }
  h1:        { fontSize: 24px, fontWeight: 700, lineHeight: 1.33, letterSpacing: -0.3px }
  h2:        { fontSize: 18px, fontWeight: 600, lineHeight: 1.4,  letterSpacing: -0.2px }
  h3:        { fontSize: 15px, fontWeight: 600, lineHeight: 1.45, letterSpacing: -0.1px }
  body:      { fontSize: 14px, fontWeight: 400, lineHeight: 1.6,  letterSpacing: 0 }
  body-strong: { fontSize: 14px, fontWeight: 600, lineHeight: 1.6, letterSpacing: 0 }
  caption:   { fontSize: 12px, fontWeight: 400, lineHeight: 1.5,  letterSpacing: 0 }
  label:     { fontSize: 12px, fontWeight: 600, lineHeight: 1.4,  letterSpacing: 0.3px, transform: uppercase }
  data:      { fontSize: 13px, fontWeight: 400, lineHeight: 1.5,  numeric: tabular }

spacing:   { 0: 0, 1: 4px, 2: 8px, 3: 12px, 4: 16px, 5: 20px, 6: 24px, 8: 32px, 10: 40px, 12: 48px, 16: 64px }
radius:    { none: 0, sm: 4px, md: 6px, lg: 8px, xl: 12px, 2xl: 16px, pill: 9999px }
shadow:
  none: "none"
  sm:   "0 1px 2px rgba(17,24,39,0.06)"
  md:   "0 2px 8px rgba(17,24,39,0.08)"
  lg:   "0 8px 24px rgba(17,24,39,0.10)"
  overlay: "0 16px 48px rgba(17,24,39,0.18)"
zindex:    { base: 0, sticky: 100, dropdown: 200, drawer: 300, modal: 400, toast: 500 }
motion:
  duration: { instant: 80ms, fast: 150ms, base: 200ms, slow: 300ms }
  easing:   { standard: "cubic-bezier(0.2,0,0,1)", enter: "cubic-bezier(0,0,0.2,1)", exit: "cubic-bezier(0.4,0,1,1)" }

density:
  comfortable: { rowHeight: 48px, cardPadding: 24px, controlHeight: 40px, gridGap: 20px, bodySize: 14px }
  compact:     { rowHeight: 36px, cardPadding: 16px, controlHeight: 32px, gridGap: 12px, bodySize: 13px }

components:
  [app-header, sidebar-nav, filter-bar, kpi-card, chart-card, data-table,
   issue-panel, detail-drawer, button, input, select, badge, tabs, toast]
---
# DESIGN.md — Work App Design System v1.0

> 업무용 웹앱(어드민 · 대시보드 · 내부툴)의 시각 언어 규격. 에이전트는 UI 코드를 생성하기 전 이 문서를 먼저 읽고, **모든 수치와 색상을 토큰명으로만 참조**한다.

---

## 1. Meta

| 항목        | 값                                                     |
| ----------- | ------------------------------------------------------ |
| 제품 유형   | 업무용 웹앱 (Admin · Dashboard · Internal Tool)      |
| 버전        | 1.0.0                                                  |
| 플랫폼      | Web, Desktop-first (최소 지원 768px)                   |
| 스택        | React 18+ / Tailwind v4 / CSS Variables                |
| 테마        | Light(기본) · Dark · Grey-Skyblue                   |
| 밀도        | comfortable(기본) · compact                           |
| 접근성 목표 | WCAG 2.1 AA                                            |
| 추출 근거   | AX-EIS v3 프로토타입 스크린샷 픽셀 샘플링 (2026-09-27) |

**브랜드 교체 지점** — 다른 프로젝트로 이식할 때 수정하는 값은 `colors.brand-*` 6단계와 `--font-sans` 뿐이다. Semantic 계층 이하는 손대지 않는다.

---

## 2. Design Principles

1. **Data first, chrome last** — 화면의 시각적 무게는 데이터가 가진다. 판단 기준: 어떤 장식 요소를 제거했을 때 정보 해석이 나빠지지 않으면 제거한다.
2. **Status is color, color is status** — 채도 높은 색(`success/warning/danger`)은 상태 전달에만 쓴다. 판단 기준: 이 색이 사용자의 행동을 바꾸지 않으면 neutral로 낮춘다.
3. **One elevation step at a time** — 표면 계층은 canvas → surface → raised → overlay 4단계뿐. 판단 기준: 같은 계층 안에서 그림자로 위계를 만들지 않고, 여백과 보더로 만든다.
4. **Density is a decision, not a default** — 요약 화면은 comfortable, 목록·분석 화면은 compact. 판단 기준: 한 화면의 주 작업이 "읽기"면 comfortable, "훑기/비교"면 compact.
5. **Every state is designed** — default·hover·focus·active·disabled·loading·error·empty 8상태가 정의되지 않은 컴포넌트는 미완성으로 본다.

---

## 3. Foundation Tokens

### 3.1 Color — Raw

브랜드 계열은 AX-EIS 프로토타입에서 실측 추출했다. 추출 방법: 화면 전체를 2px 간격 샘플링 후 채도(max−min > 35) 픽셀의 최빈값.

| 토큰 | HEX | 추출 근거 | 흰 배경 대비 |
| --------------- | ----------- | ----------------------------------- | -------------------------------------------- |
| `brand-500` | `#4F8EF7` | 실측 최빈 채도색 (2,392px) | 2.97:1 —**텍스트 불가**, 면/차트 전용 |
| `brand-300` | `#83B0F9` | 실측 2위 (2,566px), 그라데이션 상단 | 2.05:1 — 장식 전용 |
| `brand-600` | `#2F6FE4` | brand-500 파생 | **4.65:1 AA ✓** — 텍스트·버튼 면 |
| `brand-700` | `#1E56C4` | brand-500 파생 | 7.1:1 ✓ — hover/press, 링크 |
| `brand-100` | `#D8E6FD` | 실측 (67px, 선택 배경) | 배경 전용 |
| `success-500` | `#2ECC8A` | 실측 (1,193px) | 2.08:1 — 면·차트 전용 |
| `success-700` | `#0B7A4B` | 파생 | **5.38:1 ✓** — 상태 텍스트 |
| `warning-500` | `#F0B429` | 실측 (934px) | 면 전용 |
| `warning-700` | `#8A5A00` | 파생 | **5.93:1 ✓** |
| `danger-500` | `#F75555` | 실측 (702px) | 3.29:1 — 면 전용 |
| `danger-600` | `#D42B2B` | 파생 | **5.02:1 ✓** (흰 글자 대비도 5.02 ✓) |
| `neutral-600` | `#5A6080` | 실측 (687px, 보조 텍스트) | **6.14:1 ✓** |
| `neutral-400` | `#8A90A8` | 파생 | 3.16:1 — 대형 텍스트·보더·아이콘만 |
| `neutral-100` | `#F0F2F7` | 실측 캔버스 최빈색 (4,618px) | 배경 |

> **핵심 규칙**: `-500` 단계는 **면(fill)과 차트**, `-600/-700` 단계는 **텍스트와 액션**. 이 경계를 넘으면 AA가 깨진다.

### 3.2 Color — Semantic

| Semantic 토큰 | Light | Dark | 용도 |
| ----------------------------- | --------------- | ------------------------ | ------------------------------------------ |
| `--color-bg-canvas` | `neutral-100` | `dark-canvas` | 페이지 최하위 배경 |
| `--color-bg-surface` | `neutral-0` | `dark-surface` | 카드·패널 |
| `--color-bg-raised` | `neutral-0` | `dark-raised` | 드롭다운·드로어·모달 |
| `--color-bg-subtle` | `neutral-50` | `dark-raised` | 테이블 헤더, 비활성 영역 |
| `--color-bg-hover` | `neutral-100` | `#232C3E` | 행·항목 hover |
| `--color-bg-selected` | `brand-50` | `#1B2942` | 선택 상태 |
| `--color-border` | `neutral-200` | `dark-border` | 기본 1px 보더 |
| `--color-border-strong` | `neutral-300` | `#3A4560` | 입력창·구분 강조 |
| `--color-text-primary` | `neutral-900` | `dark-ink` | 본문·제목 |
| `--color-text-secondary` | `neutral-600` | `dark-ink-2` | 레이블·설명 |
| `--color-text-muted` | `neutral-400` | `#7A8299` | 비활성·플레이스홀더 (14px 이하 본문 금지) |
| `--color-text-onbrand` | `neutral-0` | `neutral-0` | 브랜드 면 위 텍스트 |
| `--color-action` | `brand-600` | `brand-on-dark` | 링크·아이콘 버튼 |
| `--color-action-hover` | `brand-700` | `brand-300` | |
| `--color-fill-brand` | `brand-500` | `brand-500` | 차트·프로그레스·장식 면 |
| `--color-status-success` | `success-700` | `#4ADE9B` | 상태 텍스트/아이콘 |
| `--color-status-warning` | `warning-700` | `#F5C451` | |
| `--color-status-danger` | `danger-600` | `#FF8080` | |
| `--color-status-success-bg` | `success-100` | `rgba(46,204,138,.16)` | 배지 배경 |
| `--color-status-warning-bg` | `warning-100` | `rgba(240,180,41,.16)` | |
| `--color-status-danger-bg` | `danger-100` | `rgba(247,85,85,.16)` | |
| `--color-focus-ring` | `brand-600` | `brand-on-dark` | 포커스 링 |

### 3.3 Typography

**Font family**

```
--font-sans: "Pretendard Variable", Pretendard, -apple-system,
             BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

`Pretendard`는 한·영 혼용 시 x-height와 자간이 균일해 업무용 데이터 화면에 적합하다. 라이선스 제약이 있는 환경에서는 `Noto Sans KR`로 대체하되 `letter-spacing`을 `-0.1px` 더 조인다. *[가정] — 폰트는 지정되지 않아 국내 업무시스템 관행에 따라 선정했다.*

**Scale** — 모든 수치 표시는 `font-variant-numeric: tabular-nums` 필수. 자릿수가 바뀔 때 숫자가 흔들리면 안 된다.

| 토큰 | Size | Weight | LH | LS | 용도 |
| --------------- | ---- | ------ | ---- | ---- | ----------------------- |
| `display` | 32 | 700 | 1.25 | -0.4 | 페이지 최상위 제목 |
| `metric-lg` | 32 | 700 | 1.15 | -0.5 | KPI 카드 주 수치 |
| `metric-md` | 24 | 700 | 1.20 | -0.3 | 보조 수치, 요약 타일 |
| `h1` | 24 | 700 | 1.33 | -0.3 | 화면 제목 |
| `h2` | 18 | 600 | 1.40 | -0.2 | 섹션·카드 제목 |
| `h3` | 15 | 600 | 1.45 | -0.1 | 서브 섹션 |
| `body` | 14 | 400 | 1.60 | 0 | 본문 기본 |
| `body-strong` | 14 | 600 | 1.60 | 0 | 강조 본문 |
| `data` | 13 | 400 | 1.50 | 0 | 테이블 셀 (tabular) |
| `caption` | 12 | 400 | 1.50 | 0 | 보조 설명, 갱신 시각 |
| `label` | 12 | 600 | 1.40 | +0.3 | 대문자 레이블, KPI 제목 |

- 한글 본문은 14px 미만으로 내리지 않는다. 12px는 영문·숫자·레이블 전용.
- 위계는 **weight로 먼저, size로 나중에** 만든다. 같은 14px에서 400↔600 대비를 우선 사용한다.

### 3.4 Spacing — 4px Grid

`0 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

| 상황                | 값                                                      |
| ------------------- | ------------------------------------------------------- |
| 아이콘–레이블 간격 | `space-2` (8)                                         |
| 폼 레이블–입력창   | `space-2` (8)                                         |
| 카드 내부 패딩      | `space-6` (24) comfortable / `space-4` (16) compact |
| 카드 간 그리드 갭   | `space-5` (20) / `space-3` (12)                     |
| 섹션 간 수직 간격   | `space-8` (32)                                        |
| 페이지 좌우 여백    | `space-8` (32), ≤1024px에서 `space-4` (16)         |

### 3.5 Radius

| 토큰      | 값                             | 용도 |
| --------- | ------------------------------ | ---- |
| `sm` 4  | 배지, 체크박스, 차트 막대 상단 |      |
| `md` 6  | 버튼, 입력창, 셀렉트           |      |
| `lg` 8  | 카드, 패널, 테이블 컨테이너    |      |
| `xl` 12 | 드로어, 모달                   |      |
| `pill`  | 상태 칩, 필터 토글             |      |

`2xl`(16) 이상은 사용하지 않는다. 업무용 화면에서 과도한 라운딩은 정보 밀도를 떨어뜨린다.

### 3.6 Shadow & Elevation

| 계층      | 토큰                                               | 처리                          | 사용처      |
| --------- | -------------------------------------------------- | ----------------------------- | ----------- |
| 0 canvas  | `none`                                           | 배경색만                      | 페이지 바탕 |
| 1 surface | `shadow-sm` + 1px `--color-border`             | 카드, 패널                    |             |
| 2 raised  | `shadow-md`                                      | 드롭다운, 팝오버, sticky 헤더 |             |
| 3 overlay | `shadow-overlay` + scrim `rgba(17,24,39,0.45)` | 드로어, 모달                  |             |

다크 테마에서는 그림자 대신 **표면 밝기 차**(`dark-surface` → `dark-raised`)로 계층을 만든다. 어두운 배경 위의 그림자는 보이지 않는다.

### 3.7 Z-index

`base 0 · sticky 100 · dropdown 200 · drawer 300 · modal 400 · toast 500`

임의 값 금지. 새 레이어가 필요하면 토큰을 추가한다.

### 3.8 Motion

| 토큰             | 값                    | 사용 |
| ---------------- | --------------------- | ---- |
| `instant` 80ms | 호버 색 전환          |      |
| `fast` 150ms   | 버튼 press, 배지      |      |
| `base` 200ms   | 드롭다운, 탭 전환     |      |
| `slow` 300ms   | 드로어 슬라이드, 모달 |      |

- 진입은 `easing.enter`, 퇴장은 `easing.exit`, 상태 변화는 `easing.standard`.
- 위치 이동은 `transform`만 사용한다(`left/top` 금지).
- `prefers-reduced-motion: reduce`에서는 모든 duration을 `0ms`로 낮추고 opacity 전환만 남긴다.

---

## 4. Theme

토글은 `<html data-theme="light|dark">`로 제어하고, 미지정 시 `prefers-color-scheme`을 따른다.

```css
:root, :root[data-theme="light"] {
  --color-bg-canvas:#F0F2F7; --color-bg-surface:#FFFFFF; --color-bg-raised:#FFFFFF;
  --color-bg-subtle:#F7F8FB; --color-bg-hover:#F0F2F7; --color-bg-selected:#EEF4FE;
  --color-border:#E3E6EF; --color-border-strong:#CBD1E0;
  --color-text-primary:#111827; --color-text-secondary:#5A6080; --color-text-muted:#8A90A8;
  --color-action:#2F6FE4; --color-action-hover:#1E56C4; --color-fill-brand:#4F8EF7;
  --color-status-success:#0B7A4B; --color-status-warning:#8A5A00; --color-status-danger:#D42B2B;
  --color-focus-ring:#2F6FE4;
}
:root[data-theme="dark"] {
  --color-bg-canvas:#0F1420; --color-bg-surface:#171D2B; --color-bg-raised:#1E2637;
  --color-bg-subtle:#1E2637; --color-bg-hover:#232C3E; --color-bg-selected:#1B2942;
  --color-border:#2A3346; --color-border-strong:#3A4560;
  --color-text-primary:#E8EAF2; --color-text-secondary:#A3AAC2; --color-text-muted:#7A8299;
  --color-action:#7CA9FA; --color-action-hover:#83B0F9; --color-fill-brand:#4F8EF7;
  --color-status-success:#4ADE9B; --color-status-warning:#F5C451; --color-status-danger:#FF8080;
  --color-focus-ring:#7CA9FA;
}
```

**테마 전환 규칙**

- 차트 시리즈 색(`chart-1~6`)은 테마와 무관하게 유지하고, 축·그리드·툴팁만 semantic 토큰으로 바꾼다. 색이 바뀌면 사용자가 시리즈를 다시 학습해야 한다.
- 다크에서 이미지·로고는 배경을 투명 처리하고, 불가능하면 `neutral-0` 패딩 박스에 얹는다.

---

## 5. Layout

### 5.1 Breakpoint

| 이름 | 폭 | 변화 |
| ------ | ---------- | ---------------------------------------------------- |
| `xs` | <768 | 미지원(경고 화면). 업무용 웹앱은 태블릿 이상 전제 |
| `sm` | 768–1023 | 사이드바 아이콘 전용(64px)으로 축소, 그리드 2열 |
| `md` | 1024–1439 | 사이드바 표시, 그리드 3열, 우측 패널은 하단으로 이동 |
| `lg` | 1440–1919 | 기본 레이아웃. 그리드 4열 |
| `xl` | ≥1920 | 컨테이너 1920px 고정, 좌우 여백 흡수 |

### 5.2 App Shell

```
┌──────────────────────────────────────────────────────┐
│ AppHeader                                  56px 고정 │
├────────────┬─────────────────────────────┬───────────┤
│ Sidebar    │ Main                        │ Aside     │
│ 240px      │ flex (min 0)                │ 320px     │
│ (sm: 64px) │                             │ (md 이하  │
│            │  FilterBar (sticky, 56px)   │  하단이동)│
│            │  Content                    │           │
└────────────┴─────────────────────────────┴───────────┘
```

- Sidebar `240px` 고정, 축소 시 `64px`.
- Aside(알림·이슈 패널) `320px` 고정. `md` 이하에서 Main 하단으로 스택.
- Main 내부 그리드: 12컬럼, 갭 `space-5`(comfortable) / `space-3`(compact).

### 5.3 Grid 배치 규칙

| 카드 폭 | 컬럼 | 사용              |
| ------- | ---- | ----------------- |
| 1/4     | 3    | KPI 카드          |
| 1/3     | 4    | 요약 차트         |
| 1/2     | 6    | 비교 차트         |
| 2/3     | 8    | 주 추세 차트      |
| 1/1     | 12   | 데이터 테이블, 맵 |

- **한 행의 카드 높이는 항상 동일**하게 정렬한다(`align-items: stretch`).
- KPI 카드는 한 행에 4~6개. 7개 이상이면 두 행으로 나누되 행마다 의미 그룹을 맞춘다.

### 5.4 Density 적용

```css
[data-density="comfortable"]{ --row-h:48px; --card-pad:24px; --control-h:40px; --grid-gap:20px; --body-size:14px; }
[data-density="compact"]    { --row-h:36px; --card-pad:16px; --control-h:32px; --grid-gap:12px; --body-size:13px; }
```

| 화면 성격 | 기본 밀도 |
| ------------------- | --------------- |
| 요약·경영 대시보드 | `comfortable` |
| 분석·비교 화면 | `compact` |
| 목록·상세 테이블 | `compact` |
| 폼·설정 | `comfortable` |

밀도는 화면 단위로 설정하고, 한 화면 안에서 섞지 않는다.

---

## 6. Components

각 컴포넌트는 `default · hover · focus · active · disabled · loading · error · empty` 중 해당되는 상태를 모두 정의한다.

### 6.1 Button

**Variant**

| variant | 배경 | 텍스트 | 보더 | 용도 |
| ------------- | ---------------------- | ------------------------ | ---------------------------- | -------------------- |
| `primary` | `--color-action` | `--color-text-onbrand` | none | 화면당 1개의 주 액션 |
| `secondary` | `--color-bg-surface` | `--color-text-primary` | 1px`--color-border-strong` | 보조 액션 |
| `ghost` | transparent | `--color-action` | none | 3순위, 툴바 |
| `danger` | `danger-600` | `neutral-0` | none | 파괴적 액션 |

**Size** — `sm` 32px / `md` 40px(기본) / `lg` 48px. 패딩 `0 space-4`, 아이콘 동반 시 `gap space-2`.

**State**

| 상태          | 처리                                                                             |
| ------------- | -------------------------------------------------------------------------------- |
| hover         | primary →`--color-action-hover`, secondary/ghost → `--color-bg-hover`      |
| focus-visible | `outline: 2px solid var(--color-focus-ring); outline-offset: 2px`              |
| active        | `transform: scale(0.98)`, `duration.fast`                                    |
| disabled      | `opacity: .45; cursor: not-allowed`, 포커스 불가                               |
| loading       | 레이블 유지 + 좌측 16px 스피너,`aria-busy="true"`, 폭 고정(레이아웃 점프 금지) |

**Props**

| prop                         | 타입                               | 기본값        |
| ---------------------------- | ---------------------------------- | ------------- |
| `variant`                  | `primary\|secondary\|ghost\|danger` | `secondary` |
| `size`                     | `sm\|md\|lg`                       | `md`        |
| `iconLeft` / `iconRight` | `ReactNode`                      | —            |
| `loading`                  | `boolean`                        | `false`     |
| `disabled`                 | `boolean`                        | `false`     |
| `fullWidth`                | `boolean`                        | `false`     |

- ✅ 한 화면에 `primary` 하나. 두 개가 보이면 하나를 `secondary`로 내린다.
- ❌ `danger`를 강조 목적으로 쓰지 않는다. 되돌릴 수 없는 동작에만.

### 6.2 Input / Select

- 높이 `var(--control-h)`, radius `md`, 보더 1px `--color-border-strong`, 배경 `--color-bg-surface`.
- 패딩 `0 space-3`. 좌측 아이콘 사용 시 `padding-left: space-8`.
- hover: 보더 `neutral-400` → focus: 보더 `--color-action` + `outline 2px --color-focus-ring, offset 1px`.
- error: 보더 `danger-600`, 하단 `caption` 메시지 `--color-status-danger`, `aria-invalid="true"`, `aria-describedby`로 연결.
- disabled: 배경 `--color-bg-subtle`, 텍스트 `--color-text-muted`.
- 레이블은 항상 표시한다. placeholder를 레이블 대용으로 쓰지 않는다.

| prop                     | 타입        | 기본값    |
| ------------------------ | ----------- | --------- |
| `label`                | `string`  | 필수      |
| `value` / `onChange` | —          | 필수      |
| `error`                | `string`  | —        |
| `hint`                 | `string`  | —        |
| `size`                 | `sm\|md`   | `md`    |
| `required`             | `boolean` | `false` |

### 6.3 Badge

- 높이 20px(sm) / 24px(md), radius `pill`, 패딩 `0 space-2`, `label` 타이포.
- tone: `neutral · brand · success · warning · danger`. 배경은 `-bg` 토큰, 텍스트는 `--color-status-*`.
- 색만으로 상태를 전달하지 않는다. 아이콘 또는 텍스트를 함께 둔다(색각 이상 대응).

### 6.4 Tabs

- 하단 보더 2px 방식. 선택 탭: 텍스트 `--color-text-primary` + 인디케이터 `--color-action`, 비선택: `--color-text-secondary`.
- 높이 40px, 항목 간 `space-6`.
- `role="tablist"`, 좌우 화살표로 이동, `Home/End` 지원.

### 6.5 AppHeader

- 높이 56px 고정, 배경 `--color-bg-surface`, 하단 1px `--color-border`, `z-index: sticky`.
- 좌: 로고 + 제품명(`h3`) + 환경 배지. 우: 타임스탬프(`caption`) → 알림 → 테마 토글 → 사용자.
- 로고 좌우 최소 여백 `space-4`, 원본 비율 유지.
- 알림 배지는 우상단 오프셋 `-2px`, 99 초과 시 `99+`.

### 6.6 SidebarNav

- 폭 240px / 축소 64px, 배경 `--color-bg-surface`, 우측 1px `--color-border`.
- 항목 높이 40px, radius `md`, 좌 패딩 `space-3`, 아이콘 20px + `gap space-3`.
- 상태: hover `--color-bg-hover` / active `--color-bg-selected` + 텍스트 `--color-action` + 좌측 3px 인디케이터 `--color-action`.
- 그룹 헤더는 `label` 타이포 + `--color-text-muted`, 상단 `space-4` 여백.
- 항목 우측 카운트 배지는 `danger` tone. 축소 모드에서는 아이콘 우상단 점으로 대체.

| prop          | 타입                                         |
| ------------- | -------------------------------------------- |
| `items`     | `{ id, label, icon, badge?, children? }[]` |
| `activeId`  | `string`                                   |
| `collapsed` | `boolean`                                  |

### 6.7 FilterBar

- 높이 56px, sticky(`top: 56px`), 배경 `--color-bg-surface`, 하단 1px `--color-border`.
- 좌측: 필터 컨트롤들(`gap space-3`). 우측: 초기화(`ghost`) + 기간 토글 + 내보내기.
- 기간 토글은 `pill` 세그먼트. 선택 항목 배경 `--color-action`, 텍스트 `--color-text-onbrand`.
- 화면 폭이 허용되면 필터를 드롭다운 안에 숨기지 않고 한 줄로 펼친다.
- 적용된 필터 개수를 초기화 버튼 옆에 배지로 표시한다.

### 6.8 KpiCard

구조(고정): **레이블 → 주 수치 → 델타 → 스파크라인**

| 요소           | 토큰                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| 컨테이너       | 배경`--color-bg-surface`, radius `lg`, 패딩 `var(--card-pad)`, `shadow-sm`, 보더 1px |
| 상단 액센트 바 | 높이 3px, 상태색`-500` 계열, radius 상단만                                                 |
| 레이블         | `label` / `--color-text-secondary`                                                       |
| 주 수치        | `metric-lg` / `--color-text-primary` / tabular-nums                                      |
| 델타           | `caption` + 방향 아이콘, 상승=`--color-status-success`, 하락=`--color-status-danger`   |
| 스파크라인     | 높이 40px,`--color-fill-brand` 라인 + 8% 투명도 area, 축·눈금 없음                        |

- **델타 색은 방향이 아니라 의미로 결정한다.** 불량률 상승은 `danger`다. `polarity: 'higher-is-better' | 'lower-is-better'` prop으로 제어한다.
- 클릭 가능한 카드는 hover 시 `shadow-md` + 보더 `--color-border-strong`, `role="button"` + `tabIndex=0` + Enter/Space 처리.
- loading: 각 요소를 스켈레톤 블록으로 대체, 카드 높이 유지.
- empty: 수치 자리에 `—`, 델타·스파크라인 숨김, `caption`으로 "데이터 없음".

| prop         | 타입                                       | 기본값               |
| ------------ | ------------------------------------------ | -------------------- |
| `label`    | `string`                                 | 필수                 |
| `value`    | `string \| number`                        | 필수                 |
| `unit`     | `string`                                 | —                   |
| `delta`    | `{ value:number, baseline:string }`      | —                   |
| `polarity` | `'higher-is-better'\|'lower-is-better'`   | `higher-is-better` |
| `status`   | `'neutral'\|'success'\|'warning'\|'danger'` | `neutral`          |
| `series`   | `number[]`                               | —                   |
| `onClick`  | `() => void`                             | —                   |
| `loading`  | `boolean`                                | `false`            |

### 6.9 ChartCard (Recharts 전제)

**컨테이너** — 배경 `--color-bg-surface`, radius `lg`, 패딩 `var(--card-pad)`, 헤더(제목 `h2` + 부제 `caption`) + 우측 액션, 본문 높이 최소 240px.

**차트 토큰**

| 항목          | 규격                                                                                |
| ------------- | ----------------------------------------------------------------------------------- |
| 시리즈 팔레트 | `chart-1` → `chart-6` 순서 고정. 7개 이상이면 "기타"로 묶는다                  |
| 축 선         | `--color-border` 1px, 축 레이블 `caption` / `--color-text-secondary`          |
| 그리드        | 가로선만`--color-border`, `strokeDasharray="3 3"`. 세로 그리드 금지             |
| 라인          | `strokeWidth: 2`, `dot: false`, 활성 dot `r: 4`                               |
| Area          | 동일 색 12% 투명도 그라데이션, 하단 0%                                              |
| Bar           | radius`[4,4,0,0]`, 카테고리 간 `barCategoryGap: 25%`                            |
| 목표선        | `ReferenceLine`, `--color-text-muted`, `strokeDasharray="4 4"`, 우측 레이블   |
| 툴팁          | 배경`--color-bg-raised`, radius `md`, `shadow-md`, 보더 1px, 패딩 `space-3` |
| 범례          | 상단 우측, 12px 원형 마커 +`caption`. 항목 3개 이하면 생략 가능                   |
| 축 숫자       | tabular-nums, 천 단위 구분, 단위는 축 제목에 1회만                                  |

**데이터 결손 처리** — `null`은 선을 끊는다(0으로 보간 금지). 결손 구간은 `--color-text-muted` 점선으로 잇고 범례에 "추정" 표기.

**상태** — loading: 축 프레임 유지 + 영역 스켈레톤 / empty: 중앙 아이콘 + "표시할 데이터가 없습니다" + 필터 초기화 버튼 / error: `danger` 아이콘 + 재시도 버튼.

### 6.10 DataTable

| 요소     | 규격                                                           |
| -------- | -------------------------------------------------------------- |
| 헤더     | 배경`--color-bg-subtle`, `label` 타이포, 높이 40px, sticky |
| 행       | 높이`var(--row-h)`, 하단 1px `--color-border`              |
| 셀       | 패딩`0 space-4`, `data` 타이포                             |
| 정렬     | 텍스트 좌측,**숫자 우측**, 상태 배지 중앙                |
| hover    | 행 배경`--color-bg-hover`                                    |
| selected | 행 배경`--color-bg-selected` + 좌측 2px `--color-action`   |
| zebra    | 사용하지 않음. 보더로 충분하다                                 |

- 첫 컬럼과 액션 컬럼은 가로 스크롤 시 고정(`position: sticky`).
- 가로 스크롤 존재 시 우측 가장자리에 그라데이션 힌트를 표시한다.
- 정렬 가능한 헤더는 `aria-sort`를 갱신하고 방향 아이콘을 항상 자리 잡아 둔다(레이아웃 점프 금지).
- loading: 행 5개 스켈레톤 / empty: 컬럼 헤더 유지 + 중앙 안내 + 주 액션 1개.

| prop | 타입 | 기본값 |
| ---------------------------- | --------------------------------------------------------- | --------- |
| `columns` | `{ key, header, align?, width?, sortable?, sticky? }[]` | 필수 |
| `rows` | `T[]` | 필수 |
| `density` | `'comfortable'\|'compact'` | 상위 상속 |
| `selectable` | `boolean` | `false` |
| `onRowClick` | `(row:T)=>void` | — |
| `sort` / `onSortChange` | `{ key, dir }` | — |
| `loading` / `emptyState` | — | — |

### 6.11 IssuePanel (Aside)

- 폭 320px, 배경 `--color-bg-surface`, 좌측 1px `--color-border`, 섹션 간 `space-6`.
- 섹션 헤더: `label` + 건수 배지, 우측 "전체 보기" `ghost sm`.
- 항목: 좌측 3px 우선순위 인디케이터(`danger`/`warning`/`neutral`), 제목 `body-strong` 2줄 말줄임, 메타 `caption`(담당자 · 기한), 우측 상태 배지.
- 기한 초과 항목은 기한 텍스트를 `--color-status-danger` + `body-strong`으로.
- 항목 높이는 가변이되 최소 64px. 터치 타깃 44px 이상.

### 6.12 DetailDrawer

드릴다운의 **표준 패턴**. 카드·행 클릭 시 우측에서 슬라이드인한다.

| 항목       | 규격                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| 폭         | 480px(기본) / 640px(`wide`) / 최대 `90vw`                           |
| 배경       | `--color-bg-raised`, 좌측 radius `xl`, `shadow-overlay`           |
| Scrim      | `rgba(17,24,39,0.45)`, 클릭 시 닫힘                                   |
| 애니메이션 | `transform: translateX(100%→0)`, `duration.slow`, `easing.enter` |
| 헤더       | 높이 64px, 제목`h2` + 부제 `caption`, 우측 닫기(44px)               |
| 본문       | 패딩`space-6`, 독립 스크롤                                            |
| 푸터       | 높이 72px, sticky, 상단 1px 보더, 우측 정렬`secondary` + `primary`  |

**접근성** — 열릴 때 포커스를 헤더로 이동, 내부 포커스 트랩, `Esc` 닫기, 닫을 때 트리거 요소로 포커스 복귀, `role="dialog"` + `aria-modal="true"` + `aria-labelledby`.

**중첩 금지** — 드로어 위에 드로어를 열지 않는다. 더 깊은 탐색이 필요하면 드로어 내부 탭 또는 전체 페이지 전환으로 처리한다.

### 6.13 Toast

- 우하단, 폭 360px, radius `lg`, `shadow-lg`, `z-index: toast`.
- tone별 좌측 4px 인디케이터 + 아이콘. 기본 5초 후 자동 소멸, hover 시 정지.
- `error` tone은 자동 소멸하지 않는다. 명시적 닫기만.
- `role="status"`(info/success) / `role="alert"`(error). 최대 3개 스택, 초과 시 오래된 것부터 제거.

---

## 7. Patterns

### 7.1 드릴다운 흐름 (표준)

```
KPI 카드 클릭
  → DetailDrawer 열림 (상위 화면 맥락 유지)
    ├ 상단: 지표 요약 + 기간 비교
    ├ 중단: 분해 차트 (부문/제품/고객 축)
    ├ 하단: 원인 후보 리스트 (이상 항목 danger 강조)
    └ 푸터: [닫기] [이슈 등록]
      → 이슈 등록 폼 (담당자·기한·우선순위)
        → Toast 확인 + 이슈 패널에 즉시 반영
```

- 드로어는 상위 화면을 가리지 않는다. 배경의 KPI 행은 scrim 너머로 계속 보여야 맥락이 유지된다.
- 드로어 상태는 URL 쿼리(`?detail=kpi.revenue`)에 반영해 새로고침·공유가 가능하게 한다.

### 7.2 폼

- 1열 배치 기본. 논리적으로 짝인 필드만 2열(시작일/종료일 등).
- 레이블 상단 배치, 필수 표시는 레이블 뒤 `*` + `aria-required`.
- 검증은 blur 시점에 1차, 제출 시 전체. 입력 중에는 에러를 띄우지 않는다.
- 에러 발생 시 첫 번째 오류 필드로 포커스 이동 + 상단에 요약 배너.
- 제출 중에는 `primary` 버튼만 loading, 폼 전체를 비활성화하지 않는다.

### 7.3 빈 상태 (Empty)

| 유형             | 처리                                                      |
| ---------------- | --------------------------------------------------------- |
| 최초 데이터 없음 | 아이콘 + 한 줄 설명 + 주 액션 1개                         |
| 필터 결과 없음   | "조건에 맞는 항목이 없습니다" +**필터 초기화** 버튼 |
| 권한 없음        | 사유 명시 + 요청 경로 안내. 빈 표를 보여주지 않는다       |

### 7.4 로딩

- 레이아웃이 예측 가능하면 **스켈레톤**, 불가능하면 스피너.
- 스켈레톤은 실제 콘텐츠와 동일한 높이·radius. 펄스 애니메이션 `1.5s ease-in-out infinite`.
- 200ms 미만으로 끝나는 로딩은 표시하지 않는다(깜빡임 방지).
- 부분 갱신 시 기존 데이터를 유지한 채 `opacity: .6` + 상단 프로그레스 바.

### 7.5 에러

| 범위          | 처리                                                     |
| ------------- | -------------------------------------------------------- |
| 필드          | 인라인 메시지                                            |
| 카드/위젯     | 카드 내부 에러 상태 + 재시도 버튼. 다른 카드는 정상 유지 |
| 화면          | 전체 에러 화면 + 재시도 + 지원 연락 경로                 |
| 전역/네트워크 | Toast(`error`, 자동 소멸 없음)                         |

에러 메시지는 **무엇이 실패했고 다음에 무엇을 하면 되는지**를 쓴다. 에러 코드는 보조로만 노출한다.

### 7.6 상태색 사용 규칙

| 상태 | 색 | 반드시 동반 |
| ---- | ----------- | ------------------------------ |
| 정상 | `success` | 체크 아이콘 또는 "정상" 텍스트 |
| 주의 | `warning` | 경고 아이콘 |
| 위험 | `danger` | 경고 아이콘 + 수치 |
| 중립 | `neutral` | — |

색은 항상 보조 수단이다. 색을 제거해도 의미가 전달되어야 한다.

---

## 8. Accessibility (WCAG 2.1 AA)

**대비**

- 본문 텍스트 4.5:1, 18px 이상 또는 14px Bold는 3:1, UI 컴포넌트 경계·아이콘은 3:1.
- `neutral-400`(3.16:1)은 본문 텍스트로 사용 금지 — 플레이스홀더·보더·비활성 전용.
- `brand-500` / `success-500` / `danger-500`은 텍스트 색으로 사용 금지 — 면·차트 전용.

**포커스**

- 모든 인터랙티브 요소에 `:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }`.
- `outline: none`만 두고 대체 표시가 없는 코드는 금지.
- 포커스 순서는 시각적 순서와 일치시킨다.

**키보드**

- 전체 기능을 키보드만으로 수행할 수 있어야 한다.
- 드로어·모달: 포커스 트랩, `Esc` 닫기, 닫은 뒤 트리거로 복귀.
- 테이블: 행 이동 `↑/↓`, 정렬 헤더 `Enter/Space`.
- 페이지 최상단에 "본문 바로가기" 링크를 둔다.

**터치 타깃** — 최소 44×44px. 시각 크기가 작으면 투명 패딩으로 확보한다.

**스크린 리더**

- 아이콘 전용 버튼에 `aria-label` 필수.
- KPI 카드: `aria-label="월 매출 달성률 94.2퍼센트, 전월 대비 2.1퍼센트포인트 상승"`.
- 차트: `role="img"` + `aria-label`에 핵심 추세를 문장으로, 원본 데이터는 접근 가능한 표로 제공.
- 실시간 갱신 영역은 `aria-live="polite"`.

**기타**

- `prefers-reduced-motion` 대응 필수.
- 색각 이상 대비: 상태는 색+아이콘, 차트는 색+패턴/레이블.
- 브라우저 200% 확대에서 가로 스크롤 없이 사용 가능해야 한다.

---

## 9. Implementation

### 9.1 파일 구조

```
src/
├─ styles/
│  ├─ tokens.css        # raw + semantic CSS 변수 (단일 진실 공급원)
│  ├─ theme.css         # data-theme 매핑
│  └─ density.css       # data-density 매핑
├─ components/
│  ├─ primitives/       # Button, Input, Select, Badge, Tabs, Toast
│  ├─ layout/           # AppHeader, SidebarNav, FilterBar, AppShell
│  ├─ data/             # KpiCard, ChartCard, DataTable
│  └─ overlay/          # DetailDrawer, Modal
├─ charts/
│  ├─ chartTheme.ts     # Recharts 공통 설정
│  └─ formatters.ts     # 숫자·단위·날짜 포매터
└─ DESIGN.md
```

### 9.2 토큰 정의

```css
/* tokens.css — raw */
:root{
  --brand-50:#EEF4FE; --brand-100:#D8E6FD; --brand-300:#83B0F9;
  --brand-500:#4F8EF7; --brand-600:#2F6FE4; --brand-700:#1E56C4;
  --neutral-0:#FFFFFF; --neutral-50:#F7F8FB; --neutral-100:#F0F2F7;
  --neutral-200:#E3E6EF; --neutral-300:#CBD1E0; --neutral-400:#8A90A8;
  --neutral-600:#5A6080; --neutral-800:#2A3040; --neutral-900:#111827;
  --success-100:#C9F2E1; --success-500:#2ECC8A; --success-700:#0B7A4B;
  --warning-100:#FDEFCD; --warning-500:#F0B429; --warning-700:#8A5A00;
  --danger-100:#FDDCDC;  --danger-500:#F75555;  --danger-600:#D42B2B;
  --chart-1:#4F8EF7; --chart-2:#2ECC8A; --chart-3:#F0B429;
  --chart-4:#F75555; --chart-5:#8B5CF6; --chart-6:#06B6D4;

  --space-1:4px;  --space-2:8px;  --space-3:12px; --space-4:16px;
  --space-5:20px; --space-6:24px; --space-8:32px; --space-10:40px;
  --space-12:48px; --space-16:64px;

  --radius-sm:4px; --radius-md:6px; --radius-lg:8px;
  --radius-xl:12px; --radius-pill:9999px;

  --shadow-sm:0 1px 2px rgba(17,24,39,.06);
  --shadow-md:0 2px 8px rgba(17,24,39,.08);
  --shadow-lg:0 8px 24px rgba(17,24,39,.10);
  --shadow-overlay:0 16px 48px rgba(17,24,39,.18);

  --z-sticky:100; --z-dropdown:200; --z-drawer:300; --z-modal:400; --z-toast:500;

  --dur-instant:80ms; --dur-fast:150ms; --dur-base:200ms; --dur-slow:300ms;
  --ease-standard:cubic-bezier(.2,0,0,1);
  --ease-enter:cubic-bezier(0,0,.2,1);
  --ease-exit:cubic-bezier(.4,0,1,1);
}

@media (prefers-reduced-motion: reduce){
  :root{ --dur-instant:0ms; --dur-fast:0ms; --dur-base:0ms; --dur-slow:0ms; }
}
```

```js
// tailwind.config.js (v4는 @theme 사용 가능)
export default {
  theme: {
    extend: {
      colors: {
        canvas:'var(--color-bg-canvas)', surface:'var(--color-bg-surface)',
        raised:'var(--color-bg-raised)', subtle:'var(--color-bg-subtle)',
        border:'var(--color-border)', 'border-strong':'var(--color-border-strong)',
        ink:'var(--color-text-primary)', 'ink-2':'var(--color-text-secondary)',
        'ink-muted':'var(--color-text-muted)',
        action:'var(--color-action)', 'action-hover':'var(--color-action-hover)',
        success:'var(--color-status-success)', warning:'var(--color-status-warning)',
        danger:'var(--color-status-danger)',
      },
      borderRadius:{ sm:'var(--radius-sm)', md:'var(--radius-md)', lg:'var(--radius-lg)', xl:'var(--radius-xl)' },
      boxShadow:{ sm:'var(--shadow-sm)', md:'var(--shadow-md)', lg:'var(--shadow-lg)', overlay:'var(--shadow-overlay)' },
    }
  }
}
```

```ts
// charts/chartTheme.ts
export const chartTheme = {
  series: ['var(--chart-1)','var(--chart-2)','var(--chart-3)',
           'var(--chart-4)','var(--chart-5)','var(--chart-6)'],
  axis:   { stroke:'var(--color-border)', tick:{ fill:'var(--color-text-secondary)', fontSize:12 } },
  grid:   { stroke:'var(--color-border)', strokeDasharray:'3 3', vertical:false },
  tooltip:{ background:'var(--color-bg-raised)', border:'1px solid var(--color-border)',
            borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-md)', padding:'var(--space-3)' },
  line:   { strokeWidth:2, dot:false, activeDot:{ r:4 } },
  bar:    { radius:[4,4,0,0] as [number,number,number,number], barCategoryGap:'25%' },
  reference:{ stroke:'var(--color-text-muted)', strokeDasharray:'4 4' },
};
```

### 9.3 네이밍 규칙

| 대상          | 규칙                      | 예                               |
| ------------- | ------------------------- | -------------------------------- |
| Raw 토큰      | `--{계열}-{단계}`       | `--brand-600`                  |
| Semantic 토큰 | `--color-{역할}-{수식}` | `--color-bg-surface`           |
| 컴포넌트      | PascalCase                | `KpiCard`                      |
| 파일          | 컴포넌트명과 동일         | `KpiCard.tsx`                  |
| Variant prop  | 소문자 유니온             | `'primary' \| 'secondary'`      |
| 상태 클래스   | `is-` 접두              | `is-loading`                   |
| 데이터 속성   | `data-{축}`             | `data-theme`, `data-density` |

### 9.4 에이전트 체크리스트

UI 코드를 출력하기 전 다음을 자체 검증한다.

- [ ] 하드코딩된 HEX·px가 0개인가 (토큰 참조만 사용했는가)
- [ ] 텍스트 색에 `-500` 단계를 쓰지 않았는가
- [ ] 모든 인터랙티브 요소에 `:focus-visible` 스타일이 있는가
- [ ] 각 컴포넌트의 loading·empty·error 상태를 구현했는가
- [ ] 숫자 표시에 `tabular-nums`를 적용했는가
- [ ] 한 화면에 `primary` 버튼이 1개인가
- [ ] 터치 타깃이 44px 이상인가
- [ ] 다크 테마에서 대비가 유지되는가
- [ ] 상태 전달에 색 외의 수단(아이콘/텍스트)이 있는가

---

## 10. Do's & Don'ts (Guardrails)

### Do

- 모든 색·간격·radius를 토큰명으로 참조한다.
- 위계는 weight → 색 → size 순으로 만든다.
- 한 행의 카드 높이를 동일하게 맞춘다.
- 차트 시리즈 색은 `chart-1`부터 순서대로 배정하고 테마 간 유지한다.
- 델타의 색은 방향이 아니라 지표의 `polarity`로 결정한다.
- 드릴다운은 DetailDrawer로 통일하고 URL에 상태를 반영한다.
- 빈 상태·로딩·에러를 반드시 함께 설계한다.
- 다크 테마 계층은 그림자가 아니라 표면 밝기 차로 만든다.

### Don't

- ❌ 토큰에 없는 색·간격·radius를 새로 만들지 않는다.
- ❌ `brand-500` / `success-500` / `danger-500`을 텍스트 색으로 쓰지 않는다 (AA 미달).
- ❌ `neutral-400`을 본문 텍스트에 쓰지 않는다 (3.16:1).
- ❌ 색만으로 상태를 전달하지 않는다.
- ❌ 한 화면에 `primary` 버튼을 2개 이상 두지 않는다.
- ❌ 그라데이션·글래스모피즘·장식 그림자를 업무 화면에 쓰지 않는다.
- ❌ radius를 12px 초과로 올리지 않는다(드로어·모달 제외).
- ❌ 테이블에 zebra stripe를 넣지 않는다.
- ❌ 차트에서 결손값을 0으로 보간하지 않는다.
- ❌ 드로어 위에 드로어를 중첩하지 않는다.
- ❌ 화면 폭이 충분한데 필터를 드롭다운 안에 숨기지 않는다.
- ❌ `outline: none`을 대체 포커스 표시 없이 쓰지 않는다.
- ❌ 한 화면에서 comfortable과 compact를 혼용하지 않는다.
- ❌ 200ms 미만 로딩에 스피너를 띄우지 않는다.

---

## 11. Changelog

| 버전  | 날짜       | 변경                                                                                                                                                |
| ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2026-09-27 | 최초 작성. AX-EIS v3 프로토타입 실측 팔레트 기반, 업무용 웹앱 범용 시스템으로 일반화. Light/Dark · comfortable/compact 이중 축, 컴포넌트 14종 정의 |

---

## 확인이 필요한 [가정]

| 항목             | 적용한 가정             | 확인 요청                                                     |
| ---------------- | ----------------------- | ------------------------------------------------------------- |
| 본문 폰트        | `Pretendard Variable` | 사내 라이선스 정책상 사용 가능한지,`Noto Sans KR` 대체 여부 |
| 최소 지원 폭     | 768px (모바일 미지원)   | 현장/모바일 조회 요구가 있는지                                |
| 차트 라이브러리  | Recharts                | 대용량 시계열·히트맵 요구가 있으면 ECharts 재검토 필요       |
| 로고 자산        | AX 로고 SVG 미수령      | 다크 테마용 반전 버전 존재 여부                               |
| 인쇄/PDF         | 별도 레이아웃 미정의    | 보고서 출력이 요구사항이면`@media print` 섹션 추가 필요     |
| 데이터 갱신 주기 | 미정                    | 실시간이면`aria-live` 및 폴링 UI 규칙 보강 필요             |
