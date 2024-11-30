import lighthouse, { type Flags } from "npm:lighthouse";
import * as chromeLauncher from "npm:chrome-launcher";
import ora from "npm:ora";
import inquirer from "npm:inquirer";
import { Result } from "./types.ts";
import { calcAvgMetrics, initLogger, normalizeScore } from "./utils.ts";
import { prompts, throttlingConfigs } from "./constants.ts";

const runLighthouseTest = async (url: string, runs: number) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const resultsByConfig: Record<string, Result[]> = {};
  let totalTime = 0;

  for (const { label, options } of throttlingConfigs) {
    const results: Result[] = [];
    const spinner = ora().start();
    for (let i = 0; i < runs; i++) {
      spinner.text = `Running test ${i + 1}/${runs} for ${label}...`;
      const start = Date.now();
      const result = await lighthouse(
        url,
        {
          ...options,
          logLevel: "silent",
          output: "json",
          port: chrome.port,
        } as Flags,
      );
      const duration = Date.now() - start;
      totalTime += duration;

      if (result) {
        const { categories, audits } = result.lhr;
        results.push({
          performance: normalizeScore(categories.performance.score),
          accessibility: normalizeScore(categories.accessibility.score),
          bestPractices: normalizeScore(categories["best-practices"].score),
          seo: normalizeScore(categories.seo.score),
          webVitals: {
            fcp: audits["first-contentful-paint"].numericValue || 0,
            lcp: audits["largest-contentful-paint"].numericValue || 0,
          },
        });
      }
    }
    resultsByConfig[label] = results;
    spinner.clear();
    console.log(`✅ Completed tests for ${label}`);
  }

  chrome.kill();

  console.log(`\n⏰ Total runtime: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`📊 Average results for ${runs} runs:`);

  for (const label in resultsByConfig) {
    const results = resultsByConfig[label];
    const avgMetrics = calcAvgMetrics(results);
    const configEmoji = throttlingConfigs.find((config) =>
      config.label === label
    )?.emoji || "";

    console.log(`\n${configEmoji} ${label}:`);
    console.log(
      `  - Performance: ${(avgMetrics.performance / runs).toFixed(2)}`,
    );
    console.log(
      `  - Accessibility: ${(avgMetrics.accessibility / runs).toFixed(2)}`,
    );
    console.log(
      `  - Best Practices: ${(avgMetrics.bestPractices / runs).toFixed(2)}`,
    );
    console.log(`  - SEO: ${(avgMetrics.seo / runs).toFixed(2)}`);
    console.log(`  - FCP: ${(avgMetrics.webVitals.fcp / runs).toFixed(2)}s`);
    console.log(`  - LCP: ${(avgMetrics.webVitals.lcp / runs).toFixed(2)}s`);
  }
};

const main = async () => {
  const { resetLogger } = initLogger();
  const { url, runs } = await inquirer.prompt(prompts);
  console.log("\n🚀 Running Lighthouse tests...");
  await runLighthouseTest(url, runs);
  resetLogger();
  Deno.exit(0);
};

const shutdown = (signal: string) => {
  console.log(`\n👋 Received ${signal}. Shutting down gracefully...`);
  Deno.exit(0);
};

addEventListener("SIGINT", () => shutdown("SIGINT"));

main().catch((error) => {
  console.error("🚨 An error occurred:", error);
  Deno.exit(1);
});
