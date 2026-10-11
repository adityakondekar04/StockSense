import React, { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Play, Pause, CheckCircle2, AlertTriangle } from "lucide-react";

export type SimulationMode = "without" | "with";

interface StepConfig {
  day: string;
  dayShort: string;
  stock: number;
  status: "ORDER_NOW" | "DELIVERED" | "OUT_OF_STOCK" | null;
  explanation: string;
  durationMs: number;
  isDeliveryArrival?: boolean;
}

const TOTAL_PACKETS = 15;
const REORDER_POINT = 6;

// Deterministic sales schedule for both modes
const WITHOUT_STOCKSENSE_STEPS: StepConfig[] = [
  {
    day: "Monday",
    dayShort: "Mon",
    stock: 15,
    status: null,
    explanation: "Customers are buying. Stock is healthy.",
    durationMs: 1400,
  },
  {
    day: "Tuesday",
    dayShort: "Tue",
    stock: 13,
    status: null,
    explanation: "Customers are buying. Stock is healthy.",
    durationMs: 1300,
  },
  {
    day: "Wednesday",
    dayShort: "Wed",
    stock: 10,
    status: null,
    explanation: "Midweek sales continue. No replenishment trigger exists.",
    durationMs: 1300,
  },
  {
    day: "Thursday",
    dayShort: "Thu",
    stock: 8,
    status: null,
    explanation: "Stock decreases with daily purchases. Shopkeeper relies on guesswork.",
    durationMs: 1300,
  },
  {
    day: "Friday",
    dayShort: "Fri",
    stock: 6,
    status: null,
    explanation: "Stock reaches the reorder point, but no purchase order is sent.",
    durationMs: 1400,
  },
  {
    day: "Saturday",
    dayShort: "Sat",
    stock: 4,
    status: null,
    explanation: "Inventory falls below safety threshold. Weekend demand increases.",
    durationMs: 1400,
  },
  {
    day: "Sunday morning",
    dayShort: "Sun AM",
    stock: 2,
    status: null,
    explanation: "Stock is critically low. Supplier lead time means stockout is now inevitable.",
    durationMs: 1400,
  },
  {
    day: "Sunday afternoon",
    dayShort: "Sun PM",
    stock: 0,
    status: "OUT_OF_STOCK",
    explanation: "The order was not placed early enough. The shelf is empty.",
    durationMs: 3000,
  },
];

const WITH_STOCKSENSE_STEPS: StepConfig[] = [
  {
    day: "Monday",
    dayShort: "Mon",
    stock: 15,
    status: null,
    explanation: "Customers are buying. Stock is healthy.",
    durationMs: 1400,
  },
  {
    day: "Tuesday",
    dayShort: "Tue",
    stock: 13,
    status: null,
    explanation: "Customers are buying. Stock is healthy.",
    durationMs: 1300,
  },
  {
    day: "Wednesday",
    dayShort: "Wed",
    stock: 10,
    status: null,
    explanation: "StockSense continuously reviews demand rate against supplier lead time.",
    durationMs: 1300,
  },
  {
    day: "Thursday",
    dayShort: "Thu",
    stock: 8,
    status: null,
    explanation: "Stock approaches safety threshold. Continuous review algorithm active.",
    durationMs: 1300,
  },
  {
    day: "Friday",
    dayShort: "Fri",
    stock: 6,
    status: "ORDER_NOW",
    explanation: "StockSense: stock is at the reorder point, so the order goes out today.",
    durationMs: 1600,
  },
  {
    day: "Saturday",
    dayShort: "Sat",
    stock: 4,
    status: "ORDER_NOW",
    explanation: "Purchase order in transit. Calculated safety buffer absorbs weekend demand.",
    durationMs: 1400,
  },
  {
    day: "Sunday morning",
    dayShort: "Sun AM",
    stock: 2,
    status: "ORDER_NOW",
    explanation: "Shelf reaches safety stock just as the scheduled replenishment shipment arrives.",
    durationMs: 1400,
  },
  {
    day: "Sunday afternoon",
    dayShort: "Sun PM",
    stock: 11,
    status: "DELIVERED",
    isDeliveryArrival: true,
    explanation: "The delivery lands just as the shelf thins. No empty shelf.",
    durationMs: 3000,
  },
];

export const InventorySimulation: React.FC = () => {
  const [mode, setMode] = useState<SimulationMode>("with");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = mode === "with" ? WITH_STOCKSENSE_STEPS : WITHOUT_STOCKSENSE_STEPS;
  const currentStep = steps[stepIndex] || steps[0];

  // Clean timer cleanup
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Mode change handler
  const handleModeChange = (newMode: SimulationMode) => {
    clearTimer();
    setMode(newMode);
    setStepIndex(0);
    setIsPlaying(true);
  };

  // Replay handler
  const handleReplay = () => {
    clearTimer();
    setStepIndex(0);
    setIsPlaying(true);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      clearTimer();
      setIsPlaying(false);
    } else {
      // If at end, restart
      if (stepIndex >= steps.length - 1) {
        setStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  // Step jumper
  const handleJumpToStep = (index: number) => {
    clearTimer();
    setStepIndex(index);
    setIsPlaying(false);
  };

  // Main animation timer runner
  useEffect(() => {
    clearTimer();

    if (!isPlaying) return;

    if (stepIndex < steps.length - 1) {
      const delay = currentStep.durationMs;
      timerRef.current = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
      }, delay);
    } else {
      // Simulation finished, stay on final step
      setIsPlaying(false);
    }

    return () => {
      clearTimer();
    };
  }, [stepIndex, isPlaying, mode, steps, currentStep.durationMs, clearTimer]);

  // Derive visible packets
  // Packets are arranged on shelf from left to right (indices 0 to 14).
  // Current stock count means packets 0 to (currentStep.stock - 1) are on shelf.
  const activeStock = currentStep.stock;

  return (
    <div className="w-full bg-white rounded-3xl border border-[#ebebeb] p-6 sm:p-10 lg:p-12 shadow-sm">
      {/* 1. Header & Mode Switcher Grid */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-[#ebebeb]">
        {/* Left Heading & Supporting Copy */}
        <div className="space-y-4 max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2f2f2] text-[#4d4d4d] text-xs font-mono font-medium">
            <span>INTERACTIVE SIMULATION</span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span>7-DAY CYCLE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
            <span className="block text-[#171717]">Know before</span>
            <span className="block text-[#8f8f8f]">it runs out.</span>
          </h2>

          <p className="text-base text-[#4d4d4d] leading-relaxed font-normal">
            StockSense tells a small shop when to reorder and how much, and shows its working. Watch the
            same week of sales, twice.
          </p>
        </div>

        {/* Right Controls: Mode Toggle Pills & Replay */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Mode Selector Pill Buttons */}
          <div
            role="group"
            aria-label="Simulation Mode"
            className="inline-flex p-1 rounded-full bg-[#f2f2f2] border border-[#ebebeb]"
          >
            <button
              type="button"
              onClick={() => handleModeChange("without")}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                mode === "without"
                  ? "bg-[#171717] text-white shadow-sm"
                  : "text-[#4d4d4d] hover:text-[#171717] hover:bg-white/60"
              }`}
            >
              Without StockSense
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("with")}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                mode === "with"
                  ? "bg-[#171717] text-white shadow-sm"
                  : "text-[#4d4d4d] hover:text-[#171717] hover:bg-white/60"
              }`}
            >
              With StockSense
            </button>
          </div>

          {/* Action buttons: Play/Pause and Replay */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayPause}
              title={isPlaying ? "Pause simulation" : "Play simulation"}
              aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-[#ebebeb] text-[#171717] hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              title="Replay simulation from start"
              aria-label="Replay simulation from start"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#ebebeb] text-xs font-medium text-[#171717] hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Timeline Step Bar */}
      <div className="py-4 border-b border-[#f2f2f2] flex items-center justify-between text-xs text-[#8f8f8f]">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar max-w-full">
          <span className="text-[11px] font-mono text-[#a1a1a1] uppercase pr-1 shrink-0">Timeline:</span>
          {steps.map((st, idx) => {
            const isActive = idx === stepIndex;
            const isPassed = idx < stepIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleJumpToStep(idx)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#171717] text-white font-semibold"
                    : isPassed
                    ? "text-[#171717] bg-[#f2f2f2]"
                    : "text-[#a1a1a1] hover:text-[#4d4d4d]"
                }`}
              >
                {st.dayShort}
              </button>
            );
          })}
        </div>
        <div className="text-right hidden sm:block font-mono text-[11px] text-[#4d4d4d]">
          {currentStep.day}
        </div>
      </div>

      {/* 3. The Interactive Shelf Simulation Stage */}
      <div className="pt-12 pb-8 sm:pt-16 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Top Marker Zone (Reorder threshold label & indicator) */}
          <div className="relative w-full h-8 mb-2">
            {/* Reorder point label pinned above 6th packet boundary (40% width) */}
            <div
              className="absolute top-0 flex flex-col items-center pointer-events-none transition-all duration-300"
              style={{ left: "40%", transform: "translateX(-50%)" }}
            >
              <div className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200/90 px-2.5 py-0.5 rounded-full shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>reorder point</span>
              </div>
            </div>
          </div>

          {/* Main Shelf Container */}
          <div className="relative w-full">
            {/* Vertical Amber Dotted Line across the shelf at 40% (between packet 6 and 7) */}
            <div
              className="absolute top-0 bottom-3 w-0 border-r-2 border-dashed border-amber-400 pointer-events-none z-10 transition-all duration-300"
              style={{ left: "40%" }}
            />

            {/* Shelf Items Area */}
            <div className="relative h-20 sm:h-24 md:h-28 flex items-end justify-between px-2 sm:px-4 pb-2">
              {Array.from({ length: TOTAL_PACKETS }).map((_, idx) => {
                const isPacketPresent = idx < activeStock;
                const isNewlyDelivered =
                  currentStep.isDeliveryArrival && isPacketPresent && idx >= 2;

                return (
                  <div
                    key={idx}
                    className="relative flex-1 flex flex-col items-center justify-end h-full px-0.5 sm:px-1"
                  >
                    {/* The Product Packet */}
                    <div
                      className={`w-full max-w-[28px] sm:max-w-[38px] md:max-w-[42px] h-14 sm:h-18 md:h-22 rounded-[3px] border bg-white flex flex-col justify-between p-0.5 sm:p-1 transition-all duration-300 ease-out select-none ${
                        isPacketPresent
                          ? isNewlyDelivered
                            ? "opacity-100 translate-y-0 scale-100 border-[#171717] shadow-sm animate-delivery-arrival ring-1 ring-emerald-400"
                            : "opacity-100 translate-y-0 scale-100 border-slate-700/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                          : "opacity-0 -translate-y-3 scale-90 pointer-events-none"
                      }`}
                    >
                      {/* Subtle Packet Detail: Top Tuck Flap */}
                      <div className="w-full h-1 sm:h-1.5 border-b border-slate-200 bg-slate-50/70 rounded-t-[1px]" />

                      {/* Subtle Packet Detail: Center pill icon / graphic */}
                      <div className="w-full flex-1 flex items-center justify-center my-0.5">
                        <div className="w-2 sm:w-3.5 h-1 sm:h-1.5 rounded-full bg-slate-200" />
                      </div>

                      {/* Subtle Packet Detail: Bottom barcode / SKU tick line */}
                      <div className="w-3/4 mx-auto h-[1px] bg-slate-300/80" />
                    </div>

                    {/* Packet Index Label for Storekeeper Clarity */}
                    <span
                      className={`text-[9px] font-mono mt-1 transition-opacity ${
                        isPacketPresent ? "text-slate-400" : "text-transparent"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Horizontal Shelf Structure: Plank Surface & Edge */}
            <div className="w-full">
              {/* Shelf Top Line & Solid Plank */}
              <div className="h-2.5 sm:h-3 w-full bg-gradient-to-b from-slate-200 to-slate-100 border-t border-b border-slate-300 rounded-sm shadow-xs" />
              {/* Shelf Under-Shadow */}
              <div className="h-3 w-full bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Counter, Order Status Stamp & Narrative Display */}
      <div className="mt-4 pt-6 border-t border-[#ebebeb]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Live Stock Counter */}
          <div className="md:col-span-4 flex items-baseline gap-3">
            <span
              className={`text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight font-mono transition-colors duration-200 ${
                activeStock === 0
                  ? "text-red-600"
                  : activeStock <= REORDER_POINT
                  ? "text-amber-600"
                  : "text-[#171717]"
              }`}
            >
              {activeStock}
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-[#8f8f8f] font-normal">
                packets left on the shelf
              </span>
              <span className="text-[11px] font-mono text-[#a1a1a1]">
                Capacity: {TOTAL_PACKETS} · ROP: {REORDER_POINT}
              </span>
            </div>
          </div>

          {/* Middle Column: Compact Status Stamp */}
          <div className="md:col-span-3 min-h-[2.5rem] flex md:justify-center items-center">
            {currentStep.status === "ORDER_NOW" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-red-500 text-red-600 bg-red-50/90 shadow-xs animate-status-stamp">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>ORDER NOW</span>
              </div>
            )}

            {currentStep.status === "OUT_OF_STOCK" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-red-500 text-red-600 bg-red-50/90 shadow-xs animate-status-stamp">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>OUT OF STOCK</span>
              </div>
            )}

            {currentStep.status === "DELIVERED" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-emerald-500 text-emerald-700 bg-emerald-50/90 shadow-xs animate-status-stamp">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>DELIVERED</span>
              </div>
            )}
          </div>

          {/* Right Column: Explanatory Narrative Sentence */}
          <div className="md:col-span-5 bg-[#fafafa] border border-[#ebebeb] rounded-2xl p-4 min-h-[4rem] flex items-center">
            <p className="text-xs sm:text-sm text-[#171717] font-medium leading-relaxed transition-opacity duration-200">
              {currentStep.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySimulation;
