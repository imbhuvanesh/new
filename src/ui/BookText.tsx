import {
  certifications,
  education,
  experience,
  experiments,
  interests,
  journey,
  profile,
  projects,
  skillGroups,
  socials,
} from '../data/portfolio'

/* ─────────────────────────────────────────────────────────────────────────────
   The whole book as plain, selectable text. It backs the "Read as text" panel
   and the screen-reader/summary copy, so nothing is ever locked inside a canvas.
   ───────────────────────────────────────────────────────────────────────────── */

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-bronze/20 pt-8 first:border-t-0 first:pt-0">
      <p className="font-mono text-[10px] uppercase tracking-widest2 text-bronze">{number}</p>
      <h2 className="mt-2 font-serif text-3xl text-paper sm:text-4xl">{title}</h2>
      <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-paper-deep/90">{children}</div>
    </section>
  )
}

function LinkRow({ href, children, note }: { href: string; children: React.ReactNode; note?: string }) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noreferrer noopener"
      className="group inline-flex items-baseline gap-2 text-bronze-bright underline decoration-bronze/40 decoration-1 underline-offset-4 transition hover:decoration-bronze-bright"
    >
      <span>{children}</span>
      {note ? <span className="font-mono text-[10px] tracking-wider text-paper-deep/50">{note}</span> : null}
    </a>
  )
}

export function BookText({ idPrefix = 'text' }: { idPrefix?: string }) {
  const id = (n: string) => `${idPrefix}-${n}`

  return (
    <div className="space-y-12">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-bronze">A portfolio in eight chapters</p>
        <h1 className="mt-3 font-serif text-5xl leading-none text-paper sm:text-6xl">{profile.name}</h1>
        <p className="mt-3 font-serif text-xl italic text-bronze-bright">{profile.role}</p>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-paper-deep/85">{profile.availability}</p>
      </header>

      <Section id={id('about')} number="01" title="About Me">
        {profile.about.map((p) => (
          <p key={p.slice(0, 24)} className="max-w-prose">
            {p}
          </p>
        ))}
        <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {education.map((e) => (
            <li key={e.institution}>
              <p className="font-serif text-lg text-paper">{e.institution}</p>
              <p className="text-sm text-paper-deep/75">
                {e.qualification} · {e.period} · {e.detail}
              </p>
              <p className="text-sm text-paper-deep/55">{e.place}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id={id('skills')} number="02" title="Skills">
        <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.id}>
              <dt className="font-serif text-lg text-paper">{g.title}</dt>
              <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
                {g.items.join(' · ')}
              </dd>
              <dd className="mt-1 text-sm italic text-paper-deep/55">{g.note}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id={id('projects')} number="03" title="Selected Projects">
        <div className="space-y-8">
          {projects.map((p) => (
            <article key={p.id}>
              <h3 className="font-serif text-2xl text-paper">{p.title}</h3>
              <p className="mt-1 font-serif text-lg italic text-bronze-bright">{p.tagline}</p>
              <p className="mt-3 max-w-prose">{p.problem}</p>
              <p className="mt-2 max-w-prose text-paper-deep/75">{p.description}</p>
              <p className="mt-2 max-w-prose text-sm text-paper-deep/60">{p.role}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-bronze">
                {p.stack.join(' · ')}
              </p>
              <p className="mt-3 flex flex-wrap gap-4">
                {p.links.map((l) => (
                  <LinkRow key={l.href} href={l.href} note={l.note}>
                    {l.label}
                  </LinkRow>
                ))}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section id={id('journey')} number="04" title="The Journey">
        <ol className="space-y-5">
          {journey.map((m) => (
            <li key={m.title} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-bronze">{m.when}</span>
              <span>
                <span className="block font-serif text-lg text-paper">{m.title}</span>
                <span className="block max-w-prose text-sm text-paper-deep/75">{m.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        <h3 className="pt-4 font-serif text-xl text-paper">Experience</h3>
        {experience.map((e) => (
          <div key={e.org}>
            <p className="text-paper">
              <span className="font-medium">{e.role}</span> · {e.org} ·{' '}
              <span className="text-paper-deep/70">{e.period}</span>
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-paper-deep/75">
              {e.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <p className="mt-2">
              <LinkRow href={e.link.href}>{e.link.label}</LinkRow>
            </p>
          </div>
        ))}

        <h3 className="pt-4 font-serif text-xl text-paper">Certifications</h3>
        <ul className="space-y-2">
          {certifications.map((c) => (
            <li key={c.title}>
              <span className="text-paper">{c.title}</span>{' '}
              <span className="text-sm text-paper-deep/70">
                — {c.issuer}, {c.detail}
              </span>{' '}
              <LinkRow href={c.link.href} note={c.link.label}>
                verify
              </LinkRow>
            </li>
          ))}
        </ul>
      </Section>

      <Section id={id('universe')} number="05" title="Creative Universe">
        <dl className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {interests.map((i) => (
            <div key={i.title}>
              <dt className="font-serif text-lg text-paper">{i.title}</dt>
              <dd className="text-sm text-paper-deep/65">{i.note}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id={id('experiments')} number="06" title="Experiments &amp; Ideas">
        <div className="space-y-6">
          {experiments.map((x) => (
            <article key={x.id}>
              <h3 className="font-serif text-xl text-paper">{x.title}</h3>
              <p className="mt-1 max-w-prose text-sm text-paper-deep/80">{x.note}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-bronze">
                {x.stack.join(' · ')}
              </p>
              {x.link ? (
                <p className="mt-2">
                  <LinkRow href={x.link.href}>{x.link.label}</LinkRow>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section id={id('contact')} number="07" title="Contact">
        <p className="max-w-prose">{profile.invitation}</p>
        <p className="font-serif text-2xl italic text-bronze-bright">{profile.closing}</p>
        <ul className="space-y-2">
          <li>
            <LinkRow href={`mailto:${profile.email}`} note={profile.email}>
              Email
            </LinkRow>
          </li>
          {socials.map((s) => (
            <li key={s.href}>
              <LinkRow href={s.href} note={s.note}>
                {s.label}
              </LinkRow>
            </li>
          ))}
        </ul>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-deep/50">{profile.location}</p>
      </Section>
    </div>
  )
}
