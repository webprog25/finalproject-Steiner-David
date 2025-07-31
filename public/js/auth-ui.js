import GoogleAuth from "./googleauth.js";

export const CLIENT_ID = "995897016265-jjqb5mjsff0hbqpmgbr4siimo5ces6nh.apps.googleusercontent.com";

export let API_KEY = localStorage.getItem("apiKey") || null;
export let USER_EMAIL = localStorage.getItem("email") || null;

let logoutTimerId = null;

export function apiRequest(method, path, body) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (API_KEY) opts.headers.Authorization = `Bearer ${API_KEY}`;
    if (body) opts.body = JSON.stringify(body);
    return fetch(path, opts);
}

function scheduleAutoLogout(onLogout) {
    if (!API_KEY) return;
    let msUntilExpiry;
    try {
        let [, payloadB64] = API_KEY.split(".");
        let payload = JSON.parse(atob(payloadB64));
        msUntilExpiry = payload.exp * 1000 - Date.now();
        if (msUntilExpiry <= 0) throw new Error("already expired");
    } catch {
        onLogout();
        return;
    }
    clearTimeout(logoutTimerId);
    logoutTimerId = setTimeout(() => {
        alert("Session expired. You’ve been logged out.");
        onLogout();
    }, msUntilExpiry);
}

const BTN_OPTS = {
    type: "standard",
    theme: "outline",
    size: "large",
    shape: "pill",
    text: "continue_with",
    logo_alignment: "left",
    width: 200
};

export function initAuthUi(onLogin) {
    const host = document.getElementById("google-signin");
    const logoutBtn = document.getElementById("logout-btn");
    const addLink = document.querySelector("a.nav-link.add");
    const legend = document.querySelector("section.legend");
    const stats = document.getElementById("stats");


    function handleLogout() {
        clearTimeout(logoutTimerId);
        API_KEY = null;
        USER_EMAIL = null;
        localStorage.removeItem("apiKey");
        localStorage.removeItem("email");
        showAnon();
        if (onLogin) onLogin();
    }


    function showAuthed(email) {
        if (host) {
            while (host.firstChild) {
                host.removeChild(host.firstChild);
            }
            const span = document.createElement("span");
            span.className = "user-greeting";
            span.textContent = `Hi, ${email}`;
            host.appendChild(span);
        }
        if (logoutBtn) logoutBtn.hidden = false;
        if (addLink) addLink.hidden = false;
        if (legend) legend.hidden = false;
        if (stats) stats.hidden = false;
        if (onLogin) onLogin();
        scheduleAutoLogout(handleLogout);
    }

    function showAnon() {
        if (host) {
            while (host.firstChild) {
                host.removeChild(host.firstChild);
            }
            let auth = new GoogleAuth(CLIENT_ID);
            auth.render(host, async (idToken) => {
                let res = await apiRequest("POST", "/api/google", { idToken });
                let data = await res.json();
                if (!res.ok) {
                    alert(data.error || "Login failed");
                    return;
                }
                API_KEY = data.apiKey;
                USER_EMAIL = data.email;
                localStorage.setItem("apiKey", API_KEY);
                localStorage.setItem("email", USER_EMAIL);
                showAuthed(USER_EMAIL);
            }, BTN_OPTS);
        }
        if (logoutBtn) logoutBtn.hidden = true;
        if (addLink) addLink.hidden = true;
        if (legend) legend.hidden = true;
        if (stats) stats.hidden = true;
    }
    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    if (API_KEY && USER_EMAIL) {
        showAuthed(USER_EMAIL);
    } else {
        showAnon();
        if (onLogin) onLogin();
    }
}
