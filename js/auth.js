// js/auth.js

async function hashPassword(pw) {
  // 간단 버전: 그대로 저장 (내부용이면 이대로, 나중에 원하면 해시 적용)
  return pw;
}

async function signup() {
  const userId = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const school = document.getElementById("school").value.trim();
  const grade = document.getElementById("grade").value.trim();
  const msgEl = document.getElementById("msg");

  msgEl.textContent = "";

  if (!userId || !password || !name || !phone) {
    msgEl.textContent = "아이디, 비밀번호, 이름, 전화번호는 필수입니다.";
    return;
  }

  // 아이디 중복 체크
  const { data: exist, error: existErr } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existErr) {
    console.error(existErr);
    msgEl.textContent = "회원가입 중 오류가 발생했습니다.";
    return;
  }
  if (exist) {
    msgEl.textContent = "이미 존재하는 아이디입니다.";
    return;
  }

  const hashed = await hashPassword(password);

  const role = userId === "admin" ? "admin" : "student";

  const { data: inserted, error: insertErr } = await supabase
    .from("users")
    .insert({
      user_id: userId,
      password: hashed,
      name,
      phone,
      school,
      grade: grade ? parseInt(grade, 10) : null,
      role,
    })
    .select("*")
    .single();

  if (insertErr) {
    console.error(insertErr);
    msgEl.textContent = "회원가입 실패: " + insertErr.message;
    return;
  }

  msgEl.classList.remove("msg-error");
  msgEl.classList.add("msg-success");
  msgEl.textContent = "회원가입 완료! 이제 로그인 해주세요.";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

async function login() {
  const userId = document.getElementById("login-userId").value.trim();
  const password = document.getElementById("login-password").value;
  const msgEl = document.getElementById("login-msg");

  msgEl.textContent = "";

  if (!userId || !password) {
    msgEl.textContent = "아이디와 비밀번호를 입력해주세요.";
    return;
  }

  const hashed = await hashPassword(password);

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .eq("password", hashed)
    .maybeSingle();

  if (error) {
    console.error(error);
    msgEl.textContent = "로그인 중 오류가 발생했습니다.";
    return;
  }
  if (!user) {
    msgEl.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    return;
  }

  setCurrentUser({
    id: user.id,
    userId: user.user_id,
    name: user.name,
    phone: user.phone,
    school: user.school,
    grade: user.grade,
    role: user.role,
  });

  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "index.html";
  }
}

// 아이디 찾기 (이름 + 전화번호)
async function findId() {
  const name = prompt("이름을 입력하세요:");
  if (!name) return;
  const phone = prompt("전화번호를 입력하세요 (예: 010-1234-5678):");
  if (!phone) return;

  const { data, error } = await supabase
    .from("users")
    .select("user_id")
    .eq("name", name.trim())
    .eq("phone", phone.trim())
    .maybeSingle();

  if (error) {
    alert("아이디 찾기 중 오류가 발생했습니다.");
    console.error(error);
    return;
  }
  if (!data) {
    alert("일치하는 정보가 없습니다.");
    return;
  }

  alert(`아이디는 "${data.user_id}" 입니다.`);
}

// 비밀번호 재설정 (아이디 + 전화번호)
async function resetPassword() {
  const userId = prompt("아이디를 입력하세요:");
  if (!userId) return;
  const phone = prompt("전화번호를 입력하세요 (예: 010-1234-5678):");
  if (!phone) return;

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId.trim())
    .eq("phone", phone.trim())
    .maybeSingle();

  if (error) {
    alert("비밀번호 재설정 중 오류가 발생했습니다.");
    console.error(error);
    return;
  }
  if (!user) {
    alert("일치하는 정보가 없습니다.");
    return;
  }

  const newPw = prompt("새 비밀번호를 입력하세요:");
  if (!newPw) return;
  const hashed = await hashPassword(newPw);

  const { error: updateErr } = await supabase
    .from("users")
    .update({ password: hashed })
    .eq("id", user.id);

  if (updateErr) {
    alert("비밀번호 변경에 실패했습니다.");
    console.error(updateErr);
    return;
  }

  alert("비밀번호가 변경되었습니다. 다시 로그인 해주세요.");
}

// 이벤트 바인딩
document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) signupBtn.addEventListener("click", signup);

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) loginBtn.addEventListener("click", login);

  const findIdLink = document.getElementById("open-find-id");
  if (findIdLink) findIdLink.addEventListener("click", (e) => {
    e.preventDefault();
    findId();
  });

  const resetPwLink = document.getElementById("open-reset-pw");
  if (resetPwLink) resetPwLink.addEventListener("click", (e) => {
    e.preventDefault();
    resetPassword();
  });
});
