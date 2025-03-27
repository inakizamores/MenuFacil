'use client';

import React from 'react';
import { 
  Users, 
  Building2, 
  Pizza, 
  QrCode, 
  ArrowUpRight, 
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // Statistics for the admin dashboard
  const statistics = [
    {
      title: 'Total Users',
      value: '1,246',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      link: '/admindashboard/users'
    },
    {
      title: 'Restaurants',
      value: '573',
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      link: '/admindashboard/restaurants'
    },
    {
      title: 'Active Menus',
      value: '892',
      change: '+15.3%',
      trend: 'up',
      icon: Pizza,
      link: '/admindashboard/menus'
    },
    {
      title: 'QR Code Scans',
      value: '24,892',
      change: '+32.7%',
      trend: 'up',
      icon: QrCode,
      link: '/admindashboard/analytics'
    }
  ];

  // System alerts for admin attention
  const systemAlerts = [
    {
      title: 'Database storage reaching limit',
      description: 'Current usage at 85% of allocated capacity',
      priority: 'high',
      time: '2 hours ago'
    },
    {
      title: 'API rate limit warnings',
      description: 'Multiple instances of rate limit exceeded in the last 24 hours',
      priority: 'medium',
      time: '5 hours ago'
    },
    {
      title: 'New user registration spike',
      description: 'Unusual increase in registration rate detected',
      priority: 'low',
      time: '12 hours ago'
    }
  ];

  // Recent system activities
  const recentActivities = [
    {
      action: 'User suspended',
      subject: 'john.doe@example.com',
      actor: 'admin@menufacil.app',
      time: '10 minutes ago'
    },
    {
      action: 'Plan upgrade',
      subject: 'Restaurant La Piazza',
      actor: 'owner@lapiazza.com',
      time: '45 minutes ago'
    },
    {
      action: 'Payment processed',
      subject: '$29.99 - Premium Plan',
      actor: 'finance-system',
      time: '2 hours ago'
    },
    {
      action: 'New restaurant verified',
      subject: 'Sushi Express',
      actor: 'verification-bot',
      time: '3 hours ago'
    },
    {
      action: 'System backup',
      subject: 'Database snapshot created',
      actor: 'system',
      time: '6 hours ago'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-800">System Overview</h1>
        <div className="text-sm text-neutral-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className="text-2xl font-bold text-neutral-800 mt-1">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-neutral-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-100">
                <stat.icon className="h-5 w-5 text-neutral-700" />
              </div>
            </div>
            <Link 
              href={stat.link}
              className="mt-4 text-xs font-medium text-neutral-600 hover:text-yellow-600 flex items-center"
            >
              View details
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-800">System Health</h2>
            <Link 
              href="/admindashboard/system-health"
              className="text-xs font-medium text-neutral-600 hover:text-yellow-600 flex items-center"
            >
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-700">CPU Utilization</span>
                <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-2">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-xs text-neutral-500 mt-1">45% - Normal</span>
              </div>
              <Activity className="h-5 w-5 text-neutral-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-700">Memory Usage</span>
                <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-2">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
                <span className="text-xs text-neutral-500 mt-1">62% - Normal</span>
              </div>
              <Activity className="h-5 w-5 text-neutral-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-700">Storage</span>
                <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-2">
                  <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs text-red-500 mt-1">85% - High</span>
              </div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-neutral-700">API Response Time</span>
                <div className="w-full bg-neutral-200 rounded-full h-2.5 mt-2">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '28%' }}></div>
                </div>
                <span className="text-xs text-neutral-500 mt-1">224ms - Good</span>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-800">System Alerts</h2>
            <Link 
              href="/admindashboard/alerts"
              className="text-xs font-medium text-neutral-600 hover:text-yellow-600 flex items-center"
            >
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {systemAlerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  alert.priority === 'high' ? 'border-red-200 bg-red-50' : 
                  alert.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' : 
                  'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start">
                  <AlertTriangle className={`h-5 w-5 mr-2 ${
                    alert.priority === 'high' ? 'text-red-500' : 
                    alert.priority === 'medium' ? 'text-yellow-500' : 
                    'text-blue-500'
                  }`} />
                  <div>
                    <h3 className="text-sm font-medium text-neutral-800">{alert.title}</h3>
                    <p className="text-xs text-neutral-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-neutral-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-neutral-800">Recent Activity</h2>
          <Link 
            href="/admindashboard/activity"
            className="text-xs font-medium text-neutral-600 hover:text-yellow-600 flex items-center"
          >
            View all
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {recentActivities.map((activity, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                    {activity.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {activity.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {activity.actor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {activity.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 