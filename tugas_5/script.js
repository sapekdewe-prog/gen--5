(function () {
    'use strict';

    document.documentElement.classList.add('js');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- 1. Efek mengetik ---------- */
    var typingEl = document.getElementById('typing');
    if (typingEl) {
        var words = ['Fresh Graduate', 'Web Design Enthusiast', 'Canva & CapCut Creator', 'Future Software Developer'];
        var wi = 0, ci = 0, deleting = false;

        if (reduceMotion) {
            typingEl.textContent = words[0];
        } else {
            (function type() {
                var word = words[wi];
                ci += deleting ? -1 : 1;
                typingEl.textContent = word.slice(0, ci);
                var delay = deleting ? 45 : 95;
                if (!deleting && ci === word.length) { delay = 1600; deleting = true; }
                else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
                setTimeout(type, delay);
            })();
        }
    }

    /* ---------- 2. Muncul saat scroll ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var ro = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
            });
        }, { threshold: 0.12 });
        reveals.forEach(function (el) { ro.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- 3. Angka berjalan ---------- */
    function animateCount(el) {
        var target = parseInt(el.dataset.target, 10) || 0;
        var pad = parseInt(el.dataset.pad, 10) || 0;
        var duration = 1600, start = null;
        function fmt(n) { return String(n).padStart(pad, '0'); }
        if (reduceMotion) { el.textContent = fmt(target); return; }
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ---------- 4. Progress bar skill ---------- */
    var counts = document.querySelectorAll('.count');
    var bars = document.querySelectorAll('.progress-bar');

    if ('IntersectionObserver' in window) {
        var co = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
            });
        }, { threshold: 0.5 });
        counts.forEach(function (c) { co.observe(c); });

        var bo = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.style.width = e.target.dataset.w + '%'; bo.unobserve(e.target); }
            });
        }, { threshold: 0.4 });
        bars.forEach(function (b) { bo.observe(b); });
    } else {
        counts.forEach(animateCount);
        bars.forEach(function (b) { b.style.width = b.dataset.w + '%'; });
    }

    /* ---------- 5. Efek timbul 3D (tilt + kilau) ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.tilt').forEach(function (el) {
            var max = parseFloat(el.dataset.tilt) || 10;
            var raf = null;

            el.addEventListener('mouseenter', function () { el.classList.add('is-tilting'); });

            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width;
                var py = (e.clientY - r.top) / r.height;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(function () {
                    el.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
                    el.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
                    el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
                    el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
                });
            });

            el.addEventListener('mouseleave', function () {
                if (raf) cancelAnimationFrame(raf);
                el.classList.remove('is-tilting');
                el.style.setProperty('--rx', '0deg');
                el.style.setProperty('--ry', '0deg');
            });
        });
    }

    /* ---------- 6. Cahaya kursor + parallax orb + tombol magnet ---------- */
    if (finePointer && !reduceMotion) {
        var glow = document.querySelector('.cursor-glow');
        var orbs = document.querySelectorAll('.orb');
        var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
        var gx = tx, gy = ty;

        window.addEventListener('mousemove', function (e) {
            tx = e.clientX; ty = e.clientY;
            if (glow) glow.style.opacity = '1';
            var nx = e.clientX / window.innerWidth - 0.5;
            var ny = e.clientY / window.innerHeight - 0.5;
            orbs.forEach(function (o, i) {
                var f = (i + 1) * 28;
                o.style.translate = (nx * f) + 'px ' + (ny * f) + 'px';
            });
        });
        document.addEventListener('mouseleave', function () { if (glow) glow.style.opacity = '0'; });

        (function loop() {
            gx += (tx - gx) * 0.12;
            gy += (ty - gy) * 0.12;
            if (glow) glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)';
            requestAnimationFrame(loop);
        })();

        document.querySelectorAll('.btn').forEach(function (b) {
            b.addEventListener('mousemove', function (e) {
                var r = b.getBoundingClientRect();
                var x = (e.clientX - r.left - r.width / 2) * 0.18;
                var y = (e.clientY - r.top - r.height / 2) * 0.25;
                b.style.translate = x + 'px ' + y + 'px';
            });
            b.addEventListener('mouseleave', function () { b.style.translate = '0 0'; });
        });
    }

    /* ---------- 7. Klik untuk menyalin ---------- */
    var toast = document.getElementById('toast');
    var toastTimer;
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
    }
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
            document.body.removeChild(ta);
        });
    }
    document.querySelectorAll('[data-copy]').forEach(function (el) {
        el.addEventListener('click', function () {
            var text = el.dataset.copy;
            copyText(text).then(function () { showToast('Tersalin: ' + text); })
                          .catch(function () { showToast('Gagal menyalin'); });
        });
    });
})();