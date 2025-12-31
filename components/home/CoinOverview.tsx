import React from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import CandlestickChart from '@/components/CandlestickChart';
import { CoinOverviewFallback } from './fallback';
import { fetchOHLC, fetchMarketChart } from '@/lib/coingecko.safe';
import { fetcher } from '@/lib/coingecko.actions';

type Timeframe = 1 | 7 | 30 | 365;
const COIN_ID = 'bitcoin';

async function getChartData(timeframe: Timeframe) {
  if (timeframe === 1) {
    return fetchOHLC(COIN_ID, 1);
  }

  const market = await fetchMarketChart(COIN_ID, timeframe);

  return market.prices.map((p, i) => {
    const open = p[1];
    const close = market.prices[i + 1]?.[1] ?? open;
    const high = Math.max(open, close);
    const low = Math.min(open, close);

    return [p[0], open, high, low, close] as OHLCData;
  });
}

const CoinOverview = async ({ timeframe = 1 }: { timeframe?: Timeframe }) => {
  try {
    const [coin, chartData] = await Promise.all([
      fetcher<CoinDetailsData>(`/coins/${COIN_ID}`, {
        dex_pair_format: 'symbol',
      }),
      getChartData(timeframe),
    ]);

    return (
      <div id="coin-overview">
        <CandlestickChart data={chartData} coinId={COIN_ID}>
          <div className="header flex gap-3 items-center pt-2">
            <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
            <div>
              <p className="text-sm opacity-70">
                {coin.name} / {coin.symbol.toUpperCase()}
              </p>
              <h1 className="text-2xl font-bold">
                {formatCurrency(coin.market_data.current_price.usd)}
              </h1>
            </div>
          </div>
        </CandlestickChart>
      </div>
    );
  } catch (error) {
    console.error('CoinOverview error:', error);
    return <CoinOverviewFallback />;
  }
};

export default CoinOverview;
