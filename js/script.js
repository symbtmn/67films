document.addEventListener('DOMContentLoaded', () => {
  //  Түнгі / Күндізгі режим
  const themeBtn = document.getElementById('theme-toggle');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');

      if (document.body.classList.contains('dark-mode')) {
        themeBtn.textContent = '🌙 Түнгі режим';
      } else {
        themeBtn.textContent = '☀️ Күндізгі режим';
      }
    });
  }

  // 2. Excel (CSV) жүктеу
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const category = document.getElementById('category').value;
      const message = document.getElementById('message').value;

      const headers = "Аты,Email,Санат,Хабарлама\n";
      const row = `"${name}","${email}","${category}","${message.replace(/"/g, '""')}"\n`;

      const blob = new Blob(["\ufeff" + headers + row], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "clients_data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Деректер сақталды!");
      this.reset();
    });
  }
  const searchInput = document.getElementById('siteSearchInput');
  const searchBtn = document.getElementById('searchBtn');
  const items = document.querySelectorAll('#contentList .item');

// 1. Беттегі элементтерді СРАЗУ (Live) фильтрлеу
  searchInput.addEventListener('input', () => {
    const filterText = searchInput.value.toLowerCase().trim();

    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(filterText)) {
        item.style.display = 'block'; // Сәйкес келсе көрсетеді
      } else {
        item.style.display = 'none';  // Жоқ болса жасырады
      }
    });
  });


  function handleSearch() {
    const query = searchInput.value.trim();
    if (query !== '') {
      alert(`Іздеу сұранысы: ${query}`);

    }
  }

// Enter басу оқиғасы
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

// Лупа батырмасын басу оқиғасы
  searchBtn.addEventListener('click', handleSearch);
});
// Көру статусын өзгерту функциясы
function setStatus(btnElement, statusType) {
  const buttons = document.querySelectorAll('.status-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  btnElement.classList.add('active');

  const feedbackText = document.getElementById('feedbackText');
  const ratingBox = document.getElementById('ratingBox');

  if (statusType === 'not_watched' || statusType === 'will_watch') {
    feedbackText.textContent = "💡 Бұл фильмді әлі көрмеген болсаңыз, көріп шығуға кеңес береміз!";
    ratingBox.style.display = 'none';
  } else if (statusType === 'watched') {
    feedbackText.textContent = "🎉 Фильмді көріп болдыңыз ба? Бағаңызды беріп өтіңіз:";
    ratingBox.style.display = 'flex';
  } else if (statusType === 'watching') {
    feedbackText.textContent = "🍿 Көріліміңіз сәтті өтсін!";
    ratingBox.style.display = 'none';
  } else if (statusType === 'dropped') {
    feedbackText.textContent = "⏹️ Фильм соңына дейін қаралмады.";
    ratingBox.style.display = 'none';
  }
}

// Жұлдызша бағалау функциясы
function rateFilm(starCount) {
  const stars = document.querySelectorAll('.stars span');
  stars.forEach((star, index) => {
    if (index < starCount) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });

  const ratingResult = document.getElementById('ratingResult');
  ratingResult.textContent = `Бағаңыз: ${starCount} / 5 ⭐`;
}
