import { tool } from "ai";
import { z } from "zod";
import { Agent, setGlobalDispatcher } from "undici";

// Increase Node's default fetch timeout for long-running Kali tools (45 minutes)
if (typeof setGlobalDispatcher === "function") {
  setGlobalDispatcher(new Agent({ headersTimeout: 2700000, bodyTimeout: 2700000 }));
}

const baseUrl = process.env.MCP_KALI_SERVER_URL || "http://127.0.0.1:5000";

async function fetchKaliApi(endpoint: string, method: string, body?: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2700000); // 45 minute timeout

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
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
      // Return raw output string if available, else formatted JSON
      if (json.output) return json.output;
      if (json.stdout) return json.stdout;
      return JSON.stringify(json, null, 2);
    } catch {
      return text;
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return `Error: The tool execution timed out after 45 minutes. The command is likely still running on the Kali server in the background, but the dashboard stopped waiting for the response.`;
    }
    return `Error: Connection to Kali Server failed (${err.message}). The request was sent to the server, but the connection dropped before a response was received. Check if the scan is still running in the Kali terminal.`;
  }
}

export async function getKaliHttpTools() {
  return {
    // ── Network Scanning ──────────────────────────────────────────
    nmapScan: tool({
      description: "Perform an Nmap scan for network discovery, port scanning, and service/OS detection.",
      inputSchema: z.object({
        target: z.string().describe("Target IP, hostname, or CIDR range (e.g. 192.168.1.0/24)."),
        scan_type: z.string().optional().describe("Scan flags (e.g. -sV -O -A -sS -sU)."),
        ports: z.string().optional().describe("Port range (e.g. 1-1000 or 22,80,443)."),
        additional_args: z.string().optional().describe("Extra nmap args (e.g. -T4 -Pn --script vuln)."),
      }),
      execute: async (params) => {
        // Ensure we explicitly pass additional_args without -Pn so the Kali server doesn't default to -Pn
        if (!params.additional_args) {
          params.additional_args = "-T4";
        }
        return fetchKaliApi("/api/tools/nmap", "POST", params);
      },
    }),

    enum4linuxScan: tool({
      description: "Enumerate SMB/Windows shares, users, groups and policies using Enum4linux.",
      inputSchema: z.object({
        target: z.string().describe("Target IP or hostname."),
        additional_args: z.string().optional().describe("Extra enum4linux args (e.g. -a for all)."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/enum4linux", "POST", params),
    }),

    // ── Web Vulnerability Scanning ────────────────────────────────
    niktoScan: tool({
      description: "Scan a web server for vulnerabilities, misconfigurations, and outdated software using Nikto.",
      inputSchema: z.object({
        target: z.string().describe("Target URL or IP (e.g. http://192.168.1.1)."),
        additional_args: z.string().optional().describe("Extra nikto args (e.g. -Tuning 1)."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/nikto", "POST", params),
    }),

    gobusterScan: tool({
      description: "Brute-force web directories, files, DNS subdomains, or vhosts using Gobuster.",
      inputSchema: z.object({
        url: z.string().describe("Target URL (e.g. http://192.168.1.1)."),
        mode: z.string().optional().describe("Mode: dir, dns, vhost (default: dir)."),
        wordlist: z.string().optional().describe("Wordlist path (default: /usr/share/wordlists/dirb/common.txt)."),
        additional_args: z.string().optional().describe("Extra gobuster args."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/gobuster", "POST", params),
    }),

    dirbScan: tool({
      description: "Scan a web server for hidden directories and files using Dirb.",
      inputSchema: z.object({
        url: z.string().describe("Target base URL."),
        wordlist: z.string().optional().describe("Wordlist path."),
        additional_args: z.string().optional().describe("Extra dirb args."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/dirb", "POST", params),
    }),

    wpscanAnalysis: tool({
      description: "Perform a WordPress security scan for plugins, themes, and user enumeration using WPScan.",
      inputSchema: z.object({
        url: z.string().describe("Target WordPress URL."),
        additional_args: z.string().optional().describe("Extra WPScan args (e.g. --enumerate u,p,t)."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/wpscan", "POST", params),
    }),

    ffufFuzz: tool({
      description: "Fast web fuzzer for discovering hidden files, directories, vhosts, or parameters using ffuf.",
      inputSchema: z.object({
        url: z.string().describe("Target URL with FUZZ keyword (e.g. http://target.com/FUZZ)."),
        mode: z.string().optional().describe("Fuzzing mode: dir, vhost, param."),
        wordlist: z.string().optional().describe("Wordlist path."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/ffuf", "POST", params),
    }),

    sqlmapTest: tool({
      description: "Test for SQL injection vulnerabilities and extract data using SQLMap.",
      inputSchema: z.object({
        url: z.string().describe("Target URL to test (e.g. http://target.com/page?id=1)."),
        data: z.string().optional().describe("POST data string."),
        additional_args: z.string().optional().describe("Extra sqlmap args (e.g. --dbs --batch --level=3)."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/sqlmap", "POST", params),
    }),

    // ── Exploitation ──────────────────────────────────────────────
    metasploitExploit: tool({
      description: "Execute a Metasploit exploit module against a target host.",
      inputSchema: z.object({
        module: z.string().describe("Metasploit module path (e.g. exploit/windows/smb/ms17_010_eternalblue)."),
        rhosts: z.string().describe("Target IP or hostname."),
        rport: z.number().optional().describe("Target port."),
        payload: z.string().optional().describe("Payload to use (e.g. windows/x64/meterpreter/reverse_tcp)."),
        lhost: z.string().optional().describe("Local listener IP."),
        lport: z.number().optional().describe("Local listener port."),
        additional_options: z.record(z.string()).optional().describe("Additional Metasploit options as key-value pairs."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/metasploit", "POST", params),
    }),

    // ── Password Attacks ──────────────────────────────────────────
    hydraCrack: tool({
      description: "Crack network service login credentials using Hydra (SSH, FTP, HTTP, RDP, etc.).",
      inputSchema: z.object({
        target: z.string().describe("Target IP or hostname."),
        service: z.string().describe("Service to attack (e.g. ssh, ftp, http-post-form, rdp)."),
        username: z.string().optional().describe("Single username to try."),
        username_file: z.string().optional().describe("Path to username list."),
        password_file: z.string().optional().describe("Path to password list (default: rockyou.txt)."),
        additional_args: z.string().optional().describe("Extra hydra args."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/hydra", "POST", params),
    }),

    medusaBruteForce: tool({
      description: "Parallel network login cracker using Medusa. Faster than Hydra for bulk attacks.",
      inputSchema: z.object({
        host: z.string().describe("Target host IP."),
        service: z.string().describe("Target service (e.g. ssh, ftp, http)."),
        username: z.string().optional().describe("Username to test."),
        password_file: z.string().optional().describe("Path to password list."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/medusa", "POST", params),
    }),

    johnCrack: tool({
      description: "Crack password hashes using John the Ripper.",
      inputSchema: z.object({
        hash_file: z.string().describe("Path to the file containing password hashes."),
        format: z.string().optional().describe("Hash format (e.g. md5crypt, sha512crypt, ntlm)."),
        wordlist: z.string().optional().describe("Wordlist path (default: rockyou.txt)."),
        additional_args: z.string().optional().describe("Extra john args."),
      }),
      execute: async (params) => fetchKaliApi("/api/tools/john", "POST", params),
    }),

    // ── Autonomous Pentest Orchestration ──────────────────────────
    startAutonomousPentest: tool({
      description: "Start a new AI-driven autonomous 7-phase penetration test assessment.",
      inputSchema: z.object({
        target_network: z.string().describe("Target network CIDR or IP (e.g. 192.168.1.0/24)."),
        scope: z.array(z.string()).describe("Allowed target networks/IPs list."),
        safe_mode: z.boolean().describe("Safe mode — non-destructive read-only testing."),
        stop_at_phase: z.string().optional().describe("Stop at phase name (e.g. vulnerability_assessment)."),
      }),
      execute: async (params) => fetchKaliApi("/api/pentest/start", "POST", params),
    }),

    continueAutonomousPentest: tool({
      description: "Continue an existing autonomous pentest assessment to the next phase.",
      inputSchema: z.object({
        session_id: z.string().describe("The active pentest session ID."),
      }),
      execute: async ({ session_id }) => fetchKaliApi("/api/pentest/continue", "POST", { session_id }),
    }),

    checkPentestStatus: tool({
      description: "Check the current status and progress of an ongoing penetration test.",
      inputSchema: z.object({
        session_id: z.string().describe("The session ID to check."),
      }),
      execute: async ({ session_id }) => fetchKaliApi(`/api/pentest/status/${session_id}`, "GET"),
    }),

    generatePentestReport: tool({
      description: "Generate a professional markdown security report for a completed or ongoing assessment.",
      inputSchema: z.object({
        session_id: z.string().describe("The session ID for the report."),
      }),
      execute: async ({ session_id }) => fetchKaliApi(`/api/pentest/report/${session_id}?format=markdown`, "GET"),
    }),

    runFullyAutonomous: tool({
      description: "Run a fully autonomous end-to-end penetration test (all 7 phases) without pausing.",
      inputSchema: z.object({
        target_network: z.string().describe("Target network CIDR or IP."),
        scope: z.array(z.string()).describe("Allowed target networks/IPs."),
        safe_mode: z.boolean().describe("Safe mode — non-destructive testing."),
      }),
      execute: async (params) => fetchKaliApi("/api/pentest/autonomous", "POST", params),
    }),

    kaliTerminalCommand: tool({
      description: "Execute ANY arbitrary shell command on the Kali Linux system. Use this to access any Kali tool that doesn't have a dedicated MCP tool (e.g. searchsploit, msfvenom, masscan, etc.).",
      inputSchema: z.object({
        command: z.string().describe("The full shell command to execute (e.g. 'searchsploit drupal 7')."),
      }),
      execute: async (params) => fetchKaliApi("/api/command", "POST", params),
    }),
  };
}
