
const data = window.GUIDE_DATA;

function renderQuickCard(target, d){
  document.getElementById(target).innerHTML = `
    <article class="quick-card">
      <div class="stage-title">
        <div><div class="eyebrow">QUICK VIEW</div><h3>${d.title}</h3><p class="lead">${d.subtitle || ""}</p></div>
        <span class="time-pill">${d.time || ""}</span>
      </div>
      <div class="info-block"><h4>이 단계의 목적</h4><p>${d.purpose}</p></div>
      <div class="info-block"><h4>핵심 포인트</h4><ul>${d.points.map(x=>`<li>${x}</li>`).join("")}</ul></div>
      <div class="info-block"><h4>샘플 질문</h4><div class="question-list">${d.questions.map(x=>`<div class="question-item">“${x}”</div>`).join("")}</div></div>
      <div class="info-block"><h4>인정·공감</h4><ul>${d.empathy.map(x=>`<li>${x}</li>`).join("")}</ul></div>
      <div class="info-block"><h4>Self-check</h4><div class="check-list">${d.checks.map(x=>`<label><input type="checkbox"><span>${x}</span></label>`).join("")}</div></div>
    </article>`;
}

function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const el=document.getElementById(`page-${page}`); if(el) el.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));

document.querySelectorAll("[data-page-toggle]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const p=btn.dataset.pageToggle;
    document.querySelectorAll(`[data-page-toggle="${p}"]`).forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`quick-${p}`).classList.toggle("active",btn.dataset.mode==="quick");
    document.getElementById(`full-${p}`).classList.toggle("active",btn.dataset.mode==="full");
  });
});

function initStages(page, group){
  const first=Object.keys(group)[0];
  renderQuickCard(`stageContent-${page}`,group[first]);
  document.querySelectorAll(`[data-group="${page}"]`).forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(`[data-group="${page}"]`).forEach(x=>x.classList.remove("active"));
      btn.classList.add("active");
      renderQuickCard(`stageContent-${page}`,group[btn.dataset.stage]);
    });
  });
}

renderQuickCard("singleQuick-pre",data.pre);
renderQuickCard("singleQuick-between1",data.between1);
renderQuickCard("singleQuick-between2",data.between2);
initStages("session1",data.session1);
initStages("session2",data.session2);
initStages("session3",data.session3);


// --- Static access gate: casual access control only ---
const DREAM_MILESTONE_PASSWORD = "dream2026";
function unlockGuide(){
  const overlay=document.getElementById("authOverlay");
  if(overlay) overlay.classList.add("hidden");
  sessionStorage.setItem("dm-auth","ok");
}
function attemptLogin(){
  const input=document.getElementById("passwordInput");
  const error=document.getElementById("authError");
  if(!input) return;
  if(input.value===DREAM_MILESTONE_PASSWORD){
    if(error) error.textContent="";
    unlockGuide();
  }else{
    if(error) error.textContent="비밀번호가 올바르지 않습니다.";
    input.focus(); input.select();
  }
}
if(sessionStorage.getItem("dm-auth")==="ok") unlockGuide();
document.getElementById("loginBtn")?.addEventListener("click",attemptLogin);
document.getElementById("passwordInput")?.addEventListener("keydown",e=>{if(e.key==="Enter") attemptLogin();});
document.querySelectorAll("[data-page-jump]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageJump)));
