/**
 * 삼성전자 상생협력 아카데미 — 미래경영자 코칭 포털
 * Client Application Logic (app.js)
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Initial State & Local Storage Keys
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    STATE: 'mk_coaching_app_state',
    AGREEMENT: 'mk_coaching_agreement',
    LOGS: 'mk_coaching_logs',
    LIFELINE: 'mk_coaching_lifeline',
    VALUES: 'mk_coaching_values',
    LEADERSHIP: 'mk_coaching_leadership',
    MANDALART: 'mk_coaching_mandalart',
    LIFECOACH_WS1: 'mk_lifecoach_ws1',
    LIFECOACH_WS2: 'mk_lifecoach_ws2',
    LIFECOACH_WS3: 'mk_lifecoach_ws3',
    COHORTS: 'mk_coaching_cohorts',
    MIGRATED: 'mk_coaching_cohort_migrated'
  };

  // 기수별로 분리 저장되는 키 — 나머지(STATE/COHORTS)는 기수와 무관한 공통 설정
  const SCOPED_KEYS = [
    STORAGE_KEYS.AGREEMENT,
    STORAGE_KEYS.LOGS,
    STORAGE_KEYS.LIFELINE,
    STORAGE_KEYS.VALUES,
    STORAGE_KEYS.LEADERSHIP,
    STORAGE_KEYS.MANDALART,
    STORAGE_KEYS.LIFECOACH_WS1,
    STORAGE_KEYS.LIFECOACH_WS2,
    STORAGE_KEYS.LIFECOACH_WS3
  ];

  const DEFAULT_COHORTS = [
    { id: 'c1', label: '1기' },
    { id: 'c2', label: '2기' },
    { id: 'c3', label: '3기' },
    { id: 'c4', label: '4기' }
  ];

  // 공식 구글폼 (삼성전자 상생협력 아카데미 미경자 코칭일지)
  const GOOGLE_FORM_BASE = 'https://docs.google.com/forms/d/e/1FAIpQLSedf_CYG8CDnr42WDstAE2MdpdN3ReucNn4HbnKSy606QRVCg/viewform';

  const DEFAULT_STATE = {
    theme: 'gray-skyblue',
    density: 'comfortable',
    roleMode: 'coachee', // 'coachee' | 'coach' | 'admin'
    cohortId: null,      // null 이면 최신 기수를 사용
    currentTab: 'overview',
    viewModes: {
      session1: 'quick',
      session2: 'quick',
      session3: 'quick',
      lifecoach1: 'quick',
      lifecoach2: 'quick',
      lifecoach3: 'quick'
    }
  };

  // 기수 목록과 현재 기수는 appState 보다 먼저 확정해야 한다 (저장 키가 기수에 의존)
  let cohorts = readRaw(STORAGE_KEYS.COHORTS);
  if (!Array.isArray(cohorts) || !cohorts.length) {
    cohorts = DEFAULT_COHORTS.slice();
    writeRaw(STORAGE_KEYS.COHORTS, cohorts);
  }

  function latestCohortId() {
    return cohorts[cohorts.length - 1].id;
  }

  function findCohort(id) {
    return cohorts.find(c => c.id === id) || null;
  }

  const savedState = readRaw(STORAGE_KEYS.STATE);
  let appState = Object.assign({}, DEFAULT_STATE, savedState);
  if (!savedState || savedState.theme === 'light') {
    appState.theme = 'gray-skyblue';
  }
  // 저장된 기수가 없거나 삭제되었으면 최신 기수로 되돌린다
  if (!findCohort(appState.cohortId)) {
    appState.cohortId = latestCohortId();
  }
  if (!['coachee', 'coach', 'admin'].includes(appState.roleMode)) {
    appState.roleMode = 'coachee';
  }
  saveJson(STORAGE_KEYS.STATE, appState);

  migrateLegacyCohortData();

  // --------------------------------------------------------------------------
  // 2. Utility Helpers
  // --------------------------------------------------------------------------
  // 기수 스코프를 적용하지 않는 원본 접근 (기수 목록 / 앱 설정 / 마이그레이션용)
  function readRaw(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('LocalStorage load error:', e);
      return null;
    }
  }

  function writeRaw(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // 워크시트/합의서/일지 키는 현재 기수 네임스페이스를 붙인다
  function scopedKey(key, cohortId) {
    if (!SCOPED_KEYS.includes(key)) return key;
    return key + '__' + (cohortId || appState.cohortId);
  }

  function loadJson(key) {
    return readRaw(scopedKey(key));
  }

  function saveJson(key, data) {
    writeRaw(scopedKey(key), data);
  }

  // 기수 도입 이전에 저장된 데이터를 기본(최신) 기수 소유로 1회 이관한다
  function migrateLegacyCohortData() {
    if (readRaw(STORAGE_KEYS.MIGRATED)) return;
    const target = appState.cohortId;
    let moved = 0;
    SCOPED_KEYS.forEach(key => {
      const legacy = localStorage.getItem(key);
      if (legacy === null) return;
      const dest = scopedKey(key, target);
      if (localStorage.getItem(dest) !== null) return; // 이미 있으면 덮지 않는다
      try {
        localStorage.setItem(dest, legacy);
        if (localStorage.getItem(dest) === legacy) {
          localStorage.removeItem(key);
          moved += 1;
        }
      } catch (e) {
        console.warn('Cohort migration error:', key, e);
      }
    });
    writeRaw(STORAGE_KEYS.MIGRATED, { at: new Date().toISOString(), cohortId: target, moved: moved });
  }

  // 새로고침 후에도 안내 문구를 이어서 보여주기 위한 대기 토스트
  function queueToast(message) {
    try {
      sessionStorage.setItem('mk_coaching_pending_toast', message);
    } catch (e) { /* 세션 저장 실패는 무시 */ }
  }

  function flushQueuedToast() {
    try {
      const msg = sessionStorage.getItem('mk_coaching_pending_toast');
      if (msg) {
        sessionStorage.removeItem('mk_coaching_pending_toast');
        showToast(msg);
      }
    } catch (e) { /* 무시 */ }
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 200ms ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // --------------------------------------------------------------------------
  // 3. App Shell Controllers (Theme, Density, Role, Tabs)
  // --------------------------------------------------------------------------
  function applyTheme(theme) {
    appState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      if (theme === 'gray-skyblue') {
        btn.title = '테마: 그레이-스카이블루 (클릭 시 다크 모드로 전환)';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
      } else if (theme === 'dark') {
        btn.title = '테마: 다크 (클릭 시 라이트 모드로 전환)';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      } else {
        btn.title = '테마: 라이트 (클릭 시 그레이-스카이블루로 전환)';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      }
    }
    saveJson(STORAGE_KEYS.STATE, appState);
  }

  function applyDensity(density) {
    appState.density = density;
    document.documentElement.setAttribute('data-density', density);
    const btn = document.getElementById('densityToggleBtn');
    if (btn) {
      btn.title = density === 'comfortable' ? '컴팩트 모드로 전환' : '컴포터블 모드로 전환';
    }
    saveJson(STORAGE_KEYS.STATE, appState);
  }

  const ROLE_LABELS = {
    coachee: '피코치 모드',
    coach: '코치 전용 모드',
    admin: '관리자 모드'
  };

  const ROLE_TOASTS = {
    coachee: '피코치 학습 가이드 모드로 전환되었습니다',
    coach: '코치 전용 모드로 전환되었습니다 (일지 작성 활성화)',
    admin: '관리자 모드로 전환되었습니다 (기수 관리 활성화)'
  };

  function applyRoleMode(role, notify) {
    appState.roleMode = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
      const on = btn.dataset.role === role;
      // 마크업에 .is-active, JS는 .active 를 써서 두 개가 동시에 선택돼 보이던 문제 수정
      btn.classList.toggle('active', on);
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    // 관리자는 코치 도구까지 볼 수 있고, 관리자 메뉴는 관리자에게만 보인다
    const seesCoachTools = role === 'coach' || role === 'admin';
    document.querySelectorAll('.coach-only').forEach(el => {
      el.style.display = seesCoachTools ? '' : 'none';
    });
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = role === 'admin' ? '' : 'none';
    });

    const roleIndicator = document.getElementById('currentRoleLabel');
    if (roleIndicator) {
      roleIndicator.textContent = ROLE_LABELS[role] || ROLE_LABELS.coachee;
    }

    // 숨겨진 메뉴에 머물러 있으면 개요로 돌려보낸다
    const current = document.querySelector(`.nav-link[data-tab="${appState.currentTab}"]`);
    if (current && current.style.display === 'none') showTab('overview');

    saveJson(STORAGE_KEYS.STATE, appState);
    if (notify !== false) showToast(ROLE_TOASTS[role] || ROLE_TOASTS.coachee);
  }

  function showTab(tabId) {
    appState.currentTab = tabId;
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`section-${tabId}`);
    if (targetSection) targetSection.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
      const on = link.dataset.tab === tabId;
      // 사이드바는 .is-active, 상단 탭은 .active 를 사용한다 (두 규칙 모두 유지)
      link.classList.toggle('active', on);
      link.classList.toggle('is-active', on);
      link.setAttribute('aria-current', on ? 'page' : 'false');
    });

    scrollMainToTop();
    if (targetSection) setupReveal(targetSection);
    if (tabId === 'overview') renderProgress();
    saveJson(STORAGE_KEYS.STATE, appState);
  }

  // --------------------------------------------------------------------------
  // 3-1. Scroll Helpers (실제 스크롤 컨테이너는 .main-wrapper)
  // --------------------------------------------------------------------------
  function getScroller() {
    return document.getElementById('mainContent');
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function scrollMainToTop() {
    const scroller = getScroller();
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (scroller) scroller.scrollTo({ top: 0, behavior: behavior });
    else window.scrollTo({ top: 0, behavior: behavior });
  }

  // --------------------------------------------------------------------------
  // 3-2. Scroll Reveal — 섹션 전환 시 카드가 순차적으로 부드럽게 등장
  // --------------------------------------------------------------------------
  let revealObserver = null;

  function setupReveal(section) {
    const targets = section.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { root: getScroller(), rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }

    targets.forEach((el, i) => {
      el.classList.remove('is-visible');
      el.style.transitionDelay = (i * 60) + 'ms';
      revealObserver.observe(el);
    });
  }

  // --------------------------------------------------------------------------
  // 3-3. 진행 현황 집계 — 브라우저에 실제 저장된 데이터만 계산한다
  // --------------------------------------------------------------------------
  const MANDALART_PETALS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

  function filled(value) {
    return String(value == null ? '' : value).trim().length > 0;
  }

  const PROGRESS_SPEC = [
    {
      key: 'agreement',
      tab: 'agreement',
      total: 7,
      done: function () {
        const d = loadJson(STORAGE_KEYS.AGREEMENT);
        if (!d) return 0;
        let n = ['coacheeName', 'coacheeCompany', 'coachName', 'goal1', 'goal2', 'goal3']
          .filter(k => filled(d[k])).length;
        if (d.isSigned) n += 1;
        return n;
      }
    },
    {
      key: 'career',
      tab: 'session1',
      total: 4,
      done: function () {
        let n = 0;
        const lifeline = loadJson(STORAGE_KEYS.LIFELINE);
        if (Array.isArray(lifeline) && lifeline.some(r => r && filled(r.event))) n++;
        const values = loadJson(STORAGE_KEYS.VALUES);
        if (Array.isArray(values) && values.length >= 3) n++;
        if (loadJson(STORAGE_KEYS.LEADERSHIP)) n++;
        const m = loadJson(STORAGE_KEYS.MANDALART);
        if (m && filled(m.core) && MANDALART_PETALS.every(k => filled(m[k]))) n++;
        return n;
      }
    },
    {
      key: 'life',
      tab: 'lifecoach1',
      total: 11,
      done: function () {
        const ws1 = loadJson(STORAGE_KEYS.LIFECOACH_WS1) || {};
        const ws2 = loadJson(STORAGE_KEYS.LIFECOACH_WS2) || {};
        const ws3 = loadJson(STORAGE_KEYS.LIFECOACH_WS3) || {};
        return ['topic', 'reason', 'goal'].filter(k => filled(ws1[k])).length
          + ['mentor', 'future', 'nofail', 'aha'].filter(k => filled(ws2[k])).length
          + ['identity', 'valueLink', 'actions', 'keywords'].filter(k => filled(ws3[k])).length;
      }
    }
  ];

  function renderProgress() {
    let doneSum = 0;
    let totalSum = 0;

    PROGRESS_SPEC.forEach(spec => {
      const done = Math.min(spec.done(), spec.total);
      const pct = Math.round((done / spec.total) * 100);
      doneSum += done;
      totalSum += spec.total;

      const card = document.querySelector(`[data-progress="${spec.key}"]`);
      if (!card) return;

      const valueEl = card.querySelector('[data-progress-value]');
      const barEl = card.querySelector('[data-progress-bar]');
      const hintEl = card.querySelector('[data-progress-hint]');

      if (valueEl) valueEl.innerHTML = `${pct}<small>%</small>`;
      if (barEl) barEl.style.width = pct + '%';
      if (hintEl) {
        hintEl.textContent = done === 0
          ? '아직 작성 전 · 눌러서 시작하기'
          : (done >= spec.total ? '작성 완료' : `${done}/${spec.total} 항목 작성`);
      }
      card.setAttribute('aria-label', `${card.querySelector('.progress-card-label')?.textContent || spec.key} 진행률 ${pct}퍼센트, 눌러서 이동`);
    });

    const overall = totalSum ? Math.round((doneSum / totalSum) * 100) : 0;
    const badge = document.getElementById('progressOverallBadge');
    if (badge) {
      badge.textContent = `전체 ${overall}%`;
      badge.className = 'badge num ' + (overall >= 100 ? 'badge-success' : overall > 0 ? 'badge-brand' : 'badge-neutral');
    }
  }

  // --------------------------------------------------------------------------
  // 3-4. 기수(Cohort) 선택 & 관리
  // --------------------------------------------------------------------------
  function currentCohortLabel() {
    const c = findCohort(appState.cohortId);
    return c ? c.label : '—';
  }

  function cohortItemCount(cohortId) {
    return SCOPED_KEYS.filter(k => localStorage.getItem(scopedKey(k, cohortId)) !== null).length;
  }

  function renderCohortPicker() {
    const sel = document.getElementById('cohortSelect');
    if (sel) {
      sel.innerHTML = cohorts
        .map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`)
        .join('');
      sel.value = appState.cohortId;
    }
    document.querySelectorAll('[data-cohort-label]').forEach(el => {
      el.textContent = currentCohortLabel();
    });
    const badge = document.getElementById('adminCurrentCohort');
    if (badge) badge.textContent = `현재 기수 ${currentCohortLabel()}`;
  }

  function switchCohort(cohortId) {
    if (!findCohort(cohortId) || cohortId === appState.cohortId) {
      renderCohortPicker();
      return;
    }
    appState.cohortId = cohortId;
    saveJson(STORAGE_KEYS.STATE, appState);
    // 워크시트 모듈들이 로드 시점의 기수 데이터를 들고 있으므로 전체를 다시 초기화한다
    queueToast(`${currentCohortLabel()} 데이터로 전환되었습니다`);
    location.reload();
  }

  function saveCohorts() {
    writeRaw(STORAGE_KEYS.COHORTS, cohorts);
    renderCohortPicker();
    renderCohortTable();
  }

  function addCohort(label) {
    const name = String(label || '').trim();
    if (!name) {
      showToast('기수 이름을 입력해 주세요.');
      return false;
    }
    if (cohorts.some(c => c.label === name)) {
      showToast(`'${name}' 기수가 이미 있습니다.`);
      return false;
    }
    const used = new Set(cohorts.map(c => c.id));
    let n = cohorts.length + 1;
    while (used.has('c' + n)) n += 1;
    cohorts.push({ id: 'c' + n, label: name });
    saveCohorts();
    showToast(`'${name}' 기수가 추가되었습니다.`);
    return true;
  }

  function renameCohort(cohortId) {
    const c = findCohort(cohortId);
    if (!c) return;
    const next = window.prompt('기수 이름을 입력하세요.', c.label);
    if (next === null) return;
    const name = next.trim();
    if (!name) {
      showToast('기수 이름은 비워 둘 수 없습니다.');
      return;
    }
    if (cohorts.some(o => o !== c && o.label === name)) {
      showToast(`'${name}' 기수가 이미 있습니다.`);
      return;
    }
    c.label = name;
    saveCohorts();
    showToast('기수 이름이 변경되었습니다.');
  }

  function deleteCohort(cohortId) {
    const c = findCohort(cohortId);
    if (!c) return;
    if (cohorts.length <= 1) {
      showToast('마지막 남은 기수는 삭제할 수 없습니다.');
      return;
    }
    if (cohortId === appState.cohortId) {
      showToast('현재 선택된 기수는 삭제할 수 없습니다. 다른 기수로 전환한 뒤 삭제해 주세요.');
      return;
    }
    const count = cohortItemCount(cohortId);
    const warn = count > 0
      ? `'${c.label}'에 저장된 ${count}개 항목(합의서·워크시트·일지)이 함께 삭제되며 되돌릴 수 없습니다.`
      : `'${c.label}'에는 저장된 데이터가 없습니다.`;
    if (!window.confirm(`${warn}\n\n정말 삭제할까요?`)) return;

    SCOPED_KEYS.forEach(k => localStorage.removeItem(scopedKey(k, cohortId)));
    cohorts = cohorts.filter(o => o.id !== cohortId);
    saveCohorts();
    showToast(`'${c.label}' 기수를 삭제했습니다.`);
  }

  function renderCohortTable() {
    const body = document.getElementById('cohortTableBody');
    if (!body) return;
    body.innerHTML = cohorts.map(c => {
      const isCurrent = c.id === appState.cohortId;
      const count = cohortItemCount(c.id);
      return `<tr${isCurrent ? ' class="is-current"' : ''}>
        <th scope="row">${escapeHtml(c.label)}</th>
        <td class="num">${count}개</td>
        <td>${isCurrent ? '<span class="badge badge-success">선택됨</span>' : '<span class="badge badge-neutral">대기</span>'}</td>
        <td class="col-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-cohort-action="select" data-cohort-id="${escapeHtml(c.id)}"${isCurrent ? ' disabled' : ''}>선택</button>
          <button type="button" class="btn btn-ghost btn-sm" data-cohort-action="rename" data-cohort-id="${escapeHtml(c.id)}">이름 변경</button>
          <button type="button" class="btn btn-ghost btn-sm btn-danger" data-cohort-action="delete" data-cohort-id="${escapeHtml(c.id)}"${isCurrent || cohorts.length <= 1 ? ' disabled' : ''}>삭제</button>
        </td>
      </tr>`;
    }).join('');
  }

  function initCohortUI() {
    renderCohortPicker();
    renderCohortTable();

    document.getElementById('cohortSelect')?.addEventListener('change', e => {
      switchCohort(e.target.value);
    });

    document.getElementById('cohortAddForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('newCohortLabel');
      if (addCohort(input.value)) input.value = '';
      input.focus();
    });

    document.getElementById('cohortTableBody')?.addEventListener('click', e => {
      const btn = e.target.closest('[data-cohort-action]');
      if (!btn) return;
      const id = btn.dataset.cohortId;
      if (btn.dataset.cohortAction === 'select') switchCohort(id);
      else if (btn.dataset.cohortAction === 'rename') renameCohort(id);
      else if (btn.dataset.cohortAction === 'delete') deleteCohort(id);
    });
  }

  // --------------------------------------------------------------------------
  // 3-5. 반응형 내비게이션 — 데스크톱은 고정 사이드바, 태블릿 이하는 드로어
  //      CSS 의 @media (max-width: 1024px) 와 같은 분기점을 사용한다.
  // --------------------------------------------------------------------------
  const DRAWER_MQ = window.matchMedia('(max-width: 1024px)');

  function isDrawerMode() {
    return DRAWER_MQ.matches;
  }

  function setDrawer(open) {
    const nav = document.getElementById('sidebarNav');
    const backdrop = document.getElementById('sidebarBackdrop');
    const btn = document.getElementById('sidebarToggleBtn');
    if (!nav) return;
    nav.classList.toggle('is-open', open);
    backdrop?.classList.toggle('is-open', open);
    backdrop?.setAttribute('aria-hidden', String(!open));
    btn?.setAttribute('aria-expanded', String(open));
    // 드로어가 열린 동안 뒤 본문이 스크롤되지 않도록
    document.getElementById('mainContent')?.toggleAttribute('inert', open);
    if (open) nav.querySelector('.nav-link')?.focus({ preventScroll: true });
  }

  function toggleSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    if (isDrawerMode()) {
      setDrawer(!nav.classList.contains('is-open'));
      return;
    }
    // 데스크톱: 아이콘 레일로 접기/펼치기
    nav.classList.toggle('collapsed');
    document.getElementById('sidebarToggleBtn')
      ?.setAttribute('aria-expanded', String(!nav.classList.contains('collapsed')));
  }

  function syncNavToViewport() {
    const nav = document.getElementById('sidebarNav');
    const btn = document.getElementById('sidebarToggleBtn');
    if (!nav) return;
    if (isDrawerMode()) {
      // 드로어로 전환될 때는 항상 닫힌 상태에서 시작
      setDrawer(false);
    } else {
      // 데스크톱 복귀: 드로어 흔적을 지우고 레일 상태만 남긴다
      nav.classList.remove('is-open');
      document.getElementById('sidebarBackdrop')?.classList.remove('is-open');
      document.getElementById('mainContent')?.removeAttribute('inert');
      btn?.setAttribute('aria-expanded', String(!nav.classList.contains('collapsed')));
    }
  }

  function initResponsiveNav() {
    document.getElementById('sidebarToggleBtn')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebarBackdrop')?.addEventListener('click', () => setDrawer(false));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isDrawerMode()) setDrawer(false);
    });

    // 메뉴를 고르면 드로어는 닫는다
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (isDrawerMode()) setDrawer(false);
      });
    });

    if (DRAWER_MQ.addEventListener) DRAWER_MQ.addEventListener('change', syncNavToViewport);
    else DRAWER_MQ.addListener(syncNavToViewport); // 구형 Safari

    syncNavToViewport();
  }

  function resumeWork() {
    const next = PROGRESS_SPEC.find(spec => spec.done() < spec.total);
    if (!next) {
      showToast('모든 워크시트가 작성되었습니다. 코칭 일지에서 기록을 확인해 보세요.');
      return;
    }
    showTab(next.tab);
  }

  // --------------------------------------------------------------------------
  // 4. View Mode Toggles (Quick Card vs Deep Guide)
  // --------------------------------------------------------------------------
  function setSessionViewMode(sessionKey, mode) {
    appState.viewModes[sessionKey] = mode;
    const parent = document.getElementById(`section-${sessionKey}`);
    if (!parent) return;

    parent.querySelectorAll(`[data-view-btn="${sessionKey}"]`).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
      btn.setAttribute('aria-selected', btn.dataset.mode === mode);
    });

    const quickView = parent.querySelector('.session-quick-view');
    const deepView = parent.querySelector('.session-deep-view');
    if (quickView && deepView) {
      quickView.style.display = mode === 'quick' ? 'block' : 'none';
      deepView.style.display = mode === 'deep' ? 'block' : 'none';
    }
    saveJson(STORAGE_KEYS.STATE, appState);
  }

  // --------------------------------------------------------------------------
  // 5. Worksheet 1: Life Line & Core Values (Session 1)
  // --------------------------------------------------------------------------
  const DEFAULT_VALUES = ['신뢰', '혁신', '사람중심', '책임감', '장기적 안목', '과감한 결단', '진정성', '성장', '자율', '상생협력', '겸손', '실행력'];
  let selectedValues = loadJson(STORAGE_KEYS.VALUES) || ['신뢰', '사람중심', '혁신'];

  function initValuesSelector() {
    const container = document.getElementById('valuesChipContainer');
    if (!container) return;

    container.innerHTML = '';
    DEFAULT_VALUES.forEach(val => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `value-chip ${selectedValues.includes(val) ? 'selected' : ''}`;
      chip.textContent = val;
      chip.addEventListener('click', () => {
        if (selectedValues.includes(val)) {
          selectedValues = selectedValues.filter(v => v !== val);
        } else {
          if (selectedValues.length >= 3) {
            showToast('핵심 가치는 최대 3개까지 선택할 수 있습니다.');
            return;
          }
          selectedValues.push(val);
        }
        chip.classList.toggle('selected', selectedValues.includes(val));
        saveJson(STORAGE_KEYS.VALUES, selectedValues);
        updateSelectedValuesDisplay();
      });
      container.appendChild(chip);
    });
    updateSelectedValuesDisplay();
  }

  function updateSelectedValuesDisplay() {
    const display = document.getElementById('selectedValuesList');
    if (display) {
      display.textContent = selectedValues.length > 0 
        ? selectedValues.map((v, i) => `${i + 1}. ${v}`).join('  |  ')
        : '선택된 핵심 가치가 없습니다 (최대 3개 선택)';
    }
  }

  // Life Line Table
  let lifeLineRecords = loadJson(STORAGE_KEYS.LIFELINE) || [
    { period: '학창 시절/청년기', event: '첫 독립 프로젝트 및 팀 리딩 경험', learning: '실패 속에서 소통의 중요성 체득' },
    { period: '회사 입사 초기', event: '현장 실무 투입 및 선배들의 시선 마주함', learning: '전문성 부족에 대한 인정과 겸손한 학습' },
    { period: '경영 참여 시점', event: '신규 전략 과제 주도 및 의사결정 참여', learning: '책임감의 무게와 나만의 리더십 기준 고민' }
  ];

  function renderLifeLine() {
    const container = document.getElementById('lifeLineRows');
    if (!container) return;

    container.innerHTML = '';
    lifeLineRecords.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'timeline-row';
      row.innerHTML = `
        <input type="text" class="form-input" value="${escapeHtml(item.period)}" placeholder="시기/단계" data-idx="${idx}" data-field="period">
        <input type="text" class="form-input" value="${escapeHtml(item.event)}" placeholder="주요 사건 및 변곡점" data-idx="${idx}" data-field="event">
        <input type="text" class="form-input" value="${escapeHtml(item.learning)}" placeholder="성찰 및 나에게 남긴 의미" data-idx="${idx}" data-field="learning">
        <button type="button" class="btn btn-ghost btn-sm" data-delete-idx="${idx}" title="삭제">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', e => {
        const { idx, field } = e.target.dataset;
        lifeLineRecords[idx][field] = e.target.value;
        saveJson(STORAGE_KEYS.LIFELINE, lifeLineRecords);
      });
    });

    container.querySelectorAll('[data-delete-idx]').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(btn.dataset.deleteIdx, 10);
        lifeLineRecords.splice(idx, 1);
        saveJson(STORAGE_KEYS.LIFELINE, lifeLineRecords);
        renderLifeLine();
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. Worksheet 2: Leadership Wheel (Session 2)
  // --------------------------------------------------------------------------
  const WHEEL_DIMENSIONS = [
    { key: 'strategy', label: '전략적 사고 및 비전 제시', desc: '사업 방향성과 핵심 과제를 명확히 짚어내는 능력' },
    { key: 'communication', label: '현장 소통 및 경청', desc: '직원들의 고충을 열린 마음으로 듣고 공감하는 소통' },
    { key: 'trust', label: '신뢰 구축 및 솔선수범', desc: '언행일치와 원칙 준수로 조직의 신망을 얻는 능력' },
    { key: 'resilience', label: '감정 조절 및 회복탄력성', desc: '위기나 비판 상황에서도 평정심을 유지하고 회복하는 힘' },
    { key: 'influence', label: '선배 임직원 설득 및 조화', desc: '기존 베테랑 조직과 갈등 없이 융합을 이끌어내는 역량' },
    { key: 'feedback', label: '피드백 수용 및 자기 객관화', desc: '나의 약점과 다른 시각을 열린 자세로 받아들이는 태도' },
    { key: 'change', label: '변화 추진 및 과감한 결단', desc: '익숙함에 안주하지 않고 새로운 시도를 주도하는 결단력' },
    { key: 'selfcare', label: '자기 돌봄 및 에너지 관리', desc: '리더로서의 지치지 않는 체력과 멘탈 건강 유지' }
  ];

  let leadershipScores = loadJson(STORAGE_KEYS.LEADERSHIP) || {
    strategy: 7, communication: 6, trust: 8, resilience: 6,
    influence: 5, feedback: 7, change: 6, selfcare: 5
  };

  function initLeadershipWheel() {
    const container = document.getElementById('wheelSlidersContainer');
    if (!container) return;

    container.innerHTML = '';
    WHEEL_DIMENSIONS.forEach(dim => {
      const currentScore = leadershipScores[dim.key] || 5;
      const item = document.createElement('div');
      item.className = 'wheel-item';
      item.innerHTML = `
        <div class="wheel-item-header">
          <span>${dim.label}</span>
          <span class="score-display font-semibold text-action" id="score-text-${dim.key}">${currentScore}점</span>
        </div>
        <input type="range" min="1" max="10" value="${currentScore}" class="wheel-slider" data-key="${dim.key}">
        <div class="caption-text">${dim.desc}</div>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll('.wheel-slider').forEach(slider => {
      slider.addEventListener('input', e => {
        const key = e.target.dataset.key;
        const val = parseInt(e.target.value, 10);
        leadershipScores[key] = val;
        const textEl = document.getElementById(`score-text-${key}`);
        if (textEl) textEl.textContent = `${val}점`;
        saveJson(STORAGE_KEYS.LEADERSHIP, leadershipScores);
        renderWheelGraph();
      });
    });

    renderWheelGraph();
  }

  function renderWheelGraph() {
    const svg = document.getElementById('wheelChartSvg');
    if (!svg) return;

    const size = 300;
    const center = size / 2;
    const maxRadius = 120;
    const count = WHEEL_DIMENSIONS.length;
    const angleStep = (Math.PI * 2) / count;

    let points = [];
    let backgroundLines = '';

    // Draw concentric scale rings
    [2, 4, 6, 8, 10].forEach(level => {
      const r = (level / 10) * maxRadius;
      backgroundLines += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="var(--color-border)" stroke-dasharray="2,2" />`;
    });

    WHEEL_DIMENSIONS.forEach((dim, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const xEnd = center + Math.cos(angle) * maxRadius;
      const yEnd = center + Math.sin(angle) * maxRadius;
      backgroundLines += `<line x1="${center}" y1="${center}" x2="${xEnd}" y2="${yEnd}" stroke="var(--color-border)" />`;

      const score = leadershipScores[dim.key] || 5;
      const rScore = (score / 10) * maxRadius;
      const xScore = center + Math.cos(angle) * rScore;
      const yScore = center + Math.sin(angle) * rScore;
      points.push(`${xScore},${yScore}`);
    });

    const polygonPoints = points.join(' ');
    svg.innerHTML = `
      ${backgroundLines}
      <polygon points="${polygonPoints}" fill="var(--color-fill-brand)" fill-opacity="0.25" stroke="var(--color-action)" stroke-width="2" />
      ${points.map(pt => {
        const [x, y] = pt.split(',');
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--color-action)" />`;
      }).join('')}
    `;
  }

  // --------------------------------------------------------------------------
  // 7. Worksheet 3: Mandalart 9-Grid (Session 3)
  // --------------------------------------------------------------------------
  let mandalartData = loadJson(STORAGE_KEYS.MANDALART) || {
    core: '지속 가능한 성장을 이끄는 신뢰받는 미래경영자',
    c1: '조직 문화 혁신',
    c2: '현장 소통 정례화',
    c3: '신사업 발굴 및 추진',
    c4: '선대 원칙 계승과 재해석',
    c5: '핵심 인재 육성',
    c6: '재무 건전성 및 리스크 관리',
    c7: '리더십 자기 성찰 루틴',
    c8: '글로벌 경쟁력 확보'
  };

  function initMandalart() {
    const keys = ['c1', 'c2', 'c3', 'c4', 'core', 'c5', 'c6', 'c7', 'c8'];
    keys.forEach(k => {
      const el = document.getElementById(`mandalart-${k}`);
      if (el) {
        el.value = mandalartData[k] || '';
        el.addEventListener('input', e => {
          mandalartData[k] = e.target.value;
          saveJson(STORAGE_KEYS.MANDALART, mandalartData);
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. Coaching Agreement Form
  // --------------------------------------------------------------------------
  let agreementData = loadJson(STORAGE_KEYS.AGREEMENT) || {
    coacheeName: '',
    coacheeCompany: '',
    coachName: '',
    startDate: new Date().toISOString().slice(0, 10),
    goal1: '',
    goal2: '',
    goal3: '',
    isSigned: false
  };

  function initAgreementForm() {
    const form = document.getElementById('agreementForm');
    if (!form) return;

    ['coacheeName', 'coacheeCompany', 'coachName', 'startDate', 'goal1', 'goal2', 'goal3'].forEach(f => {
      const input = document.getElementById(`agree_${f}`);
      if (input) {
        input.value = agreementData[f] || '';
        input.addEventListener('input', e => {
          agreementData[f] = e.target.value;
          saveJson(STORAGE_KEYS.AGREEMENT, agreementData);
        });
      }
    });

    const signCheckbox = document.getElementById('agree_isSigned');
    if (signCheckbox) {
      signCheckbox.checked = !!agreementData.isSigned;
      signCheckbox.addEventListener('change', e => {
        agreementData.isSigned = e.target.checked;
        saveJson(STORAGE_KEYS.AGREEMENT, agreementData);
        showToast(agreementData.isSigned ? '코칭 합의서가 공식 서명되었습니다.' : '합의서 서명이 해제되었습니다.');
      });
    }

    document.getElementById('btnPrintAgreement')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btnCopyAgreement')?.addEventListener('click', () => {
      const text = `[미래경영자 심화과정 코칭 합의서]
고객(리더): ${agreementData.coacheeName || '(미입력)'} (${agreementData.coacheeCompany || '소속사'})
담당 코치: ${agreementData.coachName || '(미입력)'}
시작일: ${agreementData.startDate} (총 3회기)
[핵심 코칭 목표]
1. ${agreementData.goal1 || '(미작성)'}
2. ${agreementData.goal2 || '(미작성)'}
3. ${agreementData.goal3 || '(미작성)'}
상호 합의 및 서명 완료 상태: ${agreementData.isSigned ? '서명완료' : '작성중'}`;
      navigator.clipboard.writeText(text).then(() => {
        showToast('코칭 합의서 전문이 클립보드에 복사되었습니다.');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. Coach Log Editor (Coach Mode Exclusive)
  // --------------------------------------------------------------------------
  let currentLogSession = 1;
  let coachingLogs = loadJson(STORAGE_KEYS.LOGS) || {
    1: { discovery: '', coreKeywords: '', actionPlan: '', nextFollowUp: '', coachReview: '', updatedAt: '' },
    2: { discovery: '', coreKeywords: '', actionPlan: '', nextFollowUp: '', coachReview: '', updatedAt: '' },
    3: { discovery: '', coreKeywords: '', actionPlan: '', nextFollowUp: '', coachReview: '', updatedAt: '' }
  };

  function selectLogSession(sessionNum) {
    currentLogSession = sessionNum;
    document.querySelectorAll('.log-nav-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.logSession, 10) === sessionNum);
    });

    const activeTitle = document.getElementById('activeLogSessionTitle');
    if (activeTitle) activeTitle.textContent = `${sessionNum}회차 코칭 일지`;

    const logData = coachingLogs[sessionNum] || {};
    ['discovery', 'coreKeywords', 'actionPlan', 'nextFollowUp', 'coachReview'].forEach(f => {
      const el = document.getElementById(`log_${f}`);
      if (el) el.value = logData[f] || '';
    });

    updateLogSaveStatus(logData.updatedAt);
  }

  function updateLogSaveStatus(timestamp) {
    const statusEl = document.getElementById('logSaveStatusBadge');
    if (!statusEl) return;
    if (timestamp) {
      statusEl.className = 'badge badge-success';
      statusEl.textContent = `저장됨 (${timestamp})`;
    } else {
      statusEl.className = 'badge badge-neutral';
      statusEl.textContent = '작성 대기';
    }
  }

  function initLogEditor() {
    ['discovery', 'coreKeywords', 'actionPlan', 'nextFollowUp', 'coachReview'].forEach(f => {
      const el = document.getElementById(`log_${f}`);
      if (el) {
        el.addEventListener('input', e => {
          if (!coachingLogs[currentLogSession]) coachingLogs[currentLogSession] = {};
          coachingLogs[currentLogSession][f] = e.target.value;
          const now = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
          coachingLogs[currentLogSession].updatedAt = now;
          saveJson(STORAGE_KEYS.LOGS, coachingLogs);
          updateLogSaveStatus(now);
        });
      }
    });

    document.querySelectorAll('.log-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectLogSession(parseInt(btn.dataset.logSession, 10));
      });
    });

    // Copy Log to Clipboard
    document.getElementById('btnCopyLog')?.addEventListener('click', () => {
      const d = coachingLogs[currentLogSession] || {};
      const agree = loadJson(STORAGE_KEYS.AGREEMENT) || {};
      const text = `[미래경영자 심화과정 ${currentLogSession}회차 코칭일지]
피코치: ${agree.coacheeName || '미입력'} (${agree.coacheeCompany || ''})
코치: ${agree.coachName || '미입력'}

1. 피코치가 새롭게 발견한 것 (Self-Discovery):
${d.discovery || '(내용 없음)'}

2. 중요하게 표현한 기준·강점·고민 (Core Keywords):
${d.coreKeywords || '(내용 없음)'}

3. 구체적 실행 약속 (Action Plan):
${d.actionPlan || '(내용 없음)'}

4. 다음 회차에서 확인할 내용 (Follow-up):
${d.nextFollowUp || '(내용 없음)'}

5. 코치 성찰 (효과적인 개입 및 보완점):
${d.coachReview || '(내용 없음)'}`;

      navigator.clipboard.writeText(text).then(() => {
        showToast(`${currentLogSession}회차 일지가 클립보드에 복사되었습니다.`);
      });
    });

    // Submit to Google Form (prefilled)
    document.getElementById('btnSubmitGoogleForm')?.addEventListener('click', () => {
      const d = coachingLogs[currentLogSession] || {};
      const agree = loadJson(STORAGE_KEYS.AGREEMENT) || {};

      // 필수 항목 검증
      const required = [
        ['discovery', '1. 피코치가 새롭게 발견한 것'],
        ['coreKeywords', '2. 중요하게 표현한 기준 · 강점 · 고민'],
        ['actionPlan', '3. 구체적 실행 약속'],
        ['nextFollowUp', '4. 다음 회차에서 확인할 내용']
      ];
      const missing = required.filter(([k]) => !(d[k] || '').trim()).map(([, label]) => label);
      if (missing.length) {
        showToast(`미작성 항목이 있습니다: ${missing.join(', ')}`);
        return;
      }

      // 현재 회차 -> 구글폼 객관식 보기값 (정확히 일치해야 선택됨)
      const SESSION_CHOICE = {
        1: '1회차 (자기 탐색 & 합의)',
        2: '2회차 (리더십 & 관계 관리)',
        3: '3회차 (셀프 코칭 & 비전)'
      };

      // 구글폼 문항 entry ID 매핑
      const ENTRY = {
        coachName:     'entry.1742304624',
        coacheeName:   'entry.606321728',
        session:       'entry.877365387',
        discovery:     'entry.1218732954',
        coreKeywords:  'entry.1412507033',
        actionPlan:    'entry.249075081',
        nextFollowUp:  'entry.2019047062',
        coachReview:   'entry.1232641748'
      };

      const values = {
        [ENTRY.coachName]:    agree.coachName || '',
        [ENTRY.coacheeName]:  agree.coacheeName || '',
        [ENTRY.session]:      SESSION_CHOICE[currentLogSession] || '추가 회차',
        [ENTRY.discovery]:    d.discovery || '',
        [ENTRY.coreKeywords]: d.coreKeywords || '',
        [ENTRY.actionPlan]:   d.actionPlan || '',
        [ENTRY.nextFollowUp]: d.nextFollowUp || '',
        [ENTRY.coachReview]:  d.coachReview || ''
      };

      const params = new URLSearchParams({ usp: 'pp_url' });
      Object.entries(values).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });

      const url = `${GOOGLE_FORM_BASE}?${params.toString()}`;
      saveJson(STORAGE_KEYS.LOGS, coachingLogs);
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast(`${currentLogSession}회차 일지가 저장되었고 구글폼에 자동 입력되었습니다.`);
    });

    // Export JSON Backup
    document.getElementById('btnExportJson')?.addEventListener('click', () => {
      const fullExport = {
        agreement: loadJson(STORAGE_KEYS.AGREEMENT),
        logs: coachingLogs,
        leadership: leadershipScores,
        mandalart: mandalartData,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `미래경영자코칭_데이터_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('코칭 전체 데이터가 JSON 파일로 다운로드되었습니다.');
    });
  }

  // --------------------------------------------------------------------------
  // 10. Toolkit & Question Library Accordion
  // --------------------------------------------------------------------------
  function initToolkitAccordion() {
    document.querySelectorAll('.qa-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.qa-item');
        item.classList.toggle('open');
      });
    });

    document.querySelectorAll('.btn-copy-question').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const text = btn.dataset.questionText;
        navigator.clipboard.writeText(text).then(() => {
          showToast('질문이 클립보드에 복사되었습니다.');
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 11. Global Events & Bootstrap
  // --------------------------------------------------------------------------
  // 새로고침 시 브라우저가 이전 스크롤 위치를 복원하지 않도록 (항상 상단에서 시작)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  document.addEventListener('DOMContentLoaded', () => {
    // Apply Settings
    applyTheme(appState.theme);
    applyDensity(appState.density);
    applyRoleMode(appState.roleMode, false);
    initResponsiveNav();
    initCohortUI();
    showTab(appState.currentTab);
    flushQueuedToast();

    // Event Listeners for Shell
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      let nextTheme = 'light';
      if (appState.theme === 'light') nextTheme = 'gray-skyblue';
      else if (appState.theme === 'gray-skyblue') nextTheme = 'dark';
      else nextTheme = 'light';

      applyTheme(nextTheme);
      showToast(
        nextTheme === 'gray-skyblue' ? '그레이-스카이블루 테마로 전환되었습니다' :
        nextTheme === 'dark' ? '다크 모드로 전환되었습니다' :
        '라이트 모드로 전환되었습니다'
      );
    });

    document.getElementById('btnReloadSharingHub')?.addEventListener('click', () => {
      const iframe = document.getElementById('sharingHubIframe');
      if (iframe) {
        iframe.src = iframe.src;
        showToast('코칭 툴 나눔터를 새로고침했습니다.');
      }
    });

    document.getElementById('densityToggleBtn')?.addEventListener('click', () => {
      applyDensity(appState.density === 'comfortable' ? 'compact' : 'comfortable');
    });

    // 이어서 작성하기 — 미완료 워크시트로 바로 이동
    document.getElementById('btnResumeWork')?.addEventListener('click', resumeWork);

    // 맨 위로 버튼 — 스크롤 컨테이너 기준
    const scroller = getScroller();
    const toTopBtn = document.getElementById('toTopBtn');
    if (scroller && toTopBtn) {
      scroller.addEventListener('scroll', () => {
        toTopBtn.classList.toggle('is-visible', scroller.scrollTop > 320);
      }, { passive: true });
      toTopBtn.addEventListener('click', scrollMainToTop);
    }

    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyRoleMode(btn.dataset.role);
      });
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        showTab(link.dataset.tab);
      });
    });

    document.querySelectorAll('[data-jump-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        showTab(btn.dataset.jumpTab);
      });
    });

    // Session View Mode Toggles
    ['session1', 'session2', 'session3', 'lifecoach1', 'lifecoach2', 'lifecoach3'].forEach(s => {
      document.querySelectorAll(`[data-view-btn="${s}"]`).forEach(btn => {
        btn.addEventListener('click', () => {
          setSessionViewMode(s, btn.dataset.mode);
        });
      });
      setSessionViewMode(s, appState.viewModes[s] || 'quick');
    });

    // Add LifeLine Row Button
    document.getElementById('btnAddLifeLineRow')?.addEventListener('click', () => {
      lifeLineRecords.push({ period: '', event: '', learning: '' });
      saveJson(STORAGE_KEYS.LIFELINE, lifeLineRecords);
      renderLifeLine();
    });

    // Life Coaching Worksheets Logic
    function initLifeWorksheets() {
      // 1회차 워크시트
      const ws1Data = loadJson(STORAGE_KEYS.LIFECOACH_WS1) || {};
      const t1 = document.getElementById('life1-topic');
      const r1 = document.getElementById('life1-reason');
      const g1 = document.getElementById('life1-goal');
      if (t1 && ws1Data.topic) t1.value = ws1Data.topic;
      if (r1 && ws1Data.reason) r1.value = ws1Data.reason;
      if (g1 && ws1Data.goal) g1.value = ws1Data.goal;

      document.getElementById('btnSaveLifeWorksheet1')?.addEventListener('click', () => {
        saveJson(STORAGE_KEYS.LIFECOACH_WS1, {
          topic: t1?.value || '',
          reason: r1?.value || '',
          goal: g1?.value || ''
        });
        showToast('1회차 라이프 코칭 합의서가 저장되었습니다.');
      });

      // 2회차 워크시트
      const ws2Data = loadJson(STORAGE_KEYS.LIFECOACH_WS2) || {};
      const m2 = document.getElementById('life2-mentor');
      const f2 = document.getElementById('life2-future');
      const n2 = document.getElementById('life2-nofail');
      const a2 = document.getElementById('life2-aha');
      if (m2 && ws2Data.mentor) m2.value = ws2Data.mentor;
      if (f2 && ws2Data.future) f2.value = ws2Data.future;
      if (n2 && ws2Data.nofail) n2.value = ws2Data.nofail;
      if (a2 && ws2Data.aha) a2.value = ws2Data.aha;

      document.getElementById('btnSaveLifeWorksheet2')?.addEventListener('click', () => {
        saveJson(STORAGE_KEYS.LIFECOACH_WS2, {
          mentor: m2?.value || '',
          future: f2?.value || '',
          nofail: n2?.value || '',
          aha: a2?.value || ''
        });
        showToast('2회차 관점 전환 성찰 카드가 저장되었습니다.');
      });

      // 3회차 워크시트
      const ws3Data = loadJson(STORAGE_KEYS.LIFECOACH_WS3) || {};
      const id3 = document.getElementById('life3-identity-name');
      const v3 = document.getElementById('life3-value-link');
      const act3 = document.getElementById('life3-actions');
      const kw3 = document.getElementById('life3-keywords');
      if (id3 && ws3Data.identity) id3.value = ws3Data.identity;
      if (v3 && ws3Data.valueLink) v3.value = ws3Data.valueLink;
      if (act3 && ws3Data.actions) act3.value = ws3Data.actions;
      if (kw3 && ws3Data.keywords) kw3.value = ws3Data.keywords;

      document.getElementById('btnSaveLifeWorksheet3')?.addEventListener('click', () => {
        saveJson(STORAGE_KEYS.LIFECOACH_WS3, {
          identity: id3?.value || '',
          valueLink: v3?.value || '',
          actions: act3?.value || '',
          keywords: kw3?.value || ''
        });
        showToast('3회차 정체성 통합 및 플래너가 저장되었습니다.');
      });
    }

    // Initialize modules
    initValuesSelector();
    renderLifeLine();
    initLeadershipWheel();
    initMandalart();
    initAgreementForm();
    initLogEditor();
    selectLogSession(1);
    initToolkitAccordion();
    initLifeWorksheets();
    renderProgress();
    renderCohortTable();

    const activeSection = document.getElementById(`section-${appState.currentTab}`);
    if (activeSection) setupReveal(activeSection);
  });
})();
