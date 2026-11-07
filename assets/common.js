window.LANGS = [["ru","Русский"],["uk","Українська"],["en","English"],["es","Español"],["de","Deutsch"],["fr","Français"],["zh","中文"],["ar","العربية"],["he","עברית"]];
window.RTL = ["ar","he"];
window.I18N = window.I18N || {};
window.L = "ru";
(function(){ let s = null; try { s = localStorage.getItem("ark_lang"); } catch (e) {}
  const codes = LANGS.map(l => l[0]);
  const b = (navigator.language || "en").slice(0,2).toLowerCase();
  L = (s && codes.includes(s)) ? s : (codes.includes(b) ? b : "en"); })();
window.$ = id => document.getElementById(id);
window.esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
// translate: ru text, en text -> current language
window.tx = (ru, en) => L === "ru" ? ru : L === "en" ? en : ((I18N[L] && I18N[L][en]) || en);
window.tobj = o => tx(o.ru, o.en);
window.tarr = (ru, en) => L === "ru" ? ru : en.map(e => tx(e, e));
window.deepTx = o => { if (typeof o === "string") return tx(o, o); const r = {}; for (const k in o) r[k] = deepTx(o[k]); return r; };
const DEC = {ru:",",uk:",",de:",",fr:",",es:","}, THO = {ru:" ",uk:" ",fr:" ",de:".",es:"."};
window.nfmt = (v, dec) => { let s = (+v).toFixed(dec || 0); const [i, d] = s.split("."); const ii = i.replace(/\B(?=(\d{3})+(?!\d))/g, THO[L] || ","); return d ? ii + (DEC[L] || ".") + d : ii; };
window.langHooks = [];
function loadDict(l) {
  return new Promise(res => {
    if (l === "ru" || l === "en" || I18N[l]) return res();
    const s = document.createElement("script"); s.src = "assets/i18n/" + l + ".js"; s.onload = res; s.onerror = res; document.head.appendChild(s);
  });
}
window.setLang = async function (l) {
  await loadDict(l);
  L = l;
  const b = document.body; b.classList.remove("lru","len","lx"); b.classList.add(l === "ru" ? "lru" : l === "en" ? "len" : "lx");
  document.documentElement.lang = l; document.documentElement.dir = RTL.includes(l) ? "rtl" : "ltr";
  document.querySelectorAll("span.tr").forEach(sp => { if (l !== "ru" && l !== "en") sp.innerHTML = (I18N[l] && I18N[l][sp.dataset.k]) || sp.dataset.k; });
  const sel = $("langsel"); if (sel) sel.value = l;
  try { localStorage.setItem("ark_lang", l); } catch (e) {}
  document.querySelectorAll("[data-count]").forEach(el => el.textContent = (el.dataset.pre || "") + nfmt(el.dataset.count, +(el.dataset.dec || 0)) + (el.dataset.suf || ""));
  langHooks.forEach(h => h());
};
document.addEventListener("DOMContentLoaded", () => {
  // add a translation slot after each English span
  document.querySelectorAll("span.en").forEach(en => { const t = document.createElement("span"); t.className = "tr"; t.dataset.k = en.innerHTML.trim(); en.after(t); });
  const sel = $("langsel");
  if (sel) { sel.innerHTML = LANGS.map(([c, n]) => `<option value="${c}">${n}</option>`).join(""); sel.onchange = () => setLang(sel.value); }
  const nav = $("nav");
  if (nav) { const f = () => nav.classList.toggle("solid", scrollY > 40 || nav.dataset.solid === "1"); addEventListener("scroll", f, {passive:true}); f(); }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.12});
  window.observeReveal = root => (root || document).querySelectorAll(".rv:not(.in)").forEach(el => io.observe(el));
  observeReveal();
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1600;
    const step = t => { const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3); el.textContent = (el.dataset.pre || "") + nfmt(to * ease, dec) + (el.dataset.suf || ""); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), {threshold:.5});
  document.querySelectorAll("[data-count]").forEach(el => co.observe(el));
  setLang(L);
});
