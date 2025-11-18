// js/admin.js

setTodayText();

const me = getCurrentUser();
if (!me || me.role !== "admin") {
  alert("관리자만 접근 가능합니다.");
  window.location.href = "login.html";
}

const adminHeaderEl = document.getElementById("admin-header");
adminHeaderEl.textContent = `${me.name} 관리자님, 안녕하세요 👋`;

// 회원 목록 불러오기
async function loadUsers() {
  const userListEl = document.getElementById("user-list");

  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    userListEl.innerHTML = "회원 목록을 불러오는 중 오류가 발생했습니다.";
    return;
  }

  if (!users || !users.length) {
    userListEl.innerHTML = '<div class="empty-state">등록된 학생이 없습니다.</div>';
    return;
  }

  userListEl.innerHTML = "";

  users.forEach((u) => {
    const div = document.createElement("div");
    div.className = "post-item";

    div.innerHTML = `
      <div class="post-item-header">
        <div class="post-meta-left">
          <span class="post-name">${u.name}</span>
          <span class="post-badge">${u.school || ""} ${
      u.grade || ""
    }학년</span>
        </div>
        <div class="post-date">아이디: ${u.user_id}</div>
      </div>
      <div class="post-message">전화번호: ${u.phone || "-"}</div>
      <div style="margin-top:6px;">
        <button class="btn btn-ghost assign-btn" data-id="${
          u.user_id
        }">과제 배부</button>
      </div>
    `;

    userListEl.appendChild(div);
  });

  document.querySelectorAll(".assign-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const studentUserId = btn.getAttribute("data-id");
      const title = prompt("과제 제목(예: 2025-11-19 과제 예정)");
      if (!title) return;
      const description = prompt("과제 내용(간단히)");
      const dueDate = prompt("제출기한 (YYYY-MM-DD 형식, 생략 가능)");

      const { error: insertErr } = await supabase
        .from("homework_assignments")
        .insert({
          student_user_id: studentUserId,
          title,
          description: description || "",
          due_date: dueDate || "",
          done: false,
        });

      if (insertErr) {
        alert("과제 배부 중 오류가 발생했습니다.");
        console.error(insertErr);
        return;
      }

      alert("과제가 배부되었습니다. (학생 마이페이지에 표시됩니다)");
    });
  });
}

// 과제 제출 글 목록 + 삭제
async function loadPostsForAdmin() {
  const postListEl = document.getElementById("post-list");

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    postListEl.innerHTML = "글 목록을 불러오는 중 오류가 발생했습니다.";
    return;
  }

  if (!posts || !posts.length) {
    postListEl.innerHTML = '<div class="empty-state">제출된 과제가 없습니다.</div>';
    return;
  }

  postListEl.innerHTML = "";

  posts.forEach((p) => {
    const div = document.createElement("div");
    div.className = "post-item";

    const dateText = p.created_at
      ? new Date(p.created_at).toLocaleString()
      : "";

    div.innerHTML = `
      <div class="post-item-header">
        <div class="post-meta-left">
          <span class="post-badge">${p.school_grade || ""}</span>
          <span class="post-name">${p.name || ""}</span>
          <span class="post-badge">${p.manager || ""}</span>
        </div>
        <div class="post-date">${dateText}</div>
      </div>
      <div class="post-message">${p.message || ""}</div>
      <div style="margin-top:6px; display:flex; gap:8px;">
        <button class="btn btn-danger delete-post-btn" data-id="${
          p.id
        }">글 + 파일 삭제</button>
      </div>
    `;

    postListEl.appendChild(div);
  });

  document.querySelectorAll(".delete-post-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const postId = btn.getAttribute("data-id");
      if (!confirm("이 글과 연결된 파일까지 모두 삭제하시겠습니까?")) return;
      await deletePostWithFiles(postId);
      await loadPostsForAdmin();
    });
  });
}

async function deletePostWithFiles(postId) {
  // 1) post_files에서 해당 글의 파일 경로들 가져오기
  const { data: files, error } = await supabase
    .from("post_files")
    .select("*")
    .eq("post_id", postId);

  if (error) {
    console.error(error);
  } else if (files && files.length) {
    const paths = files.map((f) => f.path);
    const { error: removeErr } = await supabase.storage
      .from("post-files")
      .remove(paths);
    if (removeErr) console.error("파일 삭제 실패:", removeErr);

    // post_files 행 삭제
    const { error: delFileRowsErr } = await supabase
      .from("post_files")
      .delete()
      .eq("post_id", postId);
    if (delFileRowsErr) console.error(delFileRowsErr);
  }

  // 2) posts에서 글 삭제
  const { error: delPostErr } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (delPostErr) {
    console.error(delPostErr);
    alert("글 삭제 중 오류가 발생했습니다.");
    return;
  }

  alert("글과 파일이 모두 삭제되었습니다.");
}

loadUsers();
loadPostsForAdmin();
