import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/account/${tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">My Account</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => handleTabChange('info')}
                  className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'info' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Personal Information
                </button>
                <button
                  onClick={() => handleTabChange('order')}
                  className={`w-full text-left px-4 py-2 rounded-md font-medium ${activeTab === 'order' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  My Orders
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;