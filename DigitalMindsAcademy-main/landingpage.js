const slidesData = [
  {
    title: 'New Courses Launched',
    body: 'Master new technical and practical courses launched just for you. Join us and let us learn the basics.',
    tagline: 'Learn, Practice, Improve',
    badge: 'Latest Updates',
    image: 'images/loginmodel.png'
  },
  {
    title: 'Industry-Ready Tracks',
    body: 'Follow guided learning paths built with real-world projects and hands-on activities.',
    tagline: 'Build, Test, Deploy',
    badge: 'Latest Updates',
    image: 'images/loginmodel.png'
  },
  {
    title: 'New Quiz Sets',
    body: 'Practice with updated quizzes to boost your confidence before assessments.',
    tagline: 'Review, Repeat, Succeed',
    badge: 'Latest Updates',
    image: 'images/loginmodel.png'
  },
  {
    title: 'Mentor Sessions',
    body: 'Join live mentor sessions and get feedback on your progress and projects.',
    tagline: 'Ask, Learn, Grow',
    badge: 'Latest Updates',
    image: 'images/loginmodel.png'
  },
  {
    title: 'Skill Badges',
    body: 'Earn badges as you complete milestones and showcase your achievements.',
    tagline: 'Progress, Prove, Shine',
    badge: 'Latest Updates',
    image: 'images/loginmodel.png'
  },
  {
    title: 'Updated Lessons',
    body: 'Refreshed modules with clearer examples and improved materials.',
    tagline: 'Study, Apply, Excel',
    badge: 'Latest Updates',
    image: 'images/loginmodel.png'
  }
];

const slides = slidesData.slice(0, 6);
const slidesWrap = document.querySelector('.hero-slides');
const dotsWrap = document.querySelector('.hero-dots');

let currentIndex = 0;
let autoTimer = null;

const renderSlides = () => {
  if (!slidesWrap || !dotsWrap) return;

  slidesWrap.innerHTML = slides
    .map(
      (slide) => `
        <article class="hero-slide">
          <img src="${slide.image}" alt="${slide.title}">
          <div class="hero-card-overlay"></div>
          <div class="hero-badge">${slide.badge}</div>
          <div class="hero-caption">
            <h3>${slide.title}</h3>
            <p>${slide.body}</p>
            <div class="hero-tagline">${slide.tagline}</div>
          </div>
        </article>
      `
    )
    .join('');

  dotsWrap.innerHTML = slides
    .map(
      (_, idx) =>
        `<button class="dot${idx === 0 ? ' active' : ''}" aria-label="Slide ${
          idx + 1
        }"></button>`
    )
    .join('');
};

const goToSlide = (index) => {
  if (!slidesWrap || !dotsWrap) return;
  const total = slides.length;
  currentIndex = (index + total) % total;
  slidesWrap.style.transform = `translateX(-${currentIndex * 100}%)`;
  dotsWrap.querySelectorAll('.dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentIndex);
  });
};

const startAuto = () => {
  if (autoTimer) return;
  autoTimer = setInterval(() => {
    goToSlide(currentIndex + 1);
  }, 5000);
};

const resetAuto = () => {
  clearInterval(autoTimer);
  autoTimer = null;
  startAuto();
};

renderSlides();
goToSlide(0);
startAuto();

if (dotsWrap) {
  dotsWrap.addEventListener('click', (event) => {
    const dot = event.target.closest('.dot');
    if (!dot) return;
    const dots = Array.from(dotsWrap.querySelectorAll('.dot'));
    const index = dots.indexOf(dot);
    if (index >= 0) {
      goToSlide(index);
      resetAuto();
    }
  });
}
