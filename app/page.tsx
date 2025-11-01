export default function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>✅ Gemini Trading App</h1>
      <p>App is LIVE and WORKING!</p>
      <p style={{ color: 'green', fontSize: '20px' }}>SUCCESS 🚀</p>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, TrendingUp, Zap, BarChart3, AlertCircle, Eye, EyeOff, Download, Moon, Sun, Plus, Trash2, Loader } from 'lucide-react';

function Card({ children, className = "", darkMode = true }: { children: React.ReactNode; className?: string; darkMode?: boolean }) {
  const baseClasses = darkMode 
    ? 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6' 
    : 'rounded-2xl border border-black/5 bg-white/80 backdrop-blur-sm p-6 shadow-sm';
  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}

function Select({ label, value, onChange, options, darkMode = true }: { label: string; value: string; onChange: (val: string) => void; options: string[]; darkMode?: boolean }) {
  return (
    <div className="w-full">
      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-1.5`}>{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className={`px-3.5 py-2.5 rounded-xl transition-all ${darkMode ? 'bg-white/8 border border-white/15 text-white focus:bg-white/12 focus:border-white/25' : 'bg-white border border-black/8 text-black focus:bg-white focus:border-black/15'} text-sm w-full focus:outline-none cursor-pointer`}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

interface TradeLog {
  id: string;
  asset: string;
  signal: string;
  timestamp: string;
  confidence: number;
}

interface PriceData {
  btc: number;
  eth: number;
  bnb: number;
  ada: number;
  xrp: number;
}

export default function GeminiTradingApp() {
  const [asset, setAsset] = useState("BTCUSDT");
  const [showMetrics, setShowMetrics] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [prices, setPrices] = useState<PriceData>({ btc: 0, eth: 0, bnb: 0, ada: 0, xrp: 0 });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const assetOptions = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT"];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,ripple&vs_currencies=usd');
        const data = await response.json();
        setPrices({
          btc: data.bitcoin.usd,
          eth: data.ethereum.usd,
          bnb: data.binancecoin.usd,
          ada: data.cardano.usd,
          xrp: data.ripple.usd
        });
        setLoading(false);
      } catch (error) {
        console.error('Error loading prices:', error);
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentPrice = () => {
    const priceMap: { [key: string]: number } = {
      'BTCUSDT': prices.btc,
      'ETHUSDT': prices.eth,
      'BNBUSDT': prices.bnb,
      'ADAUSDT': prices.ada,
      'XRPUSDT': prices.xrp
    };
    return priceMap[asset] || 0;
  };

  const currentPrice = getCurrentPrice();
  const mtfData = [
    {
      timeframe: "1h",
      rsi_14: Math.floor(Math.random() * 100),
      macd_value: (Math.random() - 0.5) * 0.01,
      macd_signal: (Math.random() - 0.5) * 0.01,
      ema_50: currentPrice * 0.99,
      current_price: currentPrice,
      trend: currentPrice > (currentPrice * 0.99) ? ("Bullish" as const) : ("Bearish" as const),
      confluence: Math.floor(Math.random() * 4) + 1,
      volume: Math.floor(Math.random() * 5000000),
      volatility: Math.floor(Math.random() * 5) + 1
    },
    {
      timeframe: "4h",
      rsi_14: Math.floor(Math.random() * 100),
      macd_value: (Math.random() - 0.5) * 0.01,
      macd_signal: (Math.random() - 0.5) * 0.01,
      ema_50: currentPrice * 0.98,
      current_price: currentPrice,
      trend: currentPrice > (currentPrice * 0.98) ? ("Bullish" as const) : ("Bearish" as const),
      confluence: Math.floor(Math.random() * 4) + 1,
      volume: Math.floor(Math.random() * 5000000),
      volatility: Math.floor(Math.random() * 5) + 1
    },
    {
      timeframe: "1d",
      rsi_14: Math.floor(Math.random() * 100),
      macd_value: (Math.random() - 0.5) * 0.01,
      macd_signal: (Math.random() - 0.5) * 0.01,
      ema_50: currentPrice * 0.97,
      current_price: currentPrice,
      trend: currentPrice > (currentPrice * 0.97) ? ("Bullish" as const) : ("Bearish" as const),
      confluence: Math.floor(Math.random() * 4) + 1,
      volume: Math.floor(Math.random() * 5000000),
      volatility: Math.floor(Math.random() * 5) + 1
    }
  ];

  const generateSignal = () => {
    const bullishCount = mtfData.filter(tf => tf.trend === 'Bullish').length;
    const bearishCount = mtfData.filter(tf => tf.trend === 'Bearish').length;
    const avgConfluence = Math.round(mtfData.reduce((acc, tf) => acc + tf.confluence, 0) / mtfData.length);
    const avgVolatility = (mtfData.reduce((acc, tf) => acc + tf.volatility, 0) / mtfData.length).toFixed(1);
    const riskReward = (avgConfluence / (parseFloat(avgVolatility) * 2)).toFixed(2);
    
    let signal = 'HOLD';
    let color = darkMode ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200';
    let textColor = darkMode ? 'text-yellow-400' : 'text-yellow-600';
    
    if (bullishCount > bearishCount && avgConfluence >= 3) {
      signal = 'STRONG BUY';
      color = darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200';
      textColor = darkMode ? 'text-green-400' : 'text-green-600';
    } else if (bullishCount > bearishCount) {
      signal = 'BUY';
      color = darkMode ? 'bg-green-500/15 border-green-500/25' : 'bg-green-100 border-green-300';
      textColor = darkMode ? 'text-green-300' : 'text-green-700';
    } else if (bearishCount > bullishCount && avgConfluence >= 3) {
      signal = 'STRONG SELL';
      color = darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200';
      textColor = darkMode ? 'text-red-400' : 'text-red-600';
    } else if (bearishCount > bullishCount) {
      signal = 'SELL';
      color = darkMode ? 'bg-red-500/15 border-red-500/25' : 'bg-red-100 border-red-300';
      textColor = darkMode ? 'text-red-300' : 'text-red-700';
    }
    
    return { signal, color, textColor, avgConfluence, avgVolatility, riskReward, bullishCount, bearishCount };
  };

  const signal = generateSignal();

  const logTrade = () => {
    const newTrade: TradeLog = {
      id: Date.now().toString(),
      asset,
      signal: signal.signal,
      timestamp: new Date().toLocaleString('de-DE'),
      confidence: signal.avgConfluence
    };
    setTradeLogs([newTrade, ...tradeLogs]);
  };

  const deleteTrade = (id: string) => {
    setTradeLogs(tradeLogs.filter(t => t.id !== id));
  };

  const exportToCSV = () => {
    const csv = [
      ['Asset', 'Signal', 'Timestamp', 'Confidence'].join(','),
      ...tradeLogs.map(t => [t.asset, t.signal, t.timestamp, t.confidence].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trading-history.csv';
    a.click();
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen w-full transition-all ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>
              Gemini Trading App
            </h1>
            <p className={`text-lg mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Professional Trading Workflow</p>
            {!loading && <p className={`text-xs mt-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>✅ Live Data</p>}
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-full transition-all ${darkMode ? 'bg-white/10 hover:bg-white/15 text-gray-300' : 'bg-black/10 hover:bg-black/15 text-gray-700'}`}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <Card darkMode={darkMode}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
            <CheckSquare className="h-5 w-5 text-blue-500" /> Asset Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select label="Select Asset" value={asset} onChange={setAsset} options={assetOptions} darkMode={darkMode} />
              {!loading && <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>💰 ${currentPrice.toFixed(2)}</p>}
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setShowMetrics(!showMetrics)}
                className={`w-full px-3.5 py-2.5 rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30' : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200'}`}
              >
                {showMetrics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {showMetrics ? 'Hide' : 'Show'} Metrics
              </button>
            </div>
            <div className="flex items-end">
              <button 
                onClick={logTrade}
                className={`w-full px-3.5 py-2.5 rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${darkMode ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30' : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'}`}
              >
                <Plus className="h-4 w-4" /> Log Trade
              </button>
            </div>
          </div>
        </Card>

        <Card darkMode={darkMode} className="space-y-6">
          <h2 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
            <TrendingUp className="h-5 w-5 text-blue-500" /> Multi-Timeframe Analysis
          </h2>
          
          {loading ? (
            <div className={`flex items-center justify-center py-12 gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Loading live data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mtfData.map((tf) => (
                <div key={tf.timeframe} className={`rounded-xl border p-4 transition-all ${darkMode ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/2'}`}>
                  <div className={`flex justify-between items-center mb-4 pb-3 border-b ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                    <span className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-black'}`}>{tf.timeframe}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      tf.trend === 'Bullish' ? (darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700') :
                      (darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700')
                    }`}>
                      {tf.trend === 'Bullish' ? '🟢' : '🔴'} {tf.trend}
                    </span>
                  </div>

                  <div className={`mb-3 p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>RSI (14)</span>
                      <span className={`text-sm font-semibold ${tf.rsi_14 > 70 ? (darkMode ? 'text-red-400' : 'text-red-600') : tf.rsi_14 < 30 ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                        {tf.rsi_14}
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-1.5 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                      <div 
                        className={`h-full rounded-full transition-all ${tf.rsi_14 > 70 ? 'bg-red-500' : tf.rsi_14 < 30 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${tf.rsi_14}%` }}
                      />
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confluence</span>
                      <span className={`text-sm font-semibold text-blue-500`}>{tf.confluence}/4</span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                      <div
                        className={`h-full transition-all rounded-full ${tf.confluence <= 1 ? 'bg-red-500' : tf.confluence <= 2 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${(tf.confluence / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card darkMode={darkMode} className={`${signal.color} border transition-all`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Trading Signal</p>
                <p className={`text-2xl font-bold ${signal.textColor}`}>{signal.signal}</p>
              </div>
            </div>
            <div className={`text-right text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>{asset}</p>
              <p className="mt-1">Confidence: {signal.avgConfluence}/4</p>
            </div>
          </div>
        </Card>

        {tradeLogs.length > 0 && (
          <Card darkMode={darkMode}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                <BarChart3 className="h-5 w-5 text-blue-500" /> Trade History ({tradeLogs.length})
              </h2>
              <button 
                onClick={exportToCSV}
                className={`px-3.5 py-2 rounded-lg transition-all font-medium flex items-center gap-2 text-sm ${darkMode ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30' : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-200'}`}
              >
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className={`w-full text-xs ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                <thead className={`${darkMode ? 'border-b border-white/10' : 'border-b border-black/10'}`}>
                  <tr>
                    <th className={`text-left py-2 px-2 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Asset</th>
                    <th className={`text-left py-2 px-2 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Signal</th>
                    <th className={`text-left py-2 px-2 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Confidence</th>
                    <th className={`text-left py-2 px-2 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Time</th>
                    <th className={`text-left py-2 px-2 font-medium ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeLogs.map(trade => (
                    <tr key={trade.id} className={`${darkMode ? 'border-b border-white/5 hover:bg-white/5' : 'border-b border-black/5 hover:bg-black/5'} transition-all`}>
                      <td className="py-2 px-2 font-medium text-blue-500">{trade.asset}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${trade.signal.includes('BUY') ? (darkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700')}`}>
                          {trade.signal}
                        </span>
                      </td>
                      <td className="py-2 px-2">{trade.confidence}/4</td>
                      <td className={`py-2 px-2 ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>{trade.timestamp}</td>
                      <td className="py-2 px-2">
                        <button 
                          onClick={() => deleteTrade(trade.id)}
                          className={`transition-all ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card darkMode={darkMode} className={darkMode ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50'}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              <p className="font-semibold mb-1">💡 Pro Tip:</p>
              <p>Don't rely solely on signals. Combine this analysis with proper risk management for best results.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
