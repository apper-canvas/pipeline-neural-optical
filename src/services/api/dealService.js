import { toast } from "react-toastify";

class DealService {
  constructor() {
    this.tableName = 'deal_c';
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}}
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Failed to fetch deals: ${response.message}`);
        toast.error(response.message);
        return [];
      }
      
      return response.data?.map(deal => ({
        Id: deal.Id,
        name: deal.Name || '',
        value: 50000, // Default for now - update based on actual schema
        stage: 'lead', // Default for now - update based on actual schema  
        probability: 25, // Default for now - update based on actual schema
        contactId: null, // Update based on actual schema
        companyId: null, // Update based on actual schema
        closeDate: new Date().toISOString(), // Default for now
        notes: deal.Tags || '',
        createdAt: deal.CreatedOn || new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response?.data) {
        throw new Error("Deal not found");
      }
      
      const deal = response.data;
      return {
        Id: deal.Id,
        name: deal.Name || '',
        value: 50000, // Default for now
        stage: 'lead', // Default for now  
        probability: 25, // Default for now
        contactId: null, // Update based on actual schema
        companyId: null, // Update based on actual schema
        closeDate: new Date().toISOString(), // Default for now
        notes: deal.Tags || '',
        createdAt: deal.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(dealData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: dealData.name,
          Tags: dealData.notes || ''
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create deal: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdDeal = successful[0].data;
          return {
            Id: createdDeal.Id,
            name: createdDeal.Name,
            value: dealData.value || 50000,
            stage: dealData.stage || 'lead',
            probability: dealData.probability || 25,
            contactId: dealData.contactId,
            companyId: dealData.companyId,
            closeDate: dealData.closeDate,
            notes: createdDeal.Tags || '',
            createdAt: createdDeal.CreatedOn || new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, dealData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateData = {};
      if (dealData.name) updateData.Name = dealData.name;
      if (dealData.notes) updateData.Tags = dealData.notes;
      
      const params = {
        records: [{
          Id: id,
          ...updateData
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update deal: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedDeal = successful[0].data;
          return {
            Id: updatedDeal.Id,
            name: updatedDeal.Name,
            value: dealData.value || 50000,
            stage: dealData.stage || 'lead',
            probability: dealData.probability || 25,
            contactId: dealData.contactId,
            companyId: dealData.companyId,
            closeDate: dealData.closeDate,
            notes: updatedDeal.Tags || '',
            createdAt: updatedDeal.CreatedOn || new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = { 
        RecordIds: [id]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete deal: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      return false;
    }
  }

  async updateStage(id, newStage) {
    try {
      const stagesProbability = {
        "lead": 25,
        "qualified": 50,
        "proposal": 75,
        "negotiation": 85,
        "closed-won": 100,
        "closed-lost": 0
      };
      
      const probability = stagesProbability[newStage] || 25;
      
      return await this.update(id, {
        stage: newStage,
        probability: probability
      });
    } catch (error) {
      console.error("Error updating deal stage:", error?.response?.data?.message || error);
      return null;
    }
  }
}

export default new DealService();