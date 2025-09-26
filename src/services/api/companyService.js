import mockCompanies from "@/services/mockData/companies.json";

class CompanyService {
  constructor() {
    this.companies = [...mockCompanies];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.companies];
  }

  async getById(id) {
    await this.delay();
    const company = this.companies.find(c => c.Id === id);
    if (!company) {
      throw new Error("Company not found");
    }
    return { ...company };
  }

  async create(companyData) {
    await this.delay();
    const newCompany = {
      ...companyData,
      Id: Math.max(...this.companies.map(c => c.Id), 0) + 1,
      createdAt: new Date().toISOString()
    };
    this.companies.push(newCompany);
    return { ...newCompany };
  }

  async update(id, companyData) {
    await this.delay();
    const index = this.companies.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Company not found");
    }
    
    this.companies[index] = {
      ...this.companies[index],
      ...companyData,
      Id: id
    };
    
    return { ...this.companies[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.companies.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error("Company not found");
    }
    
    this.companies.splice(index, 1);
    return true;
  }

  async search(query) {
    await this.delay();
    const searchTerm = query.toLowerCase();
    return this.companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm) ||
      company.industry.toLowerCase().includes(searchTerm) ||
      company.domain.toLowerCase().includes(searchTerm)
    );
  }
}

export default new CompanyService();