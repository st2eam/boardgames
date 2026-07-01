interface IconProps {
  className?: string;
}

const V = "0 0 32 32";
const O = "#333";
const W = 0.7;

export function CrabIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      <ellipse cx="16" cy="17" rx="7" ry="5" fill="#fff" stroke={O} strokeWidth={W} />
      <ellipse cx="19" cy="17" rx="4" ry="5" fill="#f0e8e4" stroke="none" />
      <path d="M9 17 L5 12 L3 14 L6 16 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M5 12 L2 10 L3 14 Z" fill="#f0e8e4" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M23 17 L27 12 L29 14 L26 16 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M27 12 L30 10 L29 14 Z" fill="#f0e8e4" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <line x1="13" y1="12" x2="12" y2="9" stroke={O} strokeWidth={W} strokeLinecap="round" />
      <circle cx="12" cy="8.5" r="1" fill={O} opacity={0.6} />
      <line x1="19" y1="12" x2="20" y2="9" stroke={O} strokeWidth={W} strokeLinecap="round" />
      <circle cx="20" cy="8.5" r="1" fill={O} opacity={0.6} />
      <line x1="11" y1="20" x2="8" y2="24" stroke={O} strokeWidth={0.5} strokeLinecap="round" opacity={0.5} />
      <line x1="14" y1="21" x2="12" y2="25" stroke={O} strokeWidth={0.5} strokeLinecap="round" opacity={0.5} />
      <line x1="18" y1="21" x2="20" y2="25" stroke={O} strokeWidth={0.5} strokeLinecap="round" opacity={0.5} />
      <line x1="21" y1="20" x2="24" y2="24" stroke={O} strokeWidth={0.5} strokeLinecap="round" opacity={0.5} />
      <line x1="16" y1="12" x2="16" y2="22" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" />
    </svg>
  );
}

export function BoatIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      <path d="M16 6 L16 18 L25 18 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 8 L16 18 L8 18 Z" fill="#f0ede8" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <line x1="16" y1="5" x2="16" y2="18" stroke={O} strokeWidth={W} />
      <line x1="16" y1="10" x2="22" y2="17" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" />
      <line x1="16" y1="11" x2="10.5" y2="17" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" />
      <path d="M5 18 L27 18 L24 23 L8 23 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 18 L27 18 L24 23 L16 23 Z" fill="#e8edf0" stroke="none" />
      <line x1="5" y1="18" x2="27" y2="18" stroke={O} strokeWidth={0.4} opacity={0.25} />
      <line x1="16" y1="18" x2="16" y2="23" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" />
      <path d="M3 25 Q8 23 13 25 Q18 27 23 25 Q28 23 30 25" stroke="#c8dce8" strokeWidth={0.5} opacity={0.35} fill="none" />
    </svg>
  );
}

export function FishIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Diamond body — tropical fish 🐠 */}
      <path d="M10 16 L18 9 L26 16 L18 23 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M18 9 L26 16 L18 16 Z" fill="#e4edf0" stroke="none" />
      <path d="M18 16 L26 16 L18 23 Z" fill="#e8f0ed" stroke="none" />
      {/* Triangle tail — base midpoint connects to diamond left corner */}
      <path d="M10 16 L4 10 L4 22 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M10 16 L4 10 L4 16 Z" fill="#f0ede8" stroke="none" />
      {/* Eye */}
      <circle cx="21" cy="15" r="1.2" fill={O} opacity={0.6} />
      {/* Dorsal fin */}
      <path d="M16 11 L18 7 L19 10" fill="#f0ede8" stroke={O} strokeWidth={0.5} strokeLinejoin="round" opacity={0.6} />
      {/* Fold creases */}
      <line x1="10" y1="16" x2="26" y2="16" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" />
      <line x1="18" y1="9" x2="18" y2="23" stroke={O} strokeWidth={0.3} opacity={0.12} strokeDasharray="1 1" />
    </svg>
  );
}

export function SwimmerIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Head */}
      <circle cx="10" cy="13.5" r="3" fill="#fff" stroke={O} strokeWidth={W} />
      <path d="M10 10.5 A3 3 0 0 1 13 13.5 L10 13.5 Z" fill="#f0ede8" stroke="none" />
      {/* Eye */}
      <circle cx="11" cy="13" r="0.7" fill={O} opacity={0.6} />
      {/* Torso */}
      <path d="M13 12.5 L24 10.5 L25 14 L24 17.5 L13 15.5 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M18.5 11.5 L24 10.5 L25 14 L24 17.5 L18.5 16.5 Z" fill="#e4edf0" stroke="none" />
      {/* Forward arm — reaching ahead */}
      <path d="M11 11 L5 7 L4 9.5 L10 13 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M5 7 L4 9.5 L7.5 10.5 Z" fill="#f0ede8" stroke="none" />
      {/* Back arm — sweeping behind */}
      <path d="M16 16 L12 23 L14 24 L18 17 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M14 20 L14 24 L17 18 Z" fill="#f0ede8" stroke="none" />
      {/* Legs — flutter kick */}
      <path d="M24 11.5 L29 9 L29 12 L25 13 Z" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M24 16.5 L29 19 L29 16 L25 15 Z" fill="#f0ede8" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      {/* Water ripples */}
      <path d="M2 7 Q4 6 5.5 7" stroke="#c8dce8" strokeWidth={0.5} opacity={0.35} fill="none" />
      <path d="M11 24.5 Q13 23.5 14.5 24.5" stroke="#c8dce8" strokeWidth={0.5} opacity={0.35} fill="none" />
      {/* Fold crease */}
      <line x1="10" y1="14" x2="25" y2="14" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" />
    </svg>
  );
}

export function SharkIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Streamlined body */}
      <path d="M4 16 L16 10 L28 15 L29 17 L28 19 L16 20 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 17 L28 15 L29 17 L28 19 L16 18 Z" fill="#dce4ea" stroke="none" />
      {/* Dorsal fin — tall and sharp */}
      <path d="M13 10 L17 3 L19 10" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M17 3 L19 10 L16 10 Z" fill="#dce4ea" stroke="none" />
      {/* Tail — forked */}
      <path d="M4 16 L2 11 L3 14" stroke={O} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16 L2 21 L3 18" stroke={O} strokeWidth={W} strokeLinecap="round" strokeLinejoin="round" />
      {/* Pectoral fin */}
      <path d="M17 19 L14 24 L19 20" fill="#e8ede8" stroke={O} strokeWidth={0.5} strokeLinejoin="round" opacity={0.6} />
      {/* Eye */}
      <circle cx="25" cy="16" r="0.9" fill={O} opacity={0.7} />
      {/* Gill slits */}
      <line x1="22" y1="14.5" x2="22" y2="17" stroke={O} strokeWidth={0.3} opacity={0.3} />
      <line x1="23.5" y1="14.5" x2="23.5" y2="16.5" stroke={O} strokeWidth={0.3} opacity={0.3} />
      {/* Mouth line */}
      <path d="M27 18 L29 17.5" stroke={O} strokeWidth={0.4} opacity={0.4} strokeLinecap="round" />
      {/* Fold crease */}
      <line x1="4" y1="16" x2="29" y2="17" stroke={O} strokeWidth={0.3} opacity={0.12} strokeDasharray="1 1" />
    </svg>
  );
}

export function JellyfishIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      <path d="M8 15 Q8 4 16 4 Q24 4 24 15 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 4 Q24 4 24 15 L16 15 Z" fill="#f5e4ee" stroke="none" />
      <line x1="16" y1="4" x2="16" y2="15" stroke={O} strokeWidth={0.4} opacity={0.2} strokeDasharray="1 1" />
      <path d="M10 8 Q16 11 22 8" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" fill="none" />
      <path d="M9 12 Q16 14 23 12" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" fill="none" />
      <circle cx="13" cy="10" r="0.8" fill={O} opacity={0.6} />
      <circle cx="19" cy="10" r="0.8" fill={O} opacity={0.6} />
      <path d="M9 15 L10 18 L8 21 L10 24" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      <path d="M12 15 L13 19 L11 22 L13 26" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      <path d="M16 15 L16 19 L15 22 L16 27" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      <path d="M20 15 L19 19 L21 22 L19 26" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      <path d="M23 15 L22 18 L24 21 L22 24" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
    </svg>
  );
}

export function LobsterIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Body — elongated oval, top-down view */}
      <ellipse cx="16" cy="14" rx="5" ry="4" fill="#fff" stroke={O} strokeWidth={W} />
      <ellipse cx="18.5" cy="14" rx="3" ry="4" fill="#f0e4e0" stroke="none" />
      {/* Tail segment */}
      <path d="M16 18 L14 22 L18 22 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 18 L18 22 L16 22 Z" fill="#f0e8e4" stroke="none" />
      {/* Tail fan */}
      <path d="M13 22 L16 21.5 L19 22 L16 26 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 21.5 L19 22 L16 26 Z" fill="#f0e8e4" stroke="none" />
      {/* Left claw */}
      <path d="M11 13 L7 9 L5 11 L8 13 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M7 9 L4 7 L5 11 Z" fill="#f0e8e4" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      {/* Right claw */}
      <path d="M21 13 L25 9 L27 11 L24 13 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M25 9 L28 7 L27 11 Z" fill="#f0e8e4" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      {/* Antennae */}
      <line x1="13" y1="10.5" x2="9" y2="4" stroke={O} strokeWidth={0.5} strokeLinecap="round" opacity={0.5} />
      <line x1="19" y1="10.5" x2="23" y2="4" stroke={O} strokeWidth={0.5} strokeLinecap="round" opacity={0.5} />
      {/* Eyes */}
      <circle cx="14" cy="11.5" r="0.8" fill={O} opacity={0.6} />
      <circle cx="18" cy="11.5" r="0.8" fill={O} opacity={0.6} />
      {/* Legs */}
      <line x1="13" y1="17" x2="10" y2="20.5" stroke={O} strokeWidth={0.4} opacity={0.4} strokeLinecap="round" />
      <line x1="19" y1="17" x2="22" y2="20.5" stroke={O} strokeWidth={0.4} opacity={0.4} strokeLinecap="round" />
      <line x1="14.5" y1="17.5" x2="12" y2="21.5" stroke={O} strokeWidth={0.4} opacity={0.4} strokeLinecap="round" />
      <line x1="17.5" y1="17.5" x2="20" y2="21.5" stroke={O} strokeWidth={0.4} opacity={0.4} strokeLinecap="round" />
      {/* Body segment fold lines */}
      <line x1="16" y1="10" x2="16" y2="26" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" />
      <line x1="11.5" y1="14" x2="20.5" y2="14" stroke={O} strokeWidth={0.3} opacity={0.12} strokeDasharray="1 1" />
    </svg>
  );
}

export function ShellIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Scallop shell — fan with hinge at bottom */}
      <path d="M16 26 L3 11 Q3 4 16 4 Q29 4 29 11 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 26 L16 4 Q29 4 29 11 Z" fill="#f0e8e0" stroke="none" />
      {/* Hinge ears */}
      <path d="M16 26 L12 29 L14.5 26" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M16 26 L20 29 L17.5 26" fill="#f0e8e0" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      {/* Ridges */}
      <line x1="16" y1="26" x2="6" y2="6" stroke={O} strokeWidth={0.4} opacity={0.2} />
      <line x1="16" y1="26" x2="10" y2="5" stroke={O} strokeWidth={0.4} opacity={0.2} />
      <line x1="16" y1="26" x2="16" y2="4" stroke={O} strokeWidth={0.4} opacity={0.2} />
      <line x1="16" y1="26" x2="22" y2="5" stroke={O} strokeWidth={0.4} opacity={0.2} />
      <line x1="16" y1="26" x2="26" y2="6" stroke={O} strokeWidth={0.4} opacity={0.2} />
      {/* Curved fold lines */}
      <path d="M5 12 Q16 15 27 12" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" fill="none" />
      <path d="M9 18 Q16 20 23 18" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" fill="none" />
    </svg>
  );
}

export function OctopusIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Head — round, distinct from jellyfish dome */}
      <circle cx="16" cy="11" r="7" fill="#fff" stroke={O} strokeWidth={W} />
      <path d="M16 4 A7 7 0 0 1 23 11 L16 11 Z" fill="#e8e0f0" stroke="none" />
      
      {/* Center fold */}
      <line x1="16" y1="4" x2="16" y2="18" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" />
      {/* Horizontal fold */}
      <path d="M9.5 9 Q16 12 22.5 9" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" fill="none" />
      {/* 8 tentacles — spreading outward radially */}
      <path d="M9.5 16 L5 20 L7 22" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      <path d="M11 17 L8 23 L10 25.5" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
      <path d="M13 17.5 L12 24 L13.5 27" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      <path d="M15 18 L14.5 25 L15.5 28" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
      <path d="M17 18 L17.5 25 L16.5 28" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
      <path d="M19 17.5 L20 24 L18.5 27" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      <path d="M21 17 L24 23 L22 25.5" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
      <path d="M22.5 16 L27 20 L25 22" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
    </svg>
  );
}

export function PenguinIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Body — side profile facing right */}
      <path d="M10 10 Q10 4 16 4 Q22 4 22 10 L23 22 Q23 27 17 28 Q11 28 10 22 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      {/* Tuxedo back */}
      <path d="M10 10 Q10 4 13 4.5 L13 26 Q11 27 10 22 Z" fill="#d0d0d0" stroke="none" />
      {/* Head cap */}
      <path d="M13 4.5 Q15 4 16 4 Q18 4 19 4.5 L19 7 L13 7 Z" fill="#d8d8d8" stroke="none" />
      {/* Eye */}
      <circle cx="18" cy="8.5" r="1" fill={O} opacity={0.7} />
      {/* Beak — pointing right */}
      <path d="M22 10 L26 11.5 L22 12.5" fill="#f0c860" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
      {/* Wing */}
      <path d="M11 14 L7 19.5 L9 21.5 L12 17" fill="#d0d0d0" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      {/* Feet */}
      <path d="M15 28 L14 30.5 L17 30 Z" fill="#f0c860" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
      <path d="M19 27.5 L18 30 L21 29.5 Z" fill="#f0c860" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
      {/* Fold crease */}
      <line x1="16" y1="4" x2="16" y2="28" stroke={O} strokeWidth={0.3} opacity={0.12} strokeDasharray="1 1" />
    </svg>
  );
}

export function SailorIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Ring at top */}
      <circle cx="16" cy="5.5" r="2.5" fill="none" stroke={O} strokeWidth={W} />
      <path d="M16 3 A2.5 2.5 0 0 1 18.5 5.5 L16 5.5 Z" fill="#f0ede8" stroke="none" />
      {/* Shank — vertical bar */}
      <path d="M15 8 L17 8 L17 25 L15 25 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M16 8 L17 8 L17 25 L16 25 Z" fill="#e8edf0" stroke="none" />
      {/* Flukes — curved arms at bottom, NO horizontal crossbar */}
      <path d="M15 25 Q7 25 6 17" stroke={O} strokeWidth={W} strokeLinecap="round" fill="none" />
      <path d="M17 25 Q25 25 26 17" stroke={O} strokeWidth={W} strokeLinecap="round" fill="none" />
      {/* Fluke arrow points */}
      <path d="M6 17 L4 18.5 L7 18.5" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M26 17 L28 18.5 L25 18.5" fill="#f0ede8" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      {/* Fold crease */}
      <line x1="16" y1="3" x2="16" y2="25" stroke={O} strokeWidth={0.3} opacity={0.1} strokeDasharray="1 1" />
    </svg>
  );
}

{/* === Multiplier / Formula icons: N / [mini icon] === */}

export function LighthouseIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* "1" top-left — larger */}
      <path d="M5 4 L8 3 L8 15 L5 15 Z" fill="#fff" stroke={O} strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M6.5 3.5 L8 3 L8 15 L6.5 15 Z" fill="#f0ede8" stroke="none" />
      {/* "/" separator */}
      <line x1="9" y1="26" x2="22" y2="4" stroke={O} strokeWidth={0.7} opacity={0.3} />
      {/* Mini boat — larger, bottom-right */}
      <path d="M20 16 L20 24 L27 24 Z" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M20 18 L20 24 L14 24 Z" fill="#f0ede8" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <line x1="20" y1="15" x2="20" y2="24" stroke={O} strokeWidth={0.5} />
      <path d="M13 24 L29 24 L27 28 L15 28 Z" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M20 24 L29 24 L27 28 L20 28 Z" fill="#e8edf0" stroke="none" />
    </svg>
  );
}

export function ShoalIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* "1" top-left — larger */}
      <path d="M5 4 L8 3 L8 15 L5 15 Z" fill="#fff" stroke={O} strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M6.5 3.5 L8 3 L8 15 L6.5 15 Z" fill="#f0ede8" stroke="none" />
      {/* "/" separator */}
      <line x1="9" y1="26" x2="22" y2="4" stroke={O} strokeWidth={0.7} opacity={0.3} />
      {/* Mini tropical fish — larger, bottom-right */}
      <path d="M15 22 L22 17 L29 22 L22 27 Z" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M22 17 L29 22 L22 22 Z" fill="#e4edf0" stroke="none" />
      <path d="M15 22 L12 19 L12 25 Z" fill="#fff" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
      <path d="M15 22 L12 19 L12 22 Z" fill="#f0ede8" stroke="none" />
      <circle cx="25.5" cy="21.5" r="0.8" fill={O} opacity={0.5} />
    </svg>
  );
}

export function ColonyIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* "2" top-left — larger, drawn as path strokes */}
      <path d="M4 5.5 Q4 3 7 3 Q10 3 10 5.5 Q10 8 5.5 10.5 L10 10.5" fill="none" stroke={O} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="12" x2="10" y2="12" stroke={O} strokeWidth={0.6} strokeLinecap="round" />
      <line x1="4" y1="10.5" x2="4" y2="12" stroke={O} strokeWidth={0.6} strokeLinecap="round" />
      <line x1="10" y1="10.5" x2="10" y2="12" stroke={O} strokeWidth={0.6} strokeLinecap="round" />
      {/* "/" separator */}
      <line x1="9" y1="26" x2="22" y2="4" stroke={O} strokeWidth={0.7} opacity={0.3} />
      {/* Mini penguin — side profile facing right, matching PenguinIcon */}
      <path d="M19 16 Q19 12 23 12 Q27 12 27 16 L27.5 24 Q27.5 27 24 27.5 Q20 27.5 19 24 Z" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M19 16 Q19 12 21 12.5 L21 26 Q20 27 19 24 Z" fill="#d0d0d0" stroke="none" />
      <path d="M21 12.5 Q22 12 23 12 Q24.5 12 25.5 13 L25.5 14.5 L21 14.5 Z" fill="#d8d8d8" stroke="none" />
      <circle cx="25" cy="15" r="0.7" fill={O} opacity={0.6} />
      <path d="M27 16 L29.5 17 L27 17.8" fill="#f0c860" stroke={O} strokeWidth={0.3} strokeLinejoin="round" />
      <path d="M20 19 L17.5 22.5 L19 24 L20.5 21" fill="#d0d0d0" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
    </svg>
  );
}

export function CaptainIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* "3" top-left — bold stroked arcs */}
      <path d="M5 3.5 L9 3.5 Q12 3.5 12 6 Q12 8 8.5 8" fill="none" stroke={O} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 8 Q12 8 12 10.5 Q12 13 9 13 L5 13" fill="none" stroke={O} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
      {/* "/" separator */}
      <line x1="9" y1="26" x2="22" y2="4" stroke={O} strokeWidth={0.7} opacity={0.3} />
      {/* Mini anchor (no crossbar) — larger, bottom-right */}
      <circle cx="23" cy="14.5" r="2" fill="none" stroke={O} strokeWidth={0.6} />
      <path d="M22 16.5 L24 16.5 L24 27 L22 27 Z" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      <path d="M23 16.5 L24 16.5 L24 27 L23 27 Z" fill="#e8edf0" stroke="none" />
      <path d="M22 27 Q16 27 15 21" stroke={O} strokeWidth={0.6} strokeLinecap="round" fill="none" />
      <path d="M24 27 Q30 27 31 21" stroke={O} strokeWidth={0.6} strokeLinecap="round" fill="none" />
      <path d="M15 21 L13.5 22.5 L16 22" stroke={O} strokeWidth={0.4} strokeLinejoin="round" fill="none" />
      <path d="M31 21 L32 22.5 L29.5 22" stroke={O} strokeWidth={0.4} strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function MermaidIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* "1" top-left — larger */}
      <path d="M5 4 L8 3 L8 15 L5 15 Z" fill="#fff" stroke={O} strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M6.5 3.5 L8 3 L8 15 L6.5 15 Z" fill="#f0ede8" stroke="none" />
      {/* "/" separator */}
      <line x1="9" y1="26" x2="22" y2="4" stroke={O} strokeWidth={0.7} opacity={0.3} />
      {/* Colorful Möbius ring — bottom-right, larger */}
      <circle cx="23" cy="21" r="6" fill="none" stroke={O} strokeWidth={0.3} opacity={0.15} />
      <path d="M23 15 A6 6 0 0 1 29 21" stroke="#e06060" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M29 21 A6 6 0 0 1 26 26.2" stroke="#e0a030" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M26 26.2 A6 6 0 0 1 20 26.2" stroke="#50b050" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M20 26.2 A6 6 0 0 1 17 21" stroke="#5080d0" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M17 21 A6 6 0 0 1 23 15" stroke="#9060c0" strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* "+" in center */}
      <line x1="23" y1="19" x2="23" y2="23" stroke={O} strokeWidth={0.8} strokeLinecap="round" opacity={0.5} />
      <line x1="21" y1="21" x2="25" y2="21" stroke={O} strokeWidth={0.8} strokeLinecap="round" opacity={0.5} />
    </svg>
  );
}

export function StarfishIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      <path
        d="M16 4 L18.5 12 L27 12 L20.5 17 L23 25 L16 20.5 L9 25 L11.5 17 L5 12 L13.5 12 Z"
        fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round"
      />
      <path
        d="M16 4 L18.5 12 L27 12 L20.5 17 L23 25 L16 20.5 L16 4 Z"
        fill="#f0e8e0" stroke="none"
      />
      <line x1="16" y1="4" x2="16" y2="20.5" stroke={O} strokeWidth={0.3} opacity={0.15} strokeDasharray="1 1" />
      <line x1="5" y1="12" x2="23" y2="25" stroke={O} strokeWidth={0.3} opacity={0.12} strokeDasharray="1 1" />
      <line x1="27" y1="12" x2="9" y2="25" stroke={O} strokeWidth={0.3} opacity={0.12} strokeDasharray="1 1" />
      <circle cx="16" cy="14.5" r="1" fill={O} opacity={0.15} />
      <circle cx="16" cy="9" r="0.4" fill={O} opacity={0.15} />
      <circle cx="12" cy="14" r="0.4" fill={O} opacity={0.15} />
      <circle cx="20" cy="14" r="0.4" fill={O} opacity={0.15} />
      <circle cx="13" cy="20" r="0.4" fill={O} opacity={0.15} />
      <circle cx="19" cy="20" r="0.4" fill={O} opacity={0.15} />
    </svg>
  );
}

export function SeahorseIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* Head */}
      <path d="M19 5 L22 7 L21 10 L18 9 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M21 6 L22 7 L21 10 L20 9 Z" fill="#e4edf0" stroke="none" />
      {/* Snout */}
      <path d="M22 7 L26 8 L23 9.5 Z" fill="#fff" stroke={O} strokeWidth={0.5} strokeLinejoin="round" />
      {/* Eye */}
      <circle cx="20" cy="7.5" r="0.8" fill={O} opacity={0.6} />
      {/* Crown/crest */}
      <path d="M18.5 5 L17 3 L19 4" stroke={O} strokeWidth={0.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      {/* Body — curved geometric shape */}
      <path d="M18 9 L21 10 L20 15 L19 19 L16 22 L13 21 L14 17 L16 12 Z" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M19 10 L20 15 L19 19 L17 21 L16 18 L17 13 Z" fill="#e4edf0" stroke="none" />
      {/* Dorsal fin */}
      <path d="M15 13 L12 11 L14 16" fill="#f0ede8" stroke={O} strokeWidth={0.5} strokeLinejoin="round" opacity={0.6} />
      {/* Curled tail */}
      <path d="M16 22 L18 25 Q19 28 16 28 Q13 27 14 24" fill="#fff" stroke={O} strokeWidth={W} strokeLinejoin="round" />
      <path d="M17 24 Q19 28 16 28 Q14 27 15 25 Z" fill="#e4edf0" stroke="none" />
      {/* Belly segment folds */}
      <line x1="14.5" y1="14" x2="19.5" y2="13" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" />
      <line x1="14" y1="17" x2="19" y2="16.5" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" />
      <line x1="14.5" y1="20" x2="18" y2="19.5" stroke={O} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 1" />
      {/* Center fold crease */}
      <line x1="19" y1="5" x2="15" y2="26" stroke={O} strokeWidth={0.3} opacity={0.12} strokeDasharray="1 1" />
    </svg>
  );
}

export function CrabArmyIcon({ className }: IconProps) {
  return (
    <svg viewBox={V} className={className} fill="none">
      {/* "1" top-left — larger */}
      <path d="M5 4 L8 3 L8 15 L5 15 Z" fill="#fff" stroke={O} strokeWidth={0.6} strokeLinejoin="round" />
      <path d="M6.5 3.5 L8 3 L8 15 L6.5 15 Z" fill="#f0ede8" stroke="none" />
      {/* "/" separator */}
      <line x1="9" y1="26" x2="22" y2="4" stroke={O} strokeWidth={0.7} opacity={0.3} />
      {/* Mini crab — bottom-right, larger */}
      <ellipse cx="23" cy="22" rx="5" ry="3.5" fill="#fff" stroke={O} strokeWidth={0.5} />
      <ellipse cx="25.5" cy="22" rx="3" ry="3.5" fill="#f0e8e4" stroke="none" />
      {/* Mini claws */}
      <path d="M18 22 L15 19 L13 20.5 L16 22 Z" fill="#fff" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
      <path d="M15 19 L13 17.5 L13 20.5 Z" fill="#f0e8e4" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
      <path d="M28 22 L31 19 L32 20.5 L29 22 Z" fill="#fff" stroke={O} strokeWidth={0.4} strokeLinejoin="round" />
      {/* Mini eyes */}
      <line x1="21" y1="18.5" x2="20" y2="16.5" stroke={O} strokeWidth={0.4} strokeLinecap="round" />
      <circle cx="20" cy="16" r="0.7" fill={O} opacity={0.5} />
      <line x1="25" y1="18.5" x2="26" y2="16.5" stroke={O} strokeWidth={0.4} strokeLinecap="round" />
      <circle cx="26" cy="16" r="0.7" fill={O} opacity={0.5} />
      {/* Mini legs */}
      <line x1="20" y1="24.5" x2="18" y2="27" stroke={O} strokeWidth={0.3} opacity={0.4} strokeLinecap="round" />
      <line x1="22" y1="25" x2="21" y2="27.5" stroke={O} strokeWidth={0.3} opacity={0.4} strokeLinecap="round" />
      <line x1="24" y1="25" x2="25" y2="27.5" stroke={O} strokeWidth={0.3} opacity={0.4} strokeLinecap="round" />
      <line x1="26" y1="24.5" x2="28" y2="27" stroke={O} strokeWidth={0.3} opacity={0.4} strokeLinecap="round" />
    </svg>
  );
}
