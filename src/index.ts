import lighthouse, { type Flags } from 'npm:lighthouse';
import * as chromeLauncher from 'npm:chrome-launcher';
import ora from 'npm:ora';
import inquirer from 'npm:inquirer';
import { Result } from './types.ts';
import { calcAvgMetrics, normalizeScore } from './utils.ts';
import { prompts } from './constants.ts';

const runLighthouseTest = async (url: string, runs: number) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options: Flags = { 
    logLevel: 'silent', 
    output: 'json', 
    port: chrome.port, 
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] ,
    formFactor: 'mobile',
    throttlingMethod: 'devtools',
    throttling: {
      rttMs: 100,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 4,
    },
    screenEmulation: {
      mobile: true,
    },
  };
  const spinner = ora('Running Lighthouse test').start();
  const results: Result[] = [];
  const performanceTips = new Set<string>();
  let totalTime = 0;

  for (let i = 0; i < runs; i++) {
    spinner.text = `Running test ${i + 1} of ${runs}...`;
    const start = Date.now();
    const result = await lighthouse(url, options);
    const duration = Date.now() - start;
    totalTime += duration;

    if (result) {
      spinner.text = `Test ${i + 1} completed in ${duration / 1000}s`;
      const { categories, audits } = result.lhr;

      const performance = normalizeScore(categories.performance.score);
      const accessibility = normalizeScore(categories.accessibility.score);
      const bestPractices = normalizeScore(categories['best-practices'].score);
      const seo = normalizeScore(categories.seo.score);
      results.push({
        performance,
        accessibility,
        bestPractices,
        seo,
        webVitals: {
          fcp: audits['first-contentful-paint'].numericValue || 0,
          lcp: audits['largest-contentful-paint'].numericValue || 0,
        },
      });

      for (const key in audits) {
        const audit = audits[key];
        if (audit.score !== 1 && audit.details) {
          const {details} = audit;
          if ('displayValue' in details && details.displayValue) {
            performanceTips.add(`${audit.title}: ${details.displayValue}`);
          } else if (audit.description) {
            performanceTips.add(`${audit.title}: ${audit.description}`);
          }
        }
      }
      
    } else {
      spinner.text = `❌ Test ${i + 1} failed`;
    }
  }

  spinner.succeed('✅ All tests completed');
  chrome.kill();

  const avgMetrics = calcAvgMetrics(results);

  console.log('\n🚀 Test results');
  console.log(`  ⏰ Total runtime: ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log('  📊 Metrics (in seconds):');
  console.log(`    - Performance: ${(avgMetrics.performance / runs).toFixed(2)}`);
  console.log(`    - Accessibility: ${(avgMetrics.accessibility / runs).toFixed(2)}`);
  console.log(`    - Best Practices: ${(avgMetrics.bestPractices / runs).toFixed(2)}`);
  console.log(`    - SEO: ${(avgMetrics.seo / runs).toFixed(2)}`);
  console.log('  🌐 Web Vitals:');
  console.log(`    - FCP: ${(avgMetrics.webVitals.fcp / runs).toFixed(2)}s`);
  console.log(`    - LCP: ${(avgMetrics.webVitals.lcp / runs).toFixed(2)}s`);

  console.log('\n📋 Performance Enhancement Tips:');
  performanceTips.forEach((tip) => console.log(`  - ${tip}`));
};


const main = async () => {
  const { url, runs } = await inquirer.prompt(prompts);
  await runLighthouseTest(url, runs);
  Deno.exit(0);
};

const shutdown = (signal: string) => {
  console.log(`\n👋 Received ${signal}. Shutting down gracefully...`);
  Deno.exit(0);
};

addEventListener('SIGINT', () => shutdown('SIGINT'));

main().catch((error) => {
  console.error('🚨 An error occurred:', error);
  Deno.exit(1);
});
