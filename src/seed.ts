/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Sample data shared by the server (first-run shared feeds) and the client ("Load sample data")
import { Farm, Crop, Expense, MarketplaceItem, Equipment, CommunityPost, Role, CropGrowthStage } from "./types";

export const seedFarms: Farm[] = [
  {
    id: "farm-1",
    name: "North Alluvial Plain Grid",
    location: "Indore Rural, MP",
    soilType: "Clay Loam",
    waterSource: "Tubewell",
    areaAcres: 4.5,
    cropHistory: ["Soybean", "Wheat"],
    farmerId: "sample",
    createdAt: "10/07/2024"
  },
  {
    id: "farm-2",
    name: "Deccan Hill Slope Plot",
    location: "Pune Outskirts, MH",
    soilType: "Sandy Loam",
    waterSource: "Canal Drip Sump",
    areaAcres: 2.5,
    cropHistory: ["Cotton", "Maize"],
    farmerId: "sample",
    createdAt: "15/08/2024"
  }
];

export const seedCrops: Crop[] = [
  {
    id: "crop-1",
    farmId: "farm-1",
    name: "Basmati Rice Paddy",
    variety: "Pusa PB-1121",
    sowingDate: "2026-06-15",
    growthStage: CropGrowthStage.VEGETATIVE,
    expectedHarvestDate: "2026-11-10",
    yieldPredictionQuintals: 110,
    expectedProfit: 65000,
    notes: "Sown using standard localized vermicompost beds"
  },
  {
    id: "crop-2",
    farmId: "farm-2",
    name: "Kharif Yellow Maize",
    variety: "Pioneer Hybrid 3396",
    sowingDate: "2026-07-02",
    growthStage: CropGrowthStage.SOWING,
    expectedHarvestDate: "2026-10-25",
    yieldPredictionQuintals: 42,
    expectedProfit: 35000,
    notes: "Heavy moisture retention requested from canopy sensor"
  }
];

export const seedExpenses: Expense[] = [
  { id: "exp-1", farmId: "farm-1", category: "Seeds", amount: 4800, date: "2026-06-18", description: "Pusa PB-1121 Paddy Seeds (40 Kg)" },
  { id: "exp-2", farmId: "farm-1", category: "Fertilizers", amount: 6200, date: "2026-06-25", description: "12 bags Organic Vermicompost fertilizer" },
  { id: "exp-3", farmId: "farm-2", category: "Machinery", amount: 3500, date: "2026-07-03", description: "Tractor Sowing attachment rental" }
];

export const seedMarketplaceItems: MarketplaceItem[] = [
  {
    id: "prod-1",
    farmerId: "farmer-101",
    farmerName: "Harpreet Singh (Verified)",
    title: "Wholesale Organic Wheat Grain",
    cropName: "Durum Wheat",
    variety: "Sharbati Gold Grade-A",
    quantityKg: 3500,
    pricePerKg: 28,
    location: "Ludhiana Mandi, PB",
    description: "Naturally solar dried to maintain low grain moisture below 11%. Stored in safe pesticide-free grain silos.",
    contactNumber: "+91 94444 88888",
    createdAt: "18/07/2026",
    isSold: false
  },
  {
    id: "prod-2",
    farmerId: "farmer-102",
    farmerName: "Amrita Dev (Verified)",
    title: "Dry Yellow Chickpeas (Gram)",
    cropName: "Desi Chana",
    variety: "Pusa Desi Chana",
    quantityKg: 1200,
    pricePerKg: 52,
    location: "Bhopal Mandi, MP",
    description: "Rich protein grade yellow gram harvested during late Rabi cycle. Complete organic certification available.",
    contactNumber: "+91 93333 77777",
    createdAt: "20/07/2026",
    isSold: false
  }
];

export const seedEquipment: Equipment[] = [
  {
    id: "eq-1",
    ownerId: "owner-1",
    ownerName: "Devraj Gowda",
    name: "Mahindra Arjun 555 DI Tractor",
    type: "Tractor",
    ratePerDay: 1800,
    location: "Hassan Hub, KA",
    description: "50 HP high torque engine perfect for hard clay soils. Rotavator attachment included.",
    contactNumber: "+91 92222 66666",
    isAvailable: true
  },
  {
    id: "eq-2",
    ownerId: "owner-2",
    ownerName: "Sanjay Mishra",
    name: "Preet Heavy Crop Straw Reaper",
    type: "Harvester",
    ratePerDay: 2500,
    location: "Patna Outskirts, BR",
    description: "Efficient wheat and paddy straw harvest separator. Cuts fuel use by up to 20%.",
    contactNumber: "+91 91111 55555",
    isAvailable: true
  }
];

export const seedPosts: CommunityPost[] = [
  {
    id: "post-1",
    authorId: "author-10",
    authorName: "Dr. Varma (Lead Agronomist)",
    authorRole: Role.ADMIN,
    title: "Mitigating Chlorosis in Rice Leaves during Monsoon Spelling",
    content: "Ensure active foliar sprays of Ferrous Sulphate (0.5%) if you detect light green patchiness in waterlogged rice plots. Do not over-apply synthetic urea as it dilutes chlorophyll synthesis.",
    likes: 18,
    likedBy: [],
    replies: [
      {
        id: "rep-1",
        authorId: "author-11",
        authorName: "Ramesh Sen",
        authorRole: Role.FARMER,
        content: "Thank you Dr. Varma! This perfectly aligns with the iron deficiency warnings on my Deccan Hill Plot.",
        createdAt: "19/07/2026"
      }
    ],
    createdAt: "19/07/2026",
    tags: ["Soil", "Pathology"]
  }
];
