import { type User, type InsertUser, type Pixel, type InsertPixel } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pixel operations
  getPixelsInBounds(
    northLat: number,
    southLat: number,
    eastLng: number,
    westLng: number
  ): Promise<Pixel[]>;
  getAllPixels(): Promise<Pixel[]>;
  createPixel(pixel: InsertPixel): Promise<Pixel>;
  deletePixelAt(latitude: number, longitude: number): Promise<boolean>;
  getPixelCount(): Promise<number>;
  getRecentPixels(limit?: number): Promise<Pixel[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pixels: Map<string, Pixel>;

  constructor() {
    this.users = new Map();
    this.pixels = new Map();
    
    // Add some initial sample pixels for demonstration
    this.initializeSamplePixels();
  }

  private async initializeSamplePixels() {
    const samplePixels = [
      { latitude: 40.7128, longitude: -74.0060, color: '#ff0000', placedBy: 'Anonymous', brushSize: 2 }, // New York
      { latitude: 51.5074, longitude: -0.1278, color: '#00ff00', placedBy: 'Anonymous', brushSize: 1 },  // London
      { latitude: 35.6762, longitude: 139.6503, color: '#0000ff', placedBy: 'Anonymous', brushSize: 3 }, // Tokyo
      { latitude: -33.8688, longitude: 151.2093, color: '#ffff00', placedBy: 'Anonymous', brushSize: 1 }, // Sydney
      { latitude: 48.8566, longitude: 2.3522, color: '#ff00ff', placedBy: 'Anonymous', brushSize: 2 },    // Paris
      { latitude: 37.7749, longitude: -122.4194, color: '#00ffff', placedBy: 'Anonymous', brushSize: 1 }, // San Francisco
      { latitude: 55.7558, longitude: 37.6173, color: '#ffa500', placedBy: 'Anonymous', brushSize: 2 },   // Moscow
      { latitude: -22.9068, longitude: -43.1729, color: '#800080', placedBy: 'Anonymous', brushSize: 1 },  // Rio de Janeiro
    ];

    for (const pixelData of samplePixels) {
      await this.createPixel(pixelData);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPixelsInBounds(
    northLat: number,
    southLat: number,
    eastLng: number,
    westLng: number
  ): Promise<Pixel[]> {
    return Array.from(this.pixels.values()).filter(pixel => {
      return pixel.latitude >= southLat &&
             pixel.latitude <= northLat &&
             pixel.longitude >= westLng &&
             pixel.longitude <= eastLng;
    });
  }

  async getAllPixels(): Promise<Pixel[]> {
    return Array.from(this.pixels.values());
  }

  async createPixel(insertPixel: InsertPixel): Promise<Pixel> {
    const id = randomUUID();
    const pixel: Pixel = {
      ...insertPixel,
      id,
      placedAt: new Date(),
      placedBy: insertPixel.placedBy || null,
    };
    
    // Create a key based on coordinates to allow overwriting pixels at same location
    const locationKey = `${pixel.latitude.toFixed(6)},${pixel.longitude.toFixed(6)}`;
    
    // Remove any existing pixel at this exact location
    const existingPixel = Array.from(this.pixels.values()).find(p => 
      `${p.latitude.toFixed(6)},${p.longitude.toFixed(6)}` === locationKey
    );
    
    if (existingPixel) {
      this.pixels.delete(existingPixel.id);
    }
    
    this.pixels.set(id, pixel);
    return pixel;
  }

  async getPixelCount(): Promise<number> {
    return this.pixels.size;
  }

  async deletePixelAt(latitude: number, longitude: number): Promise<boolean> {
    // First try exact match with rounded coordinates (matching creation logic)
    const roundedLat = Math.round(latitude * 1000000) / 1000000; // 6 decimal precision
    const roundedLng = Math.round(longitude * 1000000) / 1000000;
    
    let pixelToDelete = Array.from(this.pixels.values()).find(p => {
      const pLat = Math.round(p.latitude * 1000000) / 1000000;
      const pLng = Math.round(p.longitude * 1000000) / 1000000;
      return pLat === roundedLat && pLng === roundedLng;
    });
    
    // If no exact match, search within a small radius
    if (!pixelToDelete) {
      const searchRadius = 0.001; // Increased search radius
      pixelToDelete = Array.from(this.pixels.values()).find(p => {
        const latDiff = Math.abs(p.latitude - latitude);
        const lngDiff = Math.abs(p.longitude - longitude);
        return latDiff <= searchRadius && lngDiff <= searchRadius;
      });
    }
    
    if (pixelToDelete) {
      this.pixels.delete(pixelToDelete.id);
      return true;
    }
    
    return false;
  }

  async getRecentPixels(limit = 10): Promise<Pixel[]> {
    return Array.from(this.pixels.values())
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
