# Copilot Processing Log
---

_Agent ready for use. Please review and remove this file when done._

2. `agent-output/rebel-tactical-platform/04-governance-constraints.json` ✅ NEW
3. `agent-output/rebel-tactical-platform/04-implementation-plan.md` ✅ RECREATED
4. `agent-output/rebel-tactical-platform/README.md` ✅ UPDATED

---

_Please review the summary and delete this file when done._

```
### Phase 1: Research & Preparation

- [x] TASK-001: Read agent definition instructions
- [x] TASK-002: Read source prompt file (azure-resource-health-diagnose.prompt.md)
- [x] TASK-003: Review existing agent patterns (azure-principal-architect.agent.md)

### Phase 2: Agent Implementation

- [x] TASK-004: Create agent definition file with YAML frontmatter
- [x] TASK-005: Define 6-phase interactive workflow
- [x] TASK-006: Add approval-first command execution patterns
- [x] TASK-007: Include diagnostic KQL query library
- [x] TASK-008: Add handoffs to related agents

### Phase 3: Documentation

- [x] TASK-009: Update Copilot-Processing.md with summary

## Progress Tracking

| Task     | Status       | Notes                                                |
| -------- | ------------ | ---------------------------------------------------- |
| TASK-001 | ✅ completed | Read agents-definitions.instructions.md              |
| TASK-002 | ✅ completed | Read all 324 lines of source prompt                  |
| TASK-003 | ✅ completed | Reviewed azure-principal-architect.agent.md patterns |
| TASK-004 | ✅ completed | Created agent with tools and handoffs                |
| TASK-005 | ✅ completed | Implemented 6-phase interactive workflow             |
| TASK-006 | ✅ completed | Added approval prompts for all commands              |
| TASK-007 | ✅ completed | Included error, performance, App Insights queries    |
| TASK-008 | ✅ completed | Added handoffs to Architect and Docs agents          |
| TASK-009 | ✅ completed | Updated this processing log                          |

## Summary

**✅ Agent Implementation Complete**

### File Created

| File                                                          | Purpose                      | Lines |
| ------------------------------------------------------------- | ---------------------------- | ----- |
| `.github/agents/azure-resource-health-diagnostician.agent.md` | Interactive diagnostic agent | ~600  |

### Agent Features

| Feature                      | Implementation                                                    |
| ---------------------------- | ----------------------------------------------------------------- |
| **Approval-First Execution** | All commands presented with explanation before execution          |
| **Single-Resource Focus**    | One resource at a time for thorough analysis                      |
| **6-Phase Workflow**         | Discovery → Health → Logs → Classification → Remediation → Report |
| **Interactive Checkpoints**  | User confirmation at each phase transition                        |
| **KQL Query Library**        | Error, performance, App Insights diagnostic queries               |
| **Report Generation**        | Saves to `agent-output/{project}/08-resource-health-report.md`    |
| **Handoffs**                 | Azure Principal Architect, Workload Documentation Generator       |

### Design Decisions Applied

| Decision          | Choice                    | Rationale                |
| ----------------- | ------------------------- | ------------------------ |
| Command Execution | Approval-first            | Safety over speed        |
| Resource Scope    | Single-resource           | Thorough analysis        |
| Report Location   | `agent-output/{project}/` | Consistent with workflow |

### How to Use

1. Open Copilot: `Ctrl+Alt+I`
2. Select agent: **Azure Resource Health Diagnostician**
3. Prompt example: "Diagnose the health of my Static Web App stapp-rebel-tactical-prod-weu"
4. Follow interactive prompts through 6 phases
5. Review generated report in `agent-output/{project}/`

---

_Agent ready for use. Please review and remove this file when done._

2. `agent-output/rebel-tactical-platform/04-governance-constraints.json` ✅ NEW
3. `agent-output/rebel-tactical-platform/04-implementation-plan.md` ✅ RECREATED
4. `agent-output/rebel-tactical-platform/README.md` ✅ UPDATED

---

_Please review the summary and delete this file when done._
