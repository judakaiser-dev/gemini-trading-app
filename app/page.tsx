'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, Download, TrendingUp, TrendingDown } from 'lucide-react';

const COINS = [
  { id: 'bitcoin', symbol: 'BTC', color: 'from-yellow-400 to-yellow-700' },
  { id: 'ethereum', symbol: 'ETH', color: 'from-blue-400 to-blue-700' },
  { id: 'binancecoin', symbol: 'BNB', color: 'from-pink-400 to-pink-700' },
  { id: 'cardano', symbol: 'ADA', color: 'from-purple-400 to-purple-700' },
  { id: 'ripple', symbol: 'XRP', color: 'from-cyan-400 to-cyan-700' }
];

function calcRSI( number[], period = 14): number {
  if (data.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[data.length - i] - data[data.length - i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function calcMACD( number[]): number {
  const ema = (period: number) => {
    let k = 2 / (period + 1);
    let result = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < data.length; i++) result = data[i] * k + result * (1 - k);
    return result;
  };
  return ema(12) - ema(26);
}

function getSignal(rsi: number, macd: number): string {
  if (rsi < 30 && macd > 0) return 'STRONG BUY';
  if (rsi < 40 && macd > 0) return 'BUY';
  if (rsi > 70 && macd < 0) return 'STRONG SELL';
  if (rsi > 60 && macd < 0) return 'SELL';
  return 'HOLD';
}

type TradeLog = {
  timestamp: string;
  symbol: string;
  price: number;
  signal: string;
  volume: number;
  rsi: number;
  macd: number;
};

const GeminiTradingApp: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [tradeLog, setTradeLog] = useState<TradeLog[]>([]);
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const fetchAllData = async () => {
    try {
      const ids = COINS.map(c => c.id).join(',');
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?ids=${ids}&vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=true&price_change_percentage=24h`
      );
      const data = await res.json();

      const newData: Record<string, any> = {};
      data.forEach((coin: any, idx: number) => {
        const symbol = COINS[idx]?.symbol || '';
        const history = coin.sparkline_in_7d?.price || [coin.current_price];
        const rsi = calcRSI(history);
        const macd = calcMACD(history);
        const signal = getSignal(rsi, macd);

        newData[symbol] = {
          price: coin.current_price,
          volume: coin.total_volume || 0,
          rsi,
          macd,
          signal,
          change24h: coin.price_change_percentage_24h || 0
        };
      });

      setPrices(newData);
      setLoading(false);

      const now = new Date().toLocaleTimeString('de-DE');
      Object.entries(newData).forEach(([symbol, coinData]) => {
        setTradeLog(prev => [
          {
            timestamp: now,
            symbol,
            price: coinData.price,
            signal: coinData.signal,
            volume: coinData.volume,
            rsi: parseFloat(coinData.rsi.toFixed(2)),
            macd: parseFloat(coinData.macd.toFixed(2))
          },
          ...prev.slice(0, 49)
        ]);
      });
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    const headers = ['Zeit', 'Symbol', 'Preis (USD)', 'Signal', 'Volumen', 'RSI', 'MACD'];
    const rows = tradeLog.map(t => [
      t.timestamp,
      t.symbol,
      t.price.toFixed(2),
      t.signal,
      Math.round(t.volume).toLocaleString(),
      t.rsi,
      t.macd
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className={`min-h-screen py-8 px-4 transition-colors ${dark ? 'bg-slate-950 text-white' : 'bg-white text-black'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 p-6 rounded-xl border" style={{
          borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
        }}>
          <div>
            <h1 className="text-4xl font-bold">🚀 Gemini Trading App</h1>
            <p className="text-sm opacity-60 mt-1">Crypto Trading Dashboard mit Echtzeit-Analyse | Powered by CoinGecko</p>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="p-3 rounded-full hover:bg-white/10 transition-all"
          >
            {dark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {COINS.map((coin) => {
            const p = prices[coin.symbol];
            return (
              <div
                key={coin.symbol}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:scale-105`}
                style={{
                  borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  background: `linear-gradient(135deg, ${coin.color.split(' ')[1]} 0%, rgba(255,255,255,0.05) 100%)`
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xl">{coin.symbol}</span>
                  {p?.signal?.includes('BUY') ? (
                    <TrendingUp className="text-green-500" />
                  ) : p?.signal?.includes('SELL') ? (
                    <TrendingDown className="text-red-500" />
                  ) : null}
                </div>
                <div className="text-2xl font-bold mb-2">${p?.price?.toFixed(2) || '...'}</div>
                <div className="text-xs opacity-70 mb-2">24h: {p?.change24h?.toFixed(2)}%</div>
                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  p?.signal?.includes('BUY') ? 'bg-green-500/30 text-green-300' :
                  p?.signal?.includes('SELL') ? 'bg-red-500/30 text-red-300' :
                  'bg-gray-500/30 text-gray-300'
                }`}>
                  {p?.signal || 'LOADING'}
                </div>
                <div className="text-xs opacity-50 mt-2">RSI: {p?.rsi?.toFixed(1)} | MACD: {p?.macd?.toFixed(3)}</div>
              </div>
            );
          })}
        </div>

        {/* Trade History */}
        <div className="p-6 rounded-xl border" style={{
          borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
        }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📊 Trade History ({tradeLog.length})</h2>
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <th className="text-left py-2 px-2">Zeit</th>
                  <th className="text-left py-2 px-2">Symbol</th>
                  <th className="text-left py-2 px-2">Preis</th>
                  <th className="text-left py-2 px-2">Signal</th>
                  <th className="text-left py-2 px-2">RSI</th>
                  <th className="text-left py-2 px-2">MACD</th>
                </tr>
              </thead>
              <tbody>
                {tradeLog.length > 0 ? (
                  tradeLog.slice(0, 10).map((log, idx) => (
                    <tr key={idx} className="border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                      <td className="py-2 px-2 text-xs">{log.timestamp}</td>
                      <td className="py-2 px-2 font-semibold">{log.symbol}</td>
                      <td className="py-2 px-2">${log.price.toFixed(2)}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.signal.includes('BUY') ? 'bg-green-500/30 text-green-300' :
                          log.signal.includes('SELL') ? 'bg-red-500/30 text-red-300' :
                          'bg-gray-500/30 text-gray-300'
                        }`}>
                          {log.signal}
                        </span>
                      </td>
                      <td className="py-2 px-2">{log.rsi}</td>
                      <td className="py-2 px-2">{log.macd}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 opacity-50">
                      {loading ? 'Daten laden...' : 'Keine Trades noch'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs opacity-50">
          <p>Gemini Trading App © 2025 | Real-time Crypto Data | CoinGecko API | Alle 30 Sekunden aktualisiert</p>
        </div>
      </div>
    </main>
  );
};

export default GeminiTradingApp;
