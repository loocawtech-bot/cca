window.__ccaOk = true;
(() => {
  const WHATSAPP = '554832118701';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // menu mobile
  const burger = $('#burger'), header = $('.header'), mnav = $('#mnav');
  if (burger && mnav) {
    const set = open => {
      if (open) mnav.style.top = ($('.bar', header) || header).getBoundingClientRect().bottom + 10 + 'px';
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    $$('a', mnav).forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  // header: fica sólido ao rolar e se esconde ao descer
  let ultimoY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    header.classList.toggle('scrolled', y > 30);
    if (!document.body.classList.contains('menu-open')) header.classList.toggle('hide', y > 500 && y > ultimoY + 4);
    if (y < ultimoY - 4 || y < 500) header.classList.remove('hide');
    ultimoY = y;
  };

  // título revelado palavra por palavra
  $$('.rw').forEach(el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.textContent = p; w.append(i); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
    });
    walk(el);
    $$('.w > span', el).forEach((s, i) => s.style.transitionDelay = (i * 0.06) + 's');
  });

  // texto que "acende" palavra por palavra conforme a rolagem
  const stmts = $$('[data-words]').map(el => {
    const words = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.append(p); return; }
          const s = document.createElement('span'); s.className = 'wd'; s.textContent = p; words.push(s); frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
    return { el, words };
  });
  const onWords = () => stmts.forEach(({ el, words }) => {
    const r = el.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', calmo || i < n));
  });

  // entrada suave (inclui atraso opcional via data-delay)
  const mostrar = el => {
    const d = +el.dataset.delay || 0;
    d ? setTimeout(() => el.classList.add('in'), d) : el.classList.add('in');
  };
  const alvos = $$('.rv, .fade-up, .rw, .img-rv, .hero-media');
  if ('IntersectionObserver' in window && !calmo) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { mostrar(e.target); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    alvos.forEach(el => io.observe(el));
  } else alvos.forEach(el => el.classList.add('in'));

  // contadores
  const contar = el => {
    const fim = +el.dataset.count, t0 = performance.now(), dur = 1600;
    const alvo = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : null;
    if (!alvo || calmo) return;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      alvo.nodeValue = Math.round(fim * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const ioC = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { contar(e.target); ioC.unobserve(e.target); } }), { threshold: .6 });
    $$('[data-count]').forEach(el => ioC.observe(el));
  }

  // brilho que segue o mouse nos cartões
  if (fino) $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', (e.clientX - r.left) + 'px');
    el.style.setProperty('--y', (e.clientY - r.top) + 'px');
  }));

  // parallax leve em imagens
  const para = calmo ? [] : $$('[data-parallax]');
  const onPara = () => para.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const k = +img.dataset.parallax, c = r.top + r.height / 2 - innerHeight / 2;
    img.style.transform = `translate3d(0,${(-c * k).toFixed(1)}px,0) scale(1.08)`;
  });

  // linha de progresso do processo
  const procs = $$('[data-proc]');
  const onProc = () => procs.forEach(list => {
    const r = list.getBoundingClientRect(), mid = innerHeight * .6;
    const bar = $('.bar', list), total = r.height - 40;
    const h = Math.min(total, Math.max(0, mid - r.top - 20));
    bar.style.height = h + 'px';
    $$('.pstep', list).forEach(s => s.classList.toggle('on', s.getBoundingClientRect().top + 44 < mid));
  });

  // home: últimos artigos publicados pelo painel
  const grade = $('[data-posts]');
  if (grade) fetch('/cca/api/posts.php?limite=3').then(r => r.ok ? r.json() : null).then(d => {
    if (d && d.html) { grade.innerHTML = d.html; $$('.rv', grade).forEach(el => el.classList.add('in')); }
  }).catch(() => {});

  let raf = 0;
  const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; onHeader(); onWords(); onPara(); onProc(); }); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onHeader(); onWords(); onPara(); onProc();

  // FAQ
  $$('.faq-item').forEach(item => {
    const q = $('.faq-q', item);
    q.addEventListener('click', () => {
      const open = !item.classList.contains('open');
      $$('.faq-item.open', item.parentElement).forEach(o => { o.classList.remove('open'); $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('open', open);
      q.setAttribute('aria-expanded', String(open));
    });
  });

  // máscara de telefone
  $$('input[type=tel]').forEach(tel => tel.addEventListener('input', () => {
    const d = tel.value.replace(/\D/g, '').slice(0, 11);
    tel.value = d.length < 3 ? d : d.length < 7 ? `(${d.slice(0, 2)}) ${d.slice(2)}`
      : d.length < 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
      : `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }));

  // guarda de onde o visitante veio (primeira página da visita)
  const ORIGEM_KEY = 'cca_origem';
  try {
    const qs = new URLSearchParams(location.search);
    if (!sessionStorage.getItem(ORIGEM_KEY) || qs.get('utm_source')) {
      sessionStorage.setItem(ORIGEM_KEY, JSON.stringify({
        referencia: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '',
        utm_source: qs.get('utm_source') || '', utm_medium: qs.get('utm_medium') || '', utm_campaign: qs.get('utm_campaign') || ''
      }));
    }
  } catch (e) {}
  const origem = () => { try { return JSON.parse(sessionStorage.getItem(ORIGEM_KEY)) || {}; } catch (e) { return {}; } };

  // envia o lead ao painel (não bloqueia o WhatsApp se falhar)
  const registrarLead = d => {
    try {
      fetch('/cca/api/lead.php', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, ...origem(), pagina: location.pathname })
      }).catch(() => {});
    } catch (e) {}
  };

  // formulários → painel + WhatsApp
  $$('form[data-lead]').forEach(form => form.addEventListener('submit', ev => {
    ev.preventDefault();
    let first = null;
    $$('[required]', form).forEach(f => {
      const ok = f.type === 'email' ? /^\S+@\S+\.\S+$/.test(f.value) : f.value.trim().length > 2;
      f.closest('.field').classList.toggle('err', !ok);
      if (!ok && !first) first = f;
    });
    if (first) { first.focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    registrarLead(d);
    if (d.website) { form.classList.add('sent'); return; }
    const linhas = [
      'Olá, CCA! Vim pelo site e gostaria de falar com um contador.', '',
      `Nome: ${d.nome}`, `Telefone: ${d.telefone}`, d.email ? `E-mail: ${d.email}` : '',
      d.empresa ? `Empresa: ${d.empresa}` : '', d.assunto ? `Assunto: ${d.assunto}` : '',
      d.mensagem ? `\n${d.mensagem}` : ''
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(linhas)}`, '_blank', 'noopener');
    form.classList.add('sent');
  }));

  $$('[data-ano]').forEach(el => el.textContent = new Date().getFullYear());
})();
