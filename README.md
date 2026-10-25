This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Driver Registration

Driver applications and server-side order creation use Firebase Admin credentials. Set these server-only variables in `.env.local` and in your deployment environment:

- `DRIVER_REGISTRATION_CODE`: the code shared with drivers.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: the Firebase service-account JSON as a single-line JSON value. Create a service account with Firestore access in Firebase Console. Never commit its private key.

Applications are saved with `pending` status. Sign in as an admin and open **Driver management** to review applications, activate drivers, or add drivers manually.

## Checkout Payments

Checkout keeps the customer-facing total in MAD. PayPal orders are converted to USD on the server using the current MAD/USD rate from ExchangeRate-API; the rate and USD amount are stored with the order. The rate provider is external, so PayPal amounts can vary with the rate at the time checkout starts.

Add these server-only variables to `.env.local` and your deployment environment to enable PayPal:

- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`: credentials from your PayPal developer app.
- `PAYPAL_ENV`: use `sandbox` for testing or `live` for real payments.
- `APP_URL`: the public base URL used for PayPal return callbacks, such as `http://localhost:3000` locally.

The Firebase service account must also be configured. Start in PayPal sandbox and test approval, cancellation, and capture before switching to live credentials. Your PayPal account must be able to receive payments in USD or be configured to convert them.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
