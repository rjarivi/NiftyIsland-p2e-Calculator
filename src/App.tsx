import React from 'react';
import { Calculator, Coins, Palmtree, TrendingUp, RefreshCw, ChevronDown, ChevronRight, ExternalLink, Plus, Minus } from 'lucide-react';

// Play intensity configurations
interface PlayIntensity {
  [key: string]: { name: string; bloomsPerDay: number; bloomsPerCycle: number; };
}
const PLAY_INTENSITIES: PlayIntensity = {
  casual: { name: 'Casual', bloomsPerDay: 1500, bloomsPerCycle: 15000 },
  medium: { name: 'Medium', bloomsPerDay: 3000, bloomsPerCycle: 30000 },
  high: { name: 'High', bloomsPerDay: 6000, bloomsPerCycle: 60000 },
  super: { name: 'Super User', bloomsPerDay: 14000, bloomsPerCycle: 140000 },
  custom: { name: 'Custom', bloomsPerDay: 0, bloomsPerCycle: 0 }
};

// Palm NFT configurations
interface PalmTier {
  [key: string]: { cap: number; name: string; };
}
const PALM_TIERS: PalmTier = {
  none: { cap: 100, name: 'No Palm' },
  iron: { cap: 200, name: 'Iron Palm' },
  bronze: { cap: 400, name: 'Bronze Palm' },
  silver: { cap: 800, name: 'Silver Palm' },
  gold: { cap: 1600, name: 'Gold Palm' },
  neon: { cap: 3200, name: 'Neon Palm' },
  ultra: { cap: 6400, name: 'Ultra Palm' }
};

// Stake tiers and rewards
const STAKE_TIERS = [
  { amount: 150, reward: 'Free Gacha Spin' },
  { amount: 1000, reward: 'Bloom Reward' },
  { amount: 7500, reward: 'Small Bloom Boost (1.2x for 60min)' },
  { amount: 15000, reward: 'Medium Bloom Boost (1.5x for 30min)' },
  { amount: 30000, reward: 'Large Bloom Boost (2.0x for 15min)' }
];

// Earning rate tiers based on amount staked (from Data.csv)
const STAKE_EARN_RATES = [
  { threshold: 0, rate: 1, ratePerBloom: 0.001 },
  { threshold: 10, rate: 1.25, ratePerBloom: 0.00125 },
  { threshold: 100, rate: 1.5, ratePerBloom: 0.0015 },
  { threshold: 1000, rate: 2, ratePerBloom: 0.002 },
  { threshold: 10000, rate: 8, ratePerBloom: 0.008 },
  { threshold: 100000, rate: 30, ratePerBloom: 0.03 },
  { threshold: 1000000, rate: 60, ratePerBloom: 0.06 },
  { threshold: 10000000, rate: 360, ratePerBloom: 0.36 }
];

// Reusable Number Input Component
interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  className?: string;
  placeholder?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, min = 0, step = 1, className = "", placeholder }) => {
  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(parseFloat(newValue.toFixed(6)));
  };

  const handleIncrease = () => {
    const newValue = value + step;
    onChange(parseFloat(newValue.toFixed(6)));
  };

  return (
    <div className={`flex items-center glass-input rounded-xl overflow-hidden h-12 group focus-within:ring-2 focus-within:ring-nifty-green/30 focus-within:border-nifty-green/50 ${className}`}>
      <button
        onClick={handleDecrease}
        className="h-full aspect-square flex items-center justify-center text-gray-400 hover:text-nifty-green hover:bg-nifty-hover/50 transition-colors flex-shrink-0 active:scale-90 transform duration-100"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(min, parseFloat(e.target.value) || 0))}
        className="flex-1 w-full bg-transparent text-center text-white font-mono font-medium focus:outline-none appearance-none min-w-0 h-full placeholder-gray-600"
        placeholder={placeholder}
      />
      <button
        onClick={handleIncrease}
        className="h-full aspect-square flex items-center justify-center text-gray-400 hover:text-nifty-green hover:bg-nifty-hover/50 transition-colors flex-shrink-0 active:scale-90 transform duration-100"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

function PlayToEarnCalculator() {
  const [currentPrice, setCurrentPrice] = React.useState(0.05);
  const [isLoadingPrice, setIsLoadingPrice] = React.useState(false);
  const [playIntensity, setPlayIntensity] = React.useState('casual');
  const [customBlooms, setCustomBlooms] = React.useState(0);
  const [selectedPalms, setSelectedPalms] = React.useState<{ tier: string; count: number }[]>([]);
  const [selectedTier, setSelectedTier] = React.useState('none');
  const [palmCount, setPalmCount] = React.useState(1);
  const [stakeAmount, setStakeAmount] = React.useState(0);
  const [compoundRate, setCompoundRate] = React.useState(100);
  const [showDailyBreakdown, setShowDailyBreakdown] = React.useState(false);
  const [showCycleBreakdown, setShowCycleBreakdown] = React.useState(false);
  const [showYearlyBreakdown, setShowYearlyBreakdown] = React.useState(false);

  const fetchCurrentPrice = async () => {
    try {
      setIsLoadingPrice(true);
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=island-token&vs_currencies=usd');
      const data = await response.json();
      if (data['island-token']?.usd) {
        setCurrentPrice(data['island-token'].usd);
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  React.useEffect(() => {
    fetchCurrentPrice();
  }, []);

  const calculateEarnRate = () => {
    const applicableRate = STAKE_EARN_RATES
      .slice()
      .reverse()
      .find(tier => stakeAmount >= tier.threshold);

    if (!applicableRate) return 1;

    if (stakeAmount >= 1000 && stakeAmount < 10000) {
      const position = (stakeAmount - 1000) / (10000 - 1000);
      return 2 + (position * (8 - 2));
    }

    return applicableRate.rate;
  };

  const calculateStakingCapBoost = (stakeAmount: number) => {
    return Math.floor(5 * Math.pow(stakeAmount, 0.36));
  };

  const calculateMaxCap = () => {
    const baseCap = 100;
    const stakingBoost = calculateStakingCapBoost(stakeAmount);
    const palmBoost = selectedPalms.reduce((acc, palm) => acc + PALM_TIERS[palm.tier].cap * palm.count, 0);
    return baseCap + stakingBoost + palmBoost;
  };

  const maxCap = calculateMaxCap();

  const calculateEarnings = () => {
    const { bloomsPerDay, bloomsPerCycle } = playIntensity === 'custom' ? PLAY_INTENSITIES.custom : PLAY_INTENSITIES[playIntensity];
    const earnRate = calculateEarnRate();

    const dailyBaseIsland = (bloomsPerDay * earnRate) / 1000;
    const cycleBaseIsland = (bloomsPerCycle * earnRate) / 1000;

    const dailyIsland = Math.min(dailyBaseIsland, maxCap / 10);
    const cycleIsland = Math.min(cycleBaseIsland, maxCap);

    const dailyUSD = dailyIsland * currentPrice;
    const cycleUSD = cycleIsland * currentPrice;

    return {
      daily: { baseIsland: dailyBaseIsland, island: dailyIsland, usd: dailyUSD },
      cycle: { baseIsland: cycleBaseIsland, island: cycleIsland, usd: cycleUSD }
    };
  };

  const handleAddPalm = () => {
    if (palmCount > 0 && selectedTier !== 'none') {
      setSelectedPalms((prev) => [...prev.filter(palm => palm.tier !== 'none'), { tier: selectedTier, count: palmCount }]);
      setPalmCount(1);
    }
  };

  const handleRemovePalm = (index: number) => {
    setSelectedPalms((prev) => prev.filter((_, i) => i !== index));
  };

  const earnings = calculateEarnings();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
        {/* Token Price Card */}
        <div className="glass-panel p-6 rounded-3xl hover:shadow-2xl hover:shadow-nifty-yellow/5 transition-all duration-500">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-2 text-nifty-yellow">
            <div className="p-2 bg-nifty-yellow/10 rounded-lg">
              <Coins className="w-5 h-5" />
            </div>
            Token Price
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-light">Current ISLAND Price or Enter Future Price Prediction:</p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nifty-yellow/50 font-bold z-10 group-focus-within:text-nifty-yellow transition-colors">$</span>
              <NumberInput
                value={currentPrice}
                onChange={setCurrentPrice}
                step={0.000001}
                className="pl-8"
              />
            </div>
            <button
              onClick={fetchCurrentPrice}
              disabled={isLoadingPrice}
              className="p-3.5 rounded-xl bg-nifty-hover border border-nifty-border hover:border-nifty-green hover:bg-nifty-green/10 transition-all disabled:opacity-50 group hover:shadow-[0_0_15px_rgba(79,255,188,0.2)]"
            >
              <RefreshCw className={`w-5 h-5 text-nifty-green ${isLoadingPrice ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        {/* Play Intensity Card */}
        <div className="glass-panel p-6 rounded-3xl hover:shadow-2xl hover:shadow-nifty-purple/5 transition-all duration-500">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-2 text-nifty-purple">
            <div className="p-2 bg-nifty-purple/10 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            Play Intensity
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-light">Choose your desired daily play intensity.</p>
          <div className="space-y-4">
            {playIntensity === 'custom' ? (
              <div className="flex gap-2 animate-fadeIn">
                <NumberInput
                  value={customBlooms}
                  onChange={(val) => {
                    setCustomBlooms(val);
                    PLAY_INTENSITIES.custom.bloomsPerDay = val;
                    PLAY_INTENSITIES.custom.bloomsPerCycle = val * 10;
                  }}
                  step={100}
                  placeholder="Daily blooms"
                  className="flex-1"
                />
                <button
                  onClick={() => setPlayIntensity('casual')}
                  className="px-5 py-2 rounded-xl bg-nifty-hover border border-nifty-border hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="relative group">
                <select
                  value={playIntensity}
                  onChange={(e) => {
                    setPlayIntensity(e.target.value);
                    if (e.target.value === 'custom') setCustomBlooms(0);
                  }}
                  className="w-full px-5 py-3.5 rounded-xl bg-nifty-hover/50 border border-nifty-border focus:outline-none focus:border-nifty-purple/50 focus:ring-1 focus:ring-nifty-purple/20 text-white appearance-none cursor-pointer hover:bg-nifty-hover transition-all"
                >
                  {Object.entries(PLAY_INTENSITIES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name}{key !== 'custom' ? ` - ${value.bloomsPerDay.toLocaleString()} Blooms/Day` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-nifty-purple transition-colors pointer-events-none" />
              </div>
            )}
            {playIntensity === 'custom' && customBlooms > 0 && (
              <div className="text-sm text-gray-400 bg-nifty-hover/40 p-4 rounded-xl border border-nifty-border/50 flex justify-between items-center">
                <span>Cycle blooms (10 days):</span>
                <span className="text-nifty-purple font-mono font-bold text-base">{(customBlooms * 10).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Staking Boost Card */}
        <div className="glass-panel p-6 rounded-3xl flex-1 hover:shadow-2xl hover:shadow-nifty-green/5 transition-all duration-500">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-2 text-nifty-green">
            <div className="p-2 bg-nifty-green/10 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            Staking Boost
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-light">Enter the amount to check the benefits of your stake</p>
          <div className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Staked Amount</label>
              <NumberInput
                value={stakeAmount}
                onChange={setStakeAmount}
                step={100}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-2 text-right font-mono">≈ ${(stakeAmount * currentPrice).toFixed(2)}</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-400 font-medium">Compound Rate</span>
                <span className="text-white font-mono bg-nifty-hover px-2 py-0.5 rounded text-xs">{compoundRate}%</span>
              </div>
              <div className="relative h-6 mb-6 select-none group">
                {/* Track */}
                <div className="absolute top-1/2 left-0 w-full h-3 -mt-1.5 bg-nifty-hover rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full relative overflow-hidden"
                    style={{ width: `${compoundRate}%` }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-nifty-yellow via-nifty-purple to-nifty-green opacity-80" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                  </div>
                </div>
                {/* Thumb (Visual only) */}
                <div
                  className="absolute top-1/2 w-6 h-6 -mt-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-transform group-hover:scale-110"
                  style={{ left: `calc(${compoundRate}% - 12px)` }}
                />
                {/* Interaction Layer */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compoundRate}
                  onChange={(e) => setCompoundRate(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* Labels */}
                <div className="absolute top-8 w-full flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  <span>Zero</span>
                  <span>Compound</span>
                  <span>Max</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Column: Palms & Cap */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="glass-panel p-6 rounded-3xl h-full flex flex-col hover:shadow-2xl hover:shadow-nifty-green/5 transition-all duration-500">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-2 text-white">
            <div className="p-2 bg-nifty-green/10 rounded-lg">
              <Palmtree className="w-5 h-5 text-nifty-green" />
            </div>
            Legendary Palms
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-light">Add Palms to increase your maximum ISLAND gains.</p>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 group">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-nifty-hover/50 border border-nifty-border focus:outline-none focus:border-nifty-green/50 focus:ring-1 focus:ring-nifty-green/20 text-white appearance-none cursor-pointer hover:bg-nifty-hover transition-all"
              >
                {Object.entries(PALM_TIERS).map(([tier, { name, cap }]) => (
                  <option key={tier} value={tier}>
                    {name} (+{cap} Cap)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-nifty-green transition-colors pointer-events-none" />
            </div>
            <div className="w-28">
              <NumberInput
                value={palmCount}
                onChange={(val) => setPalmCount(Math.max(1, val))}
                min={1}
              />
            </div>
            <button
              onClick={handleAddPalm}
              className="px-6 rounded-xl bg-nifty-green text-nifty-bg font-bold hover:bg-nifty-green/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(79,255,188,0.3)]"
            >
              Add
            </button>
          </div>

          {selectedPalms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedPalms.map((palm, index) => (
                <div key={index} className="flex items-center gap-2 bg-nifty-hover px-4 py-2 rounded-xl border border-nifty-border/50 animate-fadeIn group hover:border-nifty-green/30 transition-colors">
                  <span className="text-sm font-medium text-gray-300">{PALM_TIERS[palm.tier].name} <span className="text-nifty-green font-bold text-xs ml-1 bg-nifty-green/10 px-1.5 py-0.5 rounded">x{palm.count}</span></span>
                  <button
                    onClick={() => handleRemovePalm(index)}
                    className="text-gray-500 hover:text-red-400 transition-colors ml-1 p-0.5 rounded-full hover:bg-red-500/10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto bg-nifty-hover/30 rounded-2xl p-5 space-y-4 border border-nifty-border/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">Cycle Cap Breakdown <div className="h-px flex-1 bg-gradient-to-r from-nifty-border to-transparent"></div></h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Base Cap</span>
                <span className="font-mono text-white bg-nifty-hover/50 px-2 py-0.5 rounded-lg border border-nifty-border/30">100</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Staking Boost</span>
                <span className="font-mono text-nifty-purple bg-nifty-purple/10 px-2 py-0.5 rounded-lg border border-nifty-purple/20">+{calculateStakingCapBoost(stakeAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Palm NFT Boost</span>
                <span className="font-mono text-nifty-green bg-nifty-green/10 px-2 py-0.5 rounded-lg border border-nifty-green/20">+{selectedPalms.reduce((acc, palm) => acc + PALM_TIERS[palm.tier].cap * palm.count, 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-nifty-border/50 flex justify-between items-end">
              <span className="text-sm font-medium text-gray-300">Total Cycle Cap</span>
              <div className="text-right">
                <p className="text-2xl font-mono text-nifty-green font-bold drop-shadow-[0_0_8px_rgba(79,255,188,0.3)]">{maxCap.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">ISLAND</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Earnings & Promos */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
        {/* Earnings Card */}
        <div className="glass-panel p-6 rounded-3xl hover:shadow-2xl hover:shadow-nifty-green/10 transition-all duration-500">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-nifty-green to-nifty-purple rounded-full block"></span>
            Earnings Estimate
          </h2>
          <div className="space-y-4">
            {/* Daily */}
            <div className="bg-nifty-hover/30 p-5 rounded-2xl border border-nifty-border/50 hover:border-nifty-green/50 transition-all duration-300 group hover:bg-nifty-hover/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold group-hover:text-nifty-green transition-colors">Daily Earnings</span>
                <button onClick={() => setShowDailyBreakdown(!showDailyBreakdown)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
                  {showDailyBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-3xl font-bold text-nifty-green mb-1 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(79,255,188,0.3)]">
                {earnings.daily.island.toFixed(2)} <span className="text-sm font-sans font-medium text-gray-500 opacity-60">ISLAND</span>
              </div>
              <div className="text-sm text-gray-500 font-medium">≈ ${earnings.daily.usd.toFixed(2)}</div>
              {showDailyBreakdown && (
                <div className="mt-4 pt-4 border-t border-nifty-border/50 text-xs text-gray-400 space-y-2 animate-fadeIn bg-black/20 -mx-5 -mb-5 p-5 rounded-b-2xl">
                  <div className="flex justify-between"><span>Pre-Cap:</span> <span className="font-mono text-white">{earnings.daily.baseIsland.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>After Cap:</span> <span className="font-mono text-nifty-green">{earnings.daily.island.toFixed(2)}</span></div>
                </div>
              )}
            </div>

            {/* Cycle */}
            <div className="bg-nifty-hover/30 p-5 rounded-2xl border border-nifty-border/50 hover:border-nifty-purple/50 transition-all duration-300 group hover:bg-nifty-hover/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold group-hover:text-nifty-purple transition-colors">Cycle Earnings (10 days)</span>
                <button onClick={() => setShowCycleBreakdown(!showCycleBreakdown)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
                  {showCycleBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-3xl font-bold text-nifty-purple mb-1 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(207,104,251,0.3)]">
                {earnings.cycle.island.toFixed(2)} <span className="text-sm font-sans font-medium text-gray-500 opacity-60">ISLAND</span>
              </div>
              <div className="text-sm text-gray-500 font-medium">≈ ${earnings.cycle.usd.toFixed(2)}</div>
              {showCycleBreakdown && (
                <div className="mt-4 pt-4 border-t border-nifty-border/50 text-xs text-gray-400 space-y-2 animate-fadeIn bg-black/20 -mx-5 -mb-5 p-5 rounded-b-2xl">
                  <div className="flex justify-between"><span>Pre-Cap:</span> <span className="font-mono text-white">{earnings.cycle.baseIsland.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>After Cap:</span> <span className="font-mono text-nifty-purple">{earnings.cycle.island.toFixed(2)}</span></div>
                </div>
              )}
            </div>

            {/* Yearly */}
            <div className="bg-nifty-hover/30 p-5 rounded-2xl border border-nifty-border/50 hover:border-nifty-yellow/50 transition-all duration-300 group hover:bg-nifty-hover/50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold group-hover:text-nifty-yellow transition-colors">Yearly Projection</span>
                <button onClick={() => setShowYearlyBreakdown(!showYearlyBreakdown)} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
                  {showYearlyBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-3xl font-bold text-nifty-yellow mb-1 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                {(earnings.cycle.island * 36.5).toFixed(2)} <span className="text-sm font-sans font-medium text-gray-500 opacity-60">ISLAND</span>
              </div>
              <div className="text-sm text-gray-500 font-medium">≈ ${(earnings.cycle.usd * 36.5).toFixed(2)}</div>
              {showYearlyBreakdown && (
                <div className="mt-4 pt-4 border-t border-nifty-border/50 text-xs text-gray-400 space-y-2 animate-fadeIn bg-black/20 -mx-5 -mb-5 p-5 rounded-b-2xl">
                  <div className="flex justify-between"><span>Pre-Cap:</span> <span className="font-mono text-white">{(earnings.cycle.baseIsland * 36.5).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>After Cap:</span> <span className="font-mono text-nifty-yellow">{(earnings.cycle.island * 36.5).toFixed(2)}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Promo Cards */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-nifty-yellow/10 transition-all duration-500">
            <div className="h-32 overflow-hidden relative">
              <img
                src="https://pbs.twimg.com/media/GHMAcU7XgAAbm6M?format=jpg&name=small"
                alt="FlashPoint"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nifty-card to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4">
                <h3 className="text-[10px] font-bold text-nifty-bg bg-nifty-yellow px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Featured</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <p className="font-bold text-lg text-white mb-4 group-hover:text-nifty-yellow transition-colors">FlashPoint</p>
              <a
                href="https://niftyis.land/f7ash/flashpoint?ref=f7ash"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-nifty-bg font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-nifty-yellow/20"
                style={{ background: 'linear-gradient(135deg, #fde00a, #d373e4, #5bf1c2)' }}
              >
                Visit Now <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col group hover:shadow-2xl hover:shadow-nifty-purple/10 transition-all duration-500">
            <div className="h-32 overflow-hidden relative">
              <img
                src="https://pbs.twimg.com/media/GxMQ43NWgAEIJd3?format=jpg&name=large"
                alt="Your Island"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nifty-card to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4">
                <h3 className="text-[10px] font-bold text-white bg-nifty-purple px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">Promoted</h3>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <p className="font-bold text-lg text-white mb-4 group-hover:text-nifty-purple transition-colors">Your Island</p>
              <a
                href="#"
                className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-nifty-hover border border-nifty-border text-white font-bold text-sm hover:bg-white hover:text-nifty-bg transition-all hover:scale-[1.02]"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StakeToEarnCalculator() {
  const [currentPrice, setCurrentPrice] = React.useState(0);
  const [stakeAmount, setStakeAmount] = React.useState(0);
  const [isLoadingPrice, setIsLoadingPrice] = React.useState(false);

  React.useEffect(() => {
    setCurrentPrice(0.05);
  }, []);

  const getNextTier = () => STAKE_TIERS.find(tier => stakeAmount < tier.amount);

  const nextTier = getNextTier();

  const fetchCurrentPrice = async () => {
    try {
      setIsLoadingPrice(true);
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=island-token&vs_currencies=usd');
      const data = await response.json();
      if (data['island-token']?.usd) {
        setCurrentPrice(data['island-token'].usd);
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
      {/* Left Column: Inputs */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="glass-panel p-6 rounded-3xl hover:shadow-2xl hover:shadow-nifty-yellow/5 transition-all duration-500">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-2 text-nifty-yellow">
            <div className="p-2 bg-nifty-yellow/10 rounded-lg">
              <Coins className="w-5 h-5" />
            </div>
            Token Price
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-light">Current ISLAND Price or Enter Future Price Prediction:</p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nifty-yellow/50 font-bold z-10 group-focus-within:text-nifty-yellow transition-colors">$</span>
              <NumberInput
                value={currentPrice}
                onChange={setCurrentPrice}
                step={0.000001}
                className="pl-8"
              />
            </div>
            <button
              onClick={fetchCurrentPrice}
              disabled={isLoadingPrice}
              className="p-3.5 rounded-xl bg-nifty-hover border border-nifty-border hover:border-nifty-green hover:bg-nifty-green/10 transition-all disabled:opacity-50 group hover:shadow-[0_0_15px_rgba(79,255,188,0.2)]"
            >
              <RefreshCw className={`w-5 h-5 text-nifty-green ${isLoadingPrice ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl hover:shadow-2xl hover:shadow-nifty-purple/5 transition-all duration-500">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-2 text-nifty-purple">
            <div className="p-2 bg-nifty-purple/10 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            Stake Amount
          </h2>
          <p className="text-sm text-gray-400 mb-6 font-light">Enter the amount to check the benefits of your stake</p>
          <NumberInput
            value={stakeAmount}
            onChange={setStakeAmount}
            step={100}
            placeholder="0"
          />
        </div>

        <div className="glass-panel p-6 rounded-3xl flex-1 hover:shadow-2xl hover:shadow-nifty-yellow/5 transition-all duration-500">
          <h2 className="text-lg font-bold mb-6 text-white uppercase tracking-wider">Next Tier Goal</h2>
          {nextTier ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-nifty-yellow/10 rounded-full flex items-center justify-center mb-4 ring-2 ring-nifty-yellow/20">
                <div className="w-10 h-10 border-2 border-nifty-yellow rounded-full animate-bounce"></div>
              </div>
              <p className="text-xl font-bold text-nifty-yellow mb-2">{nextTier.reward}</p>
              <p className="text-sm text-gray-400 mb-6 font-light">
                Stake <span className="text-white font-mono font-bold">{(nextTier.amount - stakeAmount).toLocaleString()}</span> more ISLAND to unlock
              </p>
              <div className="relative h-2.5 bg-nifty-hover rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-nifty-yellow to-nifty-purple"
                  style={{ width: `${(stakeAmount / nextTier.amount) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-nifty-green/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-nifty-green/10">
                <span className="text-4xl text-nifty-green">✔</span>
              </div>
              <p className="text-2xl font-bold text-nifty-green animate-pulse">Max Tier Reached!</p>
              <p className="text-gray-400 mt-2">You have unlocked all rewards.</p>
            </div>
          )}
        </div>
      </div>

      {/* Middle Column: Benefits */}
      <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="glass-panel p-8 rounded-3xl h-full hover:shadow-2xl hover:shadow-nifty-green/5 transition-all duration-500">
          <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
            <div className="p-2 bg-nifty-green/10 rounded-lg">
              <Palmtree className="w-6 h-6 text-nifty-green" />
            </div>
            Staking Benefits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloom Boost */}
            <div className="bg-nifty-hover/30 p-6 rounded-2xl border border-nifty-border/50 hover:border-nifty-green/50 transition-all duration-300">
              <h4 className="text-nifty-green font-bold text-lg mb-2">Island Bloom Boost</h4>
              <p className="text-sm text-gray-400 mb-6 font-light">Increase blooms earned on your island.</p>
              <div className="space-y-4 text-sm">
                <p className={`flex items-center p-3 rounded-lg border transition-all ${stakeAmount >= 7500 ? 'bg-nifty-green/10 border-nifty-green/30 text-white' : 'bg-transparent border-transparent text-gray-500'}`}>
                  {stakeAmount >= 7500 ? <span className="mr-2 text-nifty-green text-lg">✓</span> : <span className="w-6" />}
                  Small (7,500 ISLAND)
                </p>
                <p className={`flex items-center p-3 rounded-lg border transition-all ${stakeAmount >= 15000 ? 'bg-nifty-green/10 border-nifty-green/30 text-white' : 'bg-transparent border-transparent text-gray-500'}`}>
                  {stakeAmount >= 15000 ? <span className="mr-2 text-nifty-green text-lg">✓</span> : <span className="w-6" />}
                  Medium (15,000 ISLAND)
                </p>
                <p className={`flex items-center p-3 rounded-lg border transition-all ${stakeAmount >= 30000 ? 'bg-nifty-green/10 border-nifty-green/30 text-white' : 'bg-transparent border-transparent text-gray-500'}`}>
                  {stakeAmount >= 30000 ? <span className="mr-2 text-nifty-green text-lg">✓</span> : <span className="w-6" />}
                  Large (30,000 ISLAND)
                </p>
              </div>
            </div>

            {/* Other Rewards */}
            <div className="space-y-6">
              <div className="bg-nifty-hover/30 p-6 rounded-2xl border border-nifty-border/50 hover:border-nifty-green/50 transition-all duration-300">
                <h4 className="text-nifty-green font-bold text-lg mb-2">Bloom Reward Pass</h4>
                <p className="text-sm text-gray-400 mb-4 font-light">Mint active bloom rewards for free.</p>
                <p className={`text-sm flex items-center p-3 rounded-lg border transition-all ${stakeAmount >= 1000 ? 'bg-nifty-green/10 border-nifty-green/30 text-white font-bold' : 'bg-transparent border-transparent text-gray-500'}`}>
                  {stakeAmount >= 1000 ? <span className="mr-2 text-nifty-green text-lg">✓</span> : <span className="w-6" />}
                  Unlocked (1,000 ISLAND)
                </p>
              </div>
              <div className="bg-nifty-hover/30 p-6 rounded-2xl border border-nifty-border/50 hover:border-nifty-green/50 transition-all duration-300">
                <h4 className="text-nifty-green font-bold text-lg mb-2">Gacha Spin</h4>
                <p className="text-sm text-gray-400 mb-4 font-light">Spin the Bloom Gacha for free.</p>
                <p className={`text-sm flex items-center p-3 rounded-lg border transition-all ${stakeAmount >= 150 ? 'bg-nifty-green/10 border-nifty-green/30 text-white font-bold' : 'bg-transparent border-transparent text-gray-500'}`}>
                  {stakeAmount >= 150 ? <span className="mr-2 text-nifty-green text-lg">✓</span> : <span className="w-6" />}
                  Unlocked (150 ISLAND)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = React.useState('p2e');

  return (
    <div className="h-full flex flex-col bg-nifty-bg text-white font-sans selection:bg-nifty-green/30">
      {/* Header */}
      <header className="flex-none px-6 py-4 glass-panel border-b-0 m-4 rounded-2xl flex items-center justify-between z-50 sticky top-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-nifty-hover rounded-xl border border-nifty-border shadow-lg">
            <Palmtree className="w-6 h-6 text-nifty-green drop-shadow-[0_0_8px_rgba(79,255,188,0.5)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient tracking-tight">
              Nifty Island
            </h1>
            <p className="text-xs text-gray-400 font-medium tracking-vide uppercase">Calculator Tool</p>
          </div>
        </div>

        <div className="flex bg-nifty-card p-1.5 rounded-xl border border-nifty-border shadow-inner relative">
          <div
            className={`absolute top-1.5 bottom-1.5 rounded-lg bg-nifty-hover shadow-md transition-all duration-300 ease-out`}
            style={{
              left: activeTab === 'p2e' ? '6px' : 'calc(50% + 3px)',
              width: 'calc(50% - 9px)'
            }}
          />
          <button
            onClick={() => setActiveTab('p2e')}
            className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all z-10 ${activeTab === 'p2e'
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Play to Earn
          </button>
          <button
            onClick={() => setActiveTab('stake')}
            className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all z-10 ${activeTab === 'stake'
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-300'
              }`}
          >
            Stake to Earn
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-2 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-nifty-purple/10 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-nifty-green/10 rounded-full blur-[128px] pointer-events-none animate-pulse" style={{ animationDuration: '5s' }} />

        <div className="relative h-full max-w-[1920px] mx-auto">
          {activeTab === 'p2e' ? <PlayToEarnCalculator /> : <StakeToEarnCalculator />}
        </div>
      </main>
    </div>
  );
}

export default App;