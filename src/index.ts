import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configured Planist Host-local API endpoint (bound to 127.0.0.1 per ADR-0029/0035)
const PLANIST_API_HOST = process.env.PLANIST_API_HOST || "http://127.0.0.1:8080";
const PLANIST_GRANT_TOKEN = process.env.PLANIST_GRANT_TOKEN || "";

// Initialize Planist Page-Editing & Variable-Binding MCP Server
const server = new Server(
  {
    name: "planist-mcp",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tool specifications exposed to external AI models
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // --- Module 0: Workspace & Page Lifecycle ---
      {
        name: "planist_list_pages",
        description: "List all accessible pages (Docs, Sheet, Slide, Edgeless, Design, Dashboard) in the Planist project workspace.",
        inputSchema: {
          type: "object",
          properties: {
            kindFilter: {
              type: "string",
              description: "Optional filter by PageKind: docs, sheet, slide, edgeless, design, dashboard",
            },
          },
        },
      },
      {
        name: "planist_read_page",
        description: "Read the AST, Markdown, or structural block representation of a specific Planist page by its Stable ID.",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The stable ID of the Planist page to read.",
            },
          },
          required: ["pageId"],
        },
      },
      {
        name: "planist_propose_page_edit",
        description: "Submit a page edit proposal (LivePageProposal) to Planist for human review and atomic transaction write-back.",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "Target Planist page stable ID.",
            },
            summary: {
              type: "string",
              description: "Summary explanation of the proposed changes for the user.",
            },
            markdownContent: {
              type: "string",
              description: "The proposed new or replacement Markdown/block content.",
            },
          },
          required: ["pageId", "summary", "markdownContent"],
        },
      },

      // --- Reactive Variable Substrate Tools (Project-Scoped Variables) ---
      {
        name: "planist_list_variables",
        description: "List all reactive typed variables in the Project variable substrate (bound to Sheet cells, Dashboard KPIs, Docs, and Workflows).",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "planist_get_variable",
        description: "Get the current value, type contract, and binding references for a specific project variable.",
        inputSchema: {
          type: "object",
          properties: {
            variableKey: {
              type: "string",
              description: "The unique key of the project variable (e.g. 'monthly_revenue', 'user_growth_rate').",
            },
          },
          required: ["variableKey"],
        },
      },
      {
        name: "planist_update_variable",
        description: "Update a typed project variable value. This triggers reactive UI updates across bound Sheet cells, Dashboard widgets, and Docs (Execute -> Variable -> Plan loop).",
        inputSchema: {
          type: "object",
          properties: {
            variableKey: {
              type: "string",
              description: "The target variable key.",
            },
            value: {
              description: "New value matching the variable's strict type contract (number, string, boolean, JSON).",
            },
            summary: {
              type: "string",
              description: "Optional audit reason or Workflow run reference for updating the variable.",
            },
          },
          required: ["variableKey", "value"],
        },
      },
    ],
  };
});

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // --- Page Tools ---
    if (name === "planist_list_pages") {
      const response = await axios.get(`${PLANIST_API_HOST}/api/v1/pages`, {
        headers: { Authorization: `Bearer ${PLANIST_GRANT_TOKEN}` },
        params: args,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "planist_read_page") {
      const { pageId } = args as { pageId: string };
      const response = await axios.get(`${PLANIST_API_HOST}/api/v1/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${PLANIST_GRANT_TOKEN}` },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "planist_propose_page_edit") {
      const { pageId, summary, markdownContent } = args as {
        pageId: string;
        summary: string;
        markdownContent: string;
      };

      const response = await axios.post(
        `${PLANIST_API_HOST}/api/v1/pages/${pageId}/proposals`,
        {
          summary,
          proposedContent: markdownContent,
          provenance: "external-mcp-ai",
        },
        {
          headers: { Authorization: `Bearer ${PLANIST_GRANT_TOKEN}` },
        }
      );

      return {
        content: [
          {
            type: "text",
            text: `Proposal submitted successfully! Proposal ID: ${response.data.proposalId || "pending"}. Please review and approve in Planist App.`,
          },
        ],
      };
    }

    // --- Reactive Variable Substrate Tools ---
    if (name === "planist_list_variables") {
      const response = await axios.get(`${PLANIST_API_HOST}/api/v1/variables`, {
        headers: { Authorization: `Bearer ${PLANIST_GRANT_TOKEN}` },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "planist_get_variable") {
      const { variableKey } = args as { variableKey: string };
      const response = await axios.get(`${PLANIST_API_HOST}/api/v1/variables/${variableKey}`, {
        headers: { Authorization: `Bearer ${PLANIST_GRANT_TOKEN}` },
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }

    if (name === "planist_update_variable") {
      const { variableKey, value, summary } = args as {
        variableKey: string;
        value: any;
        summary?: string;
      };

      const response = await axios.put(
        `${PLANIST_API_HOST}/api/v1/variables/${variableKey}`,
        {
          value,
          summary: summary || "Updated via MCP Tool",
          provenance: "external-mcp-ai",
        },
        {
          headers: { Authorization: `Bearer ${PLANIST_GRANT_TOKEN}` },
        }
      );

      return {
        content: [
          {
            type: "text",
            text: `Reactive Variable '${variableKey}' updated successfully to: ${JSON.stringify(value)}. Bound UI views across Planist will update automatically.`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool name: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Planist Host API Call Error: ${error.response?.data?.message || error.message}`,
        },
      ],
    };
  }
});

// Launch MCP server over stdio transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Planist Reactive-Variable MCP Server running on stdio transport.");
}

run().catch((err) => {
  console.error("Fatal error starting Planist MCP Server:", err);
  process.exit(1);
});
