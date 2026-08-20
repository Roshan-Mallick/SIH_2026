import { Navbar } from "@/components/Navbar";

export default function About() {
  return (
    <>
      <div className="page-orbs" aria-hidden="true">
        <span className="orb orb-large"></span>
        <span className="orb orb-small"></span>
        <span className="orb orb-ring"></span>
      </div>

      <header className="site-shell">
        <Navbar type="site" />

        <main>
          <section className="about-hero" aria-labelledby="page-title">
            <p className="eyebrow">THE PHILOSOPHY BEHIND AEGIS</p>
            <h1 id="page-title">AI should <span>accelerate</span> development.<br /><span>Not expand</span> your attack surface.</h1>
            <p className="hero-copy">Aegis exists to make powerful coding agents useful without making the environments around them vulnerable. The agent gets room to work; security keeps the boundaries firm.</p>
          </section>

          <section className="definition section-rule" aria-labelledby="definition-title">
            <div className="section-label">01 / THE IDEA</div>
            <div>
              <h2 id="definition-title">What is <span>Aegis PreFlight?</span></h2>
              <blockquote>Aegis PreFlight is a security-controlled environment for AI coding agents. It governs what an agent can access while it works and independently validates what it produces before that work becomes trusted.</blockquote>
            </div>
          </section>

          <section className="philosophy section-rule" aria-labelledby="philosophy-title">
            <div className="section-heading">
              <div className="section-label">02 / OUR SECURITY PHILOSOPHY</div>
              <h2 id="philosophy-title">Useful agents need<br /><span>intentional boundaries.</span></h2>
            </div>
            <div className="principles">
              <article className="principle-card">
                <div className="card-number">01</div>
                <p className="card-kicker">CONTROL</p>
                <h3>Define what the agent can access.</h3>
                <p>Filesystem, network, tools, processes and resources are governed by explicit policy.</p>
              </article>
              <article className="principle-card">
                <div className="card-number">02</div>
                <p className="card-kicker">OBSERVE</p>
                <h3>See what the agent actually does.</h3>
                <p>Monitor file access, processes, network requests and policy decisions as work happens.</p>
              </article>
              <article className="principle-card">
                <div className="card-number">03</div>
                <p className="card-kicker">VERIFY</p>
                <h3>Do not trust generated code blindly.</h3>
                <p>Scan the resulting project before it leaves the controlled environment.</p>
              </article>
            </div>
          </section>

          <section className="authority section-rule" id="authority" aria-labelledby="authority-title">
            <div className="section-label">03 / SECURITY AUTHORITY</div>
            <div className="authority-content">
              <div>
                <h2 id="authority-title">The AI explains.<br /><span>You decide.</span></h2>
                <p className="authority-note">The AI explains security decisions. It does not make the final security decision.</p>
              </div>
              <div className="authority-flow">
                <div className="authority-block hard-controls">
                  <p className="card-kicker">HARD SECURITY CONTROLS</p>
                  <ul>
                    <li>Sandbox isolation</li>
                    <li>Filesystem restrictions</li>
                    <li>Network restrictions</li>
                    <li>Process and tool policies</li>
                    <li>Deterministic scanners</li>
                  </ul>
                </div>
                <div className="flow-arrow" aria-hidden="true">↓</div>
                <div className="authority-block local-ai">
                  <p className="card-kicker">LOCAL AI</p>
                  <ul>
                    <li>Explanations</li>
                    <li>Behavioral analysis</li>
                    <li>Security reports</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="direction section-rule" id="direction" aria-labelledby="direction-title">
            <div className="section-label">04 / OUR DIRECTION</div>
            <div className="direction-content">
              <div>
                <h2 id="direction-title">A <span>measured</span> path<br />from<span> proof to platform.</span></h2>
                <p>We are building the security foundation first, then expanding the agents, controls and platforms it can support.</p>
              </div>
              <ol className="roadmap">
                <li className="roadmap-item"><span>01</span><strong>MVP</strong><small>Prove the core security architecture.</small></li>
                <li className="roadmap-item"><span>02</span><strong>MULTI-AGENT</strong><small>Support more compatible coding agents.</small></li>
                <li className="roadmap-item"><span>03</span><strong>ADVANCED SECURITY</strong><small>Add deeper controls and correlation.</small></li>
                <li className="roadmap-item"><span>04</span><strong>CROSS-PLATFORM</strong><small>Bring Aegis to Windows, Linux and macOS.</small></li>
              </ol>
            </div>
          </section>
        </main>

        <footer className="site-footer">Control the agent. <span>Verify the output.</span></footer>
      </header>
    </>
  );
}
