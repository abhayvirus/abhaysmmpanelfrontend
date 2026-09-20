/** Legal copy for ABHAYSMM PANEL — professional, no unsupported claims */

import { BRAND } from '../config/brand';

const updated = '20 September 2026';

export const LEGAL_PAGES = {
  terms: {
    path: '/terms',
    title: 'Terms & Conditions',
    updated,
    sections: [
      {
        heading: '1. Agreement',
        body: `By accessing or using ${BRAND.name} (${BRAND.domain.replace('https://', '')}), you agree to these Terms & Conditions. If you do not agree, please do not use the service.`,
      },
      {
        heading: '2. Service description',
        body: `${BRAND.name} is an online social media marketing (SMM) panel that lets registered users add wallet funds and place orders for digital marketing services offered on the platform. Service availability, rates, and delivery times may change based on providers and demand.`,
      },
      {
        heading: '3. Accounts',
        body: 'You must provide accurate registration information and keep your login credentials secure. You are responsible for activity under your account. We may suspend or restrict accounts that abuse the platform, attempt fraud, or violate these terms.',
      },
      {
        heading: '4. Wallet and payments',
        body: 'Orders are paid from your panel wallet. Funds are added through third-party payment gateways (such as Razorpay). You agree to use only payment methods you are authorized to use. Wallet credits are for purchasing services on this panel and are subject to our Refund Policy.',
      },
      {
        heading: '5. Orders',
        body: 'You are responsible for providing correct links, quantities, and other order details. Once an order is submitted to a provider, cancellation or modification may not be possible. Status updates are shown in My Orders and reflect provider progress where available.',
      },
      {
        heading: '6. Acceptable use',
        body: 'You must not use the panel for illegal activity, abuse of third-party platforms in violation of their rules where applicable, scraping, attacking our systems, or reselling access in a way that harms other users. We may refuse service at our discretion when abuse is detected.',
      },
      {
        heading: '7. Availability',
        body: 'We aim for reliable uptime but do not guarantee uninterrupted access. Maintenance, provider outages, or payment-gateway issues may temporarily affect features.',
      },
      {
        heading: '8. Contact',
        body: `Questions about these terms: ${BRAND.supportEmail}. ${BRAND.name} is a product by ${BRAND.company.name} (${BRAND.company.url}).`,
      },
    ],
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy',
    updated,
    sections: [
      {
        heading: '1. Overview',
        body: `This Privacy Policy explains how ${BRAND.name} collects and uses information when you use our website and panel.`,
      },
      {
        heading: '2. Information we collect',
        body: 'We may collect account details (such as name, email), login and security data, order and wallet transaction records, support messages, and technical logs (IP address, device/browser type) needed to operate and secure the service.',
      },
      {
        heading: '3. How we use information',
        body: 'We use data to provide the panel, process payments via payment partners, fulfill orders, provide support, prevent fraud, and improve reliability. We do not sell your personal information.',
      },
      {
        heading: '4. Payments',
        body: 'Card, UPI, and similar payment details are handled by Razorpay (or other configured gateways). We do not store your full card number or UPI PIN on our servers.',
      },
      {
        heading: '5. Sharing',
        body: 'We may share necessary data with payment processors, SMM service providers (to fulfill orders), hosting/infrastructure vendors, and when required by law. Third parties process data under their own policies where applicable.',
      },
      {
        heading: '6. Retention and security',
        body: 'We retain account and transaction records as needed for operations, support, and legal obligations. We use reasonable technical and organizational measures to protect data, but no online system is completely risk-free.',
      },
      {
        heading: '7. Your choices',
        body: `You may update profile information after login or contact ${BRAND.supportEmail} for account-related privacy requests. Some data must be kept for billing or security reasons.`,
      },
      {
        heading: '8. Contact',
        body: `Privacy questions: ${BRAND.supportEmail}.`,
      },
    ],
  },
  refund: {
    path: '/refund-policy',
    title: 'Refund Policy',
    updated,
    sections: [
      {
        heading: '1. Wallet top-ups',
        body: 'Successful wallet recharges are generally non-refundable once credited, because funds become available for immediate use on the panel. If a payment was charged but the wallet was not credited, contact support with your payment ID so we can investigate with the payment gateway.',
      },
      {
        heading: '2. Orders',
        body: 'Order pricing is deducted from your wallet when an order is placed. Refunds or partial credits (if any) depend on order status and provider outcome—for example, cancelled or failed orders may be eligible for wallet credit according to panel rules. Completed deliveries are typically not refundable.',
      },
      {
        heading: '3. How to request help',
        body: `Open a support ticket after login or email ${BRAND.supportEmail} with your registered email, order or payment ID, amount, and a short description. We will review gateway and order records before responding.`,
      },
      {
        heading: '4. Chargebacks',
        body: 'Unwarranted payment disputes may result in account review or suspension. Contact us first so we can resolve credited or pending payments quickly.',
      },
    ],
  },
  disclaimer: {
    path: '/disclaimer',
    title: 'Disclaimer',
    updated,
    sections: [
      {
        heading: '1. General',
        body: `${BRAND.name} provides an SMM panel on an “as available” basis. Information on the site is for general guidance and may change without notice.`,
      },
      {
        heading: '2. Results',
        body: 'We do not guarantee specific growth outcomes, ranking changes, or engagement metrics. Results depend on the service selected, target account conditions, platform algorithms, and third-party providers.',
      },
      {
        heading: '3. Third-party platforms',
        body: 'Social networks and payment providers are independent services. Their terms, policies, and technical changes may affect delivery. We are not affiliated with Instagram, YouTube, Facebook, TikTok, Telegram, or similar platforms unless explicitly stated.',
      },
      {
        heading: '4. Limitation',
        body: 'To the fullest extent permitted by applicable law, we are not liable for indirect or consequential losses arising from use of the panel, provider delays, or platform-side removals. Our responsibility related to wallet or orders is limited as described in the Terms and Refund Policy.',
      },
      {
        heading: '5. Contact',
        body: `${BRAND.supportEmail} · ${BRAND.company.name} · ${BRAND.company.url}`,
      },
    ],
  },
};
