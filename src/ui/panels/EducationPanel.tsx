"use client";

import { education } from "@/data/profile";

export default function EducationPanel() {
  return (
    <div className="bios">
      <div className="bios-tabs">
        <span>MAIN</span>
        <span className="on">EDUCATION</span>
        <span>BOOT</span>
        <span>EXIT</span>
      </div>
      <h2 style={{ fontFamily: "var(--sans)" }}>{education.school}</h2>
      <div className="lead" style={{ marginBottom: 18 }}>
        {education.location}
      </div>
      <dl className="bios-grid">
        <dt>DEGREE</dt>
        <dd>{education.degree}</dd>
        <dt>MAJOR</dt>
        <dd>Computer Science</dd>
        <dt>PERIOD</dt>
        <dd>{education.period}</dd>
        <dt>CGPA</dt>
        <dd className="hl">{education.cgpa} / 4.00</dd>
        <dt>HONOURS</dt>
        <dd className="hl">{education.honor}</dd>
      </dl>
      <div className="medal">
        <b>{education.cgpa}</b>
        <span>
          Graduated as a medalist. The CMOS cell on this board is rated at {education.cgpa}&nbsp;V, the number that keeps the
          firmware alive.
        </span>
      </div>
      <h3>BOOT PRIORITY</h3>
      <ol className="boot-order">
        <li>Next.js / React</li>
        <li>React Native / Expo</li>
        <li>NestJS / GraphQL / Node.js</li>
        <li>Python / FastAPI</li>
        <li>AI · Gemini · MediaPipe</li>
      </ol>
    </div>
  );
}
