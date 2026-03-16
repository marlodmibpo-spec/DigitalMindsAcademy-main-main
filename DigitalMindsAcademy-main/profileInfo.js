// Reuse profile info logic for all admin interfaces
// Requires: supabase.min.js, supabaseClient.js loaded before this script

function loadAdminProfileInfo() {
  if (window.supabaseClient) {
    window.supabaseClient.auth.getUser().then(({ data, error }) => {
      if (error || !data || !data.user) return;
      const user = data.user;
      const email = user.email || '';
      const firstName = user.user_metadata?.firstName || user.user_metadata?.first_name || '';
      const surname = user.user_metadata?.surname || user.user_metadata?.lastName || user.user_metadata?.last_name || '';
      const nameElem = document.getElementById('profile-name');
      const emailElem = document.getElementById('profile-email');
      if (nameElem) nameElem.textContent = `${firstName} ${surname}`.trim();
      if (emailElem) emailElem.textContent = email;
    });
  }
}

// Call on DOMContentLoaded and after sidebar navigation if needed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAdminProfileInfo);
} else {
  loadAdminProfileInfo();
}

// Optionally, export for reuse
window.loadAdminProfileInfo = loadAdminProfileInfo;
