document.addEventListener('DOMContentLoaded', () => {
  // 1. Түнгі / Күндізгі режим
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

// 2. Басқа бетке өту немесе Enter басып іздеу
  function handleSearch() {
    const query = searchInput.value.trim();
    if (query !== '') {
      alert(`Іздеу сұранысы: ${query}`);
      // Редирект жасау керек болса:
      // window.location.href = `/search?q=${encodeURIComponent(query)}`;
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
