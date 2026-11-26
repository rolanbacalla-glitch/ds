import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileImage,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { PortfolioHeader } from "@/components/portfolio/portfolio-header";
import { HardwareStateSwitcher } from "@/components/portfolio/hardware-state-switcher";
import { PanoramicFlowRail } from "@/components/portfolio/panoramic-flow-rail";
import { FLAGSHIP_CASE_STUDIES } from "@/data/portfolio-works";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return FLAGSHIP_CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = FLAGSHIP_CASE_STUDIES.find((item) => item.slug === slug);
  if (!study) {
    return { title: "Case Study Not Found — Rolan Bacalla" };
  }
  return {
    title: `${study.shortTitle} — Rolan Bacalla Portfolio`,
    description: study.outcomeHeadline,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const currentIndex = FLAGSHIP_CASE_STUDIES.findIndex((item) => item.slug === slug);
  if (currentIndex === -1) {
    notFound();
  }

  const study = FLAGSHIP_CASE_STUDIES[currentIndex];
  const nextStudy =
    FLAGSHIP_CASE_STUDIES[(currentIndex + 1) % FLAGSHIP_CASE_STUDIES.length];

  return (
    <div className="min-h-screen bg-[var(--sys-surface-canvas)] text-[var(--sys-on-surface)]">
      <PortfolioHeader />

      <main className="mx-auto max-w-5xl space-y-12 px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        {/* Back Breadcrumb */}
        <div>
          <Link
            href="/portfolio#work"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] px-4 text-xs font-medium text-[var(--sys-on-surface-secondary)] transition-colors hover:border-[var(--sys-outline)] hover:text-[var(--sys-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Portfolio
          </Link>
        </div>

        {/* 1. Executive Hero (5-Second Scan) */}
        <header className="space-y-6">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--sys-primary)]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: study.accentHex }}
              aria-hidden="true"
            />
            {study.eyebrow}
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[var(--sys-on-surface)] sm:text-5xl sm:leading-[1.1]">
            {study.title}
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-[var(--sys-on-surface-secondary)] sm:text-lg">
            {study.outcomeHeadline}
          </p>

          {/* Role / Timeline / Platforms Metadata Strip */}
          <dl className="tonal-card grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                Ownership &amp; Role
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--sys-on-surface)]">
                {study.role}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                Scope &amp; Cadence
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--sys-on-surface)]">
                {study.timeline}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                Platforms
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--sys-on-surface)]">
                {study.platforms.join(" · ")}
              </dd>
            </div>
          </dl>

          {/* Headline KPI Mini-Bento */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {study.metrics.map((metric) => (
              <div key={metric.label} className="tonal-card-elevated p-5">
                <p className="font-mono text-2xl font-semibold text-[var(--sys-on-surface)] tabular-nums sm:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--sys-on-surface)]">
                  {metric.label}
                </p>
                {metric.context && (
                  <p className="mt-0.5 text-xs text-[var(--sys-on-surface-secondary)]">
                    {metric.context}
                  </p>
                )}
              </div>
            ))}
          </div>

          {study.externalAction && (
            <div>
              <Link
                href={study.externalAction.href}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--sys-primary)] px-6 text-sm font-semibold text-[var(--sys-on-primary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
              >
                {study.externalAction.label}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </header>

        {/* 2. Context & Constraints */}
        <section aria-labelledby="constraints-heading" className="tonal-card p-6 sm:p-8">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--sys-on-surface-tertiary)]">
            <ShieldAlert className="h-4 w-4 text-[var(--sys-primary)]" aria-hidden="true" />
            Context &amp; Real-World Constraints
          </div>
          <h2
            id="constraints-heading"
            className="mt-2 text-xl font-semibold tracking-tight text-[var(--sys-on-surface)]"
          >
            What Made This Problem Difficult
          </h2>
          <ul className="mt-4 space-y-3">
            {study.constraints.map((constraint) => (
              <li
                key={constraint}
                className="flex items-start gap-3 text-sm leading-relaxed text-[var(--sys-on-surface-secondary)]"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sys-primary)]"
                  aria-hidden="true"
                />
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Key Decisions & Trade-Offs (Proof of Senior Judgement) */}
        <section aria-labelledby="decisions-heading" className="space-y-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--sys-on-surface-tertiary)]">
              Proof of Judgement
            </p>
            <h2
              id="decisions-heading"
              className="mt-1 text-2xl font-semibold tracking-tight text-[var(--sys-on-surface)]"
            >
              Key Decisions &amp; Trade-Offs
            </h2>
          </div>

          <div className="space-y-4">
            {study.decisions.map((decision) => (
              <article key={decision.heading} className="tonal-card p-6 sm:p-8">
                <h3 className="text-lg font-semibold tracking-tight text-[var(--sys-on-surface)]">
                  {decision.heading}
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ref-success)]">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      What We Built
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--sys-on-surface)]">
                      {decision.chosen}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ref-danger)]">
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      What We Rejected
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--sys-on-surface-secondary)]">
                      {decision.rejected}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[var(--sys-on-surface-secondary)]">
                  <strong className="text-[var(--sys-on-surface)]">Rationale:</strong>{" "}
                  {decision.rationale}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* 4. Interactive Solution Showcases */}
        {study.hasHardwareSwitcher && <HardwareStateSwitcher />}

        <PanoramicFlowRail
          title={study.flowTitle}
          subtitle={study.flowSubtitle}
          steps={study.flowSteps}
        />

        {/* 5. Outcomes, Learnings & Source Artefact Map */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="tonal-card p-6 lg:col-span-7 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--sys-on-surface-tertiary)]">
              Outcomes &amp; Reflection
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--sys-on-surface)]">
              Measurable Impact
            </h2>
            <ul className="mt-4 space-y-2.5">
              {study.outcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-2.5 text-sm text-[var(--sys-on-surface-secondary)]"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ref-success)]"
                    aria-hidden="true"
                  />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
                Key Learning
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--sys-on-surface)]">
                {study.learnings}
              </p>
            </div>
          </div>

          <div className="tonal-card p-6 lg:col-span-5 sm:p-8">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--sys-on-surface-tertiary)]">
              <FileImage className="h-4 w-4 text-[var(--sys-primary)]" aria-hidden="true" />
              Consolidated Album Artefacts
            </div>
            <p className="mt-2 text-xs text-[var(--sys-on-surface-secondary)]">
              Original high-resolution Figma boards mapped into this case study:
            </p>
            <ul className="mt-4 space-y-3">
              {study.sourceArtefacts.map((artefact) => (
                <li key={artefact.filename}>
                  <a
                    href={artefact.assetHref ?? "#"}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--sys-outline-variant)] bg-[var(--sys-surface-low)] p-3 transition-colors hover:border-[var(--sys-outline)] focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
                  >
                    <div>
                      <p className="font-mono text-xs font-medium text-[var(--sys-on-surface)]">
                        {artefact.filename}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--sys-on-surface-secondary)]">
                        {artefact.role} · <span className="font-mono">{artefact.dimensions}</span>
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-[var(--sys-on-surface-tertiary)]"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Next Case Study Navigation */}
        <nav
          aria-label="Next case study"
          className="tonal-card-elevated flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[var(--sys-on-surface-tertiary)]">
              Next Case Study
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--sys-on-surface)]">
              {nextStudy.shortTitle}
            </p>
          </div>
          <Link
            href={`/portfolio/${nextStudy.slug}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--sys-primary)] px-5 text-sm font-semibold text-[var(--sys-on-primary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-[var(--sys-primary)] focus-visible:outline-offset-2"
          >
            Continue Reading
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>
      </main>
    </div>
  );
}
