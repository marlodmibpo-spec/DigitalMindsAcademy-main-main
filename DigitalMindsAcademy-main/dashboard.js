document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display admin profile info
    if (window.supabaseClient) {
      window.supabaseClient.auth.getUser().then(({ data, error }) => {
        if (error || !data || !data.user) return;
        const user = data.user;
        const email = user.email || '';
        const firstName = user.user_metadata?.firstName || user.user_metadata?.first_name || '';
        const surname = user.user_metadata?.surname || user.user_metadata?.lastName || user.user_metadata?.last_name || '';
        document.getElementById('profile-name').textContent = `${firstName} ${surname}`.trim();
        document.getElementById('profile-email').textContent = email;
      });
    }
  if (window.Chart) {
    const bar = document.getElementById('barChart');
    if (bar instanceof HTMLCanvasElement) {
      try {
        new Chart(bar, {
          type: 'bar',
          data: {
            labels: [],
            datasets: [
              {
                label: 'Passed',
                data: [],
                backgroundColor: '#b0bf00'
              },
              {
                label: 'Failed',
                data: [],
                backgroundColor: '#ff2d2d'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              }
            }
          }
        });
      } catch (error) {
        console.warn('Chart.js failed to render bar chart.', error);
      }
    }

    const pie = document.getElementById('pieChart');
    if (pie instanceof HTMLCanvasElement) {
      try {
        new Chart(pie, {
          type: 'pie',
          data: {
            labels: [],
            datasets: [{
              data: [],
              backgroundColor: [
                '#b0bf00',
                '#021437'
              ]
            }]
          },
          options: {
            responsive: true
          }
        });
      } catch (error) {
        console.warn('Chart.js failed to render pie chart.', error);
      }
    }
  }

  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      handleLogout();
    });
  }

  const menuLinks = document.querySelectorAll('.menu a');
  if (menuLinks.length) {
    menuLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') {
          event.preventDefault();
        }
        menuLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }
});

async function handleLogout() {
  const confirmLogout = window.confirm('Are you sure you want to log out?');
  if (!confirmLogout) {
    return;
  }

  if (window.supabaseClient) {
    try {
      await window.supabaseClient.auth.signOut();
    } catch (error) {
      console.warn('Supabase sign out failed.', error);
    }
  }

  window.location.href = 'login.html';
}
