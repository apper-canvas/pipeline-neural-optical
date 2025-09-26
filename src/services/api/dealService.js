import mockDeals from "@/services/mockData/deals.json";

class DealService {
  constructor() {
    this.deals = [...mockDeals];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.deals];
  }

  async getById(id) {
    await this.delay();
    const deal = this.deals.find(d => d.Id === id);
    if (!deal) {
      throw new Error("Deal not found");
    }
    return { ...deal };
  }

  async create(dealData) {
    await this.delay();
    const newDeal = {
      ...dealData,
      Id: Math.max(...this.deals.map(d => d.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.deals.push(newDeal);
    return { ...newDeal };
  }

  async update(id, dealData) {
    await this.delay();
    const index = this.deals.findIndex(d => d.Id === id);
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    this.deals[index] = {
      ...this.deals[index],
      ...dealData,
      Id: id
    };
    
    return { ...this.deals[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.deals.findIndex(d => d.Id === id);
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    this.deals.splice(index, 1);
    return true;
  }

  async updateStage(id, newStage) {
    await this.delay();
    const index = this.deals.findIndex(d => d.Id === id);
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    this.deals[index].stage = newStage;
    
    // Update probability based on stage
    const stagesProbability = {
      "lead": 25,
      "qualified": 50,
      "proposal": 75,
      "negotiation": 85,
      "closed-won": 100,
      "closed-lost": 0
    };
    
    this.deals[index].probability = stagesProbability[newStage] || this.deals[index].probability;
    
    return { ...this.deals[index] };
  }
}

export default new DealService();