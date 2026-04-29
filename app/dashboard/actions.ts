"use server";

export async function checkMcpStatus() {
  try {
    const baseUrl = process.env.MCP_KALI_SERVER_URL || "http://127.0.0.1:5000";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${baseUrl}/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return { connected: true };
    }
  } catch (error) {
    // Ignore errors
  }
  
  return { connected: false };
}
