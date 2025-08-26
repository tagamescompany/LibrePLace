import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ColorPaletteProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  drawingMode: boolean;
  onDrawingModeToggle: (enabled: boolean) => void;
  eraseMode: boolean;
  onEraseModeToggle: (enabled: boolean) => void;
  compact?: boolean;
}

const COLORS = [
  '#ff0000', '#ff8800', '#ffff00', '#88ff00',
  '#00ff00', '#00ff88', '#00ffff', '#0088ff',
  '#0000ff', '#8800ff', '#ff00ff', '#ff0088',
  '#8B4513', '#ffffff', '#cccccc', '#888888', '#000000'
];

export default function ColorPalette({
  selectedColor,
  onColorSelect,
  brushSize,
  onBrushSizeChange,
  drawingMode,
  onDrawingModeToggle,
  eraseMode,
  onEraseModeToggle,
  compact = false,
}: ColorPaletteProps) {
  return (
    <div className="bg-slate-800/90 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 max-w-xs">
      <h3 className="text-sm font-medium text-slate-200 mb-3" data-testid="palette-title">
        Color Palette
      </h3>

      {/* Color Grid */}
      <div className="grid grid-cols-8 gap-1.5 mb-3" data-testid="color-grid">
        {COLORS.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-lg border-2 transition-all duration-150 hover:scale-110 focus:outline-none ${
              selectedColor === color
                ? 'border-slate-300'
                : 'border-transparent hover:border-slate-400'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            data-testid={`color-${color}`}
            data-color={color}
          />
        ))}
      </div>

      {/* Selected Color Display */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg border border-slate-600"
          style={{ backgroundColor: selectedColor }}
          data-testid="selected-color-preview"
        />
        <div>
          <p className="text-xs text-slate-300">Selected</p>
          <p className="text-xs font-mono text-slate-400" data-testid="selected-color-hex">
            {selectedColor.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Brush Size */}
      <div className="mb-3">
        <label className="text-xs text-slate-300 block mb-2" data-testid="brush-size-label">
          Brush Size
        </label>
        <Slider
          value={[brushSize]}
          onValueChange={(value) => onBrushSizeChange(value[0])}
          max={10}
          min={1}
          step={1}
          className="w-full"
          data-testid="brush-size-slider"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>1px</span>
          <span>10px</span>
        </div>
      </div>

      {/* Drawing Mode Toggle */}
      <div className="mb-4">
        <label className="flex items-center cursor-pointer" data-testid="drawing-mode-toggle">
          <input
            type="checkbox"
            className="sr-only"
            checked={drawingMode}
            onChange={(e) => {
              onDrawingModeToggle(e.target.checked);
              if (e.target.checked && eraseMode) {
                onEraseModeToggle(false);
              }
            }}
            data-testid="drawing-mode-checkbox"
          />
          <div className="relative">
            <div className={`block w-14 h-8 rounded-full transition-colors duration-150 ${
              drawingMode ? 'bg-primary' : 'bg-slate-600'
            }`} />
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-150 ${
              drawingMode ? 'transform translate-x-6' : ''
            }`} />
          </div>
          <span className="ml-3 text-sm text-slate-300">Drawing Mode</span>
        </label>
      </div>

      {/* Erase Mode Toggle */}
      <div className="mb-4">
        <label className="flex items-center cursor-pointer" data-testid="erase-mode-toggle">
          <input
            type="checkbox"
            className="sr-only"
            checked={eraseMode}
            onChange={(e) => {
              onEraseModeToggle(e.target.checked);
              if (e.target.checked && drawingMode) {
                onDrawingModeToggle(false);
              }
            }}
            data-testid="erase-mode-checkbox"
          />
          <div className="relative">
            <div className={`block w-14 h-8 rounded-full transition-colors duration-150 ${
              eraseMode ? 'bg-red-600' : 'bg-slate-600'
            }`} />
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-150 ${
              eraseMode ? 'transform translate-x-6' : ''
            }`} />
          </div>
          <span className="ml-3 text-sm text-slate-300">Erase Mode</span>
        </label>
      </div>

      {/* Action Buttons */}
      {!compact && (
        <div className="space-y-2">
          <Button
            className="w-full bg-primary hover:bg-blue-700 text-white"
            size="sm"
            data-testid="button-clear-view"
          >
            Clear View
          </Button>
          <Button
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200"
            size="sm"
            variant="outline"
            data-testid="button-export-image"
          >
            Export Image
          </Button>
        </div>
      )}
    </div>
  );
}