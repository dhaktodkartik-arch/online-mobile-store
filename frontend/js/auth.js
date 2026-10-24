// User Authentication & Session Management (localStorage)
// Industrial Training Project

const AUTH_TOKEN_KEY = 'mobile_store_token';
const AUTH_USER_KEY = 'mobile_store_user';

// Get stored JWT token
function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Get stored user object
function getCurrentUser() {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Save authentication data upon successful login
function saveAuth(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  updateNavAuth();
}

// Log out the user
function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  updateNavAuth();
  if (typeof showToast === 'function') {
    showToast('You have been logged out.');
  }

  // If on a page requiring login, redirect to login page
  const currentPage = window.location.pathname;
  if (currentPage.includes('checkout.html') || currentPage.includes('orders.html')) {
    window.location.href = 'login.html';
  } else {
    window.location.reload();
  }
}

// Check if logged-in user is admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

// Update the Navigation Bar auth slot on every page
function updateNavAuth() {
  const authSlot = document.getElementById('nav-auth-slot');
  if (!authSlot) return;

  const user = getCurrentUser();

  if (user && user.name) {
    const isOrdersPage = window.location.pathname.endsWith('orders.html');
    const isAdminPage = window.location.pathname.endsWith('admin.html');
    const ordersActiveClass = isOrdersPage ? 'class="active"' : '';
    const adminActiveClass = isAdminPage ? 'class="active"' : '';

    const adminLink = user.role === 'admin' 
      ? `<a href="admin.html" ${adminActiveClass} style="color: #facc15; font-weight: 600;">⚙️ Admin</a>` 
      : '';

    authSlot.innerHTML = `
      ${adminLink}
      <a href="orders.html" ${ordersActiveClass} style="margin-right: 0.3rem;">My Orders</a>
      <span class="nav-user-greeting">👋 Hello, <strong>${user.name.split(' ')[0]}</strong></span>
      <button class="btn-logout" onclick="logout()">Logout</button>
    `;
  } else {
    // Show Login link for guests
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const isRegisterPage = window.location.pathname.endsWith('register.html');
    const activeClass = isLoginPage || isRegisterPage ? 'class="active"' : '';
    authSlot.innerHTML = `<a href="login.html" ${activeClass}>Login</a>`;
  }
}

// Automatically update navbar auth state when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
});
