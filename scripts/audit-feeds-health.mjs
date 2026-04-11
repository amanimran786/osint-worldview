#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const TIMEOUT_MS = 15000;

async function testUrl(url, name, options = {}) {
  process.stdout.write(`  ${name}... `);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeout || TIMEOUT_MS);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WorldView/1.0)',
        ...options.headers,
      },
    });
    
    clearTimeout(timer);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`✅ ${response.status} (${contentType?.split(';')[0] || 'unknown'})`);
      return true;
    } else {
      console.log(`⚠️  ${response.status}`);
      return response.status !== 404;
    }
  } catch (e) {
    console.log(`❌ ${e.name === 'AbortError' ? 'TIMEOUT' : e.message}`);
    return false;
  }
}

async function runAudit() {
  console.log('\n🌍 WorldView Feed Health Audit\n');
  
  const results = {
    critical: [],
    warnings: [],
    passing: [],
  };

  // Military/Strategic feeds
  console.log('📍 Military & Strategic Feeds:');
  results.critical.push(await testUrl(
    'https://opensky-network.org/api/states/all?lamin=10&lamax=66&lomin=9&lomax=66',
    'OpenSky ADS-B (Western)',
    { timeout: 20000 }
  ) ? 'pass' : 'fail:adsb-western');
  
  results.critical.push(await testUrl(
    'https://opensky-network.org/api/states/all?lamin=4&lamax=44&lomin=104&lomax=133',
    'OpenSky ADS-B (Pacific)',
    { timeout: 20000 }
  ) ? 'pass' : 'fail:adsb-pacific');

  // Intelligence feeds
  console.log('\n📊 Intelligence & Events:');
  results.critical.push(await testUrl(
    'https://api.gdeltproject.org/api/v2/doc/doc?query=&mode=artlist&maxrecords=100&format=json',
    'GDELT Events API',
    { timeout: 15000 }
  ) ? 'pass' : 'fail:gdelt');

  results.critical.push(await testUrl(
    'https://api.acleddata.com/api/events/?limit=10&event_type=Protests&year=2025',
    'ACLED Events (limit test)',
    { timeout: 10000 }
  ) ? 'pass' : 'fail:acled');

  // Maritime feeds
  console.log('\n⛵ Maritime & Vessel Tracking:');
  results.critical.push(await testUrl(
    'https://www.marinetraffic.com/',
    'MarineTraffic Gateway',
    { timeout: 10000 }
  ) ? 'pass' : 'fail:marinetraffic');

  // Environmental feeds
  console.log('\n🌡️  Environmental & Climate:');
  results.critical.push(await testUrl(
    'https://firms.modaps.eosdis.nasa.gov/api/v1/bounds/shapefile?dataset=MODIS_NOAA20_NRT&south=-90&west=-180&north=90&east=180&limit=10',
    'FIRMS Fire Data (NASA)',
    { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } }
  ) ? 'pass' : 'fail:firms');

  results.critical.push(await testUrl(
    'https://data.ncei.noaa.gov/api/v1/datasets',
    'NOAA Climate Data',
    { timeout: 10000 }
  ) ? 'pass' : 'fail:noaa');

  // News & RSS feeds
  console.log('\n📰 News & RSS Feeds:');
  results.critical.push(await testUrl(
    'https://feeds.reuters.com/reuters/worldNews',
    'Reuters World Feed',
    { timeout: 10000 }
  ) ? 'pass' : 'fail:reuters');

  results.critical.push(await testUrl(
    'https://feeds.bloomberg.com/markets/news.rss',
    'Bloomberg Markets',
    { timeout: 10000 }
  ) ? 'pass' : 'fail:bloomberg');

  // Summary
  console.log('\n' + '='.repeat(60));
  const passed = results.critical.filter(r => r === 'pass').length;
  const total = results.critical.length;
  const health = Math.round((passed / total) * 100);
  
  console.log(`\n📈 Feed Health: ${passed}/${total} (${health}%)`);
  const failures = results.critical.filter(r => r !== 'pass');
  if (failures.length > 0) {
    console.log('\n⚠️  Failed Feeds:');
    failures.forEach(f => console.log(`   - ${f}`));
  }
  
  process.exit(health < 70 ? 1 : 0);
}

runAudit().catch(e => {
  console.error('Audit error:', e);
  process.exit(1);
});
