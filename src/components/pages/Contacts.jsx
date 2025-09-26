import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ContactTable from "@/components/organisms/ContactTable";
import ContactForm from "@/components/organisms/ContactForm";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import contactService from "@/services/api/contactService";
import companyService from "@/services/api/companyService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [contactsData, companiesData] = await Promise.all([
        contactService.getAll(),
        companyService.getAll()
      ]);

      setContacts(contactsData);
      setCompanies(companiesData);
      setFilteredContacts(contactsData);
    } catch (err) {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = contacts.filter(contact =>
        contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setShowForm(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setShowForm(true);
  };

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedContact) {
        const updatedContact = await contactService.update(selectedContact.Id, formData);
        setContacts(prev => prev.map(c => c.Id === updatedContact.Id ? updatedContact : c));
      } else {
        const newContact = await contactService.create(formData);
        setContacts(prev => [...prev, newContact]);
      }
      setShowForm(false);
      setSelectedContact(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.delete(contactId);
        setContacts(prev => prev.filter(c => c.Id !== contactId));
        toast.success("Contact deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete contact");
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
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
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer relationships and contact information
          </p>
        </div>
        <Button onClick={handleAddContact} icon="Plus">
          Add Contact
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <SearchBar
          placeholder="Search contacts..."
          onSearch={handleSearch}
          className="flex-1 max-w-md"
        />
      </div>

      {filteredContacts.length === 0 && !loading ? (
        <Empty
          title="No contacts found"
          description={searchQuery ? "No contacts match your search criteria" : "Get started by adding your first contact"}
          actionText="Add Contact"
          onAction={handleAddContact}
          icon="Users"
        />
      ) : (
        <ContactTable
          contacts={filteredContacts}
          onContactSelect={handleContactSelect}
          onEditContact={handleEditContact}
          onDeleteContact={handleDeleteContact}
        />
      )}

      <ContactForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        companies={companies}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default Contacts;