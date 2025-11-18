// js/write.js

setTodayText();

const currentUser = getCurrentUser();
if (!currentUser) {
  alert("로그인 후 이용해주세요.");
  window.location.href = "login.html";
}

const submitBtn = document.getElementById("submit-post");
const msgEl = document.getElementById("msg");

submitBtn.addEventListener("click", async () => {
  msgEl.textContent = "";

  const pinned = document.getElementById("pinned").checked;
  const schoolGrade = document.getElementById("schoolGrade").value.trim();
  const nameInput = document.getElementById("name").value.trim();
  const name = nameInput || currentUser.name;
  const manager = document.getElementById("manager").value.trim();
  const message = document.getElementById("message").value.trim();
  const postPassword = document.getElementById("postPassword").value;
  const filesInput = document.getElementById("files");
  const files = filesInput.files;

  if (!schoolGrade || !name || !message) {
    msgEl.textContent = "학교/학년, 이름, 메시지를 입력해주세요.";
    return;
  }

  // 1) posts에 글 먼저 저장
  const { data: postData, error: postErr } = await supabase
    .from("posts")
    .insert({
      school_grade: schoolGrade,
      name,
      manager,
      message,
      pinned,
      author_user_id: currentUser.userId,
      locked: !!postPassword,
      lock_password: postPassword || "",
    })
    .select("id")
    .single();

  if (postErr || !postData) {
    console.error(postErr);
    msgEl.textContent = "글 저장 중 오류가 발생했습니다.";
    return;
  }

  const postId = postData.id;

  // 2) Storage + post_files에 파일 업로드
  for (let i = 0; i < files.length; i++) {
    const f = files[i];

    if (f.size > 10 * 1024 * 1024) {
      alert(`${f.name} 파일이 10MB를 넘어서 업로드되지 않습니다.`);
      continue;
    }

    const filePath = `${postId}/${Date.now()}-${f.name}`;

    const { data: uploaded, error: uploadErr } = await supabase.storage
      .from("post-files")
      .upload(filePath, f, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadErr) {
      console.error(uploadErr);
      alert(`${f.name} 업로드 실패: ${uploadErr.message}`);
      continue;
    }

    const {
      data: publicData,
    } = supabase.storage.from("post-files").getPublicUrl(filePath);

    const fileUrl = publicData.publicUrl;

    let type = "other";
    if (f.type.startsWith("image/")) type = "image";
    else if (f.type.startsWith("video/")) type = "video";

    const { error: fileInsertErr } = await supabase
      .from("post_files")
      .insert({
        post_id: postId,
        path: filePath,
        url: fileUrl,
        type,
      });

    if (fileInsertErr) {
      console.error(fileInsertErr);
    }
  }

  msgEl.classList.remove("msg-error");
  msgEl.classList.add("msg-success");
  msgEl.textContent = "제출 완료!";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});
