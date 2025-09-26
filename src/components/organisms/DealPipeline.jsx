import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const DealPipeline = ({ deals, onDealSelect, onStageChange }) => {
  const stages = [
    { id: "lead", name: "Lead", color: "bg-gray-100 text-gray-800" },
    { id: "qualified", name: "Qualified", color: "bg-blue-100 text-blue-800" },
    { id: "proposal", name: "Proposal", color: "bg-yellow-100 text-yellow-800" },
    { id: "negotiation", name: "Negotiation", color: "bg-orange-100 text-orange-800" },
    { id: "closed-won", name: "Closed Won", color: "bg-green-100 text-green-800" },
    { id: "closed-lost", name: "Closed Lost", color: "bg-red-100 text-red-800" }
  ];

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const handleDragStart = (e, deal) => {
    e.dataTransfer.setData("dealId", deal.Id.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    const dealId = parseInt(e.dataTransfer.getData("dealId"));
    const deal = deals.find(d => d.Id === dealId);
    
    if (deal && deal.stage !== stageId) {
      onStageChange(dealId, stageId);
    }
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex space-x-6 min-w-max">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

          return (
            <div
              key={stage.id}
              className="min-w-[320px] bg-gray-50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                  <p className="text-sm text-gray-600">
                    {stageDeals.length} deals • {formatCurrency(stageValue)}
                  </p>
                </div>
                <Badge className={stage.color}>
                  {stageDeals.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <motion.div
                    key={deal.Id}
                    layout
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    whileDrag={{ scale: 1.02, rotate: 2 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e.nativeEvent, deal)}
                  >
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary"
                      onClick={() => onDealSelect(deal)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm leading-5">
                          {deal.name}
                        </h4>
                        <ApperIcon name="GripVertical" className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {formatCurrency(deal.value)}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center text-gray-500">
                          <ApperIcon name="Calendar" className="w-3 h-3 mr-1" />
                          {new Date(deal.closeDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-500">
                          <ApperIcon name="Percent" className="w-3 h-3 mr-1" />
                          {deal.probability}%
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealPipeline;