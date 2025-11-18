// js/main.js

setTodayText();

const user = getCurrentUser();
const writeBtn = document.getElementById("write-btn");
const loginLink = document.getElementById("login-link");
const signupLink = document.getElementById("signup-link");
const welcomeUser = document.getElementById("welcome-user");
const mypageLink = document.getElementById("mypage-link");
const adminLink = document.getElementById("admin-link");

if (user) {
  if (loginLink) loginLink.style.display = "none";
  if (signupLink) signupLink.style.display = "none";
  if (welcomeUser) {
    welcomeUser.style.display = "inline";
    welcomeUser.textContent = `${user.name}님 안녕하세요`;
  }
  if (mypageLink) mypageLink.style.display = "inline";
  if (adminLink && user.role === "admin") adminLink.style.display = "inline";
} else {
  if (welcomeUser) welcomeUser.style.display = "none";
  if (mypageLink) mypageLink.style.display = "none";
  if (adminLink) adminLink.style.display = "none";
}

if (writeBtn) {
  writeBtn.addEventListener("click", () => {
    if (!user) {
      requireLoginForWrite();
      return;
    }
    window.location.href = "write.html";
  });
}

const postsEl = document.getElementById("posts");
const emptyEl = document.getElementById("empty-state");

async function loadPosts() {
  if (!postsEl) return;
  postsEl.innerHTML = "불러오는 중...";

  // 상단고정 글
  const { data: pinned, error: pinnedErr } = await supabase
    .from("posts")
    .select("*")
    .eq("pinned", true)
    .order("created_at", { ascending: false });

  if (pinnedErr) {
    console.error(pinnedErr);
    postsEl.innerHTML = "목록을 불러오는 중 오류가 발생했습니다.";
    return;
  }

  // 일반 글
  const { data: normal, error: normalErr } = await supabase
    .from("posts")
    .select("*")
    .eq("pinned", false)
    .order("created_at", { ascending: false });

  if (normalErr) {
    console.error(normalErr);
    postsEl.innerHTML = "목록을 불러오는 중 오류가 발생했습니다.";
    return;
  }

  const allPosts = [...(pinned || []), ...(normal || [])];

  if (!allPosts.length) {
    postsEl.innerHTML = "";
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  postsEl.innerHTML = "";

  allPosts.forEach((p) => {
    const div = document.createElement("div");
    div.className = "post-item";

    const dateText = p.created_at
      ? new Date(p.created_at).toLocaleString()
      : "";

    const pinnedTag = p.pinned ? "공지" : `${p.school_grade || ""}`;
    const badgeClass = p.pinned
      ? "post-badge post-badge-primary"
      : "post-badge";

    div.innerHTML = `
      <div class="post-item-header">
        <div class="post-meta-left">
          <span class="${badgeClass}">${pinnedTag}</span>
          <span class="post-name">${p.name || ""}</span>
          <span class="post-badge">${p.manager || ""}</span>
        </div>
        <div class="post-date">${dateText}</div>
      </div>
      <div class="post-message">${p.message || ""}</div>
    `;

    postsEl.appendChild(div);
  });
}

loadPosts();
