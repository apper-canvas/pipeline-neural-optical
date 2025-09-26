import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import companyService from "@/services/api/companyService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [companiesData, contactsData, dealsData] = await Promise.all([
        companyService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);

      setCompanies(companiesData);
      setContacts(contactsData);
      setDeals(dealsData);
      setFilteredCompanies(companiesData);
    } catch (err) {
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchQuery, companies]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getCompanyStats = (companyId) => {
    const companyContacts = contacts.filter(c => c.companyId === companyId);
    const companyDeals = deals.filter(d => d.companyId === companyId);
    const totalValue = companyDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    return {
      contactCount: companyContacts.length,
      dealCount: companyDeals.length,
      totalValue
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSizeColor = (size) => {
    const sizeMap = {
      "1-50 employees": "default",
      "50-200 employees": "info", 
      "200-500 employees": "warning",
      "500-1000 employees": "primary",
      "1000+ employees": "success"
    };
    return sizeMap[size] || "default";
  };

  if (loading) {
    return <Loading type="table" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">
            Track your business relationships and company profiles
          </p>
        </div>
        <Button icon="Plus">
          Add Company
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <SearchBar
          placeholder="Search companies..."
          onSearch={handleSearch}
          className="flex-1 max-w-md"
        />
      </div>

      {filteredCompanies.length === 0 && !loading ? (
        <Empty
          title="No companies found"
          description={searchQuery ? "No companies match your search criteria" : "Get started by adding your first company"}
          actionText="Add Company"
          icon="Building2"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const stats = getCompanyStats(company.Id);
            
            return (
              <Card key={company.Id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Building2" className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {company.domain}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" icon="ExternalLink" />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Industry</span>
                    <Badge variant="primary">{company.industry}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Size</span>
                    <Badge variant={getSizeColor(company.size)}>
                      {company.size}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {stats.contactCount}
                    </div>
                    <div className="text-xs text-gray-600">Contacts</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {stats.dealCount}
                    </div>
                    <div className="text-xs text-gray-600">Deals</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.totalValue)}
                    </div>
                    <div className="text-xs text-gray-600">Value</div>
                  </div>
                </div>

                {company.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {company.notes}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm" icon="Edit" />
                  <Button variant="ghost" size="sm" icon="Trash2" className="text-error hover:text-red-700" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Companies;