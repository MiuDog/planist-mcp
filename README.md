<div align="center">

# 🔌 Planist-MCP
### Model Context Protocol (MCP) Server for Planist APOS
**Connect Claude, Cursor, and External AI Agents directly to your Planist Workspace.**

<p align="center">
  <em>An out-of-process, privacy-focused, Model Context Protocol server enabling AI models to inspect, read, and propose edits across Planist's 6 hyper-fused page types and reactive variable substrate.</em>
</p>

[![MCP Spec](https://img.shields.io/badge/MCP%20Spec-1.5.0-blue?style=flat-square&logo=anthropic)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)

---

</div>

## 🌟 Overview

**Planist-MCP** is the official [Model Context Protocol](https://modelcontextprotocol.io/) server for **[Planist](https://github.com/MiuDog/Planist)** — the Agentic Project Operating System (APOS).

By isolating AI interactions into an out-of-process MCP server, Planist ensures maximum data security, zero in-process script execution vulnerabilities, and seamless compatibility with Claude Desktop, Cursor, and custom AI agent frameworks.

```text
┌────────────────────────────────────────────────────────┐
│ External AI Ecosystem (Out-of-Process)                 │
│                                                        │
│  [ Claude / LLM ] ──> [ Planist-MCP Server (TS) ]     │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON-RPC stdio / HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│ Planist Desktop Application (APOS)                     │
│                                                        │
│  1. Host-Local API Listener (127.0.0.1:8080)           │
│  2. AI Grant Validation & Proposal Review Panel        │
│  3. ProjectAuthority (Typed Transaction Write-Back)    │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Features & Capabilities

- 📄 **Doc (`docs`)**: Inspect Markdown block structures, append new sections, and propose document diffs (`LivePageProposal`).
- 📊 **Sheet (`sheet`)**: Read/write specific cell ranges (`A1:D20`), evaluate formulas, and trigger data-driven chart projections.
- 🖼️ **Slide (`slide`)**: Generate structural Markdown slides with rendering hints and speaker notes (`Speaker Notes`).
- 🎨 **Edgeless (`edgeless`)**: Query spatial node cards, supply approximate node placements (letting Planist's internal engine layout the canvas), and draw vector ink strokes.
- 📐 **Design (`design`)**: Query exact UI element trees, create vector frames with exact geometry `(x, y, w, h)`, and export SVG previews.
- 📈 **Dashboard (`dashboard`)**: Select components, bind metric data variables, and set up dynamic KPI dashboard grids.
- ⚡ **Reactive Variable Substrate**: List, inspect, and update project-scoped reactive variables (`planist_update_variable`), driving real-time updates across bound Sheets, Dashboards, and Docs!

---

## 🛠️ MCP Tools Specification

### 1. Workspace & Page Lifecycle Tools

| Tool Name | Parameters | Description |
|---|---|---|
| `planist_list_pages` | `kindFilter?` | List accessible pages in the workspace (filtered by `docs`, `sheet`, `slide`, `edgeless`, `design`, `dashboard`). |
| `planist_read_page` | `pageId` | Read the AST, Markdown, or structural block representation of a specific page by its Stable ID. |
| `planist_propose_page_edit` | `pageId, summary, markdownContent` | Submit a structured page edit proposal (`LivePageProposal`) for human review in Planist. |

### 2. Reactive Project Variable Tools

| Tool Name | Parameters | Description |
|---|---|---|
| `planist_list_variables` | *None* | List all reactive typed variables in the Project Variable Substrate. |
| `planist_get_variable` | `variableKey` | Fetch current value, type contract, and UI binding references for a variable. |
| `planist_update_variable` | `variableKey, value, summary?` | **Update a project variable value**, driving automatic reactive UI updates across bound Sheet cells, Dashboard KPIs, and Docs (Execute ➔ Variable ➔ Plan loop). |

---

## 📦 Installation & Build

```bash
# Clone the repository
git clone https://github.com/MiuDog/planist-mcp.git
cd planist-mcp

# Install dependencies
npm install

# Build TypeScript code to dist/
npm run build
```

---

## ⚙️ Configuration & Setup

### Integrating with Claude Desktop

Add the following to your `claude_desktop_config.json` (located at `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "planist-mcp": {
      "command": "node",
      "args": ["C:/Projects/planist-mcp/dist/index.js"],
      "env": {
        "PLANIST_API_HOST": "http://127.0.0.1:8080",
        "PLANIST_GRANT_TOKEN": "<YOUR_LOCAL_GRANT_TOKEN>"
      }
    }
  }
}
```

---

## 🔒 Security & Human-in-the-Loop Governance

- **Out-of-Process Isolation**: The MCP server runs outside Planist's main Flutter execution thread.
- **Local Host Listener**: API connections are strictly bound to `127.0.0.1` ([ADR-0029](https://github.com/MiuDog/Planist/blob/main/spec/decisions/0029-authority-package-transport-and-persistence-topology.md)).
- **Human Approval**: Edit proposals sent via `planist_propose_page_edit` must be approved by human users in the Planist Review Panel unless authorized by an active AI Capability Grant ([ADR-0034](https://github.com/MiuDog/Planist/blob/main/spec/decisions/0034-ai-capability-grants-executor-relay-and-usage.md)).

---

<div align="center">

**Planist-MCP — Empowering Intelligent Collaboration for Planist.**  
[Planist Core Repository](https://github.com/MiuDog/Planist) • [MCP Protocol Docs](https://modelcontextprotocol.io/)

</div>
