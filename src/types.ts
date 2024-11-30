export interface Result {
	performance: number,
	accessibility: number,
	bestPractices: number,
	seo: number,
	webVitals: {
		fcp: number,
		lcp: number,
	},
}