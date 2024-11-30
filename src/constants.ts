import { type DistinctQuestion } from "inquirer";

export const prompts: DistinctQuestion[] = [
  {
    type: "input",
    name: "url",
    message: "Enter the URL to test:",
    validate: (input: string) => {
      const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
      if (!urlPattern.test(input)) {
        return "Please enter a valid URL";
      }
      return true;
    },
  },
  {
    type: "number",
    name: "runs",
    message: "Enter the number of runs (between 1 and 100):",
    default: 1,
    validate: (input: number | undefined) => {
      if (!input || input < 1 || input > 100) {
        return "Number of runs must be between 1 and 100";
      }
      return true;
    },
  },
];

export const throttlingConfigs = [
  {
    label: "Ideal (Good Network, Fast Device)",
    emoji: "🌟",
    options: {
      formFactor: "desktop",
      throttlingMethod: "provided",
      screenEmulation: { mobile: false },
    },
  },
  {
    label: "Average (Moderate Network, Mid-Range Device)",
    emoji: "📱",
    options: {
      formFactor: "mobile",
      throttlingMethod: "devtools",
      throttling: {
        rttMs: 70,
        throughputKbps: 5 * 1024,
        cpuSlowdownMultiplier: 2,
      },
      screenEmulation: { mobile: true },
    },
  },
  {
    label: "Worst-Case (Slow Network, Low-End Device)",
    emoji: "🐢",
    options: {
      formFactor: "mobile",
      throttlingMethod: "simulate",
      throttling: {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        cpuSlowdownMultiplier: 4,
      },
      screenEmulation: { mobile: true },
    },
  },
];

export const suppressedLogs = [
  "Warning: Not implemented: ClientRequest.options.createConnection",
  "Invalid dependency graph created, cycle detected",
];
