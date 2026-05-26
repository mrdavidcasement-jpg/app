import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_PRICE = 69915.59; // Current BTC price
const PRICE_CHANGE_24H = 2.45; // 24h change percentage

interface BitcoinPriceState {
  price: number;
  previousPrice: number;
  priceChange: 'up' | 'down' | 'neutral';
  change24h: number;
}

export function useBitcoinPrice(): BitcoinPriceState {
  const [state, setState] = useState<BitcoinPriceState>({
    price: INITIAL_PRICE,
    previousPrice: INITIAL_PRICE,
    priceChange: 'neutral',
    change24h: PRICE_CHANGE_24H,
  });

  const priceRef = useRef(INITIAL_PRICE);

  const updatePrice = useCallback(() => {
    // Simulate small price fluctuations (±0.15%)
    const changePercent = (Math.random() - 0.5) * 0.003;
    const newPrice = priceRef.current * (1 + changePercent);
    
    setState(prev => ({
      price: newPrice,
      previousPrice: prev.price,
      priceChange: newPrice > prev.price ? 'up' : newPrice < prev.price ? 'down' : 'neutral',
      change24h: PRICE_CHANGE_24H + (Math.random() - 0.5) * 0.1,
    }));
    
    priceRef.current = newPrice;
  }, []);

  useEffect(() => {
    // Update price every 3 seconds
    const interval = setInterval(updatePrice, 3000);
    
    return () => clearInterval(interval);
  }, [updatePrice]);

  return state;
}

// Historical prices for transactions
export const HISTORICAL_PRICES = {
  2015: 350,    // BTC price in 2015
  2016: 650,    // BTC price in 2016
};

// Calculate USD value for historical transactions
export function calculateHistoricalValue(btcAmount: number, year: keyof typeof HISTORICAL_PRICES): number {
  return btcAmount * HISTORICAL_PRICES[year];
}
