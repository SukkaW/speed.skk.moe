import useSWRImmutable from 'swr/immutable';

/** Connection details served by the Cloudflare Snippet in front of the deployed site. */
export interface Geo {
  ip: string,
  country: string,
  country_code: string,
  region: string,
  city: string,
  timezone: string,
  latitude: number | null,
  longitude: number | null,
  isp: string,
  organization: string,
  asn_organization: string,
  asn: number | null
}

const GEO_URL = '/_sukka/api/geo';

// Only the deployed site has the Snippet in front of it; the dev server answers with this instead.
const SAMPLE: Geo = {
  ip: '203.0.113.42',
  country: 'Japan',
  country_code: 'JP',
  region: 'Tokyo',
  city: 'Chiyoda',
  timezone: 'Asia/Tokyo',
  latitude: 35.6938,
  longitude: 139.7536,
  isp: 'Example Networks',
  organization: 'Example Networks',
  asn_organization: 'Example Networks',
  asn: 64496
};

async function fetchGeo(url: string): Promise<Geo> {
  if (process.env.NODE_ENV === 'development') return SAMPLE;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Geo lookup failed: ${response.status}`);
  return response.json() as Promise<Geo>;
}

export function useGeo() {
  return useSWRImmutable(GEO_URL, fetchGeo);
}
