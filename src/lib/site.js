// The canonical origin for every absolute URL the publication prints:
// canonical tags, OG/JSON-LD, feed self-links, the RSS namespace. When the
// site moves to its own domain (plan §8), this constant plus the two static
// files are the only places to touch:
//   - public/robots.txt  (the Sitemap line)
//   - public/sitemap.xml (the <loc> entries)
export const SITE_URL = "https://the-baseline.baseline-news.workers.dev";
