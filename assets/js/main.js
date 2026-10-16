const burger = document.querySelector('.burger'), menu = document.querySelector('nav ul');
burger.addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .15 });
document.querySelectorAll('.fade').forEach(el => io.observe(el));
document.querySelectorAll('[data-count]').forEach(el => {
  const t = +el.dataset.count; let n = 0;
  const step = () => { n++; el.textContent = n; if (n < t) setTimeout(step, 120) };
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { step(); o.disconnect() } }).observe(el);
});
document.getElementById('year').textContent = new Date().getFullYear();
