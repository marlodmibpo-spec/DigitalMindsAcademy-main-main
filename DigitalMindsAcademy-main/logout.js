// Shared logout handler for admin interfaces
// Requires supabaseClient.js (window.supabaseClient) loaded beforehand.
(function registerLogout() {
  function attach() {
    const btn = document.querySelector(".logout");
    if (!btn) return;

    function ensureOverlay() {
      let overlay = document.getElementById("logoutOverlay");
      if (overlay) return overlay;

      overlay = document.createElement("div");
      overlay.id = "logoutOverlay";
      overlay.className = "logout-overlay";
      overlay.innerHTML = `
        <div class="card confirm-card">
          <div class="text">Log out of your account?</div>
          <div class="logout-actions">
            <button class="btn-secondary" data-action="cancel">No, stay</button>
            <button class="btn-primary" data-action="confirm">Yes, log out</button>
          </div>
        </div>
        <div class="card working-card" hidden>
          <div class="spinner" aria-hidden="true"></div>
          <div class="text">Logging out...</div>
        </div>
      `;
      document.body.appendChild(overlay);

      const cancelBtn = overlay.querySelector('[data-action="cancel"]');
      const confirmBtn = overlay.querySelector('[data-action="confirm"]');
      cancelBtn?.addEventListener("click", () => {
        overlay.classList.remove("visible");
        document.body.classList.remove("is-logging-out");
      });
      confirmBtn?.addEventListener("click", handleConfirmLogout);

      return overlay;
    }

    const showConfirm = () => {
      const overlay = ensureOverlay();
      const confirmCard = overlay.querySelector(".confirm-card");
      const workingCard = overlay.querySelector(".working-card");
      if (confirmCard) {
        confirmCard.removeAttribute("hidden");
        confirmCard.style.display = "flex";
      }
      if (workingCard) {
        workingCard.setAttribute("hidden", "true");
        workingCard.style.display = "none";
      }
      overlay.classList.add("visible");
      document.body.classList.remove("is-logging-out");
    };

    const showWorking = () => {
      const overlay = ensureOverlay();
      const confirmCard = overlay.querySelector(".confirm-card");
      const workingCard = overlay.querySelector(".working-card");
      if (confirmCard) {
        confirmCard.setAttribute("hidden", "true");
        confirmCard.style.display = "none";
      }
      if (workingCard) {
        workingCard.removeAttribute("hidden");
        workingCard.style.display = "flex";
      }
      overlay.classList.add("visible");
      document.body.classList.add("is-logging-out");
    };

    const hideOverlay = () => {
      const overlay = document.getElementById("logoutOverlay");
      overlay?.classList.remove("visible");
      document.body.classList.remove("is-logging-out");
    };

    const handleConfirmLogout = async () => {
      // Allow the confirm dialog to disappear before showing loader
      requestAnimationFrame(showWorking);
      btn.disabled = true;

      try {
        if (window.supabaseClient) {
          await window.supabaseClient.auth.signOut();
        }
      } catch (err) {
        console.warn("Supabase signOut failed, redirecting anyway:", err);
      } finally {
        try {
          window.localStorage?.clear();
          window.sessionStorage?.clear();
        } catch (_) {
          /* ignore storage errors */
        }
        window.location.href = "login.html";
      }
    };

    const handleLogout = async () => {
      showConfirm();
    };

    btn.addEventListener("click", handleLogout);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
})();
