export type LegalDocumentId = 'privacy-policy' | 'terms-and-conditions';

export interface LegalSection {
  title: string;
  body: string[];
}

export interface LegalDocument {
  id: LegalDocumentId;
  title: string;
  summary: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'How TourPass uses account, trip, and location information.',
    lastUpdated: 'April 15, 2026',
    sections: [
      {
        title: 'Overview',
        body: [
          'TourPass provides map search, route creation, walking navigation, and profile features. This Privacy Policy explains what information we collect, how we use it, and the choices you have when using the app.',
          'By using TourPass, you agree to the data practices described in this policy.',
        ],
      },
      {
        title: 'Information We Collect',
        body: [
          'We may collect account information you provide directly, such as your name, email address, authentication details, support messages, and profile information.',
          'We may also collect app activity information related to the features you use, including saved routes, route requests, map searches, payment-related status data, and device or diagnostic information needed to operate and improve the service.',
        ],
      },
      {
        title: 'Location Services',
        body: [
          'TourPass uses location services to show your position on the map, help create routes, support navigation, and improve the accuracy of route guidance.',
          'Location access is requested from your device operating system. You can deny or revoke location permission in your device settings, but some map, search, and navigation features may no longer work correctly.',
        ],
      },
      {
        title: 'Mapbox and Routing Telemetry',
        body: [
          'TourPass uses Mapbox services for map display, search, place retrieval, and routing. When you use those features, relevant search terms, coordinates, route requests, and related technical data may be processed by Mapbox to deliver results.',
          'Mapbox may also collect telemetry or diagnostic information associated with routing and navigation features. That collection is governed by Mapbox terms and privacy practices in addition to this policy.',
        ],
      },
      {
        title: 'How We Use Information',
        body: [
          'We use collected information to authenticate users, provide maps and navigation, save preferences, process account actions, respond to support requests, maintain security, and improve TourPass functionality.',
          'We may also use aggregated or de-identified information to understand usage trends and app performance.',
        ],
      },
      {
        title: 'Sharing',
        body: [
          'We may share information with service providers that help us operate TourPass, including infrastructure, authentication, mapping, routing, analytics, payment, and customer support providers.',
          'We may also disclose information when required by law, to protect our rights, or in connection with a business transfer such as a merger, acquisition, or asset sale.',
        ],
      },
      {
        title: 'Retention and Security',
        body: [
          'We retain information for as long as reasonably necessary to provide the service, meet legal obligations, resolve disputes, and enforce agreements.',
          'We use reasonable administrative, technical, and organizational measures to protect information, but no system can guarantee absolute security.',
        ],
      },
      {
        title: 'Your Choices',
        body: [
          'You can review and update certain profile information inside the app, sign out of your account, and request deletion of your account where that option is available.',
          'You can also control permissions such as location services through your device settings.',
        ],
      },
      {
        title: 'Contact',
        body: [
          'Questions about this Privacy Policy can be directed to TourPass support through the Help Center in the app.',
        ],
      },
    ],
  },
  'terms-and-conditions': {
    id: 'terms-and-conditions',
    title: 'Terms & Conditions',
    summary: 'Rules and responsibilities for using TourPass.',
    lastUpdated: 'April 15, 2026',
    sections: [
      {
        title: 'Acceptance of Terms',
        body: [
          'These Terms & Conditions govern your use of TourPass. By creating an account, accessing the app, or using TourPass features, you agree to these terms.',
          'If you do not agree, do not use the app.',
        ],
      },
      {
        title: 'Eligibility and Accounts',
        body: [
          'You are responsible for maintaining accurate account information and for protecting access to your account credentials.',
          'You are also responsible for activity that occurs under your account unless prohibited by law.',
        ],
      },
      {
        title: 'Use of the Service',
        body: [
          'TourPass is provided for personal and lawful use. You agree not to misuse the app, interfere with the service, attempt unauthorized access, or use TourPass in a way that violates applicable law or the rights of others.',
          'Routes, place information, and guide content may change over time and may not always be complete, accurate, or available.',
        ],
      },
      {
        title: 'Navigation and Location Disclaimer',
        body: [
          'TourPass may provide map, route, and walking navigation features, but you remain responsible for your surroundings, personal safety, and compliance with posted signs, traffic rules, private property restrictions, and local laws.',
          'Do not rely on TourPass as the sole source of navigation or safety information. Always use your judgment when traveling.',
        ],
      },
      {
        title: 'Third-Party Services',
        body: [
          'Some TourPass features rely on third-party services, including Mapbox for mapping, search, and routing. Your use of those features may also be subject to third-party terms, policies, and service availability.',
          'We are not responsible for third-party services beyond the obligations imposed by applicable law.',
        ],
      },
      {
        title: 'Guide Billing',
        body: [
          'Approved guides may be billed monthly to stay on TourPass as a guide, create routes, and receive paid requests from users.',
          'Guide pricing and billing terms are shown at purchase. Fees are generally non-refundable except where required by law or platform rules.',
        ],
      },
      {
        title: 'Termination',
        body: [
          'We may suspend or terminate access to TourPass if you violate these terms, misuse the service, or create risk for TourPass, its users, or partners.',
          'You may stop using the app at any time and may request account deletion through available account tools.',
        ],
      },
      {
        title: 'Limitation of Liability',
        body: [
          'To the maximum extent permitted by law, TourPass is provided on an as-is and as-available basis without warranties of any kind.',
          'To the maximum extent permitted by law, TourPass and its operators will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from your use of the app.',
        ],
      },
      {
        title: 'Changes to These Terms',
        body: [
          'We may update these Terms & Conditions from time to time. Continued use of TourPass after updates take effect means you accept the revised terms.',
        ],
      },
    ],
  },
};

export const LEGAL_DOCUMENT_ORDER: LegalDocumentId[] = [
  'privacy-policy',
  'terms-and-conditions',
];

export function isLegalDocumentId(value: string): value is LegalDocumentId {
  return value in LEGAL_DOCUMENTS;
}
