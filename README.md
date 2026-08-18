# Aegis PreFlight

### Security Control Layer for AI Coding Agents

> **Let AI code. Aegis controls what it can access. PreFlight verifies what it produces.**

Aegis PreFlight is a security-controlled environment for AI coding agents such as **Claude Code, Codex, and other compatible agents**.

It places the agent inside a controlled environment where **filesystem, network, tools, processes, and resources are governed by explicit security policies**. Once the agent finishes, **PreFlight independently scans the generated code and project changes before they can leave the controlled environment**.

---

## Why Aegis PreFlight?

AI coding agents can perform development tasks with significant access to files, tools, processes, and network resources.

The problem is not only:

> **"Can the AI write insecure code?"**

It is also:

> **"What can the AI access while writing that code?"**

A compromised, misconfigured, or manipulated agent could potentially access resources outside the intended project or communicate with unauthorized destinations.

Aegis PreFlight addresses both sides:

```text
                    ┌─────────────────────┐
                    │      DEVELOPER      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   AEGIS ENTRY GATE  │
                    │                     │
                    │   Policy Enforcement │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    AI CODING AGENT  │
                    │  Claude / Codex / … │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    AEGIS SANDBOX    │
                    │                     │
                    │ Files │ Tools │ Net │
                    └──────────┬──────────┘
                               │
                               ▼
                         Agent works
                               │
                               ▼
                    ┌─────────────────────┐
                    │ PREFLIGHT EXIT GATE │
                    │                     │
                    │ Security Validation │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
                 BLOCK                  PASS
                    │                     │
                    ▼                     ▼
              Findings sent          Safe to leave
                 to agent             sandbox
                    │
                    ▼
                Agent fixes
                    │
                    └──────► RESCAN
```

---

## Two-Gate Security Model

### 1. Aegis — Entry Gate

Aegis controls the environment **before and during agent execution**.

It restricts:

- Filesystem access
- Network destinations
- Tools
- Processes
- Environment variables
- Sensitive resources
- CPU / memory / process resources
- Developer-defined security policies

The agent works only inside the authorized environment instead of receiving unrestricted access to the host system.

### 2. PreFlight — Exit Gate

PreFlight verifies the agent's output **before it becomes trusted**.

It can check for:

- Hardcoded secrets
- Vulnerable dependencies
- Sensitive files
- Dangerous configuration
- Security-rule violations
- Other configured security policies

Existing security scanners such as **Gitleaks, pip-audit, and npm audit** can be integrated instead of rebuilding those scanners.

---

# Core Security Controls

## Filesystem Control

The developer defines exactly what the agent can access.

```yaml
filesystem:
  read:
    - "./src/**"
    - "./tests/**"

  write:
    - "./src/**"
    - "./tests/**"

  blocked:
    - ".env"
    - ".ssh/**"
    - "**/*.pem"
    - "**/*.key"
```

Example:

```text
src/main.cpp       → ALLOW
tests/test.cpp     → ALLOW
.env               → BLOCK
~/.ssh/id_rsa      → BLOCK
```

The objective is least-privilege access to the developer-authorized workspace.

---

## Network Control

Aegis does not need to give an agent unrestricted internet access.

Network access is controlled by policy:

```yaml
network:
  default: block

  allow:
    - github.com
    - api.github.com
    - npmjs.com
    - pypi.org
```

This allows required services while preventing unrelated or suspicious destinations from being accessed.

---

## Tool & Process Control

Aegis can control which tools and processes an agent can use.

Policies can be:

```text
ALLOW
BLOCK
REQUIRE APPROVAL
```

Example:

```text
git status       → ALLOW
npm test         → ALLOW
git push         → REQUIRE APPROVAL
sudo             → BLOCK
```

The policy engine is designed so that security decisions do not depend on the agent's own judgment.

---

# Runtime Monitoring

Aegis observes structured runtime activity while the agent works.

It can record:

- File access
- Tool execution
- Process activity
- Network requests
- Policy violations
- Sensitive-resource access
- Security decisions

This provides visibility into **what the agent actually does**, rather than relying only on its generated explanation.

---

# Data-Exfiltration Detection

Aegis can correlate suspicious activity.

For example:

```text
Agent
  │
  ├── Reads sensitive configuration
  │
  ├── Collects credential-related data
  │
  └── Attempts connection to unauthorized domain
                     │
                     ▼
             Suspicious activity
                     │
                     ▼
              Aegis containment
```

For serious violations, the system can:

- Stop or suspend the agent
- Revoke network access
- Preserve the sandbox state
- Record the activity
- Generate an incident report

---

# Developer Approval

Not every operation needs to be automatically blocked.

Aegis supports developer-controlled decisions:

```text
┌─────────────────────────────────────┐
│      SECURITY APPROVAL REQUIRED     │
│                                     │
│ Agent: Coding Agent                 │
│ Action: git push origin main        │
│                                     │
│ [ BLOCK ]            [ ALLOW ]      │
└─────────────────────────────────────┘
```

Depending on policy, the developer can:

- Stop the agent
- End the process
- Revoke network access
- Allow the action
- Continue monitoring

High-confidence policy violations can also be automatically contained.

---

# PreFlight Security Scanning

When the coding task finishes, the generated project does **not** immediately become trusted.

PreFlight performs deterministic security validation.

### Secret Detection

**Gitleaks**

Detects exposed:

- API keys
- Tokens
- Credentials
- Private keys
- Other secrets

### Dependency Security

**pip-audit / npm audit**

Detects known vulnerable dependencies and CVEs.

### Code Security

**Semgrep**

Can be integrated for code-security analysis and potential bug detection.

### Sensitive Files

Detect files such as:

```text
.env
.env.production
credentials.json
secrets.json
*.pem
*.key
```

---

# BLOCK → FIX → RESCAN

This is the core PreFlight feedback loop.

```text
             SECURITY SCAN
                   │
                   ▼
             ┌───────────┐
             │   BLOCK   │
             └─────┬─────┘
                   │
                   ▼
          Structured Findings
                   │
                   ▼
              AI Agent
                   │
                   ▼
               Fixes Code
                   │
                   ▼
                RESCAN
                   │
          ┌────────┴────────┐
          ▼                 ▼
        BLOCK              PASS
          │                 │
       Fix again       Release Code
```

If PreFlight finds a blocking issue, the result can be returned to the agent as a structured finding.

The agent fixes the issue and PreFlight checks the changes again.

The goal is simple:

> **Code leaves the controlled environment only after it satisfies the configured security checks.**

---

# Security Authority

Aegis PreFlight follows a strict separation of responsibilities.

### Hard Security Controls

Security decisions are enforced by:

- Sandbox isolation
- Filesystem restrictions
- Network restrictions
- Process/tool policies
- Deterministic security scanners

### Local AI

The local LLM is used for:

- Behavioral analysis
- Finding explanations
- Incident explanations
- Security reports

The LLM is **not the final security authority**.

This means an agent cannot simply convince the security system that an unsafe action is safe.

---

# Architecture

![Aegis PreFlight Architecture](assets/aegis-architecture.png)

The architecture consists of:

```text
Developer
    │
    ▼
Aegis Entry Gate
    │
    ▼
AI Coding Agent
    │
    ▼
Aegis Sandbox
 ┌──┼──────────────┐
 ▼  ▼              ▼
Files Tools      Network
 └──┼──────────────┘
    │
    ▼
Agent Works
    │
    ▼
PreFlight Exit Gate
    │
 ┌──┴───┐
 ▼      ▼
BLOCK  PASS
 │      │
 ▼      ▼
Fix    Release
 │
 └──► Rescan
```

---

# Technology Stack

The project is designed around a **local desktop security application** and an optional cloud-facing web platform. The desktop application performs the actual sandboxing, agent execution, policy enforcement, monitoring, scanning, local AI, and reporting.

| Component | Technology |
|---|---|
| Desktop | Java + JavaFX |
| Security Engine | C++20/23 + CMake |
| Desktop ↔ Engine | Local IPC / native bridge |
| Sandbox | Docker |
| Local AI | Ollama + quantized ~2–3B model |
| Storage | SQLite |
| Secret Scanner | Gitleaks |
| Dependency Scanner | pip-audit / npm audit |
| Code Security | Semgrep |
| Reports | HTML / JSON / SARIF |
| Distribution | GitHub Releases |
| Website | Next.js + React + Tailwind CSS |
| Backend | Supabase + PostgreSQL |
| Authentication | Supabase Auth |
| Payments | Stripe |
| Web Hosting | Vercel |

The security engine and desktop application remain local; the website is primarily the account, subscription, license, and download layer.

---

# Security Incident Reporting

When an incident occurs, Aegis can generate a structured security report containing:

```text
Agent
Action attempted
Resource involved
Policy violated
Observed evidence
Aegis response
Network status
Agent status
```

The local LLM can convert this structured evidence into a human-readable explanation.

Reports are designed to support:

- HTML
- JSON
- SARIF

with audit events stored locally using SQLite and structured JSON.

---

# Example Scenario

A developer asks an AI coding agent to implement a payment integration.

The agent works inside the Aegis-controlled environment.

During development:

```text
Agent generates:
PAYMENT_API_KEY = "..."
```

PreFlight detects the hardcoded secret.

```text
PreFlight
    │
    ▼
SECRET DETECTED
    │
    ▼
BLOCK
    │
    ▼
Finding sent to Agent
    │
    ▼
Agent replaces secret with
environment-variable reference
    │
    ▼
RESCAN
    │
    ▼
PASS
```

Only after the configured security checks pass can the changes leave the controlled environment.

---

# Key Security Benefits

- **Controlled AI execution**
- **Least-privilege filesystem access**
- **Controlled network access**
- **Tool and process restrictions**
- **Runtime activity visibility**
- **Data-exfiltration detection**
- **Automatic containment**
- **Secret detection**
- **Dependency vulnerability detection**
- **Security validation before release**
- **BLOCK → FIX → RESCAN workflow**
- **Audit trails**
- **Security incident reports**

These capabilities form the layered protection model described in the project design.

---

# MVP

The first implementation focuses on proving the core security concept rather than attempting the complete commercial product.

### MVP goals

- [ ] One AI coding agent
- [ ] Restricted Docker sandbox
- [ ] Controlled filesystem
- [ ] Controlled network
- [ ] Runtime activity observation
- [ ] Policy enforcement
- [ ] Agent containment
- [ ] Security incident reporting
- [ ] PreFlight security scanning
- [ ] BLOCK → FIX → RESCAN
- [ ] Simple security dashboard

These are the defined MVP capabilities in the project specification.

---

# Future Roadmap

### Phase 1 — MVP

```text
One Agent
   +
Docker Sandbox
   +
Policy Engine
   +
Runtime Monitoring
   +
PreFlight Scanning
```

### Phase 2 — Multi-Agent

Support:

```text
Claude Code
Codex
Other compatible agents
Local/Test agents
```

The architecture is intended to prove one reliable agent integration first before expanding to multiple providers.

### Phase 3 — Advanced Security

- Fine-grained tool policies
- Credential brokering
- Advanced data-exfiltration correlation
- More security scanners
- Stronger process isolation
- Advanced approval workflows
- Security policy templates

### Phase 4 — Cross-Platform

```text
Windows
Linux
macOS
```

The planned desktop distribution includes Windows installers, Linux packages/AppImage, and macOS `.dmg`/app bundles.

---

# Local AI Direction

Aegis can eventually use a small local model for workspace-specific assistance.

The long-term objective is not necessarily to replace Claude or Codex.

Instead, a smaller local model can provide:

- Workspace-aware assistance
- Security explanations
- Project documentation understanding
- Coding conventions
- Local retrieval
- Specialized development assistance

while keeping sensitive development context local.

---

# Project Status

> **🚧 Early-stage / MVP Development**

Aegis PreFlight is currently focused on proving the core security architecture and demonstrating that AI coding agents can remain useful while operating inside a security-controlled environment.

---

# License

License to be decided.

---

## Aegis PreFlight

**Control the agent.  
Verify the output.  
Trust the code.**
