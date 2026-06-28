export const ANIMATIONS = {
  fadeIn: 'motion-safe:animate-fadeIn',
  slideUp: 'motion-safe:animate-slideUp',
  scaleIn: 'motion-safe:animate-scaleIn',
  scaleOut: 'motion-safe:animate-scaleOut',
  shimmer: 'animate-shimmer',
} as const;

export const TRANSITIONS = {
  default: 'transition-all duration-200 ease-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-300 ease-out',
  hover: 'transition-all duration-200 ease-out',
  modal: 'transition-all duration-200 ease-out',
} as const;

export const HOVER = {
  lift: 'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200',
  fade: 'hover:opacity-80 transition-opacity duration-150',
  bg: 'hover:bg-gray-50 transition-colors duration-150',
  sidebar: 'hover:bg-gray-800 hover:text-gray-200 transition-colors duration-150',
};
