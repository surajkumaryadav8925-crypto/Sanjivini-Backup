// Single runtime flag separating the demo showcase from production mode.
// Client bundle inlines NEXT_PUBLIC_APP_MODE at build time.
export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
