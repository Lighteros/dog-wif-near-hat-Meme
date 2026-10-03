const copyCa = document.getElementById("copy-ca");
if (copyCa) {
  copyCa.addEventListener("click", async () => {
    const label = copyCa.querySelector("em");
    try {
      await navigator.clipboard.writeText(copyCa.dataset.ca);
      label.textContent = "Copied";
    } catch (err) {
      label.textContent = copyCa.dataset.ca;
    }
    setTimeout(() => { label.textContent = "Copy"; }, 1400);
  });
}

const nav = document.getElementById("nav");
const menu = document.getElementById("menu");
const links = document.getElementById("links");
const progress = document.getElementById("progress");
const portrait = document.getElementById("portrait");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

menu.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menu.setAttribute("aria-expanded", open ? "true" : "false");
});
links.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    links.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
});

const onScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
  nav.classList.toggle("night", y > window.innerHeight * 0.72);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

if (!reduce && portrait) {
  const wrap = portrait.parentElement;
  wrap.addEventListener("pointermove", (event) => {
    const rect = wrap.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    portrait.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
  });
  wrap.addEventListener("pointerleave", () => {
    portrait.style.transform = "";
  });
}

function bootCanvas(id, mode) {
  const canvas = document.getElementById(id);
  if (!canvas || reduce) return;
  const ctx = canvas.getContext("2d");
  const dots = Array.from({ length: mode === "studio" ? 42 : 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.8 + 0.4,
    s: Math.random() * 0.25 + 0.05,
    o: Math.random() * 0.45 + 0.1
  }));
  let w = 0;
  let h = 0;
  let running = true;

  const resize = () => {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  };
  resize();
  window.addEventListener("resize", resize);

  const draw = (t) => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const time = t * 0.001;
    if (mode === "night") {
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const amp = 18 + i * 10;
        const yBase = h * (0.35 + i * 0.14);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 12) {
          const y = yBase + Math.sin(x * 0.004 + time * (0.6 + i * 0.15) + i) * amp * devicePixelRatio;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(62, 240, 196, ${0.05 + i * 0.03})`;
        ctx.lineWidth = 1.4 * devicePixelRatio;
        ctx.stroke();
      }
    }
    dots.forEach((dot, i) => {
      const x = ((dot.x + time * dot.s * 0.02) % 1) * w;
      const y = (dot.y * h + Math.sin(time + i) * 16 * devicePixelRatio);
      ctx.beginPath();
      ctx.fillStyle = mode === "studio"
        ? `rgba(6, 36, 28, ${dot.o * 0.35})`
        : `rgba(157, 255, 223, ${dot.o * 0.55})`;
      ctx.arc(x, y, dot.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });
  requestAnimationFrame(draw);
}

bootCanvas("studio", "studio");
bootCanvas("night", "night");
