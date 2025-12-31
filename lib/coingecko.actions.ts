'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  // 🔥 HARD GUARD: CoinGecko OHLC MUST NOT receive interval
  if (endpoint.includes('/ohlc') && params && 'interval' in params) {
    delete (params as any).interval;
  }

  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  console.log('FETCH:', url); // keep temporarily

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${response.status}: ${errorBody.error || response.statusText}`);
  }

  return response.json();
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.log(error);
      return fallback;
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>('/onchain/search/pools', { query: id });

    return poolData.data?.[0] ?? fallback;
  } catch {
    return fallback;
  }
}
