import { useEffect, useRef } from "react";
import type { Pixel } from "@shared/schema";
import type * as L from "leaflet";

interface PixelOverlayProps {
  map: L.Map;
  pixels: Pixel[];
  eraseMode?: boolean;
  onPixelErase?: (lat: number, lng: number) => void;
}

export default function PixelOverlay({ map, pixels, eraseMode = false, onPixelErase }: PixelOverlayProps) {
  const pixelLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const initPixelLayer = async () => {
      const L = await import("leaflet");
      
      // Create pixel layer if it doesn't exist
      if (!pixelLayerRef.current) {
        pixelLayerRef.current = L.layerGroup().addTo(map);
      }

      // Always clear existing pixels when mode changes
      if (pixelLayerRef.current) {
        pixelLayerRef.current.clearLayers();
      }

      // Add all pixels to the layer
      pixels.forEach((pixel) => {
        if (!pixelLayerRef.current) return;
        
        // Create perfectly square pixel using rectangle
        const pixelSizeLat = pixel.brushSize * 0.0008; // Size in degrees for latitude
        // Adjust longitude size based on latitude to make square pixels
        const latRad = pixel.latitude * Math.PI / 180;
        const pixelSizeLng = pixelSizeLat / Math.cos(latRad);
        
        const bounds = L.latLngBounds(
          [pixel.latitude - pixelSizeLat, pixel.longitude - pixelSizeLng],
          [pixel.latitude + pixelSizeLat, pixel.longitude + pixelSizeLng]
        );
        
        const pixelMarker = L.rectangle(bounds, {
          fillColor: pixel.color,
          color: pixel.color,
          weight: 1,
          fillOpacity: 0.9,
          opacity: 0.9,
        });

        // Handle clicks based on mode
        if (eraseMode) {
          // In erase mode, only handle click to delete pixel - NO POPUP
          pixelMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            if (onPixelErase) {
              onPixelErase(pixel.latitude, pixel.longitude);
            }
          });
        } else {
          // In normal mode, add popup with pixel info
          pixelMarker.bindPopup(`
            <div class="text-center">
              <div class="w-6 h-6 mx-auto mb-2" style="background-color: ${pixel.color}"></div>
              <p class="text-sm font-medium">Pixel placed</p>
              <p class="text-xs text-gray-500">${pixel.latitude.toFixed(4)}, ${pixel.longitude.toFixed(4)}</p>
              <p class="text-xs text-gray-400">${pixel.placedBy || 'Anonymous'}</p>
              <p class="text-xs text-gray-400">${new Date(pixel.placedAt).toLocaleString()}</p>
            </div>
          `);
        }

        pixelLayerRef.current.addLayer(pixelMarker);
      });
    };

    if (map && pixels) {
      initPixelLayer();
    }

    return () => {
      if (pixelLayerRef.current && map.hasLayer && map.hasLayer(pixelLayerRef.current)) {
        try {
          map.removeLayer(pixelLayerRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
        pixelLayerRef.current = null;
      }
    };
  }, [map, pixels, eraseMode]);

  return null; // This component doesn't render anything directly
}
