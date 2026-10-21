const suppliedUrl = process.argv[2] ?? process.env.SITE_URL ?? "http://127.0.0.1:3000";
let siteUrl;

try {
  siteUrl = new URL(suppliedUrl);
} catch {
  console.error("Usage: npm run smoke:site -- https://your-site.example");
  process.exit(1);
}

if (!new Set(["http:", "https:"]).has(siteUrl.protocol) || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
  console.error("Pass an HTTP or HTTPS site origin without a path, query, or fragment.");
  process.exit(1);
}

const failures = [];
const checks = [];

function check(condition, message) {
  if (condition) checks.push(message);
  else failures.push(message);
}

async function get(path) {
  try {
    const response = await fetch(new URL(path, siteUrl), { redirect: "follow", signal: AbortSignal.timeout(15_000) });
    return { response, body: await response.text() };
  } catch (error) {
    failures.push(`${path} is reachable (${error instanceof Error ? error.message : "request failed"})`);
    return null;
  }
}

const [home, projects, contact, robots, sitemap, adminLogin] = await Promise.all([
  get("/"),
  get("/projects"),
  get("/contact"),
  get("/robots.txt"),
  get("/sitemap.xml"),
  get("/admin/login"),
]);

check(home?.response.status === 200, "home page returns HTTP 200");
if (home) {
  check(home.body.includes("Skip to content") && home.body.includes('id="main-content"'), "home page exposes the keyboard skip link and target");
  check(home.body.includes("Portfolio destinations") && home.body.includes('href="/projects"') && home.body.includes('href="/contact"'), "home page exposes the map and quick Projects/Contact routes");
  const canonical = home.body.match(/<link rel="canonical" href="([^"]+)"/);
  check(Boolean(canonical && new URL(canonical[1]).origin === siteUrl.origin), "home page has a canonical URL on this site origin");
}

check(projects?.response.status === 200, "Projects returns HTTP 200");
check(contact?.response.status === 200, "Contact returns HTTP 200");

check(robots?.response.status === 200, "robots.txt returns HTTP 200");
if (robots) {
  check(robots.body.includes("Disallow: /admin") && robots.body.includes("Disallow: /media/"), "robots.txt excludes admin and media routes");
  check(robots.body.includes(new URL("/sitemap.xml", siteUrl).toString()), "robots.txt points to this site's sitemap");
}

check(sitemap?.response.status === 200, "sitemap.xml returns HTTP 200");
if (sitemap) {
  const locations = [...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  check(sitemap.body.includes("<urlset") && locations.some((location) => new URL(location).pathname === "/"), "sitemap is valid XML and includes the home page");
  check(locations.every((location) => new URL(location).origin === siteUrl.origin), "sitemap URLs use the requested site origin");
  check(locations.every((location) => !new URL(location).pathname.startsWith("/admin") && !new URL(location).pathname.startsWith("/media/")), "sitemap contains no admin or media URLs");
}

check(adminLogin?.response.status === 200, "admin login returns HTTP 200");
if (adminLogin) {
  const robotsMeta = adminLogin.body.match(/<meta name="robots" content="([^"]+)"/);
  check(Boolean(robotsMeta?.[1].includes("noindex")), "admin login is marked noindex");
}

for (const message of checks) console.log(`PASS ${message}`);
for (const message of failures) console.error(`FAIL ${message}`);
console.log(`${checks.length} passed; ${failures.length} failed.`);
if (failures.length) process.exitCode = 1;
