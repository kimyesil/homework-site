// js/common.js

function setTodayText(id = "today") {
  const el = document.getElementById(id);
  if (!el) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  el.textContent = `${y}-${m}-${d}`;
}

// 로그인 정보 localStorage 저장/불러오기
function getCurrentUser() {
  const json = localStorage.getItem("currentUser");
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function setCurrentUser(userObj) {
  if (!userObj) {
    localStorage.removeItem("currentUser");
  } else {
    localStorage.setItem("currentUser", JSON.stringify(userObj));
  }
}

function requireLoginForWrite() {
  alert("로그인 후 과제 제출이 가능합니다.");
}
