import { fetcher } from './coingecko.actions';

export function fetchOHLC(coinId: string, days: 1 | 7 | 14 | 30 | 90 | 180 | 365 | 'max') {
  return fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
    vs_currency: 'usd',
    days,
  });
}

class MarketChartData {}

export function fetchMarketChart(coinId: string, days: number) {
  return fetcher<MarketChartData>(`/coins/${coinId}/market_chart`, {
    vs_currency: 'usd',
    days,
    interval: 'daily',
  });
}
