# Cline Instructions - Agent Skills Integration

This project has been configured with the **agent-skills** collection from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills).

## Installed Components

### Skills (25 skills in `.cline/skills/`)
Each skill is a markdown workflow that I should follow when the task matches its domain:

| Skill | When to Use |
|-------|-------------|
| `spec-driven-development` | Starting new features, unclear requirements, multi-module changes |
| `planning-and-task-breakdown` | Breaking down specs into small, verifiable tasks |
| `incremental-implementation` | Building one slice at a time |
| `test-driven-development` | Red-green-refactor cycle for all code changes |
| `code-review-and-quality` | Pre-merge review (correctness, security, performance, maintainability, style) |
| `debugging-and-error-recovery` | Bugs, failures, unexpected behavior |
| `code-simplification` | Refactoring, reducing complexity |
| `api-and-interface-design` | Designing APIs, interfaces, contracts |
| `frontend-ui-engineering` | UI components, accessibility, responsive design |
| `security-and-hardening` | Security audits, threat modeling, hardening |
| `shipping-and-launch` | Release preparation, feature flags, rollback plans |
| `git-workflow-and-versioning` | Branching, commits, PRs, versioning |
| `ci-cd-and-automation` | Pipeline design, deployment automation |
| `performance-optimization` | Profiling, bottlenecks, optimization |
| `observability-and-instrumentation` | Logging, metrics, tracing, alerting |
| `documentation-and-adrs` | ADRs, API docs, onboarding guides |
| `deprecation-and-migration` | Safe removal, migration strategies |
| `constraint-driven-development` | Hard constraints as decision filters |
| `context-engineering` | Loading right context per task |
| `doubt-driven-development` | Interrogating uncertainty before building |
| `idea-refine` | Refining vague ideas into actionable specs |
| `interview-me` | Requirements interrogation, one question at a time |
| `source-driven-development` | Learning from existing code before changing |
| `using-agent-skills` | Meta-skill for discovering which skill to use |
| `browser-testing-with-devtools` | Debugging with browser DevTools |

### Agents (4 personas in `.cline/agents/`)
These are specialized review personas I can invoke for specific review tasks:

| Agent | Purpose |
|-------|---------|
| `code-reviewer.md` | General code quality review |
| `security-auditor.md` | Security-focused audit |
| `test-engineer.md` | Test quality and coverage review |
| `web-performance-auditor.md` | Web performance analysis |

### Commands (9 slash commands in `.cline/commands/`)
These map to the development lifecycle:
- `/spec` - Define what to build (spec-driven-development)
- `/plan` - Plan how to build it (planning-and-task-breakdown)
- `/build` - Build incrementally (incremental-implementation + test-driven-development)
- `/test` - Prove it works (test-driven-development + debugging-and-error-recovery)
- `/constraints` - Set quality bar (constraint-driven-development)
- `/review` - Review before merge (code-review-and-quality)
- `/webperf` - Audit web performance (web-performance-auditor)
- `/code-simplify` - Simplify code (code-simplification)
- `/ship` - Ship to production (shipping-and-launch + parallel agent reviews)

## How I Should Use These

### Automatic Skill Activation
When you give me a task, I should:
1. **Check if any skill applies** (even 1% chance)
2. **Load the relevant skill** from `.cline/skills/<skill-name>/SKILL.md`
3. **Follow the skill workflow strictly** - do not skip steps
4. **Only proceed to implementation after required steps** (spec, plan, etc.) are complete

### Intent → Skill Mapping
- Feature / new functionality → `spec-driven-development` → `incremental-implementation` → `test-driven-development`
- Planning / breakdown → `planning-and-task-breakdown`
- Bug / failure / unexpected behavior → `debugging-and-error-recovery`
- Code review → `code-review-and-quality` (and invoke agents: code-reviewer, security-auditor, test-engineer)
- Refactoring / simplification → `code-simplification`
- API or interface design → `api-and-interface-design`
- UI work → `frontend-ui-engineering`

### Lifecycle Commands
When you use slash commands (or their plain-language equivalents), I should follow the corresponding lifecycle:
- **DEFINE** → `spec-driven-development`
- **PLAN** → `planning-and-task-breakdown`
- **BUILD** → `incremental-implementation` + `test-driven-development`
- **VERIFY** → `debugging-and-error-recovery`
- **REVIEW** → `code-review-and-quality` (with parallel agent fan-out)
- **SHIP** → `shipping-and-launch`

### Agent Invocation for Reviews
For `/review` or `/ship`, I should run these three agents **in parallel** and synthesize their reports:
1. `code-reviewer` - General correctness, maintainability, style
2. `security-auditor` - Security vulnerabilities, threat model
3. `test-engineer` - Test coverage, quality, flakiness

### Anti-Rationalization (Rules I Must Follow)
- ❌ "This is too small for a skill"
- ❌ "I can just quickly implement this"
- ❌ "I'll gather context first"
- ✅ **Always check for and use skills first**

## References Available
Additional checklists in `.cline/references/`:
- `accessibility-checklist.md`
- `definition-of-done.md`
- `observability-checklist.md`
- `orchestration-patterns.md`
- `performance-checklist.md`
- `security-checklist.md`
- `testing-patterns.md`

---

**Note:** These skills are the *how* (workflows), agents are the *who* (perspectives), and commands are the *when* (entry points). I am the orchestrator - I decide which skill/agent to use based on your intent.