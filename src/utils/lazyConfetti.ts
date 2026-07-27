// Lazy load canvas-confetti to reduce initial bundle (50KB+)

// Brand colors for ambassador celebrations
const BRAND_COLORS = {
  primary: '#19cb97',
  dark: '#333333',
  accent: '#14a87d',
  gold: '#FFD700',
  silver: '#C0C0C0',
};

export const triggerConfetti = async () => {
  const confetti = await import('canvas-confetti');
  return confetti.default({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

export const triggerSuccessConfetti = async () => {
  const confetti = await import('canvas-confetti');
  
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: any) {
    confetti.default({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  
  fire(0.2, {
    spread: 60,
  });
  
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

// Ambassador-specific confetti with brand colors
export const triggerAmbassadorConfetti = async () => {
  const confetti = await import('canvas-confetti');
  
  return confetti.default({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: [BRAND_COLORS.primary, BRAND_COLORS.dark, BRAND_COLORS.accent, BRAND_COLORS.gold],
  });
};

// Special tier upgrade celebration
export const triggerTierUpConfetti = async () => {
  const confetti = await import('canvas-confetti');
  
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const colors = [BRAND_COLORS.primary, BRAND_COLORS.gold, BRAND_COLORS.accent];

  const frame = () => {
    confetti.default({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti.default({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

// Badge/milestone celebration with stars
export const triggerMilestoneConfetti = async () => {
  const confetti = await import('canvas-confetti');
  
  const defaults = {
    spread: 360,
    ticks: 100,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: [BRAND_COLORS.primary, BRAND_COLORS.accent, BRAND_COLORS.gold],
  };

  function shoot() {
    confetti.default({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'],
    });

    confetti.default({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};

// Badge earned celebration
export const triggerBadgeConfetti = async () => {
  const confetti = await import('canvas-confetti');
  
  confetti.default({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: [BRAND_COLORS.primary, BRAND_COLORS.dark, BRAND_COLORS.accent],
    shapes: ['star', 'circle'],
    scalar: 1.2,
  });
};
