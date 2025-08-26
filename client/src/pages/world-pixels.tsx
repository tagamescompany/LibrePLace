import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import WorldMap from "@/components/world-map";
import ColorPalette from "@/components/color-palette";
import StatsPanel from "@/components/stats-panel";
import { useToast } from "@/hooks/use-toast";
import type { Pixel } from "@shared/schema";

export default function WorldPixels() {
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [drawingMode, setDrawingMode] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const [currentCoordinates, setCurrentCoordinates] = useState({ lat: 20, lng: 0 });
  const [currentZoom, setCurrentZoom] = useState(3);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const { toast } = useToast();

  // Fetch all pixels
  const { data: pixels, isLoading } = useQuery<Pixel[]>({
    queryKey: ["/api/pixels"],
  });

  // Fetch statistics
  const { data: stats } = useQuery<{
    totalPixels: number;
    recentPixels: any[];
    contributors: number;
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Pixel placement mutation
  const placePixelMutation = useMutation({
    mutationFn: async (pixelData: { latitude: number; longitude: number; color: string; brushSize: number }) => {
      const response = await apiRequest("POST", "/api/pixels", {
        ...pixelData,
        placedBy: "Anonymous",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pixels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Pixel placed!",
        description: "Your pixel has been added to the world map.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place pixel. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Pixel deletion mutation
  const deletePixelMutation = useMutation({
    mutationFn: async (coords: { latitude: number; longitude: number }) => {
      const response = await apiRequest("DELETE", "/api/pixels", coords);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pixels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Pixel erased!",
        description: "The pixel has been removed from the world map.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to erase pixel. No pixel found at this location.",
        variant: "destructive",
      });
    },
  });

  const handlePixelPlace = (lat: number, lng: number) => {
    if (!drawingMode && !eraseMode) return;
    
    // Normalize longitude to be within -180 to 180 range
    let normalizedLng = lng;
    while (normalizedLng > 180) normalizedLng -= 360;
    while (normalizedLng < -180) normalizedLng += 360;
    
    // Clamp latitude to be within -90 to 90 range
    const normalizedLat = Math.max(-90, Math.min(90, lat));
    
    // Snap to grid for perfect alignment (grid size based on brush size)
    const gridSize = brushSize * 0.0008; // Same as pixel size
    const snappedLat = Math.round(normalizedLat / gridSize) * gridSize;
    const snappedLng = Math.round(normalizedLng / gridSize) * gridSize;
    
    if (eraseMode) {
      // Erase pixel
      deletePixelMutation.mutate({
        latitude: snappedLat,
        longitude: snappedLng,
      });
    } else {
      // Place pixel
      placePixelMutation.mutate({
        latitude: snappedLat,
        longitude: snappedLng,
        color: selectedColor,
        brushSize,
      });
    }
  };

  const handleCoordinatesUpdate = (lat: number, lng: number) => {
    setCurrentCoordinates({ lat, lng });
  };

  const handleZoomUpdate = (zoom: number) => {
    setCurrentZoom(zoom);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Loading World Map</h2>
          <p className="text-slate-400">Preparing unlimited pixel canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Map Container */}
      <WorldMap
        pixels={pixels || []}
        onPixelPlace={handlePixelPlace}
        onCoordinatesUpdate={handleCoordinatesUpdate}
        onZoomUpdate={handleZoomUpdate}
        selectedColor={selectedColor}
        drawingMode={drawingMode}
        eraseMode={eraseMode}
        brushSize={brushSize}
        data-testid="world-map"
      />

      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="flex justify-between items-center p-4">
          <div className="pointer-events-auto">
            <div className="bg-slate-800/90 backdrop-blur-md rounded-xl px-4 py-2 border border-slate-700/50">
              <h1 className="text-xl font-semibold text-slate-100" data-testid="title">🌍 World Pixels</h1>
              <p className="text-xs text-slate-400" data-testid="total-pixels">
                {stats?.totalPixels?.toLocaleString() || '0'} pixels placed
              </p>
            </div>
          </div>
          
          <div className="pointer-events-auto">
            <div className="bg-slate-800/90 backdrop-blur-md rounded-xl px-4 py-2 border border-slate-700/50">
              <div className="text-sm font-mono">
                <span className="text-slate-400">Lat:</span> 
                <span data-testid="current-lat" className="text-slate-100 ml-1">
                  {currentCoordinates.lat.toFixed(4)}
                </span>
                <span className="text-slate-400 ml-3">Lng:</span> 
                <span data-testid="current-lng" className="text-slate-100 ml-1">
                  {currentCoordinates.lng.toFixed(4)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Zoom: <span data-testid="current-zoom">{currentZoom}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Color Palette - Left Sidebar */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[1000] hidden md:block">
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          drawingMode={drawingMode}
          onDrawingModeToggle={setDrawingMode}
          eraseMode={eraseMode}
          onEraseModeToggle={setEraseMode}
          data-testid="desktop-color-palette"
        />
      </div>

      {/* Desktop Stats Panel - Right Sidebar */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[1000] hidden md:block">
        <StatsPanel
          stats={stats}
          pixels={pixels || []}
          data-testid="desktop-stats-panel"
        />
      </div>

      {/* Mobile Bottom Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] md:hidden">
        <div className="bg-slate-800/90 backdrop-blur-md rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 bg-primary hover:bg-blue-700 rounded-lg transition-colors duration-150"
              onClick={() => setShowMobilePalette(!showMobilePalette)}
              data-testid="button-mobile-palette"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9"></path>
              </svg>
            </button>
            
            <div 
              className="w-8 h-8 rounded-lg border border-slate-600" 
              style={{ backgroundColor: selectedColor }}
              data-testid="mobile-selected-color"
            ></div>
            
            <button 
              className={`p-2 rounded-lg transition-colors duration-150 ${
                drawingMode 
                  ? 'bg-primary hover:bg-blue-700' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              onClick={() => setDrawingMode(!drawingMode)}
              data-testid="button-mobile-drawing-mode"
            >
              <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
            
            <button 
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-150"
              onClick={() => setShowMobileStats(!showMobileStats)}
              data-testid="button-mobile-stats"
            >
              <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlays */}
      {showMobilePalette && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[1001] md:hidden">
          <ColorPalette
            selectedColor={selectedColor}
            onColorSelect={(color) => {
              setSelectedColor(color);
              setShowMobilePalette(false);
            }}
            brushSize={brushSize}
            onBrushSizeChange={setBrushSize}
            drawingMode={drawingMode}
            onDrawingModeToggle={setDrawingMode}
            eraseMode={eraseMode}
            onEraseModeToggle={setEraseMode}
            compact={true}
            data-testid="mobile-color-palette"
          />
        </div>
      )}

      {showMobileStats && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[1001] md:hidden">
          <StatsPanel
            stats={stats}
            pixels={pixels || []}
            compact={true}
            data-testid="mobile-stats-panel"
          />
        </div>
      )}
    </div>
  );
}
