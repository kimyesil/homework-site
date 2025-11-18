// js/mypage.js

setTodayText();

const u = getCurrentUser();
if (!u) {
  alert("로그인 후 이용해주세요.");
  window.location.href = "login.html";
}

const userInfoEl = document.getElementById("user-info");
const assignListEl = document.getElementById("assign-list");
const assignEmptyEl = document.getElementById("assign-empty");

userInfoEl.textContent = `${u.name} (${u.school || ""} ${
  u.grade || ""
}학년)`;

// 제출 예정 과제 불러오기
async function loadAssignments() {
  const { data, error } = await supabase
    .from("homework_assignments")
    .select("*")
    .eq("student_user_id", u.userId)
    .eq("done", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    assignListEl.innerHTML = "과제를 불러오는 중 오류가 발생했습니다.";
    return;
  }

  if (!data || !data.length) {
    assignListEl.innerHTML = "";
    assignEmptyEl.style.display = "block";
    return;
  }

  assignEmptyEl.style.display = "none";
  assignListEl.innerHTML = "";

  data.forEach((a) => {
    const div = document.createElement("div");
    div.className = "post-item";

    const dateText = a.due_date || "기한 미지정";

    div.innerHTML = `
      <div class="post-item-header">
        <div class="post-meta-left">
          <span class="post-badge post-badge-primary">과제</span>
          <span class="post-name">${a.title}</span>
        </div>
        <div class="post-date">기한: ${dateText}</div>
      </div>
      <div class="post-message">${a.description || ""}</div>
    `;

    assignListEl.appendChild(div);
  });
}

loadAssignments();
