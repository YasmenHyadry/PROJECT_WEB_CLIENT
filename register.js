document.getElementById("registerForm").addEventListener("submit", async function (e) {
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
    alert("הסיסמה חייבת להכיל לפחות 6 תווים, אות, מספר ותו מיוחד");
    return;
  }

  // ===== אימות סיסמה =====
  if (password !== confirmPassword) {
    alert("הסיסמאות אינן זהות");
    return;
  }

  // ===== בדיקת URL לתמונה =====
  if (imageUrl && !imageUrl.startsWith("http")) {
    alert("יש להזין כתובת URL תקינה לתמונה");
    return;
  }

  // ===== שליחה לשרת =====
  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        imageUrl
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("ההרשמה בוצעה בהצלחה");
    window.location.href = "login.html";

  } catch (err) {
    alert("שגיאה בחיבור לשרת");
    console.error(err);
  }
});
