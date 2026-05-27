import { useCadStore } from "../store/useCadStore";
function StatusBar() {
  const { stagePosition, stageScale, snapEnabled, gridEnabled, orthoEnabled, showMeasurements } = useCadStore();
  return <div className="flex justify-between items-center w-full">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-[#777]">COORDS:</span>
          <span className="text-white">
            {(-stagePosition.x / stageScale).toFixed(4)}, {(-stagePosition.y / stageScale).toFixed(4)}, 0.0000
          </span>
        </div>
        <div className="flex items-center space-x-4 border-l border-[#333] pl-4">
          <span className={snapEnabled ? "text-[#4a90e2]" : "text-[#777]"}>SNAP</span>
          <span className={gridEnabled ? "text-[#4a90e2]" : "text-[#777]"}>GRID</span>
          <span className={orthoEnabled ? "text-[#4a90e2]" : "text-[#777]"}>ORTHO</span>
          <span className={showMeasurements ? "text-[#4a90e2]" : "text-[#777]"}>DYN</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <span className="text-[#777]">UNITS:</span>
          <span className="text-white uppercase">Millimeters</span>
        </div>
        <div className="bg-[#1a1b1e] px-2 py-0.5 border border-[#333] rounded">
          1:1 SCALE
        </div>
        <span className="text-white">ZOOM: {(stageScale * 100).toFixed(0)}%</span>
      </div>
    </div>;
}
export {
  StatusBar
};
