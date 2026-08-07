import gsap from "gsap";
import type { Container } from "pixi.js";

/** Stop all GSAP tweens on a card before destroy / rebuild. */
export function killCardTweens(target: Container) {
  gsap.killTweensOf(target);
  if (target.scale) gsap.killTweensOf(target.scale);
}

function alive(target: Container): boolean {
  return Boolean(target) && !target.destroyed;
}

export function dealIn(
  target: Container,
  to: { x: number; y: number; rotation?: number },
  delay = 0,
) {
  if (!alive(target)) return;
  killCardTweens(target);
  target.alpha = 0;
  target.scale.set(0.35);
  gsap.to(target.scale, {
    x: 1,
    y: 1,
    duration: 0.45,
    delay,
    ease: "back.out(1.6)",
  });
  return gsap.to(target, {
    duration: 0.45,
    delay,
    ease: "back.out(1.4)",
    x: to.x,
    y: to.y,
    rotation: to.rotation ?? 0,
    alpha: 1,
  });
}

export function moveTo(
  target: Container,
  to: { x: number; y: number; rotation?: number },
  opts?: { duration?: number; delay?: number; ease?: string },
) {
  if (!alive(target)) return;
  // Overwrite prior move/lift on same target; keep scale tweens alone.
  gsap.killTweensOf(target);
  return gsap.to(target, {
    duration: opts?.duration ?? 0.35,
    delay: opts?.delay ?? 0,
    ease: opts?.ease ?? "power2.out",
    x: to.x,
    y: to.y,
    rotation: to.rotation ?? target.rotation,
  });
}

export function selectLift(target: Container, lifted: boolean, baseY: number) {
  if (!alive(target)) return;
  gsap.killTweensOf(target.scale);
  gsap.to(target.scale, {
    x: lifted ? 1.12 : 1,
    y: lifted ? 1.12 : 1,
    duration: 0.18,
    ease: "power2.out",
  });
  // Only tween y so it does not cancel a concurrent moveTo x/rotation.
  return gsap.to(target, {
    duration: 0.18,
    ease: "power2.out",
    y: lifted ? baseY - 22 : baseY,
    overwrite: "auto",
  });
}

export function playToCenter(
  target: Container,
  center: { x: number; y: number },
  onComplete?: () => void,
) {
  if (!alive(target)) return;
  killCardTweens(target);
  gsap.to(target.scale, {
    x: 1.2,
    y: 1.2,
    duration: 0.4,
    ease: "power3.inOut",
  });
  return gsap.to(target, {
    duration: 0.4,
    ease: "power3.inOut",
    x: center.x,
    y: center.y,
    rotation: 0,
    onComplete,
  });
}

export function pulseGlow(target: Container, active: boolean) {
  if (!alive(target)) return;
  gsap.killTweensOf(target);
  if (!active) {
    target.alpha = 1;
    return;
  }
  gsap.to(target, {
    alpha: 0.55,
    duration: 0.55,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
}

export function fadeInOverlay(target: Container) {
  if (!alive(target)) return;
  gsap.killTweensOf(target);
  target.alpha = 0;
  return gsap.to(target, { alpha: 0.72, duration: 0.4, ease: "power2.out" });
}
