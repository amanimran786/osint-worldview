import { strict as assert } from 'node:assert';
import test from 'node:test';
import handler from '../api/download.js';

const RELEASES_PAGE = 'https://github.com/amanimran786/osint-worldview/releases/latest';

function makeGitHubReleaseResponse(assets) {
  return new Response(JSON.stringify({ assets }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

test('matches full variant without selecting a specialized WorldView asset', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => makeGitHubReleaseResponse([
    {
      name: 'WorldView Tech_2.6.1_amd64.AppImage',
      browser_download_url: 'https://downloads.example/WorldView-Tech.AppImage',
    },
    {
      name: 'WorldView_2.6.1_amd64.AppImage',
      browser_download_url: 'https://downloads.example/WorldView.AppImage',
    },
  ]);

  try {
    const response = await handler(
      new Request('https://osint-worldview-cyan.vercel.app/api/download?platform=linux-appimage&variant=full')
    );
    assert.equal(response.status, 302);
    assert.equal(
      response.headers.get('location'),
      'https://downloads.example/WorldView.AppImage'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('matches tech variant for WorldView Tech asset names', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => makeGitHubReleaseResponse([
    {
      name: 'WorldView Tech_2.6.1_amd64.AppImage',
      browser_download_url: 'https://downloads.example/WorldView-Tech.AppImage',
    },
    {
      name: 'WorldView_2.6.1_amd64.AppImage',
      browser_download_url: 'https://downloads.example/WorldView.AppImage',
    },
  ]);

  try {
    const response = await handler(
      new Request('https://osint-worldview-cyan.vercel.app/api/download?platform=linux-appimage&variant=tech')
    );
    assert.equal(response.status, 302);
    assert.equal(
      response.headers.get('location'),
      'https://downloads.example/WorldView-Tech.AppImage'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('matches finance variant for WorldView Markets asset names', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => makeGitHubReleaseResponse([
    {
      name: 'WorldView Markets_2.6.1_amd64.AppImage',
      browser_download_url: 'https://downloads.example/WorldView-Markets.AppImage',
    },
  ]);

  try {
    const response = await handler(
      new Request('https://osint-worldview-cyan.vercel.app/api/download?platform=linux-appimage&variant=finance')
    );
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), 'https://downloads.example/WorldView-Markets.AppImage');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('falls back to release page when requested variant has no matching asset', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => makeGitHubReleaseResponse([
    {
      name: 'WorldView_2.6.1_amd64.AppImage',
      browser_download_url: 'https://downloads.example/WorldView.AppImage',
    },
  ]);

  try {
    const response = await handler(
      new Request('https://osint-worldview-cyan.vercel.app/api/download?platform=linux-appimage&variant=finance')
    );
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), RELEASES_PAGE);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
