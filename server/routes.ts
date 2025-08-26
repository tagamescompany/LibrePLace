import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPixelSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all pixels
  app.get("/api/pixels", async (req, res) => {
    try {
      const pixels = await storage.getAllPixels();
      res.json(pixels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pixels" });
    }
  });

  // Get pixels in bounds
  app.get("/api/pixels/bounds", async (req, res) => {
    try {
      const { north, south, east, west } = req.query;
      
      if (!north || !south || !east || !west) {
        return res.status(400).json({ message: "Missing bounds parameters" });
      }

      const pixels = await storage.getPixelsInBounds(
        parseFloat(north as string),
        parseFloat(south as string),
        parseFloat(east as string),
        parseFloat(west as string)
      );
      
      res.json(pixels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pixels in bounds" });
    }
  });

  // Create a new pixel
  app.post("/api/pixels", async (req, res) => {
    try {
      const validatedData = insertPixelSchema.parse(req.body);
      const pixel = await storage.createPixel(validatedData);
      res.status(201).json(pixel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid pixel data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create pixel" });
      }
    }
  });

  // Delete a pixel
  app.delete("/api/pixels", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: "Missing latitude or longitude" });
      }

      const deleted = await storage.deletePixelAt(
        parseFloat(latitude),
        parseFloat(longitude)
      );
      
      if (deleted) {
        res.json({ message: "Pixel deleted successfully" });
      } else {
        res.status(404).json({ message: "No pixel found at this location" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pixel" });
    }
  });

  // Get pixel statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const totalPixels = await storage.getPixelCount();
      const recentPixels = await storage.getRecentPixels(5);
      
      res.json({
        totalPixels,
        recentPixels,
        contributors: Math.floor(totalPixels / 10) + 100, // Simulated contributor count
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
