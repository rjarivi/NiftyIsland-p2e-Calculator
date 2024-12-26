import React from 'react';
import { Calculator, Coins, Palmtree, TrendingUp, RefreshCw } from 'lucide-react';

// Play intensity configurations
const PLAY_INTENSITIES = {
  casual: { name: 'Casual', bloomsPerDay: 1500, bloomsPerCycle: 15000 },
  medium: { name: 'Medium', bloomsPerDay: 3000, bloomsPerCycle: 30000 },
  high: { name: 'High', bloomsPerDay: 6000, bloomsPerCycle: 60000 },
  super: { name: 'Super User', bloomsPerDay: 14000, bloomsPerCycle: 140000 },
  custom: { name: 'Custom', bloomsPerDay: 0, bloomsPerCycle: 0 }
};

// Palm NFT configurations
const PALM_TIERS = {
  none: { cap: 100, name: 'No Palm' },
  iron: { cap: 300, name: 'Iron Palm' },
  bronze: { cap: 500, name: 'Bronze Palm' },
  silver: { cap: 900, name: 'Silver Palm' },
  gold: { cap: 1700, name: 'Gold Palm' },
  neon: { cap: 3300, name: 'Neon Palm' },
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

// Base cycle caps (from Data.csv)
const BASE_CYCLE_CAP = 100;
const MAX_CYCLE_CAP = 6400;

function PlayToEarnCalculator() {
  const [currentPrice, setCurrentPrice] = React.useState(0.05);
  const [isLoadingPrice, setIsLoadingPrice] = React.useState(false);
  const [playIntensity, setPlayIntensity] = React.useState('casual');
  const [customBlooms, setCustomBlooms] = React.useState(0);
  const [selectedPalms, setSelectedPalms] = React.useState<{ tier: string; count: number }[]>([]);
  const [selectedTier, setSelectedTier] = React.useState('none');
  const [palmCount, setPalmCount] = React.useState(1);
  const [stakeAmount, setStakeAmount] = React.useState(0); // Default from P2E Calculator.csv
  const [compoundRate, setCompoundRate] = React.useState(100); // Default 100% compound

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

  React.useEffect(() => {
    setCurrentPrice(0.05); // Set initial price
  }, []);

  const calculateEarnRate = () => {
    // Find the appropriate rate tier
    const applicableRate = STAKE_EARN_RATES
      .slice()
      .reverse()
      .find(tier => stakeAmount >= tier.threshold);
    
    if (!applicableRate) return 1;

    // For amounts between 1000 and 10000, interpolate between 2x and 8x
    if (stakeAmount >= 1000 && stakeAmount < 10000) {
      const position = (stakeAmount - 1000) / (10000 - 1000);
      return 2 + (position * (8 - 2));
    }

    return applicableRate.rate;
  };

  const calculateMaxCap = () => {
    const baseCap = 100; // Default cap for No Palm
    const additionalCap = selectedPalms.reduce((acc, palm) => acc + PALM_TIERS[palm.tier].cap * palm.count, 0);
    return baseCap + additionalCap;
  };

  const maxCap = calculateMaxCap();

  const calculateEarnings = () => {
    const price = currentPrice;
    const { bloomsPerDay, bloomsPerCycle } = playIntensity === 'custom' ? PLAY_INTENSITIES.custom : PLAY_INTENSITIES[playIntensity];
    const earnRate = calculateEarnRate();
    
    // Calculate base earnings
    const dailyBaseIsland = (bloomsPerDay * earnRate) / 1000;
    const cycleBaseIsland = (bloomsPerCycle * earnRate) / 1000;
    
    // Apply caps
    const dailyIsland = Math.min(dailyBaseIsland, maxCap / 10);
    const cycleIsland = Math.min(cycleBaseIsland, maxCap);
    
    // Calculate USD values
    const dailyUSD = dailyIsland * price;
    const cycleUSD = cycleIsland * price;

    return {
      daily: {
        baseIsland: dailyBaseIsland,
        island: dailyIsland,
        usd: dailyUSD
      },
      cycle: {
        baseIsland: cycleBaseIsland,
        island: cycleIsland,
        usd: cycleUSD
      }
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#ffe500]" />
            Token Price
          </h2>
          <div className="space-y-2">
            <p className="text-gray-400">Current ISLAND Price or Enter Future Price Prediction:</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.000001"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
                placeholder="Enter price"
              />
              <button
                onClick={fetchCurrentPrice}
                disabled={isLoadingPrice}
                className="p-2 rounded-lg bg-[#262933] border border-[#363a47] hover:bg-[#2f3341] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-[#4fffbc] ${isLoadingPrice ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#cf68fb]" />
            Play Intensity
          </h2>
          <p className="text-sm text-gray-400 mt-1">Choose your desired daily play intensity. More play means more gains!</p>
          <div className="relative">
            {playIntensity === 'custom' ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Enter daily blooms"
                  value={customBlooms}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setCustomBlooms(value);
                    PLAY_INTENSITIES.custom.bloomsPerDay = value;
                    PLAY_INTENSITIES.custom.bloomsPerCycle = value * 10;
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
                />
                <button
                  onClick={() => setPlayIntensity('casual')}
                  className="px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] hover:bg-[#2f3341] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={playIntensity}
                onChange={(e) => {
                  setPlayIntensity(e.target.value);
                  if (e.target.value === 'custom') {
                    setCustomBlooms(0);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
              >
                {Object.entries(PLAY_INTENSITIES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}{key !== 'custom' ? ` - ${value.bloomsPerDay.toLocaleString()} Blooms/Day` : ''}
                  </option>
                ))}
              </select>
            )}
            {playIntensity === 'custom' && customBlooms > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Cycle blooms (10 days): {(customBlooms * 10).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Palmtree className="w-5 h-5 text-[#4fffbc]" />
            Palms NFT
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
            >
              {Object.entries(PALM_TIERS).map(([tier, { name, cap }]) => (
                <option key={tier} value={tier}>
                  {name} - {cap} cap
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={palmCount}
              onChange={(e) => setPalmCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
            />
            <button
              onClick={handleAddPalm}
              className="p-2 rounded-lg bg-[#262933] border border-[#363a47] hover:bg-[#2f3341] transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedPalms.map((palm, index) => (
              <div key={index} className="flex items-center gap-2 bg-[#262933] px-3 py-1 rounded-lg">
                <span className="text-[#4fffbc]">{PALM_TIERS[palm.tier].name} x {palm.count}</span>
                <button
                  onClick={() => handleRemovePalm(index)}
                  className="text-red-500 hover:underline"
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 bg-[#262933] rounded-xl mt-6">
            <h3 className="text-lg font-medium mb-4">Earnings Estimate</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Daily Earnings</h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pre-Cap:</span>
                    <span className="text-[#4fffbc]">{earnings.daily.baseIsland.toFixed(2)} ISLAND</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">After Cap:</span>
                    <span className="text-2xl font-bold text-[#4fffbc]">{earnings.daily.island.toFixed(2)} ISLAND</span>
                  </div>
                  <p className="text-gray-400">≈ ${earnings.daily.usd.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Cycle Earnings (10 days)</h4>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pre-Cap:</span>
                    <span className="text-[#4fffbc]">{earnings.cycle.baseIsland.toFixed(2)} ISLAND</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">After Cap:</span>
                    <span className="text-2xl font-bold text-[#4fffbc]">{earnings.cycle.island.toFixed(2)} ISLAND</span>
                  </div>
                  <p className="text-gray-400">≈ ${earnings.cycle.usd.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">Max Cap: {maxCap.toLocaleString()} ISLAND</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#cf68fb]" />
            Staking Boost
          </h2>
          <p className="text-sm text-gray-400 mt-1">Enter the amount to check the benefits of your stake</p>
          <input
            type="number"
            min="0"
            step="0.000000001"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Math.max(0, parseFloat(e.target.value)))}
            className="w-full px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
            placeholder="Enter stake amount"
          />
          <p className="text-sm text-gray-400 mt-1">≈ ${(stakeAmount * currentPrice).toFixed(2)}</p>
          <div>
            <label className="block text-sm font-medium mb-1">Compound Rate: {compoundRate}%</label>
            <div className="relative h-2 mb-8">
              <div className="absolute inset-0 bg-[#262933] rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0 rounded-lg"
                  style={{
                    width: `${compoundRate}%`,
                    background: 'linear-gradient(to right, #ffe500, #cf68fb, #4fffbc)'
                  }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={compoundRate}
                onChange={(e) => setCompoundRate(parseInt(e.target.value))}
                className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:translate-y-[-1px] [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:translate-y-[-1px]"
              />
              <div className="absolute w-full flex justify-between text-xs text-gray-400" style={{ top: '16px' }}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-[#1a1b23] rounded-lg">
            <h3 className="text-lg font-medium mb-2">My Earning Power</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Staking more ISLAND increases the amount of ISLAND you earn per 1,000 blooms.
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Staked ISLAND:</span>
                  <span className="text-[#4fffbc]">{stakeAmount.toLocaleString(undefined, { maximumFractionDigits: 10 })} $ISLAND</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Earning Rate:</span>
                  <span className="text-[#4fffbc]">+{calculateEarnRate().toFixed(2)} per 1000 blooms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Boost:</span>
                  <span className="text-[#4fffbc]">+{(calculateEarnRate() - 1).toFixed(2)} ISLAND</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p className="mb-2">Disclaimers:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>This calculator is for approximation purposes only and some error due to the exact time of staking and fluctuation of token price should be expected.</li>
          <li>The P2E system earning rate and structure may change over time, so this version of the calculator may be outdated. The most recent info will be available on the Rewards Dashboard.</li>
        </ul>
      </div>
    </div>
  );
}

function StakeToEarnCalculator() {
  const [currentPrice, setCurrentPrice] = React.useState(0);
  const [futurePrice, setFuturePrice] = React.useState('');
  const [stakeAmount, setStakeAmount] = React.useState(0);
  const [compoundRate, setCompoundRate] = React.useState(0);
  const [isLoadingPrice, setIsLoadingPrice] = React.useState(false);

  React.useEffect(() => {
    setCurrentPrice(0.05); // Set initial price
  }, []);

  const getUnlockedTiers = () => {
    return STAKE_TIERS.filter(tier => stakeAmount >= tier.amount);
  };

  const getNextTier = () => {
    return STAKE_TIERS.find(tier => stakeAmount < tier.amount);
  };

  const getBoostClass = (threshold: number) => {
    return stakeAmount >= threshold ? "" : "opacity-50";
  };

  const CheckMark = () => (
    <span className="text-green-500 mr-2">✔</span>
  );

  const price = futurePrice ? parseFloat(futurePrice) : currentPrice;
  const valueUSD = stakeAmount * price;
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

  const calculateEarnRate = () => {
    return 1 + (stakeAmount * compoundRate / 100);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#ffe500]" />
            Token Price
          </h2>
          <div className="space-y-2">
            <p className="text-gray-400">Current ISLAND Price or Enter Future Price Prediction:</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.000001"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
                placeholder="Enter price"
              />
              <button
                onClick={fetchCurrentPrice}
                disabled={isLoadingPrice}
                className="p-2 rounded-lg bg-[#262933] border border-[#363a47] hover:bg-[#2f3341] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-[#4fffbc] ${isLoadingPrice ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#cf68fb]" />
            Stake Amount
          </h2>
          <p className="text-sm text-gray-400 mt-1">Enter the amount to check the benefits of your stake</p>
          <input
            type="number"
            placeholder="Enter amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Math.max(0, parseFloat(e.target.value)))}
            className="w-full px-4 py-2 rounded-lg bg-[#262933] border border-[#363a47] focus:outline-none focus:border-[#4fffbc]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-[#262933] rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Next Tier</h2>
          {nextTier ? (
            <>
              <p className="text-lg font-medium">{nextTier.reward}</p>
              <p className="text-gray-400">
                Stake {(nextTier.amount - stakeAmount).toLocaleString()} more ISLAND to unlock
              </p>
            </>
          ) : (
            <p className="text-gray-400">You've reached the highest tier!</p>
          )}
        </div>

        <div className="p-6 bg-[#262933] rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Unlocked Rewards</h2>
          {unlockedTiers.length > 0 ? (
            <div className="space-y-4">
              {unlockedTiers.map((tier, index) => (
                <div key={index} className="flex items-center gap-3 text-[#4fffbc]">
                  <div className="w-2 h-2 rounded-full bg-[#4fffbc]" />
                  <p>{tier.reward}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Stake at least 150 ISLAND to unlock rewards</p>
          )}
        </div>
      </div>

      <div className="p-6 bg-[#262933] rounded-xl mt-6">
        <h2 className="text-xl font-semibold mb-2">Staking Benefits Calculator</h2>
        <h3 className="text-lg font-semibold text-[#ffe500]">Consumables</h3>
        <p className="text-gray-400 mb-4">Unlock free boosts, bloom rewards, and gacha spins by staking ISLAND!</p>
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#2e313c] p-4 rounded-lg">
            <div>
              <h4 className="text-lg font-medium text-[#4fffbc]">Island Bloom Boost</h4>
              <p className="text-sm text-gray-400">Increase the amount of blooms earned on your island for a short time.</p>
            </div>
            <div className="text-right">
              <p className={`text-sm flex items-center ${getBoostClass(7500)}`}>{stakeAmount >= 7500 && <CheckMark />}0/3 Small - Stake at least 7,500 ISLAND</p>
              <p className={`text-sm flex items-center ${getBoostClass(15000)}`}>{stakeAmount >= 15000 && <CheckMark />}0/2 Medium - Stake at least 15,000 ISLAND</p>
              <p className={`text-sm flex items-center ${getBoostClass(30000)}`}>{stakeAmount >= 30000 && <CheckMark />}0/2 Large - Stake at least 30,000 ISLAND</p>
            </div>
          </div>
          <div className="flex justify-between items-center bg-[#2e313c] p-4 rounded-lg">
            <div>
              <h4 className="text-lg font-medium text-[#4fffbc]">Bloom Reward Pass</h4>
              <p className="text-sm text-gray-400">Mint any currently active bloom reward for free.</p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${getBoostClass(1000)}`}>{stakeAmount >= 1000 && <CheckMark />}0/5 - Earning rate 1 every 59 days</p>
            </div>
          </div>
          <div className="flex justify-between items-center bg-[#2e313c] p-4 rounded-lg">
            <div>
              <h4 className="text-lg font-medium text-[#4fffbc]">Gacha Spin</h4>
              <p className="text-sm text-gray-400">Spin the Bloom Gacha once for free.</p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${getBoostClass(150)}`}>{stakeAmount >= 150 && <CheckMark />}0/10 - Earning rate 1 every 10 days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-400">
        <p className="mb-2">Disclaimers:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>This calculator is for approximation purposes only and some error due to the exact time of staking and fluctuation of token price should be expected.</li>
          <li>The staking benefits and structure may change over time, so this version of the calculator may be outdated.</li>
        </ul>
      </div>
    </div>
  );
}

function MainCalculator() {
  const [activeTab, setActiveTab] = React.useState('p2e');

  React.useEffect(() => {
    document.title = "Nifty Island P2E Calculator";
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('p2e')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'p2e'
              ? 'bg-gradient-to-r from-[#ffe500] via-[#cf68fb] to-[#4fffbc] text-black'
              : 'bg-[#262933] text-white hover:bg-[#2e313c]'
          }`}
        >
          Play to Earn Calculator
        </button>
        <button
          onClick={() => setActiveTab('stake')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'stake'
              ? 'bg-gradient-to-r from-[#ffe500] via-[#cf68fb] to-[#4fffbc] text-black'
              : 'bg-[#262933] text-white hover:bg-[#2e313c]'
          }`}
        >
          Stake to Earn Calculator
        </button>
      </div>

      <div className="flex">
        <div className="flex-1 mr-8">
          <div className="bg-[#16171D] rounded-xl p-6 border border-[#262933]">
            {activeTab === 'p2e' ? <PlayToEarnCalculator /> : <StakeToEarnCalculator />}
          </div>
        </div>
        <aside className="w-64 p-4 bg-[#16171D] text-white rounded-xl border border-[#262933]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Featured Island</h3>
            <div className="p-4 bg-[#262933] rounded-lg">
              <p className="mb-2">Island Name: FlashPoint</p>
              <a
                href="https://niftyis.land/f7ash/flashpoint?ref=f7ash"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg text-black font-semibold"
                style={{
                  background: 'linear-gradient(90deg, #fde00a, #d373e4, #5bf1c2)'
                }}
              >
                Visit Island
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Promoted Island</h3>
            <div className="p-4 bg-[#262933] rounded-lg">
              <p className="mb-2">Your Name</p>
              <p className="text-sm text-gray-400 mb-2">Your island could be here</p>
              <a
                href="https://niftyis.land/f7ash/flashpoint?ref=f7ash"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-lg text-black font-semibold"
                style={{
                  background: 'linear-gradient(90deg, #fde00a, #d373e4, #5bf1c2)'
                }}
              >
                Visit Island
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="bg-[#16171D] border-b border-[#262933] p-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palmtree className="w-8 h-8 text-[#4fffbc]" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ffe500] via-[#cf68fb] to-[#4fffbc] text-transparent bg-clip-text">
            Nifty Island Calculator
          </h1>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#16171D] text-white p-4 mt-8 border-t border-[#262933]">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">Support the creator</p>
        <div className="flex items-center gap-4">
          <a
            href="https://niftyis.land/f7ash/flashpoint?ref=f7ash"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-lg text-black font-semibold"
            style={{
              background: 'linear-gradient(90deg, #fde00a, #d373e4, #5bf1c2)'
            }}
          >
            Visit Island
          </a>
          <a
            href="https://x.com/rjarivi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="https://cdn.brandfetch.io/idS5WhqBbM/theme/light/logo.svg?c=1bfwsmEH20zzEfSNTed" alt="X.com Logo" className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#0F1014] text-white">
      <Header />
      <MainCalculator />
      <Footer />
    </div>
  );
}

export default App;