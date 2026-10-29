/**
 * SmartHostel AI – Central API helper
 * Include this script BEFORE page-specific JS on every page that talks to the backend.
 */
const API_BASE = "http://127.0.0.1:5000/api";

const Api = {
  getToken() {
    return localStorage.getItem("access_token");
  },

  setAuth(data) {
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    if (data.profile) {
      localStorage.setItem("profile", JSON.stringify(data.profile));
    }
  },

  clearAuth() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  },

  getProfile() {
    try {
      return JSON.parse(localStorage.getItem("profile") || "null");
    } catch {
      return null;
    }
  },

  async request(method, path, body = null, auth = true) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = this.getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const options = { method, headers };
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, options);
    } catch (err) {
      return {
        success: false,
        message: "Cannot reach server. Is the Flask backend running on port 5000?",
      };
    }

    let data;
    try {
      data = await res.json();
    } catch {
      data = { success: false, message: "Invalid server response" };
    }

    if (res.status === 401) {
      this.clearAuth();
      // Redirect to role selection if on a protected page
      if (!window.location.pathname.includes("login") && !window.location.pathname.includes("register") && !window.location.pathname.includes("landing") && !window.location.pathname.includes("role")) {
        window.location.href = "roleselection.html";
      }
    }

    return data;
  },

  get(path, auth = true) {
    return this.request("GET", path, null, auth);
  },

  post(path, body, auth = true) {
    return this.request("POST", path, body, auth);
  },

  put(path, body, auth = true) {
    return this.request("PUT", path, body, auth);
  },

  delete(path, auth = true) {
    return this.request("DELETE", path, null, auth);
  },
};

// Protect student pages – call at top of student dashboard scripts
function requireAuth(role) {
  const user = Api.getUser();
  const token = Api.getToken();
  if (!token || !user) {
    window.location.href = "roleselection.html";
    return false;
  }
  if (role && user.role !== role) {
    window.location.href = "roleselection.html";
    return false;
  }
  return true;
}
