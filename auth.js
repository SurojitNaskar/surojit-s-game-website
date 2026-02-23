// Redirect if already logged in
if (localStorage.getItem("currentUser")) {
    window.location.href = "index.html";
}

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const message = document.getElementById("message");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function showMessage(text, color) {
    message.innerText = text;
    message.style.color = color;
}

// ================= REGISTER =================
if (registerBtn) {
    registerBtn.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage("Please fill all fields", "red");
            return;
        }

        let users = getUsers();

        if (users.find(u => u.username === username)) {
            showMessage("User already exists!", "red");
            return;
        }

        users.push({
            username,
            password,
            scores: {
                snake: 0,
                flappy: 0,
                brick: 0
            }
        });

        saveUsers(users);

        showMessage("Registered successfully! You can login now.", "lightgreen");

        usernameInput.value = "";
        passwordInput.value = "";
    });
}

// ================= LOGIN =================
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage("Please fill all fields", "red");
            return;
        }

        let users = getUsers();
        const user = users.find(
            u => u.username === username && u.password === password
        );

        if (user) {
            localStorage.setItem("currentUser", username);
            window.location.href = "index.html";
        } else {
            showMessage("Invalid username or password!", "red");
        }
    });
}

// ================= ENTER KEY SUPPORT =================
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        if (loginBtn) loginBtn.click();
    }
});