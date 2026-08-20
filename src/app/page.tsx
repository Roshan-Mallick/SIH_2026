import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
          <div className="orb orb-5"></div>
          <div className="orb orb-6"></div>
          <div className="orb orb-7"></div>
        </div>

        <div className="hero-glass">
          <div className="hero-inner">
            <Navbar />

            <div className="hero-content">
              <p className="hero-eyebrow">AI CODE SECURITY · PREFLIGHT</p>
              <h1 className="hero-title">Secure <span>AI Coding.<br />Before </span>It Ships.</h1>
              <p className="hero-desc">
                Aegis PreFlight puts AI coding agents inside a controlled sandbox — monitoring actions, enforcing security policies, scanning code, and validating fixes before release.
              </p>

              <div className="hero-btns">
                <Link href="/register" className="hero-btn hero-btn-primary">Sign Up</Link>
                <Link href="/login" className="hero-btn hero-btn-secondary">Log In</Link>
              </div>

              <div className="hero-workflow">
                <div className="workflow-step">
                  <span className="workflow-dot"></span>
                  <span className="workflow-label">AI AGENT</span>
                </div>
                <span className="workflow-arrow">→</span>
                <div className="workflow-step">
                  <span className="workflow-dot"></span>
                  <span className="workflow-label">SANDBOX</span>
                </div>
                <span className="workflow-arrow">→</span>
                <div className="workflow-step">
                  <span className="workflow-dot"></span>
                  <span className="workflow-label">SCAN</span>
                </div>
                <span className="workflow-arrow">→</span>
                <div className="workflow-step workflow-step-accent">
                  <span className="workflow-dot"></span>
                  <span className="workflow-label">VALIDATE</span>
                </div>
              </div>

              <div className="hero-capabilities">
                <div className="hero-cap">
                  <div className="hero-cap-inner">
                    <span className="hero-cap-title">SANDBOX</span>
                    <span className="hero-cap-desc">Controlled Runtime</span>
                  </div>
                </div>
                <div className="hero-cap">
                  <div className="hero-cap-inner">
                    <span className="hero-cap-title">MONITOR</span>
                    <span className="hero-cap-desc">Runtime Activity</span>
                  </div>
                </div>
                <div className="hero-cap">
                  <div className="hero-cap-inner">
                    <span className="hero-cap-title">PREFLIGHT</span>
                    <span className="hero-cap-desc">PASS / BLOCK</span>
                  </div>
                </div>
              </div>

              <div className="hero-status">
                <span className="status-dot"></span> SANDBOX ACTIVE
                <span className="status-sep">|</span> POLICY ENFORCED
                <span className="status-sep">|</span> PREFLIGHT READY
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services container" id="services">
        <div className="section-title">
          <div>
            <p className="pill">Our service</p>
            <h2>Our Sandboxed Code<br />Services at a Glance</h2>
          </div>

          <p>
            From real-time-threat response to zero-trust infrastructure,
            our AI delivers smart, scalable protection built to adapt every day.
          </p>
        </div>

        <div className="cards">
          <article className="card visual-card">
            <div className="scan-lines"></div>
            <div className="card-icon">♢</div>
            <div className="card-footer">
              <h3>Cloud Security &<br />Compliance</h3>
              <Link href="/pricing" className="mini-btn">Get Started</Link>
            </div>
          </article>

          <article className="card intelligence-card">
            <div className="card-icon">♧</div>

            <div className="intelligence-content">
              <h3>AI-Driven Risk<br />Intelligence</h3>
              <Link href="/pricing" className="mini-btn">Get Started</Link>
              <p>
                Our system evolves with every data pattern, learning from
                new threats and increasing protection every day.
              </p>
            </div>
          </article>

          <article className="card code-card">
            <div className="card-icon">☁</div>
            <pre><code>{`const aegis = {
  scan: true,
  patch: "automatic",
  protection: "active"
};
`}</code></pre>

            <div className="card-footer">
              <h3>Cloud Security &<br />Compliance</h3>
              <Link href="/pricing" className="mini-btn">Get Started</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="about container" id="about">
        <div className="team-panel">
          <div className="grid-bg"></div>
          <div className="code-window">
            <span></span><span></span><span></span>
            <b>SECURITY<br />MONITOR</b>
          </div>

          <button className="large-play" aria-label="Play">
            <span></span>
          </button>

          <div className="code-chip">&lt;/&gt;</div>
        </div>

        <div className="about-copy">
          <p className="pill">Who we are</p>

          <p className="about-text">
            At Aegis, we believe security should be automated and pre-emptive.
            We build AI agents that find, fix, and verify code vulnerabilities,
            making deployment painless.
          </p>

          <div className="progress">
            <div className="progress-label">
              <span>Real-time protection</span><span>80%</span>
            </div>
            <div className="track"><span className="fill"></span></div>
          </div>

          <div className="progress">
            <div className="progress-label">
              <span>Trusted defense</span><span>80%</span>
            </div>
            <div className="track"><span className="fill second"></span></div>
          </div>
        </div>
      </section>

      <footer className="container footer" id="contact">
        We Don't Just Defend. We <span>Adapt.</span>
      </footer>
    </main>
  );
}
