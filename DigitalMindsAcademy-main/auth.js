async function login() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageEl = document.getElementById("loginMessage");

  const showMessage = (text, type = "error") => {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = `login-message ${type} is-visible`;
  };

  const clearMessage = () => {
    if (!messageEl) return;
    messageEl.textContent = "";
    messageEl.className = "login-message";
  };

  const email = emailInput ? emailInput.value.trim() : "";
  const password = passwordInput ? passwordInput.value : "";

  if (!email || !password) {
    showMessage("Please enter email and password");
    return;
  }

  if (!window.supabaseClient) {
    showMessage("Supabase is not initialized. Check supabaseClient.js and the SDK script.");
    return;
  }

  const overlay = document.getElementById("loginOverlay");
  const startLoading = () => {
    overlay?.classList.add("visible");
    document.body.classList.add("is-logging-in");
  };
  const stopLoading = () => {
    overlay?.classList.remove("visible");
    document.body.classList.remove("is-logging-in");
  };

  const resolveRedirectPath = (user) => {
    const role =
      user?.user_metadata?.role ||
      user?.user_metadata?.role_name ||
      user?.role ||
      "";
    if (typeof role === "string" && role.toLowerCase() === "employee") {
      return "usercert.html";
    }
    return "dashboard.html";
  };

  try {
    startLoading();
    clearMessage();
    const { error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      stopLoading();
      showMessage(error.message || "Login failed. Please try again.");
      return;
    }

    // Determine destination by role; employees go to usercert, admins to dashboard.
    const { data: userData } = await window.supabaseClient.auth.getUser();
    const user = userData?.user || null;
    const destination = resolveRedirectPath(user);

    window.location.href = destination;
  } catch (err) {
    console.error("Login error:", err);
    showMessage("Login failed. Please try again.");
    stopLoading();
  }
}

window.login = login;

// After successful login, fetch user info from both admin and employee tables
async function fetchUserInfo(userId) {
  let profile = null;
  let userType = null;

  if (userId) {
    // Try to get admin info
    const { data: adminData } = await window.supabaseClient
      .from('admin') // Change to your actual admin table name
      .select('*')
      .eq('id', userId)
      .single();
    if (adminData) {
      profile = adminData;
      userType = 'admin';
    } else {
      // Try to get employee info
      const { data: employeeData } = await window.supabaseClient
        .from('users_employee')
        .select('*')
        .eq('id', userId)
        .single();
      if (employeeData) {
        profile = employeeData;
        userType = 'employee';
      }
    }
  }

  // Store or use profile and userType as needed (e.g., localStorage/sessionStorage)
  window.currentUserProfile = profile;
  window.currentUserType = userType;
}

window.fetchUserInfo = fetchUserInfo;
