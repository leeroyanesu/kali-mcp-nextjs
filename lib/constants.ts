export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);
export const suggestions = [
  "Scan my local network for open ports using Nmap",
  "Write a Python script to detect SQL injection vulnerabilities",
  "Explain how to perform a man-in-the-middle attack and how to defend against it",
  "What are the top 10 OWASP vulnerabilities and how to exploit them?",
];
