import { tool } from "ai";
import { z } from "zod";

const baseUrl = process.env.MCP_KALI_SERVER_URL || "http://127.0.0.1:5000";

async function fetchKaliApi(endpoint: string, method: string, body?: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return `Kali Server Error (${response.status}): ${response.statusText}`;
    }
    
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return JSON.stringify(json, null, 2);
    } catch {
      return text;
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return `Error: Kali Server connection timed out after 30 seconds. Please check if the server at ${baseUrl} is reachable.`;
    }
    return `Error connecting to Kali Server at ${baseUrl}: ${err.message}. Ensure the MCP Kali service is running and accessible on your network.`;
  }
}

export async function getKaliHttpTools() {
  return {
    nmapScan: tool({
      description: "Perform an Nmap scan for network discovery and service detection.",
      inputSchema: z.object({
        target: z.string().describe("Target IP, hostname, or network range."),
        scan_type: z.string().optional().describe("Scan type (e.g., -sV, -sS)."),
        ports: z.string().optional().describe("Ports to scan (e.g., 1-1000)."),
        additional_args: z.string().optional().describe("Additional Nmap arguments."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/nmap", "POST", params),
    }),
    sqlmapTest: tool({
      description: "Test for SQL injection vulnerabilities using SQLMap.",
      inputSchema: z.object({
        url: z.string().describe("Target URL to test."),
        data: z.string().optional().describe("POST data string."),
        additional_args: z.string().optional().describe("Additional SQLMap arguments."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/sqlmap", "POST", params),
    }),
    wpscanAnalysis: tool({
      description: "Perform a WordPress vulnerability scan using WPScan.",
      inputSchema: z.object({
        url: z.string().describe("Target WordPress URL."),
        additional_args: z.string().optional().describe("Additional WPScan arguments."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/wpscan", "POST", params),
    }),
    ffufFuzz: tool({
      description: "Fuzz web directories, vhosts, or parameters using ffuf.",
      inputSchema: z.object({
        url: z.string().describe("Target URL with FUZZ keyword."),
        mode: z.string().optional().describe("Fuzzing mode (dir, vhost, etc.)."),
        wordlist: z.string().optional().describe("Path to wordlist."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/ffuf", "POST", params),
    }),
    medusaBruteForce: tool({
      description: "Perform parallel password cracking using Medusa.",
      inputSchema: z.object({
        host: z.string().describe("Target host IP."),
        service: z.string().describe("Target service (e.g., ssh, ftp)."),
        username: z.string().optional().describe("Username to test."),
        password_file: z.string().optional().describe("Path to password list."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/medusa", "POST", params),
    }),
    startAutonomousPentest: tool({
      description: "Start a new autonomous penetration testing assessment.",
      inputSchema: z.object({
        target_network: z.string().describe("Target network or IP."),
        scope: z.array(z.string()).describe("List of allowed target networks/IPs."),
        safe_mode: z.boolean().describe("Whether to run in safe mode (non-destructive)."),
        stop_at_phase: z.string().optional().describe("Phase to stop at (e.g., vulnerability_assessment)."),
      }),
      execute: async (params) => fetchKaliApi("/api/pentest/start", "POST", params),
    }),
    continueAutonomousPentest: tool({
      description: "Continue an existing autonomous assessment to the next phase.",
      inputSchema: z.object({
        session_id: z.string().describe("The active session ID."),
      }),
      execute: async ({ session_id }) => fetchKaliApi(`/api/pentest/continue/${session_id}`, "POST"),
    }),
    checkPentestStatus: tool({
      description: "Check the status of an ongoing penetration test.",
      inputSchema: z.object({
        session_id: z.string().describe("The session ID to check."),
      }),
      execute: async ({ session_id }) => fetchKaliApi(`/api/pentest/status/${session_id}`, "GET"),
    }),
    generatePentestReport: tool({
      description: "Generate a markdown report for a completed or ongoing assessment.",
      inputSchema: z.object({
        session_id: z.string().describe("The session ID for the report."),
      }),
      execute: async ({ session_id }) => fetchKaliApi(`/api/pentest/report/${session_id}?format=markdown`, "GET"),
    }),
    runFullyAutonomous: tool({
      description: "Run a fully autonomous penetration test from start to finish without pausing.",
      inputSchema: z.object({
        target_network: z.string().describe("Target network or IP."),
        scope: z.array(z.string()).describe("List of allowed target networks/IPs."),
        safe_mode: z.boolean().describe("Whether to run in safe mode."),
      }),
      execute: async (params) => fetchKaliApi("/api/pentest/autonomous", "POST", params),
    }),
  };
}
