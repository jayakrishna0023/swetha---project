/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// AgriSphere icon set: hand-drawn on a 24px grid, 1.6px rounded strokes,
// with a harvest-gold "seed" accent as the family signature.
import React from "react";

export interface IconProps {
  className?: string;
  /** Draw the strokes in when the icon mounts */
  animate?: boolean;
  /** Hide the gold accent (e.g. on dark or monochrome backgrounds) */
  mono?: boolean;
  title?: string;
}

const ACCENT = "var(--icon-accent, #c8901a)";

function makeIcon(render: (accent: string) => React.ReactNode) {
  return function Icon({ className = "w-5 h-5", animate = false, mono = false, title }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`icon-draw ${animate ? "animate" : ""} shrink-0 ${className}`}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
      >
        {render(mono ? "currentColor" : ACCENT)}
      </svg>
    );
  };
}

// Brand mark: a globe of furrowed field with a sprout breaking through
export const LogoMark = makeIcon((a) => (
  <>
    <path pathLength={1} d="M3.5 13.2a8.5 8.5 0 0 0 17 0" />
    <path pathLength={1} d="M5.2 16.6c4.2-1.6 9.4-1.6 13.6 0" />
    <path pathLength={1} d="M8 19.6c2.6-.8 5.4-.8 8 0" />
    <path pathLength={1} d="M12 13V6.5" />
    <path pathLength={1} d="M12 9.2c0-2.6 1.8-4.4 4.6-4.6-.1 2.8-1.9 4.6-4.6 4.6Z" fill={a} stroke={a} />
    <path pathLength={1} d="M12 10.6c0-2-1.5-3.5-3.7-3.6 0 2.1 1.5 3.6 3.7 3.6Z" />
  </>
));

export const DashboardIcon = makeIcon((a) => (
  <>
    <rect pathLength={1} x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path pathLength={1} d="M12 3.5v17M3.5 12h17" />
    <rect x="13.6" y="5.1" width="5.3" height="5.3" rx="1.2" fill={a} stroke="none" opacity="0.9" />
  </>
));

export const PlotsIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M4 8.5 10 5l10 3.5-2 10.5-12.5-1.5Z" />
    <path pathLength={1} d="M7.5 12.5c3-1 6.5-1 10 .5M6.6 15.2c3.4-.8 7-.6 10.6.6" opacity="0.55" />
    <circle cx="10" cy="5" r="1.7" fill={a} stroke="none" />
    <circle cx="20" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
  </>
));

export const CalendarIcon = makeIcon((a) => (
  <>
    <rect pathLength={1} x="3.5" y="5" width="17" height="15.5" rx="2.6" />
    <path pathLength={1} d="M3.5 9.5h17M8 3v3.6M16 3v3.6" />
    <path pathLength={1} d="M12 18v-4.2" />
    <path pathLength={1} d="M12 15.2c0-1.6 1.1-2.7 2.8-2.8 0 1.7-1.1 2.8-2.8 2.8Z" fill={a} stroke={a} />
    <path pathLength={1} d="M12 16c0-1.3-.9-2.2-2.3-2.3 0 1.4.9 2.3 2.3 2.3Z" />
  </>
));

export const LedgerIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M6 3.5h11.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 6 3.5Z" />
    <path pathLength={1} d="M8 3.5v17" opacity="0.55" />
    <path pathLength={1} d="M11.2 8.2h5M11.2 10.6h5M12.4 8.2c2.2 0 2.2 2.4 0 2.4h-1.2l4 4.4" />
    <circle cx="16.8" cy="17.2" r="1.5" fill={a} stroke="none" />
  </>
));

export const WeatherIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M7 14a5 5 0 0 1 10 0" />
    <path pathLength={1} d="M12 4.5v2M5.3 7.3l1.4 1.4M18.7 7.3l-1.4 1.4M3 14h1.8M19.2 14H21" />
    <path pathLength={1} d="M4 17.5c5.3-1.4 10.7-1.4 16 0M6.5 20.5c3.7-.9 7.3-.9 11 0" />
    <circle cx="12" cy="14" r="1.6" fill={a} stroke="none" />
  </>
));

export const AdvisorIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M5 19c0-8 5-13 14-14-.5 9-5.6 14-14 14Z" />
    <path pathLength={1} d="M5 19 13 11" />
    <path d="M17.5 14.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z" fill={a} stroke={a} strokeWidth={1} />
  </>
));

export const ScannerIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16" />
    <path pathLength={1} d="M8 16c0-4.6 2.8-7.6 8-8-.3 5.2-3.3 8-8 8Z" />
    <path pathLength={1} d="M8 16l4.5-4.5" />
    <path pathLength={1} d="M3.5 12h17" stroke={a} strokeDasharray="1.5 2" opacity="0.9" />
  </>
));

export const AssistantIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M4 6.5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6.5L6 20.5v-4H7a3 3 0 0 1-3-3Z" />
    <path pathLength={1} d="M12 13.4V9.6" />
    <path pathLength={1} d="M12 11c0-1.6 1.1-2.7 2.7-2.8 0 1.7-1.1 2.8-2.7 2.8Z" fill={a} stroke={a} />
    <path pathLength={1} d="M12 11.8c0-1.3-.9-2.2-2.2-2.3 0 1.4.9 2.3 2.2 2.3Z" />
  </>
));

export const MarketIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M3.5 9 5.2 4h13.6l1.7 5" />
    <path pathLength={1} d="M3.5 9a2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 4.3 0 2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 4.3 0" />
    <path pathLength={1} d="M5 11v9.5h14V11" />
    <rect pathLength={1} x="8.5" y="14" width="7" height="6.5" rx="1" />
    <circle cx="12" cy="14" r="1.6" fill={a} stroke="none" />
  </>
));

export const DiscussIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M3.5 6a2.5 2.5 0 0 1 2.5-2.5h7.5A2.5 2.5 0 0 1 16 6v4.5a2.5 2.5 0 0 1-2.5 2.5H8l-3.5 3v-3a2.5 2.5 0 0 1-1-2Z" />
    <path pathLength={1} d="M18.5 8.5a2 2 0 0 1 2 2v4a2 2 0 0 1-1 1.7v3l-3.2-2.7H12a2 2 0 0 1-2-2" />
    <circle cx="7.5" cy="8.2" r="1" fill={a} stroke="none" />
    <circle cx="11" cy="8.2" r="1" fill="currentColor" stroke="none" opacity="0.6" />
  </>
));

export const LearnIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M12 7.5C10 5.8 7 5.2 3.5 5.5v13c3.5-.3 6.5.3 8.5 2 2-1.7 5-2.3 8.5-2v-13c-3.5-.3-6.5.3-8.5 2Z" />
    <path pathLength={1} d="M12 7.5v13" />
    <path pathLength={1} d="M16.3 3.2c0 1.6-1.2 2.8-2.8 2.8 0-1.6 1.2-2.8 2.8-2.8Z" fill={a} stroke={a} />
  </>
));

export const DocsIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10Z" />
    <path pathLength={1} d="M14 3.5V8.5h5" />
    <path pathLength={1} d="M8.5 12.5h7M8.5 15.5h4.5" />
    <circle cx="15.8" cy="15.5" r="1.3" fill={a} stroke="none" />
  </>
));

export const BellIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z" />
    <path pathLength={1} d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    <circle cx="12" cy="3.6" r="1.2" fill={a} stroke="none" />
  </>
));

export const SearchIcon = makeIcon(() => (
  <>
    <circle pathLength={1} cx="10.5" cy="10.5" r="6.5" />
    <path pathLength={1} d="m15.5 15.5 5 5" />
  </>
));

export const SettingsIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    <circle pathLength={1} cx="12" cy="12" r="4.2" />
    <circle cx="12" cy="12" r="1.5" fill={a} stroke="none" />
  </>
));

export const SignOutIcon = makeIcon(() => (
  <>
    <path pathLength={1} d="M14 4.5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7" />
    <path pathLength={1} d="M10.5 12h10M17 8.5l3.5 3.5-3.5 3.5" />
  </>
));

export const SeedIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M12 20.5c-4 0-6.5-3-6.5-7C5.5 8.5 9 4.5 12 3.5c3 1 6.5 5 6.5 10 0 4-2.5 7-6.5 7Z" />
    <path pathLength={1} d="M12 20.5V9" />
    <circle cx="12" cy="7.2" r="1.4" fill={a} stroke="none" />
  </>
));

export const RainIcon = makeIcon((a) => (
  <>
    <path pathLength={1} d="M7 15.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.6 1.3A3.4 3.4 0 0 1 17 15.5Z" />
    <path pathLength={1} d="M8.5 18.5 8 20.5M12.5 18.5l-.5 2" />
    <path d="M16.5 18.2c.6.8.9 1.3.9 1.7a.9.9 0 0 1-1.8 0c0-.4.3-.9.9-1.7Z" fill={a} stroke={a} strokeWidth={1} />
  </>
));

export const TractorIcon = makeIcon((a) => (
  <>
    <circle pathLength={1} cx="7.5" cy="16" r="4" />
    <circle pathLength={1} cx="18" cy="17.5" r="2.5" />
    <path pathLength={1} d="M5 12V6.5h6l2 5.5h5.5a2 2 0 0 1 2 2V15" />
    <path pathLength={1} d="M11.5 16H15.5M14 6.5V12" />
    <circle cx="7.5" cy="16" r="1.4" fill={a} stroke="none" />
  </>
));

export const ArrowIcon = makeIcon(() => <path pathLength={1} d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5" />);

export const PlusIcon = makeIcon(() => <path pathLength={1} d="M12 5v14M5 12h14" />);
