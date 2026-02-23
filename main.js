const currentUser = localStorage.getItem("currentUser");

if (!currentUser) {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

console.log("Logged in as:", currentUser);
