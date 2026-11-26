export type ArchiveCategory = "All" | "Product UI" | "Web & Editorial" | "Brand & Spatial";

export interface PortfolioMetric {
  value: string;
  label: string;
  context?: string;
}

export interface CaseStudyDecision {
  heading: string;
  chosen: string;
  rejected: string;
  rationale: string;
}

export interface FlowStep {
  id: string;
  stepNumber: string;
  title: string;
  platform: string;
  summary: string;
  keyDetail: string;
  stageTone: "dark" | "light" | "hardware";
  accentHex: string;
  assetHref?: string;
}

export interface SourceArtefact {
  filename: string;
  dimensions: string;
  role: string;
  assetHref?: string;
}

export interface FlagshipCaseStudy {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  outcomeHeadline: string;
  summary: string;
  role: string;
  timeline: string;
  platforms: string[];
  tags: string[];
  bentoSpan: "wide" | "standard";
  accentHex: string;
  stageTone: "dark" | "light" | "hardware";
  metrics: PortfolioMetric[];
  constraints: string[];
  decisions: CaseStudyDecision[];
  flowTitle: string;
  flowSubtitle: string;
  flowSteps: FlowStep[];
  outcomes: string[];
  learnings: string;
  sourceArtefacts: SourceArtefact[];
  hasHardwareSwitcher?: boolean;
  externalAction?: {
    label: string;
    href: string;
  };
}

export interface ArchiveItem {
  id: string;
  title: string;
  category: Exclude<ArchiveCategory, "All">;
  sourceFilename: string;
  dimensions: string;
  aspectProfile: string;
  stageTone: "dark" | "light";
  palette: string[];
  summary: string;
  highlight: string;
  tags: string[];
  assetHref?: string;
}

export const PORTFOLIO_HERO = {
  eyebrow: "Principal Product Designer · Design Systems Strategist",
  name: "Rolan Bacalla",
  headline:
    "Senior Product Designer crafting scalable design systems and connected hardware-to-cloud experiences.",
  subhead:
    "Bridging complex product ecosystems—from embedded hi-fi hardware displays and mobile companion apps to high-trust fintech and multi-platform SaaS—with accessible, token-driven systems.",
  primaryCta: "Explore Case Studies",
  secondaryCta: "Inspect Live Design System",
  availability: "Open to Senior / Principal Product & Design Systems roles (UK / Remote)",
};

export const FLAGSHIP_CASE_STUDIES: FlagshipCaseStudy[] = [
  {
    slug: "cambridge-audio-ecosystem",
    title: "Cambridge Audio: Unifying Embedded Hardware & Companion Apps",
    shortTitle: "Cambridge Audio Ecosystem",
    eyebrow: "Flagship Ecosystem · Hardware + Mobile",
    outcomeHeadline:
      "Unifying Melomania headphones, StreamMagic companion apps, and EVO 150 / CXN / EXN front-panel displays into one coherent audio ecosystem.",
    summary:
      "Consolidated 8 fragmented research, companion app, and embedded display workstreams into a single interaction model spanning mobile touchscreens and brushed-aluminium OLED/LCD hardware.",
    role: "Lead Product Designer (End-to-End Research, Companion UX & Embedded UI)",
    timeline: "Multi-release ecosystem programme",
    platforms: ["iOS & Android", "Embedded OLED/LCD (EVO 150, CXN, EXN)", "Rotary & Physical Controls"],
    tags: ["Ecosystem Design", "Embedded Hardware UI", "UX Research", "Cross-Platform"],
    bentoSpan: "wide",
    accentHex: "#D4A359",
    stageTone: "hardware",
    metrics: [
      { value: "90%", label: "Task Completion", context: "Cross-device pairing & playback" },
      { value: "+25%", label: "Setup Efficiency", context: "Streamlined onboarding flow" },
      { value: "-15%", label: "Source-Switch Friction", context: "Unified input hierarchy" },
    ],
    constraints: [
      "Low-density front-panel OLED/LCD displays viewed from 2–3 metres away across varying living-room lighting.",
      "Non-touch physical input constraints: rotary encoder dials, tactile source buttons, and IR remote navigation.",
      "Three distinct UK user personas (Alex Chen, Sarah Mitchell, Jake Patterson) spanning audiophile streamers and wireless Melomania M100/P100/A100 listeners.",
    ],
    decisions: [
      {
        heading: "We collapsed 4 nested hardware menus into a single rotary-first source selector",
        chosen: "High-contrast horizontal source rail with large legible typography and instant active-input confirmation (Variants A/B/C validated).",
        rejected: "Mirroring the mobile app's dense multi-tab navigation tree onto the 6.8-inch front-panel display.",
        rationale: "At sofa viewing distance, deep menu trees force repeated physical dial turns and break listening immersion.",
      },
      {
        heading: "We synchronised mobile companion state with hardware feedback in real time",
        chosen: "Shared semantic playback & source vocabulary across StreamMagic, Melomania Connect, and EVO 150 / CXN / EXN displays.",
        rejected: "Separate visual languages per hardware product line.",
        rationale: "Users frequently start playback on mobile and adjust volume or input physically; shared mental models eliminate cognitive switching cost.",
      },
    ],
    flowTitle: "StreamMagic Panoramic Onboarding & Playback Rail",
    flowSubtitle:
      "Re-engineered from the 11,524 × 1,388 px 18-screen panoramic Figma board into a keyboard-accessible step rail.",
    flowSteps: [
      {
        id: "ca-1",
        stepNumber: "01",
        title: "Device Discovery & Wi-Fi Handshake",
        platform: "StreamMagic iOS / Android",
        summary: "Auto-detects nearby EVO 150, CXN, and EXN streamers with progressive fallback states.",
        keyDetail: "Eliminated manual IP entry during first-run onboarding.",
        stageTone: "dark",
        accentHex: "#60A5FA",
      },
      {
        id: "ca-2",
        stepNumber: "02",
        title: "Melomania Persona-Driven Sound Profile",
        platform: "Melomania Connect",
        summary: "Tailored EQ presets and ANC modes mapped from UK persona research (Alex, Sarah, Jake).",
        keyDetail: "Black, white, and warm gold visual identity with high-legibility sliders.",
        stageTone: "dark",
        accentHex: "#D4A359",
      },
      {
        id: "ca-3",
        stepNumber: "03",
        title: "Step 1: Source Selection & Step 2: Display Sync",
        platform: "Mobile → Hardware OLED",
        summary: "Selecting HDMI ARC, Tidal Connect, or Phono on mobile immediately reflects on the front-panel screen.",
        keyDetail: "Validated A/B/C layout variants for 3-metre glanceability.",
        stageTone: "hardware",
        accentHex: "#E5E7EB",
      },
      {
        id: "ca-4",
        stepNumber: "04",
        title: "Unified Now Playing & Queue Control",
        platform: "Cross-Device Ecosystem",
        summary: "Album art, bitrate telemetry, and rotary-synced volume arcs stay consistent across phone and hi-fi chassis.",
        keyDetail: "90% task completion across multi-room playback scenarios.",
        stageTone: "dark",
        accentHex: "#EC4899",
      },
    ],
    outcomes: [
      "Unified 7+ product and research workstreams into a repeatable hardware-to-mobile blueprint.",
      "Achieved 90% task completion across multi-device pairing and source-switching validation.",
      "Reduced onboarding complexity by 25% and source-selection friction by 15%.",
    ],
    learnings:
      "Designing for physical hi-fi hardware taught me that typography scale, contrast, and input latency matter far more than decorative chrome. Every extra pixel on an OLED display competes for glanceability.",
    sourceArtefacts: [
      { filename: "Media Streamers.png", dimensions: "3860 × 4254", role: "Unified companion case study & KPIs" },
      { filename: "Melomania Connect – User personas.jpg", dimensions: "3260 × 2770", role: "3 UK target personas (M100/P100/A100)" },
      { filename: "Melomania Connect – Journey map.jpg", dimensions: "4100 × 2704", role: "End-to-end customer journey map" },
      { filename: "Melomania (Look & Feel).jpg", dimensions: "5293 × 3022", role: "Black/white/gold UI exploration" },
      { filename: "StreamMagic (Look & Feel V2).jpg", dimensions: "11524 × 1388", role: "18-screen panoramic companion flow" },
      { filename: "EVO 150 display UI layout.png", dimensions: "2211 × 7236", role: "10 embedded OLED/LCD screen states" },
      { filename: "CA design final.png", dimensions: "4269 × 3748", role: "CXN & EXN brushed-aluminium renders" },
      { filename: "Input source.png", dimensions: "3744 × 4272", role: "Source selection A/B/C layout variants" },
    ],
    hasHardwareSwitcher: true,
  },
  {
    slug: "apex-strategist",
    title: "Apex Strategist: High-Trust Crypto Portfolio & Risk Engine",
    shortTitle: "Apex Strategist Crypto App",
    eyebrow: "Flagship FinTech · Mobile Product",
    outcomeHeadline:
      "Turning volatile crypto portfolio management into a structured, rules-based workflow—lifting adoption by 25% and cutting friction by 40%.",
    summary:
      "Designed a 12-screen dark-mode mobile trading and allocation experience featuring Trade Advisor guardrails, automated Allocation Rules, and real-time Risk Alerts.",
    role: "Lead Product Designer (UX Strategy, Information Architecture & Mobile UI)",
    timeline: "End-to-end product redesign",
    platforms: ["iOS & Android", "Real-Time Portfolio Analytics"],
    tags: ["FinTech", "Risk Visualisation", "Mobile UI", "Conversion"],
    bentoSpan: "standard",
    accentHex: "#818CF8",
    stageTone: "dark",
    metrics: [
      { value: "+25%", label: "Portfolio Adoption", context: "Rules-based strategy usage" },
      { value: "-40%", label: "Execution Friction", context: "Fewer steps to rebalance" },
      { value: "8.5/10", label: "Usability Score", context: "Moderated user testing" },
      { value: "+15%", label: "Conversion Lift", context: "Active strategy activation" },
    ],
    constraints: [
      "Retail and prosumer investors faced severe cognitive overload from dense candlestick charts and uncontextualised volatility alerts.",
      "High-trust financial flows required transparent fee/risk previews before any trade execution.",
      "Dark-mode data surfaces needed strict WCAG 2.2 AA contrast for tabular balances (e.g., £59,234.56) and semantic gain/loss states.",
    ],
    decisions: [
      {
        heading: "We replaced raw order-book clutter with guided Allocation Rules",
        chosen: "Percentage-based target sliders with instant risk-drift badges and plain-English Trade Advisor summaries.",
        rejected: "Defaulting to a pro-exchange candlestick terminal on the primary home view.",
        rationale: "User testing revealed that 70%+ of hesitant investors abandoned trades due to fear of misconfiguring limit orders.",
      },
      {
        heading: "We elevated Risk Alerts into actionable inline cards rather than buried notifications",
        chosen: "Contextual risk banners tied directly to one-tap rebalance previews.",
        rejected: "Passive push notifications that dropped users back onto a generic dashboard.",
        rationale: "Pairing alert severity with a pre-calculated mitigation action drove the -40% drop in execution friction.",
      },
    ],
    flowTitle: "12-Screen Mobile Strategy & Risk Flow",
    flowSubtitle:
      "Distilled from the 5,620 × 3,781 px Apex Strategist case study canvas into four core decision moments.",
    flowSteps: [
      {
        id: "ap-1",
        stepNumber: "01",
        title: "Executive Balance & Drift Overview",
        platform: "Mobile Home",
        summary: "Tabular GBP balance (£59,234.56), 24h delta, and portfolio health score at a glance.",
        keyDetail: "Zero chart clutter above the fold; clear hierarchy for rapid scanning.",
        stageTone: "dark",
        accentHex: "#818CF8",
      },
      {
        id: "ap-2",
        stepNumber: "02",
        title: "Trade Advisor & Guardrails",
        platform: "Decision Support",
        summary: "Plain-English rationale explaining why a rebalance is recommended before committing capital.",
        keyDetail: "Drove 8.5/10 trust and usability rating in testing.",
        stageTone: "dark",
        accentHex: "#34D399",
      },
      {
        id: "ap-3",
        stepNumber: "03",
        title: "Automated Allocation Rules",
        platform: "Rule Builder",
        summary: "Interactive target weights and stop-loss thresholds with live projected exposure.",
        keyDetail: "+25% increase in structured strategy adoption.",
        stageTone: "dark",
        accentHex: "#A78BFA",
      },
      {
        id: "ap-4",
        stepNumber: "04",
        title: "Real-Time Risk Alerts",
        platform: "Monitoring",
        summary: "Severity-coded volatility triggers with one-tap review and execution confirmation.",
        keyDetail: "-40% reduction in rebalance friction and +15% conversion.",
        stageTone: "dark",
        accentHex: "#F59E0B",
      },
    ],
    outcomes: [
      "+25% lift in rules-based portfolio adoption across active users.",
      "-40% reduction in steps and friction during portfolio rebalancing.",
      "8.5/10 moderated usability score and +15% strategy conversion lift.",
    ],
    learnings:
      "In high-stakes fintech, clarity is trust. Replacing intimidating jargon with transparent pre-trade guardrails outperformed every visual polish tweak.",
    sourceArtefacts: [
      { filename: "Apex Strategist App - Crypto.png", dimensions: "5620 × 3781", role: "Full UX case study + 12 dark-mode mobile screens" },
    ],
  },
  {
    slug: "smartcharge-ev",
    title: "SmartCharge: Cross-Platform Home EV Charging Ecosystem",
    shortTitle: "SmartCharge Home EV Charging",
    eyebrow: "Flagship Mobility & SaaS · Mobile + Web",
    outcomeHeadline:
      "Designing a seamless off-peak charging and energy billing experience across 8 mobile driver flows and 3 desktop SaaS dashboards.",
    summary:
      "Bridged everyday homeowner mobile charging schedules with a clean desktop SaaS portal for tariff optimisation, multi-vehicle billing, and charger diagnostics.",
    role: "Senior Product Designer (Cross-Platform UX & Responsive Systems)",
    timeline: "Mobile & Web SaaS MVP",
    platforms: ["iOS & Android Driver App", "Responsive Web SaaS Dashboard"],
    tags: ["EV & Mobility", "Cross-Platform SaaS", "Data Visualisation", "Responsive UI"],
    bentoSpan: "standard",
    accentHex: "#3B82F6",
    stageTone: "light",
    metrics: [
      { value: "8 + 3", label: "Synced Screens", context: "8 mobile + 3 desktop SaaS" },
      { value: "1-Tap", label: "Off-Peak Schedule", context: "Automated tariff optimisation" },
      { value: "100%", label: "Token Parity", context: "Shared light-mode UI system" },
    ],
    constraints: [
      "Homeowners needed effortless one-handed charging control on mobile while fleet/household admins required detailed monthly kWh billing on desktop.",
      "Off-peak energy tariff windows are confusing when presented as raw tables instead of visual timelines.",
      "Consistent status signalling (Charging, Scheduled, Fault, Idle) had to work identically on both 390px and 1440px viewports.",
    ],
    decisions: [
      {
        heading: "We separated 'Drive-Ready Time' on mobile from granular tariff billing on desktop",
        chosen: "Goal-based mobile scheduler ('Ready by 07:30 at 80%') paired with deep kWh cost breakdowns in the desktop workspace.",
        rejected: "Forcing complex invoice exports and multi-tariff rate tables into the mobile bottom sheet.",
        rationale: "Drivers think in departure times, not kilowatt-hour intervals; separating context-of-use cut cognitive load on both platforms.",
      },
    ],
    flowTitle: "Cross-Platform EV Charging Journey",
    flowSubtitle:
      "Structured from the 8,220 × 3,250 px panoramic board into mobile driver and desktop SaaS stages.",
    flowSteps: [
      {
        id: "ev-1",
        stepNumber: "01",
        title: "Live Charger Status & State of Charge",
        platform: "Mobile Driver App",
        summary: "Clear battery ring, active kW delivery, and estimated completion time on a crisp light canvas.",
        keyDetail: "Designed for quick glances in dim driveways and bright daylight.",
        stageTone: "light",
        accentHex: "#2563EB",
      },
      {
        id: "ev-2",
        stepNumber: "02",
        title: "Smart Off-Peak Scheduling",
        platform: "Mobile Driver App",
        summary: "Set target departure time and battery percentage while SmartCharge automatically picks cheapest tariff slots.",
        keyDetail: "Replaces manual start/stop timers with outcome-first controls.",
        stageTone: "light",
        accentHex: "#10B981",
      },
      {
        id: "ev-3",
        stepNumber: "03",
        title: "Desktop Energy & Cost Analytics",
        platform: "Web SaaS Dashboard",
        summary: "Monthly kWh consumption, off-peak savings charts, and vehicle-level session logs.",
        keyDetail: "High-density data cards built on shared spacing and chart tokens.",
        stageTone: "light",
        accentHex: "#3B82F6",
      },
      {
        id: "ev-4",
        stepNumber: "04",
        title: "Billing, Tariffs & Charger Settings",
        platform: "Web SaaS Portal",
        summary: "Automated reimbursement exports, RFID card management, and firmware status.",
        keyDetail: "Unified component architecture across mobile and desktop.",
        stageTone: "light",
        accentHex: "#6366F1",
      },
    ],
    outcomes: [
      "Delivered a cohesive 11-screen cross-platform architecture (8 mobile + 3 desktop SaaS).",
      "Simplified off-peak tariff scheduling into a single departure-time mental model.",
      "Established reusable light-mode status tokens shared directly with frontend engineers.",
    ],
    learnings:
      "Cross-platform parity does not mean identical layouts—it means identical mental models and token semantics adapted to each viewport's job-to-be-done.",
    sourceArtefacts: [
      { filename: "Home EV charging.png", dimensions: "8220 × 3250", role: "8 mobile screens + 3 desktop SaaS dashboards" },
    ],
  },
  {
    slug: "antigravity-design-system",
    title: "Scalable Multi-Platform Design System & Token Architecture",
    shortTitle: "Multi-Platform Design System",
    eyebrow: "Flagship Systems · Tokens & Governance",
    outcomeHeadline:
      "Architecting a 3-tier W3C DTCG token engine, accessible component library, and automated Figma-to-code hand-off compliant with WCAG 2.2 AA.",
    summary:
      "Transformed a 9,548 px static component specification into a living perceptual OKLCH design system with automated CSS, TypeScript, and Figma Variables exports.",
    role: "Principal Design Systems Designer & Architect",
    timeline: "Ongoing v2.4 / v3.0 system",
    platforms: ["Web (React / Next.js / Tailwind v4)", "Figma Variables", "iOS / Android Token Exports"],
    tags: ["Design Systems", "W3C DTCG Tokens", "WCAG 2.2 AA", "Figma-to-Code"],
    bentoSpan: "wide",
    accentHex: "#10B981",
    stageTone: "light",
    metrics: [
      { value: "3-Tier", label: "Token Pipeline", context: "Primitives → Semantic → Component" },
      { value: "WCAG 2.2", label: "AA Verified", context: "4.5:1 text & 40px touch targets" },
      { value: "100%", label: "Single Source", context: "JSON → CSS / TS / Figma" },
    ],
    constraints: [
      "Product teams needed seamless light/dark polarity switching without manually overriding component colours.",
      "Strict spatial discipline was required to prevent illegible frosted-glass overuse on content cards.",
      "Every interactive primitive needed baked-in keyboard navigation, focus-visible rings, and reduced-motion support.",
    ],
    decisions: [
      {
        heading: "We enforced a strict 3-tier Z-Axis Spatial Hierarchy",
        chosen: "Z-Level 0 Canvas, Z-Level 1 solid `.tonal-card` content surfaces (zero backdrop blur), and Z-Level 2 `.liquid-glass-regular` strictly for floating chrome and modals.",
        rejected: "Applying glassmorphism blur indiscriminately to data tables and body cards.",
        rationale: "Preserves text legibility (>= 4.5:1) and GPU frame-rates while giving floating navigation genuine depth.",
      },
      {
        heading: "We adopted perceptual OKLCH tonal math for dynamic theming",
        chosen: "13-step OKLCH reference ramps driven by seed hue/chroma variables, compiled via `npm run build:tokens`.",
        rejected: "Hardcoded hex scales that drift in perceived lightness across brand hues.",
        rationale: "Guarantees predictable contrast ratios across both Obsidian Dark and Alabaster Light themes.",
      },
    ],
    flowTitle: "Design System Architecture Chapters",
    flowSubtitle:
      "Broken out from the 1,676 × 9,548 px vertical Design System specification into scannable interactive layers.",
    flowSteps: [
      {
        id: "ds-1",
        stepNumber: "01",
        title: "Tier 1 Primitives & OKLCH Ramps",
        platform: "tokens/primitives.json",
        summary: "Perceptually uniform colour ramps, typographic scales, geometric radii, and spring motion curves.",
        keyDetail: "Single JSON source compiled to CSS, TypeScript, and Figma Variables.",
        stageTone: "light",
        accentHex: "#6366F1",
      },
      {
        id: "ds-2",
        stepNumber: "02",
        title: "Tier 2 Semantic Intent (Light & Dark)",
        platform: "semantic.light & dark.json",
        summary: "5-step tonal surface elevation and 4-level vibrancy text hierarchy mapped to intent.",
        keyDetail: "Automatic polarity switching with zero per-component hacks.",
        stageTone: "dark",
        accentHex: "#10B981",
      },
      {
        id: "ds-3",
        stepNumber: "03",
        title: "Tier 3 Accessible UI Primitives",
        platform: "React 19 + Tailwind v4",
        summary: "Buttons, inputs, tonal cards, focus-trapped dialogues, and tabular data components.",
        keyDetail: "Automated `verify:wcag` checks for contrast and 40px touch targets.",
        stageTone: "light",
        accentHex: "#3B82F6",
      },
      {
        id: "ds-4",
        stepNumber: "04",
        title: "Live Interactive Workbench",
        platform: "Production Next.js App",
        summary: "Inspect tokens, test contrast, and export platform bundles directly in the browser.",
        keyDetail: "This portfolio itself runs natively on these exact tokens.",
        stageTone: "dark",
        accentHex: "#8B5CF6",
      },
    ],
    outcomes: [
      "Single-source token pipeline generating CSS, TypeScript, Figma Variables, and AI design rules.",
      "WCAG 2.2 AA compliance verified across Obsidian Dark and Alabaster Light modes.",
      "Live interactive workbench powering real production interfaces—including this portfolio.",
    ],
    learnings:
      "A design system only succeeds when engineers love using it. Treating tokens as compiled infrastructure rather than static Figma stickers removes hand-off friction.",
    sourceArtefacts: [
      { filename: "Design System.png", dimensions: "1676 × 9548", role: "Complete token & component library documentation" },
    ],
    externalAction: {
      label: "Open Live Design System Workbench",
      href: "/",
    },
  },
];

export const CRAFT_ARCHIVE_ITEMS: ArchiveItem[] = [
  {
    id: "checkout-flow",
    title: "E-Commerce Checkout Flow Improvements",
    category: "Product UI",
    sourceFilename: "Checkout Flow improvements.png",
    dimensions: "3930 × 2145",
    aspectProfile: "Landscape multi-screen (7 mobile flows)",
    stageTone: "light",
    palette: ["#FFFFFF", "#2563EB", "#0F172A", "#10B981"],
    summary:
      "7-screen mobile checkout optimisation reducing form fatigue with progressive disclosure, clear delivery-tier hierarchy, and frictionless payment confirmation.",
    highlight: "7-Screen Conversion Flow",
    tags: ["E-Commerce", "Checkout UX", "Mobile"],
  },
  {
    id: "roam-together",
    title: "Roam Together — Collaborative Travel App",
    category: "Product UI",
    sourceFilename: "Roam Together.png",
    dimensions: "2355 × 3145",
    aspectProfile: "Portrait showcase board",
    stageTone: "light",
    palette: ["#FFFFFF", "#F97316", "#1E293B", "#FEF3C7"],
    summary:
      "Social group travel itinerary planner combining rich destination cards, shared activity voting, and integrated interactive map views.",
    highlight: "Social Itinerary & Maps",
    tags: ["Consumer Mobile", "Maps UI", "Social"],
  },
  {
    id: "web-dashboards",
    title: "Atom Ledger & Atelier SaaS Dashboards",
    category: "Product UI",
    sourceFilename: "Dashboards.png",
    dimensions: "7777 × 2057",
    aspectProfile: "Ultra-wide panoramic (3.8:1 · 5 concepts)",
    stageTone: "dark",
    palette: ["#0D0F14", "#10B981", "#3B82F6", "#F8FAFC"],
    summary:
      "Five high-density web dashboard explorations spanning fintech transaction ledgers (Atom Ledger), dark card analytics, and executive workspaces (Atelier).",
    highlight: "5 SaaS & FinTech Concepts",
    tags: ["Data Visualisation", "SaaS", "Dark & Light"],
  },
  {
    id: "lyssnup-player",
    title: "LyssnUP — Desktop & Tablet Music Player",
    category: "Product UI",
    sourceFilename: "Music player.jpg",
    dimensions: "6341 × 2523",
    aspectProfile: "Wide dual-theme board (2.5:1)",
    stageTone: "dark",
    palette: ["#18181B", "#52525B", "#F97316", "#FAFAFA"],
    summary:
      "Audio streaming concept rendered in both obsidian dark and neutral studio-grey modes with an album cover-flow carousel and tactile playback bar.",
    highlight: "Dual-Mode Audio Concept",
    tags: ["Audio UI", "Desktop", "Cover-Flow"],
  },
  {
    id: "cody-philips",
    title: "Cody.Philips — Executive Recruitment Website",
    category: "Web & Editorial",
    sourceFilename: "Cody.Philips - Website.png",
    dimensions: "4060 × 3939",
    aspectProfile: "Near-square multi-page layout",
    stageTone: "light",
    palette: ["#2E1065", "#D97706", "#FFFFFF", "#F8FAFC"],
    summary:
      "Multi-page executive search brand experience pairing refined editorial serif typography with deep royal purple and warm gold accents ('Refined Talent Architecture').",
    highlight: "Editorial Executive Web",
    tags: ["Web Design", "Editorial Typography", "Brand Web"],
  },
  {
    id: "landing-pages",
    title: "Wealth & SaaS Marketing Landing Pages",
    category: "Web & Editorial",
    sourceFilename: "Landing pages.png",
    dimensions: "2981 × 5366",
    aspectProfile: "Tall vertical full-page layouts (1:1.8)",
    stageTone: "dark",
    palette: ["#0B0F19", "#6366F1", "#2563EB", "#FFFFFF"],
    summary:
      "Conversion-focused full-length marketing pages contrasting a dark wealth-management narrative ('Command your financial universe') with a crisp blue-and-white SaaS site.",
    highlight: "Conversion Landing Pages",
    tags: ["Marketing Web", "Conversion", "Visual Craft"],
  },
  {
    id: "hozah-brand",
    title: "Hozah — Ticketless Parking Brand & Spatial Identity",
    category: "Brand & Spatial",
    sourceFilename: "Hozah.png",
    dimensions: "5799 × 2759",
    aspectProfile: "Wide brand collage (19.7 MB source)",
    stageTone: "dark",
    palette: ["#0F172A", "#0D9488", "#84CC16", "#FFFFFF"],
    summary:
      "End-to-end brand identity for barrier-free parking ('Drive in. Park. Walk away.') spanning three logo explorations, final HOZAH.com identity, trade-show booths, print flyers, stationery, and branded merchandise.",
    highlight: "Identity · Booth · Print · Merch",
    tags: ["Brand Identity", "Exhibition", "Print Collateral"],
  },
];
