document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // ===== בדיקת שדות חובה =====
  if (!username || !password || !confirmPassword) {
    alert("יש למלא את כל שדות החובה");
    return;
  }

  // ===== קריאת משתמשים קיימים =====
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // ===== בדיקת שם משתמש קיים =====
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    alert("שם המשתמש כבר קיים במערכת");
    return;
  }

  // ===== בדיקת סיסמה =====
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  if (
    password.length < 6 ||
    !hasLetter ||
    !hasNumber ||
    !hasSpecialChar
  ) {
    alert(
      "הסיסמה חייבת להכיל לפחות 6 תווים, אות אחת, מספר אחד ותו מיוחד"
    );
    return;
  }

  // ===== אימות סיסמה =====
  if (password !== confirmPassword) {
    alert("הסיסמאות אינן זהות");
    return;
  }

  // ===== בדיקת URL לתמונה (אם הוזן) =====
  if (imageUrl && !imageUrl.startsWith("http")) {
    alert("יש להזין כתובת URL תקינה לתמונה");
    return;
  }

  // ===== יצירת משתמש חדש =====
  const newUser = {
    username,
    password,
    imageUrl
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // ===== סיום מוצלח =====
  alert("ההרשמה בוצעה בהצלחה");
  window.location.href = "login.html";
});
 