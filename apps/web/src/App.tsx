import { BrowserRouter } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-indigo-600">StockSense</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                VORTEXA 3.0 · Problem S-02
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-800">Adaptive Inventory Replenishment Engine</h1>
            <p className="mt-2 text-slate-600">
              System scaffolded successfully. Core math, database layer, and UI screens will be built step-by-step.
            </p>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
