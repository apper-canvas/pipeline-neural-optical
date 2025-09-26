import React, { useState, useEffect } from "react";
import MetricCard from "@/components/molecules/MetricCard";
import ActivityFeed from "@/components/organisms/ActivityFeed";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import contactService from "@/services/api/contactService";
import companyService from "@/services/api/companyService";
import dealService from "@/services/api/dealService";
import activityService from "@/services/api/activityService";

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, companiesData, dealsData, recentActivities] = await Promise.all([
        contactService.getAll(),
        companyService.getAll(),
        dealService.getAll(),
        activityService.getRecent(8)
      ]);

      setContacts(contactsData);
      setCompanies(companiesData);
      setDeals(dealsData);
      setActivities(recentActivities);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(deal => deal.stage === "closed-won");
  const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const averageDealSize = deals.length > 0 ? totalPipelineValue / deals.length : 0;
  const winRate = deals.length > 0 ? (wonDeals.length / deals.length) * 100 : 0;

  const metrics = [
    {
      title: "Total Pipeline",
      value: formatCurrency(totalPipelineValue),
      change: "+12.5%",
      changeType: "increase",
      icon: "TrendingUp",
      color: "primary"
    },
    {
      title: "Total Contacts",
      value: contacts.length.toString(),
      change: "+3",
      changeType: "increase",
      icon: "Users",
      color: "success"
    },
    {
      title: "Active Deals",
      value: deals.filter(d => !["closed-won", "closed-lost"].includes(d.stage)).length.toString(),
      change: "+5",
      changeType: "increase",
      icon: "Target",
      color: "warning"
    },
    {
      title: "Revenue Won",
      value: formatCurrency(totalRevenue),
      change: "+18.7%",
      changeType: "increase",
      icon: "DollarSign",
      color: "success"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your sales performance and pipeline progress
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Pipeline Overview and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pipeline Breakdown
          </h3>
          <div className="space-y-4">
            {["lead", "qualified", "proposal", "negotiation"].map((stage) => {
              const stageDeals = deals.filter(d => d.stage === stage);
              const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
              const stageNames = {
                lead: "Leads",
                qualified: "Qualified",
                proposal: "Proposals",
                negotiation: "Negotiation"
              };
              
              return (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {stageNames[stage]}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(stageValue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stageDeals.length} deals
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activities */}
        <ActivityFeed 
          activities={activities} 
          contacts={contacts} 
          deals={deals} 
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Average Deal Size
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(averageDealSize)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Win Rate
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {winRate.toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Companies
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {companies.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;