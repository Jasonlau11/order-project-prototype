import { memo, useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  radius: number;
  active: number;
  seed: number;
  sepX: number;
  sepY: number;
};

type FlowSample = {
  x: number;
  y: number;
  speed: number;
};

const CONFIG = {
  desktopBaseCount: 188,
  desktopMaxCount: 246,
  mobileCount: 76,
  separationRadius: 13,
  separationForce: 0.022,
  linkDistance: 44,
  maxLinksPerParticle: 3,
  maxSpeed: 1.32,
  flowSteer: 0.082,
  inertia: 0.989,
  mouseRadius: 220,
  mouseAttraction: 0.008,
  mouseSwirl: 0.018,
  activeEase: 0.055,
  mobileFrameInterval: 1000 / 30,
};

function fract(value: number) {
  return value - Math.floor(value);
}

function hash2(x: number, y: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function gridHash(x: number, y: number) {
  let hash = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295;
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function valueNoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = smooth(fx);
  const uy = smooth(fy);
  const a = gridHash(ix, iy);
  const b = gridHash(ix + 1, iy);
  const c = gridHash(ix, iy + 1);
  const d = gridHash(ix + 1, iy + 1);
  const top = a + (b - a) * ux;
  const bottom = c + (d - c) * ux;
  return top + (bottom - top) * uy;
}

function streamPotential(x: number, y: number, time: number) {
  const large = valueNoise(x * 1.55 + time * 0.028, y * 1.3 - time * 0.018);
  const medium = valueNoise(x * 3.15 - time * 0.045 + 8.4, y * 2.75 + time * 0.032 + 3.7);
  const fine = valueNoise(x * 6.2 + time * 0.075 + 15.2, y * 5.4 - time * 0.058 + 11.1);
  return large * 0.58 + medium * 0.31 + fine * 0.11;
}

function sampleFlowField(x: number, y: number, elapsed: number, width: number, height: number): FlowSample {
  const aspect = width / Math.max(height, 1);
  const nx = (x / Math.max(width, 1)) * aspect;
  const ny = y / Math.max(height, 1);
  const time = elapsed * 0.001;
  const epsilon = 0.0045;

  // Curl of a slowly evolving scalar potential: divergence-free, coherent and pathless.
  const dPotentialDy = (
    streamPotential(nx, ny + epsilon, time) - streamPotential(nx, ny - epsilon, time)
  ) / (2 * epsilon);
  const dPotentialDx = (
    streamPotential(nx + epsilon, ny, time) - streamPotential(nx - epsilon, ny, time)
  ) / (2 * epsilon);

  let flowX = dPotentialDy;
  let flowY = -dPotentialDx;
  const magnitude = Math.hypot(flowX, flowY) || 1;
  flowX /= magnitude;
  flowY /= magnitude;

  // A restrained cross-canvas drift opens curl loops into long, readable currents.
  const driftX = 0.82;
  const driftY = -0.16;
  flowX = flowX * 0.74 + driftX * 0.26;
  flowY = flowY * 0.74 + driftY * 0.26;
  const directedMagnitude = Math.hypot(flowX, flowY) || 1;
  flowX /= directedMagnitude;
  flowY /= directedMagnitude;

  // A separate coherent field creates fast river zones and calm drifting zones.
  const intensityNoise = valueNoise(nx * 2.05 - time * 0.018 + 21.3, ny * 2.25 + time * 0.014 + 5.8);
  const riverBand = smooth(Math.max(0, Math.min(1, (intensityNoise - 0.3) / 0.48)));
  const speed = 0.48 + riverBand * 0.52;

  return { x: flowX, y: flowY, speed };
}

function seededUnit(seed: number) {
  return hash2(seed, seed * 0.731 + 4.17);
}

function createParticle(index: number, width: number, height: number): Particle {
  const seed = seededUnit(index + 3.7);
  const angle = seededUnit(index + 7.1) * Math.PI * 2;
  const speed = 0.08 + seededUnit(index + 11.3) * 0.12;
  const x = width * (0.03 + seededUnit(index + 1.1) * 0.94);
  const y = height * (0.04 + seededUnit(index + 2.3) * 0.92);
  return {
    x,
    y,
    prevX: x,
    prevY: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 0.92 + seededUnit(index + 5.5) * 0.92,
    active: 0,
    seed,
    sepX: 0,
    sepY: 0,
  };
}

function createParticles(width: number, height: number, count: number) {
  return Array.from({ length: count }, (_, index) => createParticle(index, width, height));
}

function MarketHeroFieldBase() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ambientLayer = canvas?.parentElement;
    const interactionHost = ambientLayer?.parentElement;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ambientLayer || !interactionHost || !context) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    let reducedMotion = reducedMotionQuery.matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let particles: Particle[] = [];
    let pointerActive = false;
    let pointerX = 0;
    let pointerY = 0;
    let targetPointerX = 0;
    let targetPointerY = 0;
    let animationFrame = 0;
    let startTime = 0;
    let previousFrame = 0;
    let visible = document.visibilityState === 'visible';
    let inViewport = true;

    const separationRadius2 = CONFIG.separationRadius ** 2;
    const linkDistance2 = CONFIG.linkDistance ** 2;

    const renderStatic = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'rgba(255, 106, 61, 0.18)';
      for (const particle of particles) {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
    };

    const scheduleFrame = () => {
      window.cancelAnimationFrame(animationFrame);
      if (!reducedMotion && visible && inViewport) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const resize = () => {
      const rect = interactionHost.getBoundingClientRect();
      const nextWidth = Math.max(1, rect.width);
      const nextHeight = Math.max(1, rect.height);
      const previousWidth = width;
      const previousHeight = height;
      width = nextWidth;
      height = nextHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const desktopScale = Math.max(0, Math.min(1, (width - 1280) / 960));
      const desktopCount = Math.round(
        CONFIG.desktopBaseCount + (CONFIG.desktopMaxCount - CONFIG.desktopBaseCount) * desktopScale,
      );
      const targetCount = width < 760 ? CONFIG.mobileCount : desktopCount;
      if (particles.length === 0) {
        particles = createParticles(width, height, targetCount);
      } else {
        const scaleX = width / Math.max(previousWidth, 1);
        const scaleY = height / Math.max(previousHeight, 1);
        for (const particle of particles) {
          particle.x *= scaleX;
          particle.y *= scaleY;
          particle.prevX = particle.x;
          particle.prevY = particle.y;
        }
        if (particles.length > targetCount) particles.length = targetCount;
        while (particles.length < targetCount) {
          particles.push(createParticle(particles.length, width, height));
        }
      }

      targetPointerX = width * 0.5;
      targetPointerY = height * 0.5;
      pointerX = targetPointerX;
      pointerY = targetPointerY;
      if (reducedMotion) renderStatic();
    };

    const collectSeparationForces = () => {
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance2 = dx * dx + dy * dy;
          if (distance2 >= separationRadius2) continue;

          const distance = Math.sqrt(distance2) || 1;
          const push = (CONFIG.separationRadius - distance) / CONFIG.separationRadius;
          const forceX = (dx / distance) * push * CONFIG.separationForce;
          const forceY = (dy / distance) * push * CONFIG.separationForce;
          a.sepX += forceX;
          a.sepY += forceY;
          b.sepX -= forceX;
          b.sepY -= forceY;
        }
      }
    };

    const drawConnections = () => {
      type LinkCandidate = { aIndex: number; bIndex: number; distance2: number; intensity: number };
      const candidates: LinkCandidate[] = [];
      const linkCounts = new Uint8Array(particles.length);
      const lineBuckets: Array<Array<[number, number, number, number]>> = [[], [], []];

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance2 = dx * dx + dy * dy;
          if (distance2 >= linkDistance2) continue;
          const speedA = Math.hypot(a.vx, a.vy) || 1;
          const speedB = Math.hypot(b.vx, b.vy) || 1;
          const directionalAgreement = (a.vx * b.vx + a.vy * b.vy) / (speedA * speedB);
          if (directionalAgreement < 0.5) continue;
          const closeness = 1 - Math.sqrt(distance2) / CONFIG.linkDistance;
          const intensity = closeness * 0.62 + Math.max(a.active, b.active) * 0.38;
          candidates.push({ aIndex: i, bIndex: j, distance2, intensity });
        }
      }

      candidates.sort((left, right) => left.distance2 - right.distance2);
      for (const candidate of candidates) {
        if (
          linkCounts[candidate.aIndex] >= CONFIG.maxLinksPerParticle
          || linkCounts[candidate.bIndex] >= CONFIG.maxLinksPerParticle
        ) continue;
        const a = particles[candidate.aIndex];
        const b = particles[candidate.bIndex];
        const bucket = candidate.intensity > 0.7 ? 2 : candidate.intensity > 0.36 ? 1 : 0;
        lineBuckets[bucket].push([a.x, a.y, b.x, b.y]);
        linkCounts[candidate.aIndex] += 1;
        linkCounts[candidate.bIndex] += 1;
      }

      const alphas = [0.046, 0.086, 0.155];
      const widths = [0.48, 0.64, 0.88];
      lineBuckets.forEach((segments, index) => {
        if (segments.length === 0) return;
        context.strokeStyle = `rgba(255, 106, 61, ${alphas[index]})`;
        context.lineWidth = widths[index];
        context.beginPath();
        for (const [x1, y1, x2, y2] of segments) {
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
        }
        context.stroke();
      });
    };

    const updateParticles = (elapsed: number, frameScale: number) => {
      for (const particle of particles) {
        const flow = sampleFlowField(particle.x, particle.y, elapsed, width, height);
        const phaseVariation = 0.92 + particle.seed * 0.16;
        const desiredSpeed = CONFIG.maxSpeed * flow.speed * phaseVariation;
        const desiredX = flow.x * desiredSpeed;
        const desiredY = flow.y * desiredSpeed;

        particle.vx += (desiredX - particle.vx) * CONFIG.flowSteer * frameScale;
        particle.vy += (desiredY - particle.vy) * CONFIG.flowSteer * frameScale;

        particle.vx += particle.sepX * frameScale;
        particle.vy += particle.sepY * frameScale;

        if (pointerActive && !coarsePointer) {
          const dx = pointerX - particle.x;
          const dy = pointerY - particle.y;
          const distance = Math.hypot(dx, dy) || 1;
          const proximity = Math.max(0, 1 - distance / CONFIG.mouseRadius);
          particle.active += (proximity - particle.active) * CONFIG.activeEase * frameScale;
          if (proximity > 0) {
            const force = proximity * proximity * frameScale;
            particle.vx += (dx / distance) * CONFIG.mouseAttraction * force;
            particle.vy += (dy / distance) * CONFIG.mouseAttraction * force;
            particle.vx += (-dy / distance) * CONFIG.mouseSwirl * force;
            particle.vy += (dx / distance) * CONFIG.mouseSwirl * force;
          }
        } else {
          particle.active += (0 - particle.active) * CONFIG.activeEase * frameScale;
        }

        particle.vx *= Math.pow(CONFIG.inertia, frameScale);
        particle.vy *= Math.pow(CONFIG.inertia, frameScale);
        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > CONFIG.maxSpeed) {
          particle.vx = (particle.vx / speed) * CONFIG.maxSpeed;
          particle.vy = (particle.vy / speed) * CONFIG.maxSpeed;
        }

        particle.prevX = particle.x;
        particle.prevY = particle.y;
        particle.x += particle.vx * frameScale;
        particle.y += particle.vy * frameScale;

        const margin = 36;
        if (particle.x < -margin) particle.x = particle.prevX = width + margin;
        if (particle.x > width + margin) particle.x = particle.prevX = -margin;
        if (particle.y < -margin) particle.y = particle.prevY = height + margin;
        if (particle.y > height + margin) particle.y = particle.prevY = -margin;
      }
    };

    const renderParticles = () => {
      for (const particle of particles) {
        const speed = Math.hypot(particle.vx, particle.vy);
        const speedRatio = Math.min(1, speed / CONFIG.maxSpeed);

        // Short directional strokes read as flowing matter without a persistent foggy trail.
        context.strokeStyle = `rgba(255, 106, 61, ${0.075 + speedRatio * 0.1 + particle.active * 0.14})`;
        context.lineWidth = Math.max(0.42, particle.radius * 0.56);
        context.beginPath();
        context.moveTo(particle.prevX, particle.prevY);
        context.lineTo(particle.x, particle.y);
        context.stroke();

        const radius = particle.radius + particle.active * 0.9;
        context.fillStyle = `rgba(255, 106, 61, ${0.3 + speedRatio * 0.12 + particle.active * 0.28})`;
        context.beginPath();
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fill();
      }
    };

    function draw(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const isMobile = width < 760;
      if (isMobile && timestamp - previousFrame < CONFIG.mobileFrameInterval) {
        animationFrame = window.requestAnimationFrame(draw);
        return;
      }

      const delta = previousFrame ? Math.min(34, timestamp - previousFrame) : 16.67;
      const frameScale = delta / 16.67;
      previousFrame = timestamp;
      const elapsed = timestamp - startTime;

      context.clearRect(0, 0, width, height);
      pointerX += (targetPointerX - pointerX) * 0.12;
      pointerY += (targetPointerY - pointerY) * 0.12;

      if (pointerActive && !coarsePointer) {
        const gradient = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, CONFIG.mouseRadius);
        gradient.addColorStop(0, 'rgba(255, 106, 61, 0.065)');
        gradient.addColorStop(0.45, 'rgba(255, 106, 61, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 106, 61, 0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(pointerX, pointerY, CONFIG.mouseRadius, 0, Math.PI * 2);
        context.fill();
      }

      for (const particle of particles) {
        particle.sepX = 0;
        particle.sepY = 0;
      }

      collectSeparationForces();
      updateParticles(elapsed, frameScale);
      drawConnections();
      renderParticles();
      animationFrame = window.requestAnimationFrame(draw);
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (coarsePointer) return;
      const rect = interactionHost.getBoundingClientRect();
      pointerActive = true;
      targetPointerX = event.clientX - rect.left;
      targetPointerY = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointerActive = false;
      targetPointerX = width * 0.5;
      targetPointerY = height * 0.5;
    };

    const handleVisibilityChange = () => {
      visible = document.visibilityState === 'visible';
      previousFrame = 0;
      scheduleFrame();
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) renderStatic();
      scheduleFrame();
    };

    const resizeObserver = new ResizeObserver(resize);
    const viewportObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      previousFrame = 0;
      scheduleFrame();
    }, { rootMargin: '120px 0px' });

    resizeObserver.observe(interactionHost);
    viewportObserver.observe(interactionHost);
    interactionHost.addEventListener('pointermove', handlePointerMove);
    interactionHost.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    resize();
    if (reducedMotion) renderStatic();
    else scheduleFrame();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      viewportObserver.disconnect();
      interactionHost.removeEventListener('pointermove', handlePointerMove);
      interactionHost.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" aria-hidden="true" />;
}

export const MarketHeroField = memo(MarketHeroFieldBase);
