import { suppressedLogs } from "./constants.ts";
import { Result } from "./types.ts";

export const calcAvgMetrics = (results: Result[]) => {
  return results.reduce(
    (acc, curr) => {
      acc.performance += curr.performance;
      acc.accessibility += curr.accessibility;
      acc.bestPractices += curr.bestPractices;
      acc.seo += curr.seo;
      acc.webVitals.fcp += curr.webVitals.fcp;
      acc.webVitals.lcp += curr.webVitals.lcp;
      return acc;
    },
    {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      webVitals: {
        fcp: 0,
        lcp: 0,
      },
    },
  );
};

export const normalizeScore = (score: number | null) => {
  return score ? Math.round(score * 100) : 0;
};

export const initLogger = () => {
  const consoleMethods = ["log", "warn", "error", "info", "debug"] as const;
  type ConsoleMethod = typeof consoleMethods[number];
  const originalMethods: Partial<
    // deno-lint-ignore no-explicit-any
    Record<ConsoleMethod, (...args: any[]) => void>
  > = {};

  consoleMethods.forEach((method) => {
    originalMethods[method] = console[method];
    // deno-lint-ignore no-explicit-any
    console[method] = (...args: any[]) => {
      if (!suppressedLogs.includes(args[0]) && originalMethods[method]) {
        originalMethods[method](...args);
      }
    };
  });

  return {
    resetLogger: () => {
      consoleMethods.forEach((method) => {
        if (originalMethods[method]) {
          console[method] = originalMethods[method];
        }
      });
    },
  };
};
