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
    // Fix floating point precision issues
    onChange(parseFloat(newValue.toFixed(6)));
  };

  const handleIncrease = () => {
    const newValue = value + step;
    onChange(parseFloat(newValue.toFixed(6)));
  };

  return (
    <div className={`flex items-center bg-[#262933] rounded-xl border border-[#363a47] focus-within:border-[#4fffbc] transition-colors h-12 ${className}`}>
      <button
        onClick={handleDecrease}
        className="h-full aspect-square flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2f3341] rounded-l-xl transition-colors flex-shrink-0"
      >
        <Minus className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(min, parseFloat(e.target.value) || 0))}
        className="flex-1 w-full bg-transparent text-center text-white font-mono focus:outline-none appearance-none min-w-0 h-full"
        placeholder={placeholder}
      />
      <button
        onClick={handleIncrease}
        className="h-full aspect-square flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2f3341] rounded-r-xl transition-colors flex-shrink-0"
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
        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-[#ffe500]">
            <Coins className="w-5 h-5" />
            Token Price
          </h2>
          <p className="text-sm text-gray-400 mb-4">Current ISLAND Price or Enter Future Price Prediction:</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">$</span>
              <NumberInput
                value={currentPrice}
                onChange={setCurrentPrice}
                step={0.000001}
                className="pl-6"
              />
            </div>
            <button
              onClick={fetchCurrentPrice}
              disabled={isLoadingPrice}
              className="p-3 rounded-xl bg-[#262933] border border-[#363a47] hover:bg-[#2f3341] transition-colors disabled:opacity-50 group"
            >
              <RefreshCw className={`w-5 h-5 text-[#4fffbc] ${isLoadingPrice ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        {/* Play Intensity Card */}
        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-[#cf68fb]">
            <Calculator className="w-5 h-5" />
            Play Intensity
          </h2>
          <p className="text-sm text-gray-400 mb-4">Choose your desired daily play intensity. More play means more gains!</p>
          <div className="space-y-4">
            {playIntensity === 'custom' ? (
              <div className="flex gap-2">
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
                  className="px-4 py-2 rounded-xl bg-[#262933] border border-[#363a47] hover:bg-[#2f3341] transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={playIntensity}
                  onChange={(e) => {
                    setPlayIntensity(e.target.value);
                    if (e.target.value === 'custom') setCustomBlooms(0);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc] text-white appearance-none cursor-pointer"
                >
                  {Object.entries(PLAY_INTENSITIES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name}{key !== 'custom' ? ` - ${value.bloomsPerDay.toLocaleString()} Blooms/Day` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
            {playIntensity === 'custom' && customBlooms > 0 && (
              <p className="text-sm text-gray-400 bg-[#262933] p-3 rounded-lg">
                Cycle blooms (10 days): <span className="text-white font-mono">{(customBlooms * 10).toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>

        {/* Staking Boost Card */}
        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl flex-1">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-[#4fffbc]">
            <TrendingUp className="w-5 h-5" />
            Staking Boost
          </h2>
          <p className="text-sm text-gray-400 mb-4">Enter the amount to check the benefits of your stake</p>
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Staked Amount</label>
              <NumberInput
                value={stakeAmount}
                onChange={setStakeAmount}
                step={100}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-2 text-right">≈ ${(stakeAmount * currentPrice).toFixed(2)}</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Compound Rate: {compoundRate}%</span>
              </div>
              <div className="relative h-4 mb-6 select-none">
                {/* Track */}
                <div className="absolute top-1/2 left-0 w-full h-2 -mt-1 bg-[#262933] rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{ width: `${compoundRate}%`, background: 'linear-gradient(90deg, #ffe500, #cf68fb, #4fffbc)' }}
                  />
                </div>
                {/* Thumb (Visual only) */}
                <div
                  className="absolute top-1/2 w-4 h-4 -mt-2 bg-white rounded-full shadow-md pointer-events-none"
                  style={{ left: `calc(${compoundRate}% - 8px)` }}
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
                <div className="absolute top-6 w-full flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Column: Palms & Cap */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl h-full">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-white">
            <Palmtree className="w-5 h-5 text-[#4fffbc]" />
            Legendary Palms NFT
          </h2>
          <p className="text-sm text-gray-400 mb-4">Each Palm NFT you own increases your maximum ISLAND gains per cycle.</p>

          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc] text-white appearance-none cursor-pointer"
              >
                {Object.entries(PALM_TIERS).map(([tier, { name, cap }]) => (
                  <option key={tier} value={tier}>
                    {name} (+{cap} Cap)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="w-32">
              <NumberInput
                value={palmCount}
                onChange={(val) => setPalmCount(Math.max(1, val))}
                min={1}
              />
            </div>
            <button
              onClick={handleAddPalm}
              className="w-24 rounded-xl bg-[#4fffbc]/10 text-[#4fffbc] border border-[#4fffbc]/20 hover:bg-[#4fffbc]/20 transition-colors font-medium flex items-center justify-center"
            >
              Add
            </button>
          </div>

          {selectedPalms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedPalms.map((palm, index) => (
                <div key={index} className="flex items-center gap-2 bg-[#262933] px-3 py-1.5 rounded-lg border border-[#363a47] animate-fadeIn">
                  <span className="text-sm text-gray-300">{PALM_TIERS[palm.tier].name} <span className="text-[#4fffbc]">x{palm.count}</span></span>
                  <button
                    onClick={() => handleRemovePalm(index)}
                    className="text-gray-500 hover:text-red-400 transition-colors ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-400 mb-4">The initial cycle cap is 100 ISLAND. This cap increases based on your staking amount and Palm NFTs.</p>

          <div className="bg-[#262933]/50 rounded-xl p-4 space-y-4 border border-[#363a47]">
            <p className="text-sm font-bold text-white">Cycle Cap Breakdown:</p>

            <div className="space-y-1">
              <p className="text-xs text-gray-400">Base Cap:</p>
              <p className="text-sm font-mono text-white">100 ISLAND</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-400">Staking Boost:</p>
              <p className="text-sm font-mono text-[#cf68fb]">+{calculateStakingCapBoost(stakeAmount).toLocaleString()} ISLAND</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-400">Palm NFT Boost:</p>
              <p className="text-sm font-mono text-[#4fffbc]">+{selectedPalms.reduce((acc, palm) => acc + PALM_TIERS[palm.tier].cap * palm.count, 0).toLocaleString()} ISLAND</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-400">Total Cap:</p>
              <p className="text-sm font-mono text-[#4fffbc] font-bold">{maxCap.toLocaleString()} ISLAND</p>
            </div>

            <div className="pt-2 border-t border-[#363a47]">
              <p className="text-sm font-bold text-white">Current Cycle Cap: {maxCap.toLocaleString()} ISLAND</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Earnings & Promos */}
      <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
        {/* Earnings Card */}
        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl">
          <h2 className="text-lg font-semibold mb-6 text-white">Earnings Estimate</h2>
          <div className="space-y-4">
            {/* Daily */}
            <div className="bg-[#262933] p-4 rounded-xl border border-[#363a47] hover:border-[#4fffbc]/30 transition-colors group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm text-gray-400">Daily Earnings</span>
                <button onClick={() => setShowDailyBreakdown(!showDailyBreakdown)} className="text-gray-500 hover:text-white">
                  {showDailyBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-2xl font-bold text-[#4fffbc] mb-1 font-mono">
                {earnings.daily.island.toFixed(2)} <span className="text-sm font-sans font-normal text-gray-500">ISLAND</span>
              </div>
              <div className="text-sm text-gray-500">≈ ${earnings.daily.usd.toFixed(2)}</div>
              {showDailyBreakdown && (
                <div className="mt-3 pt-3 border-t border-[#363a47] text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between"><span>Pre-Cap:</span> <span>{earnings.daily.baseIsland.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>After Cap:</span> <span>{earnings.daily.island.toFixed(2)}</span></div>
                </div>
              )}
            </div>

            {/* Cycle */}
            <div className="bg-[#262933] p-4 rounded-xl border border-[#363a47] hover:border-[#cf68fb]/30 transition-colors group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm text-gray-400">Cycle Earnings (10 days)</span>
                <button onClick={() => setShowCycleBreakdown(!showCycleBreakdown)} className="text-gray-500 hover:text-white">
                  {showCycleBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-2xl font-bold text-[#4fffbc] mb-1 font-mono">
                {earnings.cycle.island.toFixed(2)} <span className="text-sm font-sans font-normal text-gray-500">ISLAND</span>
              </div>
              <div className="text-sm text-gray-500">≈ ${earnings.cycle.usd.toFixed(2)}</div>
              {showCycleBreakdown && (
                <div className="mt-3 pt-3 border-t border-[#363a47] text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between"><span>Pre-Cap:</span> <span>{earnings.cycle.baseIsland.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>After Cap:</span> <span>{earnings.cycle.island.toFixed(2)}</span></div>
                </div>
              )}
            </div>

            {/* Yearly */}
            <div className="bg-[#262933] p-4 rounded-xl border border-[#363a47] hover:border-[#ffe500]/30 transition-colors group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm text-gray-400">Yearly Projection</span>
                <button onClick={() => setShowYearlyBreakdown(!showYearlyBreakdown)} className="text-gray-500 hover:text-white">
                  {showYearlyBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-2xl font-bold text-[#4fffbc] mb-1 font-mono">
                {(earnings.cycle.island * 36.5).toFixed(2)} <span className="text-sm font-sans font-normal text-gray-500">ISLAND</span>
              </div>
              <div className="text-sm text-gray-500">≈ ${(earnings.cycle.usd * 36.5).toFixed(2)}</div>
              {showYearlyBreakdown && (
                <div className="mt-3 pt-3 border-t border-[#363a47] text-xs text-gray-400 space-y-1">
                  <div className="flex justify-between"><span>Pre-Cap:</span> <span>{(earnings.cycle.baseIsland * 36.5).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>After Cap:</span> <span>{(earnings.cycle.island * 36.5).toFixed(2)}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Promo Cards */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-[#16171D]/80 backdrop-blur-md rounded-2xl border border-[#262933] shadow-xl overflow-hidden flex flex-col">
            <div className="h-32 overflow-hidden relative">
              <img
                src="https://pbs.twimg.com/media/GHMAcU7XgAAbm6M?format=jpg&name=small"
                alt="FlashPoint"
                className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16171D] to-transparent opacity-60" />
              <div className="absolute bottom-2 left-3">
                <h3 className="text-xs font-bold text-[#ffe500] uppercase tracking-wider">Featured</h3>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="font-semibold text-white mb-3">FlashPoint</p>
              <a
                href="https://niftyis.land/f7ash/flashpoint?ref=f7ash"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 w-full py-2 rounded-lg text-black font-bold text-sm transition-transform hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(90deg, #fde00a, #d373e4, #5bf1c2)' }}
              >
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="bg-[#16171D]/80 backdrop-blur-md rounded-2xl border border-[#262933] shadow-xl overflow-hidden flex flex-col">
            <div className="h-32 overflow-hidden relative">
              <img
                src="https://pbs.twimg.com/media/GxMQ43NWgAEIJd3?format=jpg&name=large"
                alt="Your Island"
                className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#16171D] to-transparent opacity-60" />
              <div className="absolute bottom-2 left-3">
                <h3 className="text-xs font-bold text-[#cf68fb] uppercase tracking-wider">Promoted</h3>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="font-semibold text-white mb-3">Your Island</p>
              <a
                href="#"
                className="mt-auto flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#262933] border border-[#363a47] text-white font-bold text-sm hover:bg-[#2f3341] transition-colors"
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

  const getUnlockedTiers = () => STAKE_TIERS.filter(tier => stakeAmount >= tier.amount);
  const getNextTier = () => STAKE_TIERS.find(tier => stakeAmount < tier.amount);
  const getBoostClass = (threshold: number) => stakeAmount >= threshold ? "text-[#4fffbc]" : "text-gray-600";
  const CheckMark = () => <span className="text-[#4fffbc] mr-2">✔</span>;

  const unlockedTiers = getUnlockedTiers();
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
        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-[#ffe500]">
            <Coins className="w-5 h-5" />
            Token Price
          </h2>
          <p className="text-sm text-gray-400 mb-4">Current ISLAND Price or Enter Future Price Prediction:</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">$</span>
              <NumberInput
                value={currentPrice}
                onChange={setCurrentPrice}
                step={0.000001}
                className="pl-6"
              />
            </div>
            <button
              onClick={fetchCurrentPrice}
              disabled={isLoadingPrice}
              className="p-3 rounded-xl bg-[#262933] border border-[#363a47] hover:bg-[#2f3341] transition-colors disabled:opacity-50 group"
            >
              <RefreshCw className={`w-5 h-5 text-[#4fffbc] ${isLoadingPrice ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>

        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-[#cf68fb]">
            <TrendingUp className="w-5 h-5" />
            Stake Amount
          </h2>
          <p className="text-sm text-gray-400 mb-4">Enter the amount to check the benefits of your stake</p>
          <NumberInput
            value={stakeAmount}
            onChange={setStakeAmount}
            step={100}
            placeholder="0"
          />
        </div>

        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl flex-1">
          <h2 className="text-lg font-semibold mb-4 text-white">Next Tier Goal</h2>
          {nextTier ? (
            <div className="text-center py-4">
              <p className="text-xl font-bold text-[#ffe500] mb-2">{nextTier.reward}</p>
              <p className="text-sm text-gray-400">
                Stake <span className="text-white font-mono">{(nextTier.amount - stakeAmount).toLocaleString()}</span> more ISLAND to unlock
              </p>
              <div className="mt-4 h-2 bg-[#262933] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ffe500] to-[#cf68fb]"
                  style={{ width: `${(stakeAmount / nextTier.amount) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#4fffbc]">
              <p className="text-xl font-bold">Max Tier Reached!</p>
            </div>
          )}
        </div>
      </div>

      {/* Middle Column: Benefits */}
      <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="bg-[#16171D]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262933] shadow-xl h-full">
          <h2 className="text-lg font-semibold mb-6 text-white">Staking Benefits</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloom Boost */}
            <div className="bg-[#262933]/50 p-4 rounded-xl border border-[#363a47]">
              <h4 className="text-[#4fffbc] font-medium mb-1">Island Bloom Boost</h4>
              <p className="text-xs text-gray-400 mb-3">Increase blooms earned on your island.</p>
              <div className="space-y-2 text-sm">
                <p className={`flex items-center ${getBoostClass(7500)}`}>{stakeAmount >= 7500 && <CheckMark />} Small (7,500 ISLAND)</p>
                <p className={`flex items-center ${getBoostClass(15000)}`}>{stakeAmount >= 15000 && <CheckMark />} Medium (15,000 ISLAND)</p>
                <p className={`flex items-center ${getBoostClass(30000)}`}>{stakeAmount >= 30000 && <CheckMark />} Large (30,000 ISLAND)</p>
              </div>
            </div>

            {/* Other Rewards */}
            <div className="space-y-4">
              <div className="bg-[#262933]/50 p-4 rounded-xl border border-[#363a47]">
                <h4 className="text-[#4fffbc] font-medium mb-1">Bloom Reward Pass</h4>
                <p className="text-xs text-gray-400 mb-2">Mint active bloom rewards for free.</p>
                <p className={`text-sm flex items-center ${getBoostClass(1000)}`}>{stakeAmount >= 1000 && <CheckMark />} Unlocked (1,000 ISLAND)</p>
              </div>
              <div className="bg-[#262933]/50 p-4 rounded-xl border border-[#363a47]">
                <h4 className="text-[#4fffbc] font-medium mb-1">Gacha Spin</h4>
                <p className="text-xs text-gray-400 mb-2">Spin the Bloom Gacha for free.</p>
                <p className={`text-sm flex items-center ${getBoostClass(150)}`}>{stakeAmount >= 150 && <CheckMark />} Unlocked (150 ISLAND)</p>
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
    <div className="h-full flex flex-col bg-[#0F1014] text-white font-sans selection:bg-[#4fffbc]/30">
      {/* Header */}
      <header className="flex-none px-6 py-4 bg-[#16171D]/50 backdrop-blur-md border-b border-[#262933] flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#262933] rounded-lg border border-[#363a47]">
            <Palmtree className="w-6 h-6 text-[#4fffbc]" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#ffe500] via-[#cf68fb] to-[#4fffbc] text-transparent bg-clip-text">
            Nifty Island Calculator
          </h1>
        </div>

        <div className="flex bg-[#262933] p-1 rounded-xl border border-[#363a47]">
          <button
            onClick={() => setActiveTab('p2e')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'p2e'
              ? 'bg-[#0F1014] text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            Play to Earn
          </button>
          <button
            onClick={() => setActiveTab('stake')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'stake'
              ? 'bg-[#0F1014] text-white shadow-lg'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            Stake to Earn
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#cf68fb]/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4fffbc]/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative h-full max-w-[1920px] mx-auto">
          {activeTab === 'p2e' ? <PlayToEarnCalculator /> : <StakeToEarnCalculator />}
        </div>
      </main>
    </div>
  );
}

export default App;