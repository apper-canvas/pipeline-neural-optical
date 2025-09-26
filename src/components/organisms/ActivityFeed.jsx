import React from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const ActivityFeed = ({ activities, contacts, deals }) => {
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
      call: "text-blue-600 bg-blue-50",
      email: "text-green-600 bg-green-50",
      meeting: "text-purple-600 bg-purple-50",
      note: "text-yellow-600 bg-yellow-50",
      task: "text-red-600 bg-red-50"
    };
    return colors[type] || "text-gray-600 bg-gray-50";
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown Contact";
  };

  const getDealName = (dealId) => {
    const deal = deals.find(d => d.Id === dealId);
    return deal ? deal.name : "Unknown Deal";
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.Id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              <ApperIcon 
                name={getActivityIcon(activity.type)} 
                className="w-4 h-4" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {activity.subject}
                </h4>
                <Badge variant="default" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {activity.description}
              </p>
              
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center">
                  <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
                  {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                </div>
                
                {activity.contactId && (
                  <div className="flex items-center">
                    <ApperIcon name="User" className="w-3 h-3 mr-1" />
                    {getContactName(activity.contactId)}
                  </div>
                )}
                
                {activity.dealId && (
                  <div className="flex items-center">
                    <ApperIcon name="Target" className="w-3 h-3 mr-1" />
                    {getDealName(activity.dealId)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityFeed;