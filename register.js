document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // בדיקת שדות חובה
    if (!username || !firstName || !lastName || !password || !confirmPassword) {
        alert("יש למלא את כל שדות החובה");
        return;
    }

    // בדיקת סיסמה: מינימום 6 תווים, אות אחת ומספר אחד
    if (
        password.length < 6 ||
        !/[a-zA-Z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {
        alert("הסיסמה חייבת להכיל לפחות 6 תווים, אות אחת ומספר אחד");
        return;
    }

    // אימות סיסמה
    if (password !== confirmPassword) {
        alert("הסיסמאות אינן תואמות");
        return;
    }

    // בדיקת URL (אם הוזן)
    if (imageUrl && !imageUrl.startsWith("http")) {
        alert("יש להזין כתובת URL תקינה לתמונה");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // בדיקת שם משתמש קיים
    if (users.some(user => user.username === username)) {
        alert("שם המשתמש כבר קיים במערכת");
        return;
    }

    // יצירת משתמש חדש
    const newUser = {
        username: username,
        firstName: firstName,
        lastName: lastName,
        imageUrl: imageUrl,
        password: password
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("ההרשמה בוצעה בהצלחה");
    window.location.href = "login.html";
});
