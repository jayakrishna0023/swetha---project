/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  FARMER = "Farmer",
  BUYER = "Buyer",
  ADMIN = "Admin"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phoneNumber?: string;
  location?: string;
  isVerified: boolean;
  memberSince: string;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  soilType: string;
  waterSource: string;
  areaAcres: number;
  cropHistory: string[];
  imageUrl?: string;
  farmerId: string;
  createdAt: string;
}

export enum CropGrowthStage {
  SOWING = "Sowing Stage",
  VEGETATIVE = "Vegetative Growth",
  FLOWERING = "Flowering & Fruit Set",
  HARVEST_READY = "Ready to Harvest",
  HARVESTED = "Harvested"
}

export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  sowingDate: string;
  growthStage: CropGrowthStage;
  expectedHarvestDate: string;
  yieldPredictionQuintals?: number;
  expectedProfit?: number;
  soilType?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  farmId: string;
  cropId?: string;
  category: "Seeds" | "Fertilizers" | "Labour" | "Machinery" | "Transport" | "Water/Irrigation" | "Miscellaneous";
  amount: number;
  date: string;
  description: string;
}

export interface MarketplaceItem {
  id: string;
  farmerId: string;
  farmerName: string;
  title: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  imageUrl?: string;
  description: string;
  contactNumber: string;
  createdAt: string;
  isSold: boolean;
}

export interface Equipment {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  type: string;
  ratePerDay: number;
  location: string;
  imageUrl?: string;
  description: string;
  contactNumber: string;
  isAvailable: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  avatarUrl?: string;
  title: string;
  content: string;
  likes: number;
  likedBy: string[]; // User IDs
  replies: {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: Role;
    avatarUrl?: string;
    content: string;
    createdAt: string;
  }[];
  createdAt: string;
  tags?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: "weather" | "pest" | "harvest" | "fertilizer" | "payment" | "marketplace" | "system";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
