'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react';
interface MacroData {
  fear_greed: number | null;
  btc_dominance: number | null;
  total_market_cap: number | null;
  loading: boolean;
  error: string | null;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl shadow-sm border border-zinc-800/40 bg-zinc-900/50 p-6 ${className}`}>{children}</div>;
}

function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "red" | "amber" }) {
  const tones = {
    blue: "bg-sky-900/30 text-sky-200 border border-sky-800",
    green: "bg-emerald-900/30 text-emerald-200 border border-emerald-800",
    red: "bg-rose-900/30 text-rose-200 border border-rose-800",
    amber: "bg-amber-900/30 text-amber-200 border border-amber-800",
  };
  return <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${tones[tone]}`}>{children}</span>;
}

export default function Modul0_MarketContext() {
  const [data, setData] = useState<MacroData>({
    fear_greed: null,
    btc_dominance: null,
    total_market_cap: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function loadMacroData() {
      try {
        const fngResponse = await fetch('https://api.alternative.me/fng/?limit=1');
        const fngData = await fngResponse.json();
        const fearGreed = parseInt(fngData.data[0].value);

        const cgResponse = await fetch('https://api.coingecko.com/api/v3/global');
        const cgData = await cgResponse.json();
        const btcDominance = cgData.data.market_cap_percentage.btc;
        const totalMcap = cgData.data.total_market_cap.usd;

        setData({
          fear_greed: fearGreed,
          btc_dominance: btcDominance,
          total_market_cap: totalMcap,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({ ...prev, loading: false, error: 'API-Fehler' }));
      }
    }

    loadMacroData();
    const interval = setInterval(loadMacroData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getFearGreedStatus = (value: number) => {
    if (value <= 25) return { label: 'Extreme Fear 😱', tone: 'red' as const, signal: 'Kaufgelegenheit' };
    if (value <= 45) return { label: 'Fear 😰', tone: 'amber' as const, signal: 'Vorsichtig' };
    if (value <= 55) return { label: 'Neutral 😐', tone: 'blue' as const, signal: 'Abwarten' };
    if (value <= 75) return { label: 'Greed 😊', tone: 'green' as const, signal: 'Vorsicht' };
    return { label: 'Extreme Greed 🤑', tone: 'red' as const, signal: 'WARNUNG!' };
  };

  const getBtcDominanceStatus = (value: number) => {
    if (value > 60) return { label: 'BTC-Season', tone: 'amber' as const };
    if (value < 45) return { label: 'Alt-Season', tone: 'green' as const };
    return { label: 'Mixed', tone: 'blue' as const };
  };

  if (data.loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <span className="ml-3 text-zinc-400">Lade Makro-Daten...</span>
        </div>
      </Card>
    );
  }

  if (data.error) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle className="h-5 w-5" />
          <span>{data.error}</span>
        </div>
      </Card>
    );
  }

  const fgStatus = getFearGreedStatus(data.fear_greed!);
  const btcStatus = getBtcDominanceStatus(data.btc_dominance!);

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-400" />
          Market Context Dashboard
        </h2>
        <Badge tone="blue">Live Data</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Fear & Greed Index</span>
          </div>
          <div className="text-3xl font-bold mb-2">{data.fear_greed}</div>
          <Badge tone={fgStatus.tone}>{fgStatus.label}</Badge>
          <div className="text-xs text-zinc-500 mt-2">{fgStatus.signal}</div>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">BTC Dominance</span>
          </div>
          <div className="text-3xl font-bold mb-2">{data.btc_dominance!.toFixed(1)}%</div>
          <Badge tone={btcStatus.tone}>{btcStatus.label}</Badge>
        </div>

        <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Total Market Cap</span>
          </div>
          <div className="text-2xl font-bold mb-2">
            ${(data.total_market_cap! / 1_000_000_000_000).toFixed(2)}T
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-sky-900/20 to-blue-900/20 rounded-xl border border-sky-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-sky-400 mt-0.5" />
          <div>
            <div className="font-semibold text-sky-300 mb-1">📊 Makro-Signal</div>
            <div className="text-sm text-zinc-300">
              {data.fear_greed! < 30 ? "🟢 KAUFGELEGENHEIT" : 
               data.fear_greed! > 75 ? "🔴 VORSICHT: Überhitzung" : 
               "🟡 NEUTRAL: Confluence abwarten"}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
