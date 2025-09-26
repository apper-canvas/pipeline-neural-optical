import { toast } from "react-toastify";

class CompanyService {
  constructor() {
    this.tableName = 'company_c';
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
        console.error(`Failed to fetch companies: ${response.message}`);
        toast.error(response.message);
        return [];
      }
      
      return response.data?.map(company => ({
        Id: company.Id,
        name: company.Name || '',
        domain: `${(company.Name || '').toLowerCase().replace(/\s+/g, '')}.com`,
        industry: 'Technology', // Default for now - update based on actual schema
        size: 'Medium', // Default for now - update based on actual schema
        notes: company.Tags || '',
        createdAt: company.CreatedOn || new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error("Error fetching companies:", error?.response?.data?.message || error);
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
        throw new Error("Company not found");
      }
      
      const company = response.data;
      return {
        Id: company.Id,
        name: company.Name || '',
        domain: `${(company.Name || '').toLowerCase().replace(/\s+/g, '')}.com`,
        industry: 'Technology',
        size: 'Medium',
        notes: company.Tags || '',
        createdAt: company.CreatedOn || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(companyData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Name: companyData.name,
          Tags: companyData.notes || ''
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
          console.error(`Failed to create company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdCompany = successful[0].data;
          return {
            Id: createdCompany.Id,
            name: createdCompany.Name,
            domain: companyData.domain || `${companyData.name.toLowerCase().replace(/\s+/g, '')}.com`,
            industry: companyData.industry || 'Technology',
            size: companyData.size || 'Medium',
            notes: createdCompany.Tags || '',
            createdAt: createdCompany.CreatedOn || new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating company:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, companyData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const updateData = {};
      if (companyData.name) updateData.Name = companyData.name;
      if (companyData.notes) updateData.Tags = companyData.notes;
      
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
          console.error(`Failed to update company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const updatedCompany = successful[0].data;
          return {
            Id: updatedCompany.Id,
            name: updatedCompany.Name,
            domain: companyData.domain,
            industry: companyData.industry,
            size: companyData.size,
            notes: updatedCompany.Tags || '',
            createdAt: updatedCompany.CreatedOn || new Date().toISOString()
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating company:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete company: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting company:", error?.response?.data?.message || error);
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
      
      return response.data.map(company => ({
        Id: company.Id,
        name: company.Name || '',
        domain: `${(company.Name || '').toLowerCase().replace(/\s+/g, '')}.com`,
        industry: 'Technology',
        size: 'Medium',
        notes: company.Tags || '',
        createdAt: company.CreatedOn || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error searching companies:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new CompanyService();