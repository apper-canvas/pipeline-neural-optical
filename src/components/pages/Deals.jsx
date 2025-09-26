import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DealPipeline from "@/components/organisms/DealPipeline";
import DealForm from "@/components/organisms/DealForm";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import dealService from "@/services/api/dealService";
import contactService from "@/services/api/contactService";
import companyService from "@/services/api/companyService";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [dealsData, contactsData, companiesData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        companyService.getAll()
      ]);

      setDeals(dealsData);
      setContacts(contactsData);
      setCompanies(companiesData);
      setFilteredDeals(dealsData);
    } catch (err) {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = deals.filter(deal =>
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.stage.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDeals(filtered);
    } else {
      setFilteredDeals(deals);
    }
  }, [searchQuery, deals]);

  const handleAddDeal = () => {
    setSelectedDeal(null);
    setShowForm(true);
  };

  const handleDealSelect = (deal) => {
    setSelectedDeal(deal);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedDeal) {
        const updatedDeal = await dealService.update(selectedDeal.Id, formData);
        setDeals(prev => prev.map(d => d.Id === updatedDeal.Id ? updatedDeal : d));
      } else {
        const newDeal = await dealService.create(formData);
        setDeals(prev => [...prev, newDeal]);
      }
      setShowForm(false);
      setSelectedDeal(null);
    } catch (error) {
      throw error;
    }
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      const updatedDeal = await dealService.updateStage(dealId, newStage);
      setDeals(prev => prev.map(d => d.Id === updatedDeal.Id ? updatedDeal : d));
      toast.success("Deal stage updated successfully!");
    } catch (error) {
      toast.error("Failed to update deal stage");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalPipelineValue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDealCount = filteredDeals.filter(d => !["closed-won", "closed-lost"].includes(d.stage)).length;

  if (loading) {
    return <Loading type="pipeline" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your sales opportunities through each stage
          </p>
        </div>
        <Button onClick={handleAddDeal} icon="Plus">
          Add Deal
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <SearchBar
          placeholder="Search deals..."
          onSearch={handleSearch}
          className="max-w-md"
        />
        
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Total Pipeline:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(totalPipelineValue)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Active Deals:</span>
            <span className="font-semibold text-gray-900">
              {activeDealCount}
            </span>
          </div>
        </div>
      </div>

      {filteredDeals.length === 0 && !loading ? (
        <Empty
          title="No deals found"
          description={searchQuery ? "No deals match your search criteria" : "Get started by adding your first deal"}
          actionText="Add Deal"
          onAction={handleAddDeal}
          icon="Target"
        />
      ) : (
        <DealPipeline
          deals={filteredDeals}
          onDealSelect={handleDealSelect}
          onStageChange={handleStageChange}
        />
      )}

      <DealForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedDeal(null);
        }}
        deal={selectedDeal}
        contacts={contacts}
        companies={companies}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Deals;