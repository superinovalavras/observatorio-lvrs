/* ============================================================
   Observatório VDI — comportamento da landing
   Mesma engenharia dos sites irmaos: abas, reveal, trilho de
   rolagem, contadores, tilt e fundo vivo.
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     DESTINO DO CENSO
     Cole aqui o link publico do Google Form (o que o script
     observatorio/criar-google-form.gs imprime ao rodar). Todos os
     botoes "Responder o censo" da pagina saem deste unico ponto.
     Enquanto estiver vazio, os botoes ficam visivelmente desativados —
     de proposito, para o site nao ir ao ar com um botao que nao leva
     a lugar nenhum.
     ============================================================ */
  var URL_CENSO = 'https://forms.gle/DjiXtAcWsXYxnbHJ7';

  (function ligaBotoesDoCenso() {
    var botoes = document.querySelectorAll('[data-censo]');
    botoes.forEach(function (a) {
      if (URL_CENSO) {
        a.href = URL_CENSO;
        a.target = '_blank';
        a.rel = 'noopener';
      } else {
        a.classList.add('cta-inativo');
        a.setAttribute('aria-disabled', 'true');
        a.setAttribute('title', 'O formulário ainda não foi publicado.');
        a.addEventListener('click', function (e) { e.preventDefault(); });
      }
    });
  })();

  /* ---------- abas ---------- */

  /* So os botoes da barra recebem o estado "ativo". Os atalhos que moram
     fora dela (o "Ver o que ele pergunta" do topo) trocam de aba sem virar
     botao selecionado. */
  var botoesBarra = document.querySelectorAll('#tabbar .tab-btn[data-tab]');
  var atalhos = document.querySelectorAll('.tab-btn[data-tab]');
  var panels = document.querySelectorAll('.panel');

  var regua = document.querySelector('.tabbar-abas');

  /* Numa tela estreita a regua rola: a aba escolhida vai para o centro dela.
     A conta e feita na mao de proposito — scrollIntoView rolaria TODOS os
     conteineres rolaveis acima do botao, nao so a regua. */
  function centralizaAba(btn) {
    if (!regua || !btn) return;
    var sobra = regua.scrollWidth - regua.clientWidth;
    if (sobra <= 0) return;
    var alvo = btn.offsetLeft - (regua.clientWidth - btn.offsetWidth) / 2;
    regua.scrollLeft = Math.max(0, Math.min(alvo, sobra));
  }

  function ativarAba(chave) {
    botoesBarra.forEach(function (b) {
      var ativo = b.dataset.tab === chave;
      b.classList.toggle('active', ativo);
      if (ativo) centralizaAba(b);
    });
    panels.forEach(function (p) {
      if (p.id === 'panel-' + chave) {
        p.classList.add('active');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            p.classList.add('panel-in');
            p.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
            atualizaTrilho();
          });
        });
      } else {
        p.classList.remove('active', 'panel-in');
      }
    });
  }

  atalhos.forEach(function (btn) {
    btn.addEventListener('click', function () {
      ativarAba(btn.dataset.tab);
      document.getElementById('tabbar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- contadores ---------- */

  function contar(el) {
    var alvo = parseInt(el.getAttribute('data-count-to'), 10);
    if (reduceMotion) { el.textContent = alvo; return; }
    var inicio = null;
    var duracao = 900;
    var pronto = false;

    function passo(ts) {
      if (pronto) return;
      if (!inicio) inicio = ts;
      var progresso = Math.min((ts - inicio) / duracao, 1);
      var suave = 1 - Math.pow(1 - progresso, 3);
      el.textContent = Math.round(suave * alvo);
      if (progresso < 1) requestAnimationFrame(passo);
      else pronto = true;
    }
    requestAnimationFrame(passo);

    /* Rede de seguranca: em aba de fundo o requestAnimationFrame e
       estrangulado e a animacao congela num valor parcial — o site ficaria
       dizendo "7 blocos de perguntas". O timer garante o numero certo. */
    setTimeout(function () {
      if (!pronto) { pronto = true; el.textContent = alvo; }
    }, duracao + 250);
  }

  /* ---------- reveal na rolagem ---------- */

  /* Revelar e contar andam juntos. O painel ativo revela na hora, sem esperar
     o observador — senao o numero fica exposto em zero ate o IO disparar. */
  function revela(el) {
    el.classList.add('in-view');
    el.querySelectorAll('[data-count-to]').forEach(function (c) {
      if (!c.dataset.done) { c.dataset.done = '1'; contar(c); }
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        revela(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  document.querySelectorAll('.panel.active .reveal').forEach(function (el) {
    revela(el);
    io.unobserve(el);
  });

  /* ---------- trilho de rolagem: a espiral desce e gira ---------- */

  var trilho = document.querySelector('.rail-track');
  var preenche = document.getElementById('railFill');
  var espiral = document.getElementById('railEspiral');

  function atualizaTrilho() {
    if (!trilho) return;
    var topo = window.scrollY || document.documentElement.scrollTop;
    var altura = document.documentElement.scrollHeight - window.innerHeight;
    var progresso = altura > 0 ? Math.min(Math.max(topo / altura, 0), 1) : 0;
    preenche.style.height = (progresso * 100) + '%';
    espiral.style.top = (progresso * trilho.clientHeight) + 'px';
    espiral.style.transform = 'translate(-50%, -50%) rotate(' + (progresso * 540).toFixed(1) + 'deg)';
  }

  /* ---------- o trilho so aparece depois da barra de abas ---------- */

  var railEl = document.getElementById('scrollRail');
  var tabbarEl = document.getElementById('tabbar');

  function mostraTrilho() {
    if (!railEl || !tabbarEl) return;
    var gatilho = tabbarEl.offsetTop + tabbarEl.offsetHeight;
    var y = window.scrollY || document.documentElement.scrollTop;
    railEl.classList.toggle('rail-ativo', y > gatilho);
  }

  /* ---------- parallax do hero ---------- */

  var heroParallax = document.getElementById('heroParallax');
  var heroEl = document.querySelector('.hero');

  function moveHero() {
    if (reduceMotion || !heroParallax || !heroEl) return;
    var h = heroEl.offsetHeight;
    var y = window.scrollY || document.documentElement.scrollTop;
    var progresso = Math.min(Math.max(y / h, 0), 1);
    heroParallax.style.transform = 'translateY(' + (progresso * -60) + 'px)';
    heroParallax.style.opacity = String(1 - progresso * 1.1);
  }

  window.addEventListener('scroll', function () {
    atualizaTrilho(); moveHero(); mostraTrilho();
  }, { passive: true });

  window.addEventListener('resize', function () {
    atualizaTrilho(); moveHero(); mostraTrilho();
  });

  atualizaTrilho();
  moveHero();
  mostraTrilho();

  /* ---------- tilt 3D nos cartoes ---------- */

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.benefit-item').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--rx', (px * 10) + 'deg');
        card.style.setProperty('--ry', (py * -10) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- fundo vivo: constelacao de pontos observados ---------- */

  (function () {
    var canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, DPR;
    var pontos = [];
    var mouse = { x: null, y: null };

    function redimensiona() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function semeia() {
      var quantidade = Math.min(80, Math.floor((W * H) / 18000));
      pontos = [];
      for (var i = 0; i < quantidade; i++) {
        pontos.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 1.2 + 0.5
        });
      }
    }

    function quadro() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pontos.length; i++) {
        var p = pontos[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;

        for (var j = i + 1; j < pontos.length; j++) {
          var q = pontos[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 122) {
            ctx.strokeStyle = 'rgba(0,245,160,' + (0.13 * (1 - dist / 122)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 170) {
            ctx.strokeStyle = 'rgba(127,178,240,' + (0.34 * (1 - mdist / 170)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(127,178,240,0.62)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(quadro);
    }

    window.addEventListener('resize', function () { redimensiona(); semeia(); });
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', function () { mouse.x = null; mouse.y = null; });
    window.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    }, { passive: true });

    redimensiona();
    semeia();
    quadro();
  })();
})();
