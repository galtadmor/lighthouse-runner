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
			}
		}
	);
}

export const normalizeScore = (score: number | null) => {
	return score ? Math.round(score * 100) : 0;
}