// Non-sebuf: returns XML/HTML, stays as standalone Vercel function
export const config = { runtime: 'edge' };

const RELEASES_URL = 'https://api.github.com/repos/amanimran786/osint-worldview/releases/latest';
const REPOSITORY_URL = 'https://github.com/amanimran786/osint-worldview';
const CURRENT_VERSION = '2.6.1';

function buildFallbackResponse() {
  return new Response(JSON.stringify({
    version: CURRENT_VERSION,
    tag: '',
    url: REPOSITORY_URL,
    prerelease: false,
    releaseAvailable: false,
    source: 'build',
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=60, stale-if-error=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export default async function handler() {
  try {
    const res = await fetch(RELEASES_URL, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'WorldView-Version-Check',
      },
    });

    if (!res.ok) {
      return buildFallbackResponse();
    }

    const release = await res.json();
    const tag = release.tag_name ?? '';
    const version = tag.replace(/^v/, '');

    return new Response(JSON.stringify({
      version,
      tag,
      url: release.html_url,
      prerelease: release.prerelease ?? false,
      releaseAvailable: true,
      source: 'github-release',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60, stale-if-error=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return buildFallbackResponse();
  }
}
