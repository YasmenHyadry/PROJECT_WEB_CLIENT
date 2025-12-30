document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("error");

    error.textContent = "";

    // בדיקת שדות ריקים
    if (!username || !password) {
        error.textContent = "יש למלא שם משתמש וסיסמה";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // חיפוש משתמש תואם
    const user = users.find(u =>
        u.username === username && u.password === password
    );

    if (!user) {
        error.textContent = "שם משתמש או סיסמה שגויים";
        return;
    }

    // שמירת משתמש מחובר ב-Session Storage
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // מעבר לדף החיפוש
    window.location.href = "search.html";
});
