export function initVectorField() {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const bg = document.getElementById("field-bg");
  const grid = document.getElementById("field-grid");
  if (!bg || !grid) return;

  const CFG = {
    cell: 40,
    radius: 140,
    baseOpacity: 0.08,
    peakOpacity: 0.45,
    cursorSmooth: 0.14,
    rotSmooth: 0.06,
    opSmooth: 0.1,
    updateBudget: 700,
    overscan: 120,
  };

  const dashes = [];
  let tx = innerWidth / 2,
    ty = innerHeight / 2;
  let cx = tx,
    cy = ty;
  let isVisible = true;
  let rafId = null;

  const shortestAngleDelta = (from, to) => ((to - from + 540) % 360) - 180;

  const build = () => {
    grid.textContent = "";
    dashes.length = 0;

    const w = innerWidth + CFG.overscan * 2;
    const h = innerHeight + CFG.overscan * 2;

    const cols = Math.ceil(w / CFG.cell);
    const rows = Math.ceil(h / CFG.cell);

    grid.style.gridTemplateColumns = `repeat(${cols}, ${CFG.cell}px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, ${CFG.cell}px)`;

    const ox = -CFG.overscan;
    const oy = -CFG.overscan;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement("span");
        el.className = "dash";
        grid.appendChild(el);

        dashes.push({
          el,
          x: ox + c * CFG.cell + CFG.cell / 2,
          y: oy + r * CFG.cell + CFG.cell / 2,
          rot: 0,
          op: CFG.baseOpacity,
        });

        el.style.opacity = String(CFG.baseOpacity);
      }
    }
  };

  let resizePending = false;
  addEventListener(
    "resize",
    () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        build();
      });
    },
    { passive: true }
  );

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
    },
    { passive: true }
  );

  // Pause animation when tab is hidden to save battery
  document.addEventListener("visibilitychange", () => {
    isVisible = document.visibilityState === "visible";
    if (isVisible && !rafId) {
      tick();
    }
  });

  build();

  const tick = () => {
    if (!isVisible) {
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(tick);

    cx += (tx - cx) * CFG.cursorSmooth;
    cy += (ty - cy) * CFG.cursorSmooth;

    bg.style.setProperty("--cx", `${cx}px`);
    bg.style.setProperty("--cy", `${cy}px`);

    const maxDist2 = CFG.radius * CFG.radius;
    let updated = 0;

    for (let i = 0; i < dashes.length; i++) {
      const d = dashes[i];
      const dx = d.x - cx;
      const dy = d.y - cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 > maxDist2) continue;

      const dist = Math.sqrt(dist2);
      const t = 1 - dist / CFG.radius;

      const targetAng = (Math.atan2(cy - d.y, cx - d.x) * 180) / Math.PI;
      const targetOp = CFG.baseOpacity + t * (CFG.peakOpacity - CFG.baseOpacity);

      d.rot += shortestAngleDelta(d.rot, targetAng) * CFG.rotSmooth;
      d.op += (targetOp - d.op) * CFG.opSmooth;

      d.el.style.transform = `rotate(${d.rot.toFixed(2)}deg)`;
      d.el.style.opacity = d.op.toFixed(3);

      if (++updated >= CFG.updateBudget) break;
    }
  };

  tick();
}