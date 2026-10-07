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
    MANDALART: 'mk_coaching_mandalart'
  };

  // 공식 구글폼 (삼성전자 상생협력 아카데미 미경자 코칭일지)
  const GOOGLE_FORM_BASE = 'https://docs.google.com/forms/d/e/1FAIpQLSedf_CYG8CDnr42WDstAE2MdpdN3ReucNn4HbnKSy606QRVCg/viewform';

  const DEFAULT_STATE = {
    theme: 'light',
    density: 'comfortable',
    roleMode: 'coachee', // 'coachee' | 'coach'
    currentTab: 'overview',
    viewModes: {
      session1: 'quick',
      session2: 'quick',
      session3: 'quick'
    }
  };

  let appState = Object.assign({}, DEFAULT_STATE, loadJson(STORAGE_KEYS.STATE));

  // --------------------------------------------------------------------------
  // 2. Utility Helpers
  // --------------------------------------------------------------------------
  function loadJson(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('LocalStorage load error:', e);
      return null;
    }
  }

  function saveJson(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
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
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
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

  function applyRoleMode(role) {
    appState.roleMode = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });

    // Toggle coach exclusive elements
    document.querySelectorAll('.coach-only').forEach(el => {
      el.style.display = role === 'coach' ? '' : 'none';
    });

    const roleIndicator = document.getElementById('currentRoleLabel');
    if (roleIndicator) {
      roleIndicator.textContent = role === 'coach' ? '코치 전용 모드' : '피코치 모드';
    }

    saveJson(STORAGE_KEYS.STATE, appState);
    showToast(role === 'coach' ? '코치 전용 모드로 전환되었습니다 (일지 작성 활성화)' : '피코치 학습 가이드 모드로 전환되었습니다');
  }

  function showTab(tabId) {
    appState.currentTab = tabId;
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    const targetSection = document.getElementById(`section-${tabId}`);
    if (targetSection) targetSection.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tabId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    saveJson(STORAGE_KEYS.STATE, appState);
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
  document.addEventListener('DOMContentLoaded', () => {
    // Apply Settings
    applyTheme(appState.theme);
    applyDensity(appState.density);
    applyRoleMode(appState.roleMode);
    showTab(appState.currentTab);

    // Event Listeners for Shell
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      applyTheme(appState.theme === 'light' ? 'dark' : 'light');
    });

    document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => {
      const nav = document.getElementById('sidebarNav');
      if (nav) {
        nav.classList.toggle('collapsed');
        const isCollapsed = nav.classList.contains('collapsed');
        const btn = document.getElementById('sidebarToggleBtn');
        if (btn) btn.setAttribute('aria-expanded', !isCollapsed);
      }
    });

    document.getElementById('densityToggleBtn')?.addEventListener('click', () => {
      applyDensity(appState.density === 'comfortable' ? 'compact' : 'comfortable');
    });

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
    ['session1', 'session2', 'session3'].forEach(s => {
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

    // Initialize modules
    initValuesSelector();
    renderLifeLine();
    initLeadershipWheel();
    initMandalart();
    initAgreementForm();
    initLogEditor();
    selectLogSession(1);
    initToolkitAccordion();
  });
})();
