import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import PixelOverlay from "./pixel-overlay";
import type { Pixel } from "@shared/schema";
import type * as L from "leaflet";

interface WorldMapProps {
  pixels: Pixel[];
  onPixelPlace: (lat: number, lng: number) => void;
  onCoordinatesUpdate: (lat: number, lng: number) => void;
  onZoomUpdate: (zoom: number) => void;
  selectedColor: string;
  drawingMode: boolean;
  eraseMode: boolean;
  brushSize: number;
}

export default function WorldMap({
  pixels,
  onPixelPlace,
  onCoordinatesUpdate,
  onZoomUpdate,
  selectedColor,
  drawingMode,
  eraseMode,
  brushSize,
}: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pixelCursorRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = await import("leaflet");
      
      // Ensure map container is clean
      mapRef.current!.innerHTML = '';
      
      // Create map
      const map = L.map(mapRef.current!, {
        center: [20, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add custom zoom controls
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Add event listeners in a separate effect to ensure callbacks are current
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    const handleMouseMove = (e: L.LeafletMouseEvent) => {
      onCoordinatesUpdate(e.latlng.lat, e.latlng.lng);
      updatePixelCursor(e.originalEvent.clientX, e.originalEvent.clientY);
    };

    const handleClick = (e: L.LeafletMouseEvent) => {
      console.log('Map clicked:', e.latlng, 'Drawing mode:', drawingMode, 'Erase mode:', eraseMode);
      onPixelPlace(e.latlng.lat, e.latlng.lng);
    };

    const handleZoomMove = () => {
      onZoomUpdate(map.getZoom());
    };

    map.on('mousemove', handleMouseMove);
    map.on('click', handleClick);
    map.on('zoomend moveend', handleZoomMove);

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('click', handleClick);
      map.off('zoomend moveend', handleZoomMove);
    };
  }, [onCoordinatesUpdate, onPixelPlace, onZoomUpdate, drawingMode, eraseMode]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update cursor position
  const updatePixelCursor = (x: number, y: number) => {
    if (pixelCursorRef.current) {
      pixelCursorRef.current.style.left = `${x}px`;
      pixelCursorRef.current.style.top = `${y}px`;
    }
  };

  // Handle cursor visibility
  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement || !pixelCursorRef.current) return;

    const cursor = pixelCursorRef.current;
    
    if (drawingMode || eraseMode) {
      mapElement.style.cursor = 'none';
      cursor.classList.remove('hidden');
    } else {
      mapElement.style.cursor = '';
      cursor.classList.add('hidden');
    }

    const handleMouseEnter = () => {
      if ((drawingMode || eraseMode) && !isMobile) {
        cursor.classList.remove('hidden');
      }
    };

    const handleMouseLeave = () => {
      cursor.classList.add('hidden');
    };

    mapElement.addEventListener('mouseenter', handleMouseEnter);
    mapElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      mapElement.removeEventListener('mouseenter', handleMouseEnter);
      mapElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [drawingMode, eraseMode, isMobile]);

  return (
    <>
      <div 
        ref={mapRef} 
        className="w-full h-full bg-slate-800"
        data-testid="leaflet-map"
      />
      
      {/* Pixel Cursor */}
      <div
        ref={pixelCursorRef}
        className="absolute pointer-events-none z-[999] hidden"
        style={{
          width: `${brushSize * 4}px`,
          height: `${brushSize * 4}px`,
        }}
        data-testid="pixel-cursor"
      >
        <div
          className={`w-full h-full border-2 border-opacity-80 rounded-sm shadow-lg transform -translate-x-1/2 -translate-y-1/2 ${
            eraseMode ? 'border-red-500' : 'border-white'
          }`}
          style={{
            backgroundColor: eraseMode ? '#ff000080' : selectedColor + '80', // Red for erase mode
          }}
        />
      </div>

      {/* Pixel Overlay */}
      {isMapReady && mapInstanceRef.current && (
        <PixelOverlay
          map={mapInstanceRef.current}
          pixels={pixels}
          eraseMode={eraseMode}
          onPixelErase={onPixelPlace}
          data-testid="pixel-overlay"
        />
      )}
    </>
  );
}
