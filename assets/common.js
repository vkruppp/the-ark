window.L = "ru";
(function(){ let s = null; try { s = localStorage.getItem("ark_lang"); } catch (e) {}
  const b = (navigator.language || "").slice(0,2).toLowerCase();
  L = s || (b === "ru" || b === "uk" ? "ru" : "en"); })();
window.$ = id => document.getElementById(id);
window.esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
window.langHooks = [];
window.setLang = function (l) {
  L = l; document.body.classList.remove("lru","len"); document.body.classList.add("l"+l); document.documentElement.lang = l;
  document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("on", b.dataset.l === l));
  try { localStorage.setItem("ark_lang", l); } catch (e) {}
  langHooks.forEach(h => h());
};
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang button").forEach(b => b.onclick = () => setLang(b.dataset.l));
  const nav = $("nav");
  if (nav) { const f = () => nav.classList.toggle("solid", scrollY > 40); addEventListener("scroll", f, {passive:true}); f(); }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.12});
  window.observeReveal = root => (root || document).querySelectorAll(".rv:not(.in)").forEach(el => io.observe(el));
  observeReveal();
  // animated counters
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1600;
    const fmt = v => { let s = v.toFixed(dec); if (L === "ru") s = s.replace(".", ","); s = s.replace(/\B(?=(\d{3})+(?!\d))/g, L === "ru" ? " " : ","); return (el.dataset.pre || "") + s + (el.dataset.suf || ""); };
    const step = t => { const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * ease); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), {threshold:.5});
  document.querySelectorAll("[data-count]").forEach(el => { const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0); let v = to.toFixed(dec); if (L === "ru") v = v.replace(".", ","); v = v.replace(/\B(?=(\d{3})+(?!\d))/g, L === "ru" ? " " : ","); el.textContent = (el.dataset.pre || "") + v + (el.dataset.suf || ""); co.observe(el); });
  setLang(L);
});
