import React from "react";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuClick, onSearch }) => {
  return (
    <header className="bg-white border-b border-gray-200 lg:ml-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              icon="Menu"
              className="lg:hidden"
            />
            <div className="hidden sm:block">
              <SearchBar
                placeholder="Search contacts, companies, deals..."
                onSearch={onSearch}
                className="w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon="Bell"
              className="relative"
            >
              <span className="sr-only">Notifications</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></div>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              icon="Settings"
              className="hidden sm:flex"
            >
              <span className="sr-only">Settings</span>
            </Button>

            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
              <ApperIcon name="User" className="w-4 h-4" />
              <span>Sales Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden px-4 pb-4">
        <SearchBar
          placeholder="Search..."
          onSearch={onSearch}
        />
      </div>
    </header>
  );
};

export default Header;