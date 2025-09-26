import React, { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { AuthContext } from "../../App";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement global search functionality
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={handleMobileMenuClose}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header 
          onMenuClick={handleMobileMenuToggle}
          onSearch={handleSearch}
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;