export const STREAMING_PLATFORMS = {
  NETFLIX: 'netflix',
  PRIME_VIDEO: 'prime_video',
  DISNEY_PLUS: 'disney_plus',
  HBO_MAX: 'hbo_max',
  APPLE_TV: 'apple_tv',
  PARAMOUNT_PLUS: 'paramount_plus',
  HULU: 'hulu',
  PEACOCK: 'peacock',
  CRUNCHYROLL: 'crunchyroll',
  FILMIN: 'filmin',
  MOVISTAR_PLUS: 'movistar_plus',
} as const;

export type StreamingPlatform =
  (typeof STREAMING_PLATFORMS)[keyof typeof STREAMING_PLATFORMS];

export const STREAMING_PLATFORM_LIST = Object.values(STREAMING_PLATFORMS);

// Labels lisibles pour l'interface utilisateur
export const STREAMING_PLATFORM_LABELS = {
  [STREAMING_PLATFORMS.NETFLIX]: 'Netflix',
  [STREAMING_PLATFORMS.PRIME_VIDEO]: 'Prime Video',
  [STREAMING_PLATFORMS.DISNEY_PLUS]: 'Disney+',
  [STREAMING_PLATFORMS.HBO_MAX]: 'HBO Max',
  [STREAMING_PLATFORMS.APPLE_TV]: 'Apple TV+',
  [STREAMING_PLATFORMS.PARAMOUNT_PLUS]: 'Paramount+',
  [STREAMING_PLATFORMS.HULU]: 'Hulu',
  [STREAMING_PLATFORMS.PEACOCK]: 'Peacock',
  [STREAMING_PLATFORMS.CRUNCHYROLL]: 'Crunchyroll',
  [STREAMING_PLATFORMS.FILMIN]: 'Filmin',
  [STREAMING_PLATFORMS.MOVISTAR_PLUS]: 'Movistar+',
} as const;
