import mockActivities from "@/services/mockData/activities.json";

class ActivityService {
  constructor() {
    this.activities = [...mockActivities];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getById(id) {
    await this.delay();
    const activity = this.activities.find(a => a.Id === id);
    if (!activity) {
      throw new Error("Activity not found");
    }
    return { ...activity };
  }

  async create(activityData) {
    await this.delay();
    const newActivity = {
      ...activityData,
      Id: Math.max(...this.activities.map(a => a.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.activities.push(newActivity);
    return { ...newActivity };
  }

  async update(id, activityData) {
    await this.delay();
    const index = this.activities.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    this.activities[index] = {
      ...this.activities[index],
      ...activityData,
      Id: id
    };
    
    return { ...this.activities[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.activities.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    this.activities.splice(index, 1);
    return true;
  }

  async getByContactId(contactId) {
    await this.delay();
    return this.activities
      .filter(activity => activity.contactId === contactId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getByDealId(dealId) {
    await this.delay();
    return this.activities
      .filter(activity => activity.dealId === dealId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getRecent(limit = 10) {
    await this.delay();
    return [...this.activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }
}

export default new ActivityService();