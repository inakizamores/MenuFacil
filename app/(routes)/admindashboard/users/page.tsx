'use client';

import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Filter, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Shield,
  Lock,
  Mail,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Mock users data for the admin panel
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Restaurant Owner',
      status: 'Active',
      restaurants: 2,
      lastActive: '2 hours ago',
      joined: '03/15/2023'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      role: 'Restaurant Staff',
      status: 'Active',
      restaurants: 1,
      lastActive: '5 days ago',
      joined: '05/22/2023'
    },
    {
      id: '3',
      name: 'Miguel Santos',
      email: 'miguel@example.com',
      role: 'Restaurant Owner',
      status: 'Inactive',
      restaurants: 1,
      lastActive: '3 weeks ago',
      joined: '01/10/2023'
    },
    {
      id: '4',
      name: 'Lisa Chen',
      email: 'lisa.chen@example.com',
      role: 'System Admin',
      status: 'Active',
      restaurants: 0,
      lastActive: '1 day ago',
      joined: '09/05/2022'
    },
    {
      id: '5',
      name: 'Robert Taylor',
      email: 'robert@example.com',
      role: 'Restaurant Owner',
      status: 'Suspended',
      restaurants: 3,
      lastActive: '2 months ago',
      joined: '11/18/2022'
    },
    {
      id: '6',
      name: 'Anna Williams',
      email: 'anna.w@example.com',
      role: 'Restaurant Staff',
      status: 'Active',
      restaurants: 1,
      lastActive: '4 hours ago',
      joined: '02/28/2023'
    }
  ];

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-800">User Management</h1>
        <button className="bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-yellow-600 transition-colors">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Role filter */}
          <div className="relative inline-block text-left">
            <div>
              <button type="button" className="inline-flex justify-between w-full rounded-lg border border-neutral-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <Filter className="h-5 w-5 mr-2 text-neutral-500" />
                <span>{selectedRole === 'All' ? 'All Roles' : selectedRole}</span>
                <ChevronDown className="h-5 w-5 ml-2 text-neutral-500" />
              </button>
            </div>
            {/* Dropdown menu would go here */}
          </div>
          
          {/* Status filter */}
          <div className="relative inline-block text-left">
            <div>
              <button type="button" className="inline-flex justify-between w-full rounded-lg border border-neutral-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <Filter className="h-5 w-5 mr-2 text-neutral-500" />
                <span>{selectedStatus === 'All' ? 'All Statuses' : selectedStatus}</span>
                <ChevronDown className="h-5 w-5 ml-2 text-neutral-500" />
              </button>
            </div>
            {/* Dropdown menu would go here */}
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Restaurants
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 font-medium text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                        <div className="text-sm text-neutral-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'System Admin' 
                        ? 'bg-neutral-100 text-neutral-800' 
                        : user.role === 'Restaurant Owner'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : user.status === 'Inactive'
                        ? 'bg-neutral-100 text-neutral-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {user.restaurants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {user.joined}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button className="text-yellow-600 hover:text-yellow-800" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800" title="Send email">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="text-neutral-600 hover:text-neutral-800" title="Manage permissions">
                        <Shield className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination would go here */}
        <div className="bg-white px-4 py-3 border-t border-neutral-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-neutral-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
                  <span className="font-medium">6</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                    <span className="sr-only">Previous</span>
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-yellow-50 text-sm font-medium text-yellow-600 hover:bg-yellow-100">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 -rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 