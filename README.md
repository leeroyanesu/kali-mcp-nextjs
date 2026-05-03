# Kali AI - MCP Pentesting Assistant

Kali AI is a specialized AI-powered pentesting assistant designed for security professionals and ethical hackers. It integrates directly with local Kali Linux tools using the **Model Context Protocol (MCP)**, providing an autonomous and data-driven approach to security assessments.

![Kali AI Banner](app/(chat)/opengraph-image.png)

## 🚀 Key Features

- **MCP Integration**: Direct connection to the `kali-mcp-server` for executing real-time security scans, Nmap audits, and system analysis.
- **Local-First Persistence**: 
  - **Dexie.js**: Robust client-side storage for instant message history and offline support.
  - **JSON Storage**: Server-side persistence using a local filesystem database (`.local_db/`), eliminating the need for complex external databases.
- **Security Reports (PDF)**: Server-side PDF generation using Puppeteer for professional, high-quality export of chat history and security findings.
- **Privacy Centric**: Fully decoupled from external authentication providers (Vercel/NextAuth). Operates as a local-first application.
- **Advanced UI**: 
  - **Artifact Panel**: Side-by-side view for security reports, scan results, and code.
  - **Theme Support**: Sleek, security-focused aesthetics with support for both **Light and Dark modes**.
  - **Adaptive Header**: Hydration-safe UI with a dynamic layout.

## 🛠 Technology Stack

- **Framework**: [Next.js 16+](https://nextjs.org) (App Router)
- **AI Integration**: [AI SDK](https://ai-sdk.dev) using **Claude 3.5 Sonnet** (via Anthropic).
- **Styling**: Tailwind CSS & Lucide Icons.
- **Storage**: Dexie.js (Client) + Local JSON FS (Server).
- **PDF Engine**: Puppeteer.

## 🏁 Getting Started

### Prerequisites

- Node.js 20+
- [Kali MCP Server](https://github.com/leeroyanesu/kali-mcp-server) running locally.

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd kali-mcp-nextjs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your keys:
   ```bash
   ANTHROPIC_API_KEY=your_key_here
   MCP_KALI_SERVER_URL=http://[IP_ADDRESS][PORT]
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

MIT License - feel free to use and contribute!

---
*Powered by the Kali MCP ecosystem.*
