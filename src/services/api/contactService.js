import { toast } from "react-toastify";

class ContactService {
  constructor() {
    this.tableName = 'contact_c';
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
        console.error(`Failed to fetch contacts: ${response.message}`);
        toast.error(response.message);
        return [];
      }
      
      return response.data?.map(contact => {
        const nameParts = (contact.Name || '').split(' ');
        return {
          Id: contact.Id,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || nameParts[0] || '',
          email: `${(contact.Name || '').toLowerCase().replace(/\s+/g, '.')}@company.com`,
          phone: '+1-555-0123', // Default for now
          companyId: null, // Update based on actual schema
          title: 'Employee', // Default for now
          notes: contact.Tags || '',
          createdAt: contact.CreatedOn || new Date().toISOString(),
          lastActivity: contact.ModifiedOn || new Date().toISOString()
        };
      }) || [];
    } catch (error) {
      console.error("Error fetching contacts:", error?.response?.data?.message || error);
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
        throw new Error("Contact not found");
      }
      
      const contact = response.data;
      const nameParts = (contact.Name || '').split(' ');
      return {
        Id: contact.Id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || nameParts[0] || '',
        email: `${(contact.Name || '').toLowerCase().replace(/\s+/g, '.')}@company.com`,
        phone: '+1-555-0123',
        companyId: null,
        title: 'Employee',
        notes: contact.Tags || '',
        createdAt: contact.CreatedOn || new Date().toISOString(),
        lastActivity: contact.ModifiedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(contactData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const fullName = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim();
      
      const params = {
        records: [{
          Name: fullName,
          Tags: contactData.notes || ''
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
          console.error(`Failed to create contact: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdContact = successful[0].data;
          return {
            Id: createdContact.Id,
            firstName: contactData.firstName || '',
            lastName: contactData.lastName || '',
            email: contactData.email || '',
            phone: contactData.phone || '',
            companyId: contactData.companyId,
            title: contactData.title || '',
            notes: createdContact.Tags || '',
            createdAt: createdContact.CreatedOn || new Date().toISOString(),
            lastActivity: new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating contact:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, contactData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateData = {};
      if (contactData.firstName || contactData.lastName) {
        const fullName = `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim();
        updateData.Name = fullName;
      }
      if (contactData.notes) updateData.Tags = contactData.notes;
      
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
          console.error(`Failed to update contact: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedContact = successful[0].data;
          return {
            Id: updatedContact.Id,
            firstName: contactData.firstName || '',
            lastName: contactData.lastName || '',
            email: contactData.email || '',
            phone: contactData.phone || '',
            companyId: contactData.companyId,
            title: contactData.title || '',
            notes: updatedContact.Tags || '',
            createdAt: updatedContact.CreatedOn || new Date().toISOString(),
            lastActivity: new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating contact:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete contact: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error?.response?.data?.message || error);
      return false;
    }
  }

  async search(query) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}}
        ],
        where: [{"FieldName": "Name", "Operator": "Contains", "Values": [query]}]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success || !response.data) {
        return [];
      }
      
      return response.data.map(contact => {
        const nameParts = (contact.Name || '').split(' ');
        return {
          Id: contact.Id,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || nameParts[0] || '',
          email: `${(contact.Name || '').toLowerCase().replace(/\s+/g, '.')}@company.com`,
          phone: '+1-555-0123',
          companyId: null,
          title: 'Employee',
          notes: contact.Tags || '',
          createdAt: contact.CreatedOn || new Date().toISOString(),
          lastActivity: contact.ModifiedOn || new Date().toISOString()
        };
      });
    } catch (error) {
      console.error("Error searching contacts:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new ContactService();