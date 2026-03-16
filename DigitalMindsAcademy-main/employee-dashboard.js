document.addEventListener("DOMContentLoaded", () => {
  const fallbackProfile = {
    name: "Alden Recharge",
    email: "a.recharge.dmibpo@gmail.com",
    joined: "March 22, 2026",
    role: "Employee",
    avatar: "images/profile.png",
  };

  const sampleStats = {
    coursesCompleted: 12,
    certificates: 12,
    completion: { completed: 72, inProgress: 28 },
    assessments: {
      labels: [
        "Course 1",
        "Course 2",
        "Course 3",
        "Course 4",
        "Course 5",
        "Course 6",
        "Course 7",
        "Course 8",
        "Course 9",
      ],
      attempt: [2, 2, 3, 2, 3, 2, 2, 2, 2],
      correct: [9, 8, 10, 10, 9, 9, 10, 9, 10],
      wrong: [1, 1, 0, 0, 1, 1, 0, 1, 0],
    },
    leaderboard: [
      { name: "Alden Recharge", points: 320 },
      { name: "Aliya Raymundo", points: 120 },
      { name: "Jhong Hilarious", points: 39 },
      { name: "Jhong Hilarious", points: 37 },
      { name: "Aliya Raymundo", points: 26 },
      { name: "Jhong Hilarious", points: 24 },
      { name: "Aliya Raymundo", points: 22 },
      { name: "Alden Recharge", points: 19 },
      { name: "Aliya Raymundo", points: 17 },
    ],
  };

  function humanDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (_) {
      return iso;
    }
  }

  function applyProfile(profile) {
    const name = profile.name || fallbackProfile.name;
    const email = profile.email || fallbackProfile.email;
    const joined = profile.joined || fallbackProfile.joined;
    const role = profile.role || fallbackProfile.role;
    const avatar = profile.avatar || fallbackProfile.avatar;

    const nameEls = document.querySelectorAll("#sidebar-name, #hero-name");
    nameEls.forEach((el) => (el.textContent = name));

    const emailEls = document.querySelectorAll("#sidebar-email, #hero-email");
    emailEls.forEach((el) => (el.textContent = email));

    const joinedEl = document.getElementById("hero-joined");
    if (joinedEl) joinedEl.textContent = `Joined: ${joined}`;

    const roleEl = document.getElementById("hero-role");
    if (roleEl) roleEl.textContent = `Role: ${role}`;

    const avatarEls = document.querySelectorAll("#sidebar-avatar, #hero-avatar");
    avatarEls.forEach((el) => {
      if (el instanceof HTMLImageElement) {
        el.src = avatar;
        el.alt = `${name} photo`;
      }
    });
  }

  function renderStats(stats) {
    const coursesEl = document.getElementById("stat-courses");
    const certsEl = document.getElementById("stat-certificates");
    if (coursesEl) coursesEl.textContent = stats.coursesCompleted;
    if (certsEl) certsEl.textContent = stats.certificates;
  }

  function renderLeaderboard(list) {
    const container = document.getElementById("leaderboard");
    if (!container) return;
    container.innerHTML = "";

    list.forEach((entry, idx) => {
      const li = document.createElement("li");
      const rank = document.createElement("span");
      rank.className = "rank";
      rank.textContent = idx + 1;
      if (idx === 0) rank.classList.add("medal-gold");
      if (idx === 1) rank.classList.add("medal-silver");
      if (idx === 2) rank.classList.add("medal-bronze");

      const info = document.createElement("span");
      info.className = "info";
      const name = document.createElement("span");
      name.className = "name";
      name.textContent = entry.name;
      info.appendChild(rank);
      info.appendChild(name);

      const points = document.createElement("span");
      points.className = "points";
      points.textContent = `${entry.points} pts`;

      li.appendChild(info);
      li.appendChild(points);
      container.appendChild(li);
    });
  }

  function renderCompletionChart(data) {
    const canvas = document.getElementById("completionChart");
    if (!(canvas instanceof HTMLCanvasElement) || !window.Chart) return;
    return new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Completed", "In Progress"],
        datasets: [
          {
            data: [data.completed, data.inProgress],
            backgroundColor: ["#c6d62a", "#0f1c36"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "62%",
        plugins: { legend: { display: false } },
      },
    });
  }

  function renderScoreChart(assessments) {
    const canvas = document.getElementById("scoreChart");
    if (!(canvas instanceof HTMLCanvasElement) || !window.Chart) return;
    return new Chart(canvas, {
      type: "bar",
      data: {
        labels: assessments.labels,
        datasets: [
          {
            label: "Attempt",
            data: assessments.attempt,
            backgroundColor: "#0f213f",
            borderRadius: 6,
            barPercentage: 0.7,
          },
          {
            label: "Correct",
            data: assessments.correct,
            backgroundColor: "#b0bf00",
            borderRadius: 6,
            barPercentage: 0.7,
          },
          {
            label: "Wrong",
            data: assessments.wrong,
            backgroundColor: "#e63e3e",
            borderRadius: 6,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: "#e6e7db" },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  function activateMenu() {
    const menuLinks = document.querySelectorAll(".menu a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        menuLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
      });
    });
  }

  function bootstrapProfile() {
    if (!window.supabaseClient) {
      applyProfile(fallbackProfile);
      return;
    }

    window.supabaseClient.auth.getUser().then(({ data, error }) => {
      if (error || !data || !data.user) {
        applyProfile(fallbackProfile);
        return;
      }
      const user = data.user;
      const profile = {
        name: `${user.user_metadata?.firstName || user.user_metadata?.first_name || ""} ${user.user_metadata?.surname || user.user_metadata?.lastName || ""}`.trim() || fallbackProfile.name,
        email: user.email || fallbackProfile.email,
        joined: humanDate(user.created_at) || fallbackProfile.joined,
        role: user.user_metadata?.role || "Employee",
        avatar: user.user_metadata?.avatar || fallbackProfile.avatar,
      };
      applyProfile(profile);
    });
  }

  // Initial render
  applyProfile(fallbackProfile);
  renderStats(sampleStats);
  renderLeaderboard(sampleStats.leaderboard);
  renderCompletionChart(sampleStats.completion);
  renderScoreChart(sampleStats.assessments);
  activateMenu();
  bootstrapProfile();
});
