export const emailConfig = {
  from: process.env.FROM_EMAIL!,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Arcadia Hub',
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
} as const;
