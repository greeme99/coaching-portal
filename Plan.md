# 미래경영자 코칭 포털 (개발 기획서)

## 1. 프로젝트 개요 (Overview)
- **프로젝트명**: 미래경영자 코칭 포털
- **목적**: 삼성전자 상생협력 아카데미가 주관하는 '미래경영자 심화과정'의 일환으로, 코치와 피코치(경영자 후보, 2세 경영자 등)가 온라인에서 코칭 일정을 소화하고 관련 워크시트 및 코칭 일지를 작성/보관할 수 있는 통합 웹앱 환경 제공.
- **주요 대상**: 
  - 피코치: 가업을 승계받거나 경영 수업을 받고 있는 차세대 리더
  - 코치: 삼성전자 상생협력 아카데미 소속 전문 코치

## 2. 앱 아키텍처 및 기술 스택
- **형태**: Single Page Application (SPA) 기반의 클라이언트 사이드 웹앱
- **기술 스택**: HTML5, CSS3 (Vanilla), JavaScript (ES6+ Vanilla)
- **상태 관리**: Browser `localStorage`를 활용한 실시간 자동 저장(Auto-save) 체계
- **디자인 시스템**: `DESIGN.md` 기반의 Design Tokens 적용 (CSS Variables), 다크모드/라이트모드 지원, 반응형 웹 (태블릿 이상 화면에 최적화)

## 3. 핵심 메뉴 구조 (Information Architecture)

1. **프로그램 개요 (Overview)**: 코칭 프로그램의 전반적인 프로세스와 목표 안내
2. **코칭 합의서 (Agreement)**: 1회기 시작 시 작성하는 상호 의무 및 비밀 보장 서약
3. **1회차 · 자기 탐색 (Session 1)**: 인생 그래프(Life Line) 및 핵심 가치(Core Values) 도출 워크시트
4. **2회차 · 리더십 & 관계 (Session 2)**: 리더십 8대 역량 진단 수레바퀴(Leadership Wheel) 및 소통 시나리오
5. **3회차 · 셀프 코칭 (Session 3)**: 미래 경영 비전 만다라트(Mandalart) 및 5단계 셀프 코칭 루틴
6. **코칭 일지 (Coach Log Editor)**: 코치 전용 메뉴로, 매 회차별 코칭 기록 및 다음 회차 팔로업 메모 작성 기능
7. **참조 자료실 (Reference Toolkit)**: 경영자 코칭에 필요한 추가 문서 및 추천 도서 링크 제공

## 4. 세션별 핵심 콘텐츠 기획 (Session Plan)

### [SESSION 1] 2세 경영자로서의 자기 탐색 (Identity & Core Values)
- **목표**: 타인의 기대나 선대 경영자의 잔상을 걷어내고, 내가 소중히 여기는 핵심 가치와 과거 변곡점을 통해 나의 경영자 정체성을 발견.
- **핵심 워크시트**:
  - `WORKSHEET 1-1`: 인생 그래프 (Life Line) 변곡점 성찰 (시기/단계, 주요 사건, 성찰 내용 입력)
  - `WORKSHEET 1-2`: 경영자 핵심 가치 (Core Values) 선택기 (제시된 가치 중 최대 3개 선택)

### [SESSION 2] 리더십 스타일 진단 및 관계 관리 (Leadership & Relationship)
- **목표**: 선대 경영자 및 현장 베테랑 임직원과의 소통 마찰을 극복하고, 경영자로서의 균형 잡힌 역량 진단.
- **핵심 워크시트**:
  - `WORKSHEET 2-1`: 차세대 리더십 8대 역량 수레바퀴 (Leadership Wheel) (1~10점 자가평가 및 방사형 차트 시각화)

### [SESSION 3] 지속가능한 셀프 코칭 체계 구축 (Vision & Self-Reliance)
- **목표**: 향후 3~5년 후의 미래 경영 청사진을 구체화하고, 코칭 종료 후에도 위기 시 스스로 점검하는 루틴 체득.
- **핵심 워크시트**:
  - `WORKSHEET 3-1`: 미래 경영 비전 만다라트 (Mandalart 9-Grid) (중앙에 핵심 경영 비전을 정의하고 주변 8칸에 세부 실천 축 기록)

## 5. 데이터 저장 로직 (Local Storage Data Model)
모든 입력 필드는 브라우저 캐시에 실시간으로 저장되며, 키값 충돌 방지를 위해 아래와 같이 네임스페이스(`mk_coaching_`)를 적용합니다.

- `mk_coaching_state`: 현재 선택된 뷰포트 상태 (Quick View / Deep Guide 모드 등)
- `mk_coaching_theme`: 현재 선택된 테마 (light/dark)
- `mk_coaching_sidebar`: 사이드바 접힘/펼침 상태
- `mk_coaching_agreement`: 코칭 합의서 작성 내용 객체
- `mk_coaching_lifeline`: 1회차 인생 그래프 행렬 데이터 (Array)
- `mk_coaching_values`: 1회차 선택된 핵심 가치 배열 (Array, 최대 3개)
- `mk_coaching_wheel`: 2회차 리더십 진단 점수 (Object)
- `mk_coaching_mandalart`: 3회차 만다라트 셀 데이터 (Object)
- `mk_coaching_logs`: 코치 전용 일지 1~3회차 데이터 (Object)

## 6. 향후 고도화 방안 (Next Steps)
- **Backend/DB 연동**: 현재 `localStorage` 기반의 독립 실행형 구조에서, 실제 사용자 로그인(Authentication) 및 클라우드 DB 연동(API 통신)으로 확장 가능.
- **PDF/이미지 추출 고도화**: 만다라트 및 리더십 차트 이미지를 포함하여 리포트를 고해상도 PDF로 내보내는 기능(`html2pdf.js` 등 활용).
- **알림 및 스케줄링**: 1/2/3회차 코칭 일정에 맞춘 자동 이메일 알림 기능.
