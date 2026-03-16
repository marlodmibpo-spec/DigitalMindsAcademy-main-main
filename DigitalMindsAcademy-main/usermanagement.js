const USERS_TABLE = "users_employee";


document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#userTable tbody");
  if (!tableBody) return;

  function formatDate(value) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function resolveStatusClass(statusValue) {
    const status = String(statusValue || "").toLowerCase().trim();
    if (status === "active") return "active";
    if (status.includes("complete") && !status.includes("incomplete")) return "completed";
    if (status.includes("incomplete")) return "incomplete";
    if (status.includes("progress") || status.includes("pending")) return "progress";
    return "progress";
  }

  function titleCase(value, fallback) {
    const text = String(value || "").trim();
    if (!text) return fallback || "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function mapSupabaseRows(rows) {
    return (rows || []).map((row) => ({
      id: row.id || row.user_id || row.uid || "",
      firstName: row.firstname || row.first_name || row.firstName || "",
      lastName: row.surname || row.last_name || row.lastname || row.lastName || "",
      email: row.email || "",
      role: row.role || "employee",
      status: row.status || "Active",
      // Prefer explicit joined_at, then created_at defaults, then other variants.
      joinedAt: row.joined_at || row.created_at || row.inserted_at || row.createdAt || ""
    }));
  }

  function renderUsers(userList) {
    tableBody.innerHTML = "";
    userList.forEach((user) => {
      const row = document.createElement("tr");
      row.dataset.userId = user.id || "";
      row.dataset.email = user.email || "";
      const statusLabel = user.status || "Active";
      const statusClass = resolveStatusClass(statusLabel);
      const roleLabel = titleCase(user.role, "Employee");

      row.innerHTML = `
        <td><input type="checkbox"></td>
        <td>${user.firstName || ""}</td>
        <td>${user.lastName || ""}</td>
        <td>${user.email || ""}</td>
        <td>${roleLabel}</td>
        <td><span class="status ${statusClass}">${statusLabel}</span></td>
        <td>${formatDate(user.joinedAt)}</td>
        <td>
          <i class="fa-solid fa-pen action-btn edit"></i>
          <i class="fa-solid fa-trash action-btn delete"></i>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  async function fetchEmployeesViaFunction() {
    if (!window.SUPABASE_FUNCTIONS_URL || !window.supabaseClient) {
      return null;
    }

    const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();
    if (sessionError || !sessionData?.session) {
      throw new Error("You are not logged in. Please sign in again.");
    }

    const token = sessionData.session.access_token;
    const response = await fetch(`${window.SUPABASE_FUNCTIONS_URL}/list-employees`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Function list-employees failed (${response.status}): ${message}`);
    }

    const body = await response.json().catch(() => ({}));
    return body?.data || [];
  }

  async function loadUsersFromSupabase() {
    if (!window.supabaseClient) {
      return;
    }

    try {
      const functionRows = await fetchEmployeesViaFunction();
      if (functionRows && Array.isArray(functionRows)) {
        renderUsers(mapSupabaseRows(functionRows));
        return;
      }
    } catch (fnError) {
      console.warn("list-employees function failed, falling back to direct table select:", fnError);
    }

    const { data, error } = await window.supabaseClient
      .from(USERS_TABLE)
      .select("*");

    if (error) {
      console.error("Failed to load users from Supabase:", error);
      alert(error.message || "Unable to load employees. Please check Supabase RLS policies for select on users_employee.");
      return;
    }

    renderUsers(mapSupabaseRows(data));
  }

  async function deleteEmployeeRow(rowEl) {
    if (!rowEl) return;

    const userId = rowEl.dataset.userId || "";
    const email = rowEl.dataset.email || "";
    const firstName = (rowEl.children[1]?.textContent || "").trim();
    const lastName = (rowEl.children[2]?.textContent || "").trim();
    const userLabel = [firstName, lastName].filter(Boolean).join(" ") || email || "this user";

    const confirmed = window.confirm(`Delete ${userLabel}? This will remove them from users_employee.`);
    if (!confirmed) return;

    if (!window.supabaseClient) {
      alert("Supabase is not initialized.");
      return;
    }

    // Use edge function to delete both Auth user and users_employee row when available.
    const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();
    const token = sessionData?.session?.access_token || "";
    if (sessionError || !token) {
      alert("You must be logged in to delete users.");
      return;
    }

    const deleteFilter = userId ? { id: userId } : { email };
    let deletedViaFunction = false;
    let functionErrorMessage = "";

    // Prefer the Edge Function so the Auth user is removed with service-role privileges.
    try {
      const { data, error } = await window.supabaseClient.functions.invoke("delete-employee", {
        body: { userId, email },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) {
        functionErrorMessage = error.message || "Unknown function error";
        throw error;
      }

      deletedViaFunction = true;
    } catch (fnError) {
      functionErrorMessage = fnError?.message || functionErrorMessage || String(fnError || "Unknown error");
      console.warn("delete-employee function failed via supabaseClient.functions.invoke:", fnError);

      // Secondary attempt: direct fetch to the functions URL (covers older SDKs / custom domains).
      if (!deletedViaFunction && window.SUPABASE_FUNCTIONS_URL) {
        try {
          const response = await fetch(`${window.SUPABASE_FUNCTIONS_URL}/delete-employee`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId, email })
          });

          const parsed = await response.json().catch(() => ({}));
          if (!response.ok) {
            const message = parsed?.error || response.statusText || "Function call failed";
            functionErrorMessage = message;
            throw new Error(message);
          }

          deletedViaFunction = true;
        } catch (fetchError) {
          functionErrorMessage = fetchError?.message || functionErrorMessage || "Function fetch failed";
          console.warn("delete-employee function failed via fetch fallback:", fetchError);
        }
      }
    }

    // Fall back to table-only delete so the UI is not blocked, but surface why Auth deletion failed.
    if (!deletedViaFunction) {
      const { error } = await window.supabaseClient
        .from(USERS_TABLE)
        .delete()
        .match(deleteFilter);

      if (error) {
        console.error("Failed to delete employee:", error);
        alert(error.message || "Failed to delete user. Check Supabase RLS delete policy on users_employee.");
        return;
      }

      console.warn("Employee deleted from table only; Auth delete may have failed:", functionErrorMessage);
    }

    await loadUsersFromSupabase();
    alert(`${userLabel} has been deleted.`);
  }

  loadUsersFromSupabase();

  if (tableBody) {
    tableBody.addEventListener("click", (event) => {
      const deleteBtn = event.target.closest(".action-btn.delete");
      if (!deleteBtn) return;
      const rowEl = deleteBtn.closest("tr");
      deleteEmployeeRow(rowEl);
    });
  }

  const addUserBtn = document.querySelector(".add-user");
  const modal = document.getElementById("addUserModal");
  const cancelBtn = document.getElementById("cancelModal");
  const uploadBtn = document.querySelector(".upload-btn");
  const photoUpload = document.getElementById("photoUpload");
  const saveBtn = document.querySelector(".save-btn");
  const roleInput = document.getElementById("role");

  if (addUserBtn && modal) {
    addUserBtn.onclick = () => {
      if (roleInput) {
        roleInput.value = "Employee";
      }
      modal.style.display = "flex";
    };
  }

  if (cancelBtn && modal) {
    cancelBtn.onclick = () => {
      modal.style.display = "none";
    };
  }

  if (modal) {
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  if (uploadBtn && photoUpload) {
    uploadBtn.onclick = () => {
      photoUpload.click();
    };
  }

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const firstName = document.getElementById("firstName")?.value.trim() || "";
      const lastName = document.getElementById("lastName")?.value.trim() || "";
      const email = document.getElementById("email")?.value.trim() || "";
      const password = document.getElementById("password")?.value || "";
      const confirmPassword = document.getElementById("confirmPassword")?.value || "";
      const role = "employee";

      if (!email || !password) {
        alert("Email and password are required.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      if (!window.supabaseClient) {
        alert("Supabase is not initialized.");
        return;
      }

      if (!window.SUPABASE_FUNCTIONS_URL) {
        alert("Supabase Functions URL is not set.");
        return;
      }

      saveBtn.disabled = true;
      const originalLabel = saveBtn.textContent;
      saveBtn.textContent = "Saving...";

      // Capture the current (admin) session so we can restore it after creating an employee.
      const { data: sessionData } = await window.supabaseClient.auth.getSession();
      const adminSession = sessionData?.session || null;
      const restoreAdminSession = async () => {
        if (!adminSession) return;
        const { error: sessionRestoreError } = await window.supabaseClient.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token
        });
        if (sessionRestoreError) {
          console.warn("Failed to restore admin session after user creation:", sessionRestoreError);
        }
      };

      try {
        // 1. Create user in Supabase Auth
        const { data: signupData, error: signupError } = await window.supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              surname: lastName,
              role
            }
          }
        });

        if (signupError) {
          alert(signupError.message || "Failed to create user in Auth.");
          return;
        }

        const userId = signupData?.user?.id;
        if (!userId) {
          alert("No user ID returned from Auth.");
          return;
        }

        // Supabase signUp can switch the active session to the newly created employee.
        // Immediately restore the original admin session so inserts/reads keep admin privileges.
        await restoreAdminSession();

        // 2. Insert into users_employee
        const { error: insertError } = await window.supabaseClient
          .from('users_employee')
          .insert([
            {
              id: userId,
              firstname: firstName,
              surname: lastName,
              email,
              role: 'employee',
              status: 'Active'
            }
          ]);
        if (insertError) {
          alert('User created in Auth, but failed to insert employee data: ' + insertError.message);
          return;
        }

        await loadUsersFromSupabase();

        alert("Employee account created and added to the list!");

        if (modal) {
          modal.style.display = "none";
        }

        document.getElementById("firstName").value = "";
        document.getElementById("lastName").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("confirmPassword").value = "";
        if (roleInput) {
          roleInput.value = "Employee";
        }
      } catch (error) {
        console.error("Create user failed:", error);
        alert("Failed to create user.");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalLabel || "Save";
        // Ensure admin stays logged in even if an earlier step threw.
        await restoreAdminSession();
      }
    };
  }
});

// Create admin in both Supabase Auth and User_admins table
async function createAdmin({ email, password, firstname, surname }) {
  // 1. Create admin in Supabase Auth
  const { data, error } = await window.supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstname,
        surname,
        role: 'admin'
      }
    }
  });

  if (error) {
    alert('Failed to create admin in Auth: ' + error.message);
    return;
  }

  const userId = data.user?.id;
  if (!userId) {
    alert('No user ID returned from Auth.');
    return;
  }

  // 2. Insert into User_admins table
  const { error: insertError } = await window.supabaseClient
    .from('User_admins')
    .insert([{
      id: userId,
      firstname,
      surname,
      email,
      role: 'admin'
    }]);

  if (insertError) {
    alert('Admin created in Auth, but failed to insert into User_admins: ' + insertError.message);
    return;
  }

  alert('Admin created successfully!');
}

window.createAdmin = createAdmin;
