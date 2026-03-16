async function signup() {
  const firstNameInput = document.getElementById("firstName");
  const surnameInput = document.getElementById("surname");
  const emailInput = document.getElementById("email");
  const roleInput = document.getElementById("role");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");
  const termsInput = document.getElementById("terms");

  const firstName = firstNameInput ? firstNameInput.value.trim() : "";
  const surname = surnameInput ? surnameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim() : "";
  const role = roleInput ? roleInput.value.trim() : "admin";
  const password = passwordInput ? passwordInput.value : "";
  const confirmPassword = confirmInput ? confirmInput.value : "";

  if (!firstName || !surname || !email || !password || !confirmPassword) {
    alert("Please complete all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  if (termsInput && !termsInput.checked) {
    alert("Please accept the terms to continue.");
    return;
  }

  if (!window.supabaseClient) {
    alert("Supabase is not initialized. Check supabaseClient.js and the SDK script.");
    return;
  }

  try {
    const functionResult = await tryAdminSignupViaFunction({
      email,
      password,
      firstName,
      surname
    });

    if (functionResult.ok) {
      alert("Signup successful! You can now log in.");
      const loginParams = new URLSearchParams();
      loginParams.set("signup", "success");
      if (email) {
        loginParams.set("email", email);
      }
      window.location.href = `login.html?${loginParams.toString()}`;
      return;
    }

    const fallbackResult = await tryDirectSignup({
      email,
      password,
      firstName,
      surname,
      role: role || "admin"
    });

    if (!fallbackResult.ok) {
      alert(fallbackResult.message || functionResult.message || "Signup failed. Please try again.");
      return;
    }

    alert("Signup successful! You can now log in.");
    const loginParams = new URLSearchParams();
    loginParams.set("signup", "success");
    if (email) {
      loginParams.set("email", email);
    }
    window.location.href = `login.html?${loginParams.toString()}`;
  } catch (err) {
    console.error("Signup error:", err);
    const message = err && err.message ? err.message : "Signup failed. Please try again.";
    alert(message);
  }
}

async function tryAdminSignupViaFunction({ email, password, firstName, surname }) {
  if (!window.SUPABASE_FUNCTIONS_URL) {
    return { ok: false, message: "Supabase Functions URL is not configured." };
  }

  const headers = {
    "Content-Type": "application/json"
  };
  if (window.SUPABASE_ANON_KEY) {
    headers.apikey = window.SUPABASE_ANON_KEY;
  }

  try {
    const response = await fetch(`${window.SUPABASE_FUNCTIONS_URL}/admin-signup`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, password, firstName, surname })
    });

    let result = {};
    let responseText = "";
    try {
      responseText = await response.text();
      result = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      result = {};
    }

    if (!response.ok) {
      return {
        ok: false,
        message:
          result.error ||
          responseText ||
          `Signup failed (${response.status}). Please try again.`
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("Function signup failed:", error);
    return { ok: false, message: error?.message || "Failed to reach signup service." };
  }
}

async function tryDirectSignup({ email, password, firstName, surname, role }) {
  if (!window.supabaseClient) {
    return { ok: false, message: "Supabase is not initialized." };
  }

  // Sign up in Auth and insert into User_admins with matching id
  const { data: signupData, error: signupError } = await window.supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        surname,
        role
      }
    }
  });

  if (signupError) {
    return { ok: false, message: signupError.message || "Signup failed." };
  }

  const userId = signupData?.user?.id;
  if (!userId) {
    return { ok: false, message: "No user ID returned from Auth." };
  }

  const { error: insertError } = await window.supabaseClient
    .schema("public")
    .from("User_admins")
    .insert([
      {
        id: userId,
        firstname: firstName,
        surname,
        email,
        role
      }
    ]);

  if (insertError) {
    return { ok: false, message: insertError.message || "Failed to save admin details." };
  }

  return { ok: true };
}

function initHexagonBackground() {
  const shell = document.querySelector(".page-shell");
  const hexLayer = document.querySelector(".hexagon-bg");
  if (!shell || !hexLayer) {
    return;
  }

  hexLayer.innerHTML = "";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hexCount = window.innerWidth < 700 ? 14 : 24;
  const palette = [
    "linear-gradient(145deg, rgba(189,208,0,0.28), rgba(157,177,0,0.14))",
    "linear-gradient(145deg, rgba(200,212,114,0.30), rgba(10,26,58,0.12))",
    "linear-gradient(145deg, rgba(10,26,58,0.16), rgba(189,208,0,0.22))"
  ];
  const hexagons = [];
  const placedHexagons = [];
  const shellWidth = shell.clientWidth;
  const shellHeight = shell.clientHeight;

  function isPositionValid(x, y, size) {
    const radius = size * 0.5;
    const minEdgePadding = 24;
    if (
      x < minEdgePadding ||
      y < minEdgePadding ||
      x > shellWidth - size - minEdgePadding ||
      y > shellHeight - (size * 0.87) - minEdgePadding
    ) {
      return false;
    }

    return placedHexagons.every(function (placed) {
      const currentCenterX = x + radius;
      const currentCenterY = y + (size * 0.87 * 0.5);
      const placedCenterX = placed.x + (placed.size * 0.5);
      const placedCenterY = placed.y + (placed.size * 0.87 * 0.5);
      const dx = currentCenterX - placedCenterX;
      const dy = currentCenterY - placedCenterY;
      const distance = Math.sqrt((dx * dx) + (dy * dy));
      const minDistance = ((size + placed.size) * 0.5) + 34;
      return distance > minDistance;
    });
  }

  for (let i = 0; i < hexCount; i += 1) {
    const hex = document.createElement("span");
    hex.className = "hex";
    const size = 56 + Math.random() * 180;
    const height = size * 0.87;
    let x = 0;
    let y = 0;
    let placed = false;

    for (let attempt = 0; attempt < 140; attempt += 1) {
      const candidateX = Math.random() * Math.max(1, shellWidth - size);
      const candidateY = Math.random() * Math.max(1, shellHeight - height);
      if (isPositionValid(candidateX, candidateY, size)) {
        x = candidateX;
        y = candidateY;
        placed = true;
        break;
      }
    }

    if (!placed) {
      continue;
    }

    hex.style.width = `${size}px`;
    hex.style.height = `${height}px`;
    hex.style.background = palette[i % palette.length];
    hex.style.borderColor = i % 2 === 0 ? "rgba(189, 208, 0, 0.52)" : "rgba(10, 26, 58, 0.30)";
    hexLayer.appendChild(hex);
    placedHexagons.push({ x, y, size });

    hexagons.push({
      node: hex,
      size,
      x,
      y,
      driftX: 4 + Math.random() * 10,
      driftY: 5 + Math.random() * 14,
      rotationBase: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      opacityBase: 0.33 + Math.random() * 0.22,
      pulse: 0.7 + Math.random() * 1.4
    });
  }

  function positionHex(hex, time) {
    const t = time / 1000;
    const bob = Math.sin(t * hex.pulse);
    const sway = Math.cos((t * 0.8) + hex.pulse);
    const localX = hex.x + (sway * hex.driftX);
    const localY = hex.y - (bob * hex.driftY);
    const rotation = hex.rotationBase + t * hex.rotationSpeed;
    const opacity = Math.max(0.24, Math.min(0.92, hex.opacityBase + bob * 0.18));
    hex.node.style.opacity = opacity.toFixed(2);
    hex.node.style.transform = `translate(${localX}px, ${localY}px) rotate(${rotation}deg)`;
  }

  function animate(time) {
    hexagons.forEach(function (hex) {
      positionHex(hex, time);
    });
    if (!prefersReducedMotion) {
      window.requestAnimationFrame(animate);
    }
  }

  animate(0);
}

window.signup = signup;
initHexagonBackground();
window.addEventListener("resize", initHexagonBackground);
