export { useProductionPhase } from "./useProductionPhase";

export function ProductionPhaseSection({
  productionPhaseDetails,
  error,
  successMessage,
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-400">
        <p>Production Phase Management</p>
        {error && <p className="text-red-400 mt-2">{error}</p>}
        {successMessage && <p className="text-green-400 mt-2">{successMessage}</p>}
      </div>

      <div className="space-y-3">
        {productionPhaseDetails.length === 0 ? (
          <p className="text-slate-500 text-sm">No production phases added yet</p>
        ) : (
          productionPhaseDetails.map((phase, idx) => (
            <div key={idx} className="p-3 bg-slate-700 rounded border border-slate-600">
              <p className="text-sm font-medium ">{phase.name || `Phase ${idx + 1}`}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
