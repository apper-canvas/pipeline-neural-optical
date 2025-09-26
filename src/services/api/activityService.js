import { toast } from "react-toastify";

class ActivityService {
  constructor() {
    this.tableName = 'activity_c';
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Failed to fetch activities: ${response.message}`);
        toast.error(response.message);
        return [];
      }
      
      return response.data?.map(activity => ({
        Id: activity.Id,
        name: activity.Name,
        type: activity.type_c,
        subject: activity.subject_c,
        description: activity.description_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        date: activity.date_c,
        createdAt: activity.created_at_c
      })) || [];
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response?.data) {
        throw new Error("Activity not found");
      }
      
      const activity = response.data;
      return {
        Id: activity.Id,
        name: activity.Name,
        type: activity.type_c,
        subject: activity.subject_c,
        description: activity.description_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        date: activity.date_c,
        createdAt: activity.created_at_c
      };
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(activityData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: activityData.name || activityData.subject,
          type_c: activityData.type,
          subject_c: activityData.subject,
          description_c: activityData.description,
          contact_id_c: activityData.contactId ? parseInt(activityData.contactId) : null,
          deal_id_c: activityData.dealId ? parseInt(activityData.dealId) : null,
          date_c: activityData.date,
          created_at_c: new Date().toISOString()
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
          console.error(`Failed to create activity: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdActivity = successful[0].data;
          return {
            Id: createdActivity.Id,
            name: createdActivity.Name,
            type: createdActivity.type_c,
            subject: createdActivity.subject_c,
            description: createdActivity.description_c,
            contactId: createdActivity.contact_id_c?.Id || createdActivity.contact_id_c,
            dealId: createdActivity.deal_id_c?.Id || createdActivity.deal_id_c,
            date: createdActivity.date_c,
            createdAt: createdActivity.created_at_c
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, activityData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateData = {};
      if (activityData.name) updateData.Name = activityData.name;
      if (activityData.type) updateData.type_c = activityData.type;
      if (activityData.subject) updateData.subject_c = activityData.subject;
      if (activityData.description) updateData.description_c = activityData.description;
      if (activityData.contactId) updateData.contact_id_c = parseInt(activityData.contactId);
      if (activityData.dealId) updateData.deal_id_c = parseInt(activityData.dealId);
      if (activityData.date) updateData.date_c = activityData.date;
      
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
          console.error(`Failed to update activity: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedActivity = successful[0].data;
          return {
            Id: updatedActivity.Id,
            name: updatedActivity.Name,
            type: updatedActivity.type_c,
            subject: updatedActivity.subject_c,
            description: updatedActivity.description_c,
            contactId: updatedActivity.contact_id_c?.Id || updatedActivity.contact_id_c,
            dealId: updatedActivity.deal_id_c?.Id || updatedActivity.deal_id_c,
            date: updatedActivity.date_c,
            createdAt: updatedActivity.created_at_c
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating activity:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete activity: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      return false;
    }
  }

  async getByContactId(contactId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [{"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)]}],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }
      
      return response.data.map(activity => ({
        Id: activity.Id,
        name: activity.Name,
        type: activity.type_c,
        subject: activity.subject_c,
        description: activity.description_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        date: activity.date_c,
        createdAt: activity.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching activities by contact:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByDealId(dealId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [{"FieldName": "deal_id_c", "Operator": "EqualTo", "Values": [parseInt(dealId)]}],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }
      
      return response.data.map(activity => ({
        Id: activity.Id,
        name: activity.Name,
        type: activity.type_c,
        subject: activity.subject_c,
        description: activity.description_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        date: activity.date_c,
        createdAt: activity.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching activities by deal:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getRecent(limit = 10) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }
      
      return response.data.map(activity => ({
        Id: activity.Id,
        name: activity.Name,
        type: activity.type_c,
        subject: activity.subject_c,
        description: activity.description_c,
        contactId: activity.contact_id_c?.Id || activity.contact_id_c,
        dealId: activity.deal_id_c?.Id || activity.deal_id_c,
        date: activity.date_c,
        createdAt: activity.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching recent activities:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new ActivityService();