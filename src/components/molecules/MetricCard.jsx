import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "increase", 
  icon, 
  color = "primary" 
}) => {
  const colorMap = {
    primary: "text-primary bg-blue-50",
    success: "text-success bg-green-50",
    warning: "text-warning bg-yellow-50",
    error: "text-error bg-red-50"
  };

  const changeColorMap = {
    increase: "text-success",
    decrease: "text-error",
    neutral: "text-gray-600"
  };

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorMap[color]} mr-4`}>
          <ApperIcon name={icon} className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              <ApperIcon 
                name={changeType === "increase" ? "TrendingUp" : "TrendingDown"} 
                className={`w-4 h-4 mr-1 ${changeColorMap[changeType]}`}
              />
              <span className={`text-sm ${changeColorMap[changeType]}`}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;