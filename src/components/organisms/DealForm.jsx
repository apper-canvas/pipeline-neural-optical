import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Modal from "@/components/molecules/Modal";

const DealForm = ({ 
  isOpen, 
  onClose, 
  deal = null, 
  contacts = [], 
  companies = [], 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    stage: "lead",
    probability: "25",
    contactId: "",
    companyId: "",
    closeDate: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const stages = [
    { value: "lead", label: "Lead" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed-won", label: "Closed Won" },
    { value: "closed-lost", label: "Closed Lost" }
  ];

  useEffect(() => {
    if (deal) {
      setFormData({
        name: deal.name || "",
        value: deal.value?.toString() || "",
        stage: deal.stage || "lead",
        probability: deal.probability?.toString() || "25",
        contactId: deal.contactId || "",
        companyId: deal.companyId || "",
        closeDate: deal.closeDate ? new Date(deal.closeDate).toISOString().split('T')[0] : "",
        notes: deal.notes || ""
      });
    } else {
      setFormData({
        name: "",
        value: "",
        stage: "lead",
        probability: "25",
        contactId: "",
        companyId: "",
        closeDate: "",
        notes: ""
      });
    }
  }, [deal, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim() || !formData.value || !formData.closeDate) {
        toast.error("Please fill in all required fields");
        return;
      }

      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        closeDate: new Date(formData.closeDate).toISOString()
      };

      await onSubmit(submitData);
      toast.success(deal ? "Deal updated successfully!" : "Deal created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save deal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? "Edit Deal" : "Add New Deal"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="name"
            label="Deal Name *"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter deal name"
            required
          />
          
          <Input
            name="value"
            type="number"
            step="0.01"
            label="Deal Value *"
            value={formData.value}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {stages.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          
          <Input
            name="probability"
            type="number"
            min="0"
            max="100"
            label="Probability (%)"
            value={formData.probability}
            onChange={handleChange}
            placeholder="25"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <select
              name="contactId"
              value={formData.contactId}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.firstName} {contact.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <select
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a company</option>
              {companies.map(company => (
                <option key={company.Id} value={company.Id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          name="closeDate"
          type="date"
          label="Expected Close Date *"
          value={formData.closeDate}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any notes about this deal"
            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {deal ? "Update Deal" : "Create Deal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealForm;