document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // ===== בדיקת שדות חובה =====
  if (!username || !firstName || !password || !confirmPassword) {
    alert("יש למלא את כל שדות החובה");
    return;
  }

  // ===== קריאת משתמשים קיימים =====
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // ===== בדיקת שם משתמש קיים =====
  if (users.some(u => u.username === username)) {
    alert("שם המשתמש כבר קיים במערכת");
    return;
  }

  // ===== בדיקת סיסמה =====
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  if (
    password.length < 6 ||
    !hasLetter ||
    !hasNumber ||
    !hasSpecial
  ) {
    alert("הסיסמה חייבת להכיל לפחות 6 תווים, אות אחת, מספר אחד ותו מיוחד");
    return;
  }

  // ===== אימות סיסמה =====
  if (password !== confirmPassword) {
    alert("הסיסמאות אינן זהות");
    return;
  }

  // ===== בדיקת URL לתמונה (אם קיים) =====
  if (imageUrl && !imageUrl.startsWith("http")) {
    alert("יש להזין כתובת URL תקינה לתמונה");
    return;
  }

  // ===== שמירת משתמש =====
  const newUser = {
    username,
    firstName,
    imageUrl,
    password
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // ===== סיום =====
  alert("ההרשמה בוצעה בהצלחה");
  window.location.href = "login.html";
});
