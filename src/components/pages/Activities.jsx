import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import activityService from "@/services/api/activityService";
import contactService from "@/services/api/contactService";
import dealService from "@/services/api/dealService";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);

      setActivities(activitiesData);
      setContacts(contactsData);
      setDeals(dealsData);
      setFilteredActivities(activitiesData);
    } catch (err) {
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(activity =>
        activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [searchQuery, filterType, activities]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const getActivityIcon = (type) => {
    const icons = {
      call: "Phone",
      email: "Mail",
      meeting: "Calendar",
      note: "FileText",
      task: "CheckSquare"
    };
    return icons[type] || "Activity";
  };

  const getActivityColor = (type) => {
    const colors = {
      call: "info",
      email: "success", 
      meeting: "primary",
      note: "warning",
      task: "error"
    };
    return colors[type] || "default";
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getDealName = (dealId) => {
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.name : "Unknown Deal";
  };

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "call", label: "Calls" },
    { value: "email", label: "Emails" },
    { value: "meeting", label: "Meetings" },
    { value: "note", label: "Notes" },
    { value: "task", label: "Tasks" }
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1">
            Track all customer interactions and sales activities
          </p>
        </div>
        <Button icon="Plus">
          Log Activity
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <SearchBar
          placeholder="Search activities..."
          onSearch={handleSearch}
          className="flex-1 max-w-md"
        />
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {activityTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredActivities.length === 0 && !loading ? (
        <Empty
          title="No activities found"
          description={searchQuery || filterType !== "all" ? 
            "No activities match your search criteria" : 
            "Start logging your customer interactions and activities"
          }
          actionText="Log Activity"
          icon="Activity"
        />
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.Id} className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg bg-${getActivityColor(activity.type)}/10`}>
                  <ApperIcon 
                    name={getActivityIcon(activity.type)} 
                    className={`w-5 h-5 text-${getActivityColor(activity.type)}`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {activity.subject}
                    </h3>
                    <Badge variant={getActivityColor(activity.type)}>
                      {activity.type}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-6">
                    <div className="flex items-center space-x-1">
                      <ApperIcon name="Clock" className="w-4 h-4" />
                      <span>
                        {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    
                    {activity.contactId && (
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="User" className="w-4 h-4" />
                        <span>{getContactName(activity.contactId)}</span>
                      </div>
                    )}
                    
                    {activity.dealId && (
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="Target" className="w-4 h-4" />
                        <span>{getDealName(activity.dealId)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" icon="Edit" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon="Trash2" 
                    className="text-error hover:text-red-700"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Activities;