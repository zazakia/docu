/**
 * High-fidelity generated sample document images (rendered via high-res SVG data URIs)
 * allowing users to test the AI document scanner and handwritten OCR instantly.
 */

export interface SampleDoc {
  id: string;
  title: string;
  subtitle: string;
  type: 'handwritten' | 'id_card' | 'business_form';
  description: string;
  getDataUrl: () => string;
}

/**
 * Rasterizes an SVG string or data URL onto a canvas to produce a real image/png base64 Data URL.
 */
export function rasterizeSvgToPngDataUrl(
  svgDataUriOrString: string,
  width = 1000,
  height = 1350
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(svgDataUriOrString);
      return;
    }

    let src = svgDataUriOrString;
    if (svgDataUriOrString.startsWith('<svg') || !svgDataUriOrString.startsWith('data:')) {
      src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgDataUriOrString)));
    } else if (svgDataUriOrString.startsWith('data:image/svg+xml') && !svgDataUriOrString.includes(';base64,')) {
      try {
        const commaIdx = svgDataUriOrString.indexOf(',');
        const content = decodeURIComponent(svgDataUriOrString.substring(commaIdx + 1));
        src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(content)));
      } catch {
        src = svgDataUriOrString;
      }
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      resolve(src);
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || width;
        canvas.height = img.naturalHeight || height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png', 0.95);
          resolve(pngUrl);
          return;
        }
      } catch (e) {
        console.warn('Canvas rasterization error:', e);
      }
      resolve(src);
    };

    img.onerror = (e) => {
      clearTimeout(timer);
      console.warn('Image load error during rasterization:', e);
      resolve(src);
    };

    img.src = src;
  });
}

// Generate high-resolution SVG data URI for a handwritten customer intake sheet
function generateHandwrittenIntakeSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200" style="background:#fcfbf7; font-family:sans-serif;">
    <!-- Paper texture & borders -->
    <rect width="900" height="1200" fill="#fcfaf2"/>
    <!-- Subtle graph / lined grid -->
    <defs>
      <pattern id="lines" width="100" height="32" patternUnits="userSpaceOnUse">
        <line x1="0" y1="31" x2="100" y2="31" stroke="#e8e4d8" stroke-width="1"/>
      </pattern>
    </defs>
    <rect x="50" y="80" width="800" height="1060" fill="url(#lines)"/>
    <rect x="40" y="40" width="820" height="1120" fill="none" stroke="#d5cfbe" stroke-width="1.5"/>

    <!-- Form Header -->
    <text x="70" y="100" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="bold" fill="#1e293b">CUSTOMER REGISTRATION &amp; INTAKE FORM</text>
    <text x="70" y="125" font-family="sans-serif" font-size="12" fill="#64748b">Please print clearly. All personal data is held in strict compliance with privacy standards.</text>
    <line x1="70" y1="145" x2="830" y2="145" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Section 1: Personal Identification -->
    <rect x="70" y="165" width="760" height="30" fill="#e2e8f0" rx="3"/>
    <text x="85" y="186" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">SECTION A: PERSONAL IDENTIFICATION</text>

    <!-- Full Name -->
    <text x="80" y="230" font-size="12" font-weight="bold" fill="#475569">FULL LEGAL NAME:</text>
    <line x1="220" y1="234" x2="820" y2="234" stroke="#94a3b8" stroke-width="1.2"/>
    <!-- Simulated handwritten text -->
    <text x="235" y="228" font-family="'Caveat', 'Brush Script MT', cursive, sans-serif" font-size="28" fill="#1e3a8a" font-style="italic">Marcus Aurelius Vance</text>

    <!-- Date of Birth & ID Type -->
    <text x="80" y="280" font-size="12" font-weight="bold" fill="#475569">DATE OF BIRTH (YYYY-MM-DD):</text>
    <line x1="290" y1="284" x2="480" y2="284" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="300" y="278" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#1e3a8a" font-style="italic">1988-04-12</text>

    <text x="510" y="280" font-size="12" font-weight="bold" fill="#475569">ID TYPE / DOC:</text>
    <line x1="620" y1="284" x2="820" y2="284" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="630" y="278" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#1e3a8a" font-style="italic">Driver License (WA)</text>

    <!-- ID Number -->
    <text x="80" y="330" font-size="12" font-weight="bold" fill="#475569">GOVT / LICENSE ID NUMBER:</text>
    <line x1="290" y1="334" x2="820" y2="334" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="305" y="328" font-family="'Caveat', cursive, sans-serif" font-size="27" fill="#1e3a8a" font-style="italic">WDL-84920491-B</text>

    <!-- Section 2: Contact Details -->
    <rect x="70" y="380" width="760" height="30" fill="#e2e8f0" rx="3"/>
    <text x="85" y="401" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">SECTION B: CONTACT &amp; LOCATION</text>

    <!-- Email Address -->
    <text x="80" y="450" font-size="12" font-weight="bold" fill="#475569">EMAIL ADDRESS:</text>
    <line x1="210" y1="454" x2="820" y2="454" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="225" y="448" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#1e3a8a" font-style="italic">marcus.vance@apexcloud.io</text>

    <!-- Phone Number -->
    <text x="80" y="500" font-size="12" font-weight="bold" fill="#475569">PRIMARY PHONE NUMBER:</text>
    <line x1="260" y1="504" x2="820" y2="504" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="275" y="498" font-family="'Caveat', cursive, sans-serif" font-size="27" fill="#1e3a8a" font-style="italic">+1 (206) 555-0182</text>

    <!-- Street Address -->
    <text x="80" y="550" font-size="12" font-weight="bold" fill="#475569">STREET ADDRESS:</text>
    <line x1="220" y1="554" x2="820" y2="554" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="235" y="548" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#1e3a8a" font-style="italic">742 Evergreen Terrace, Suite 300</text>

    <!-- City, State, ZIP -->
    <text x="80" y="600" font-size="12" font-weight="bold" fill="#475569">CITY:</text>
    <line x1="130" y1="604" x2="380" y2="604" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="145" y="598" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#1e3a8a" font-style="italic">Seattle</text>

    <text x="400" y="600" font-size="12" font-weight="bold" fill="#475569">STATE:</text>
    <line x1="460" y1="604" x2="570" y2="604" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="480" y="598" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#1e3a8a" font-style="italic">WA</text>

    <text x="590" y="600" font-size="12" font-weight="bold" fill="#475569">POSTAL CODE:</text>
    <line x1="700" y1="604" x2="820" y2="604" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="715" y="598" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#1e3a8a" font-style="italic">98101</text>

    <!-- Section C: Preferences & Handwritten Notes -->
    <rect x="70" y="650" width="760" height="30" fill="#e2e8f0" rx="3"/>
    <text x="85" y="671" font-family="sans-serif" font-size="13" font-weight="bold" fill="#334155">SECTION C: INTAKE NOTES &amp; SPECIAL REQUIREMENTS</text>

    <text x="80" y="710" font-size="12" font-weight="bold" fill="#475569">REMARKS &amp; PREFERENCES:</text>
    <line x1="80" y1="745" x2="820" y2="745" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="80" y1="785" x2="820" y2="785" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="80" y1="825" x2="820" y2="825" stroke="#cbd5e1" stroke-width="1"/>

    <text x="85" y="740" font-family="'Caveat', cursive, sans-serif" font-size="25" fill="#1e3a8a" font-style="italic">Client requested monthly consolidated billing via corporate account.</text>
    <text x="85" y="780" font-family="'Caveat', cursive, sans-serif" font-size="25" fill="#1e3a8a" font-style="italic">Preferred contact method: text messages for delivery alerts, email for invoices.</text>
    <text x="85" y="820" font-family="'Caveat', cursive, sans-serif" font-size="25" fill="#1e3a8a" font-style="italic">Assigned VIP account manager per regional contract agreement.</text>

    <!-- Signature Block -->
    <rect x="70" y="880" width="760" height="150" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
    <text x="90" y="910" font-size="11" font-weight="bold" fill="#64748b">CUSTOMER SIGNATURE &amp; DECLARATION</text>
    <line x1="90" y1="990" x2="450" y2="990" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="90" y="1010" font-size="11" fill="#64748b">SIGNATURE OF APPLICANT</text>
    <!-- Handwritten signature -->
    <path d="M 110 975 Q 160 930 200 970 T 260 960 T 320 950 T 400 970" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"/>

    <line x1="520" y1="990" x2="800" y2="990" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="520" y="1010" font-size="11" fill="#64748b">DATE SIGNED</text>
    <text x="540" y="980" font-family="'Caveat', cursive, sans-serif" font-size="24" fill="#1e3a8a">2026-10-31</text>

    <!-- Official Stamp Mark -->
    <circle cx="730" cy="1080" r="42" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3" opacity="0.8"/>
    <text x="730" y="1075" text-anchor="middle" font-size="10" font-weight="bold" fill="#dc2626" opacity="0.8">VERIFIED</text>
    <text x="730" y="1090" text-anchor="middle" font-size="9" fill="#dc2626" opacity="0.8">INTAKE DESK</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Generate high-resolution SVG data URI for a State Driver License / Identity Card
function generateDriverLicenseSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="540" viewBox="0 0 860 540" style="background:#e0f2fe; font-family:sans-serif;">
    <!-- Card Frame -->
    <rect width="860" height="540" rx="24" fill="#f0f9ff" stroke="#38bdf8" stroke-width="4"/>
    <rect x="8" y="8" width="844" height="524" rx="18" fill="#ffffff"/>

    <!-- Header bar -->
    <rect x="8" y="8" width="844" height="85" fill="#0369a1" rx="18 18 0 0"/>
    <text x="40" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="2">STATE OF CALIFORNIA</text>
    <text x="40" y="74" font-family="sans-serif" font-size="15" font-weight="600" fill="#bae6fd">DRIVER LICENSE &amp; IDENTIFICATION</text>
    <rect x="730" y="24" width="90" height="50" rx="6" fill="#facc15"/>
    <text x="775" y="55" text-anchor="middle" font-size="14" font-weight="bold" fill="#854d0e">REAL ID</text>

    <!-- Photo area -->
    <rect x="40" y="120" width="180" height="230" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
    <!-- Stylized Avatar Silhouette -->
    <circle cx="130" cy="200" r="45" fill="#64748b"/>
    <path d="M 60 330 C 60 270 110 260 130 260 C 150 260 200 270 200 330 Z" fill="#64748b"/>
    <text x="130" y="340" text-anchor="middle" font-size="10" font-weight="bold" fill="#94a3b8">OFFICIAL ID PHOTO</text>

    <!-- Details Column -->
    <text x="250" y="140" font-size="11" font-weight="bold" fill="#64748b">DL NUMBER</text>
    <text x="250" y="168" font-family="'JetBrains Mono', monospace" font-size="26" font-weight="bold" fill="#0f172a">D9284719-CA</text>

    <text x="250" y="205" font-size="11" font-weight="bold" fill="#64748b">FULL LEGAL NAME</text>
    <text x="250" y="235" font-size="22" font-weight="bold" fill="#0f172a">ELENA SOPHIA ROSTOVA</text>

    <text x="250" y="272" font-size="11" font-weight="bold" fill="#64748b">STREET ADDRESS &amp; RESIDENCE</text>
    <text x="250" y="296" font-size="16" font-weight="500" fill="#334155">1440 MISSION STREET, APT 4B</text>
    <text x="250" y="320" font-size="16" font-weight="500" fill="#334155">SAN FRANCISCO, CA 94103</text>

    <!-- Dates & Class -->
    <g transform="translate(250, 350)">
      <text x="0" y="15" font-size="10" font-weight="bold" fill="#64748b">DATE OF BIRTH</text>
      <text x="0" y="36" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="bold" fill="#0f172a">1993-11-20</text>

      <text x="170" y="15" font-size="10" font-weight="bold" fill="#64748b">EXPIRATION DATE</text>
      <text x="170" y="36" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="bold" fill="#0369a1">2029-11-20</text>

      <text x="350" y="15" font-size="10" font-weight="bold" fill="#64748b">CLASS / ENDORSEMENTS</text>
      <text x="350" y="36" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="bold" fill="#0f172a">CLASS C - NONE</text>
    </g>

    <!-- Contact & Record Details Strip -->
    <rect x="40" y="420" width="780" height="90" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="60" y="445" font-size="11" font-weight="bold" fill="#64748b">CONTACT TEL: <tspan font-weight="normal" fill="#0f172a">+1 (415) 555-0199</tspan></text>
    <text x="320" y="445" font-size="11" font-weight="bold" fill="#64748b">CONTACT EMAIL: <tspan font-weight="normal" fill="#0f172a">elena.rostova@designlab.co</tspan></text>
    <text x="60" y="475" font-size="11" font-weight="bold" fill="#64748b">RECORD NOTES: <tspan font-weight="normal" fill="#334155">Registered voter, organ donor, verified residential address.</tspan></text>
    <text x="60" y="495" font-family="'JetBrains Mono', monospace" font-size="10" fill="#94a3b8">BARCODE MIGRATION HASH: CA83902919382019920192A0</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Generate high-resolution SVG data URI for a Client Membership / Service Agreement
function generateBusinessAgreementSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200" style="background:#ffffff; font-family:sans-serif;">
    <rect width="900" height="1200" fill="#ffffff"/>
    <rect x="30" y="30" width="840" height="1140" fill="none" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Corporate Header -->
    <rect x="60" y="60" width="780" height="100" fill="#0f172a" rx="6"/>
    <text x="90" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="bold" fill="#ffffff">NOVA VENTURES CLIENT ENROLLMENT</text>
    <text x="90" y="135" font-family="sans-serif" font-size="13" fill="#94a3b8">B2B Account Master Agreement &amp; Authorized Representative Onboarding</text>

    <!-- Client Block -->
    <text x="70" y="210" font-size="15" font-weight="bold" fill="#0f172a">1. PRIMARY CLIENT &amp; PRINCIPAL CONTACT</text>
    <line x1="70" y1="225" x2="830" y2="225" stroke="#e2e8f0" stroke-width="1.5"/>

    <g transform="translate(70, 245)">
      <text x="0" y="20" font-size="12" font-weight="bold" fill="#475569">FULL NAME:</text>
      <text x="180" y="20" font-size="15" font-weight="bold" fill="#0f172a">David Christopher Sterling</text>

      <text x="0" y="60" font-size="12" font-weight="bold" fill="#475569">EMAIL ADDRESS:</text>
      <text x="180" y="60" font-size="15" fill="#0f172a">david.sterling@sterlingops.com</text>

      <text x="0" y="100" font-size="12" font-weight="bold" fill="#475569">PHONE NUMBER:</text>
      <text x="180" y="100" font-size="15" fill="#0f172a">+1 (312) 555-0144</text>

      <text x="0" y="140" font-size="12" font-weight="bold" fill="#475569">ID CREDENTIAL TYPE:</text>
      <text x="180" y="140" font-size="15" fill="#0f172a">US Passport &amp; Corporate ID</text>

      <text x="0" y="180" font-size="12" font-weight="bold" fill="#475569">ID NUMBER / REF:</text>
      <text x="180" y="180" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="bold" fill="#0f172a">USA-P94018471</text>

      <text x="0" y="220" font-size="12" font-weight="bold" fill="#475569">DATE OF BIRTH:</text>
      <text x="180" y="220" font-size="15" fill="#0f172a">1982-08-15</text>
    </g>

    <!-- Address Block -->
    <text x="70" y="520" font-size="15" font-weight="bold" fill="#0f172a">2. REGISTERED BUSINESS / BILLING ADDRESS</text>
    <line x1="70" y1="535" x2="830" y2="535" stroke="#e2e8f0" stroke-width="1.5"/>

    <g transform="translate(70, 555)">
      <text x="0" y="20" font-size="12" font-weight="bold" fill="#475569">STREET ADDRESS:</text>
      <text x="180" y="20" font-size="15" fill="#0f172a">333 South Grand Avenue, 28th Floor</text>

      <text x="0" y="60" font-size="12" font-weight="bold" fill="#475569">CITY &amp; STATE:</text>
      <text x="180" y="60" font-size="15" fill="#0f172a">Los Angeles, CA</text>

      <text x="0" y="100" font-size="12" font-weight="bold" fill="#475569">POSTAL CODE:</text>
      <text x="180" y="100" font-size="15" fill="#0f172a">90071</text>
    </g>

    <!-- Special Notes Block -->
    <text x="70" y="710" font-size="15" font-weight="bold" fill="#0f172a">3. ACCOUNT NOTES &amp; COMPLIANCE TERMS</text>
    <line x1="70" y1="725" x2="830" y2="725" stroke="#e2e8f0" stroke-width="1.5"/>

    <rect x="70" y="745" width="760" height="120" fill="#f8fafc" stroke="#cbd5e1" rx="4"/>
    <text x="90" y="775" font-size="13" fill="#334155">• Corporate enterprise tier active with automated ACH payment processing.</text>
    <text x="90" y="805" font-size="13" fill="#334155">• Authorized to request API credentials and add supplementary team members.</text>
    <text x="90" y="835" font-size="13" fill="#334155">• Tax exemption certificate verified by regional compliance team.</text>

    <!-- Signatures -->
    <line x1="70" y1="960" x2="400" y2="960" stroke="#0f172a" stroke-width="2"/>
    <text x="70" y="985" font-size="13" font-weight="bold" fill="#0f172a">David C. Sterling</text>
    <text x="70" y="1005" font-size="11" fill="#64748b">Authorized Client Representative</text>

    <line x1="490" y1="960" x2="820" y2="960" stroke="#0f172a" stroke-width="2"/>
    <text x="490" y="985" font-size="13" font-weight="bold" fill="#0f172a">Sarah Jenkins, VP Operations</text>
    <text x="490" y="1005" font-size="11" fill="#64748b">Nova Ventures Approving Officer</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'handwritten_intake',
    title: 'Handwritten Intake Sheet',
    subtitle: 'Marcus Vance - Registration Slip',
    type: 'handwritten',
    description: 'Realistic pen-and-ink customer intake with cursive handwriting, signature, and verification stamp.',
    getDataUrl: generateHandwrittenIntakeSvg,
  },
  {
    id: 'driver_license',
    title: "Driver's License / Photo ID",
    subtitle: 'Elena Rostova - California DL',
    type: 'id_card',
    description: 'Official state identification card with DL number, address, class, and contact credentials.',
    getDataUrl: generateDriverLicenseSvg,
  },
  {
    id: 'business_agreement',
    title: 'Client Service Agreement',
    subtitle: 'David Sterling - Corporate Master Slip',
    type: 'business_form',
    description: 'B2B enrollment sheet with legal address, passport reference, and corporate account terms.',
    getDataUrl: generateBusinessAgreementSvg,
  },
];
