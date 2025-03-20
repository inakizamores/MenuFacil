'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getRestaurantAnalytics } from '@/actions/analytics';
import { getUserRestaurants } from '@/actions/restaurants';

interface Restaurant {
  id: string;
  name: string;
}

interface ViewsData {
  date: string;
  count: number;
}

interface DeviceData {
  deviceType: string;
  count: number;
}

interface SourceData {
  source: string;
  count: number;
}

interface AnalyticsSummary {
  totalViews: number;
  weeklyViews: ViewsData[];
  deviceBreakdown: DeviceData[];
  sourceBreakdown: SourceData[];
}

export default function AnalyticsDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!user?.id) return;
      
      try {
        const restaurantsData = await getUserRestaurants(user.id);
        setRestaurants(restaurantsData);
        
        // Select the first restaurant by default if available
        if (restaurantsData.length > 0) {
          setSelectedRestaurant(restaurantsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('Failed to load restaurants');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && user) {
      fetchRestaurants();
    }
  }, [user, authLoading]);
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!selectedRestaurant) return;
      
      setIsLoading(true);
      try {
        const data = await getRestaurantAnalytics(selectedRestaurant);
        setAnalyticsData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data');
        setAnalyticsData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedRestaurant) {
      fetchAnalytics();
    }
  }, [selectedRestaurant]);
  
  // Format date for chart display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Handle restaurant selection
  const handleRestaurantChange = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h1 className="text-xl font-semibold mb-2">Authentication Required</h1>
          <p>Please sign in to view analytics.</p>
        </Card>
      </div>
    );
  }
  
  if (restaurants.length === 0 && !isLoading) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <h1 className="text-xl font-semibold mb-2">No Restaurants Found</h1>
          <p>You need to create a restaurant before you can view analytics.</p>
          <Link href="/dashboard/restaurants/create">
            <Button className="mt-4">
              Create Restaurant
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Restaurant Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Restaurant</label>
        <select 
          className="w-full md:w-64 rounded-md border border-input p-2"
          value={selectedRestaurant || ''}
          onChange={(e) => handleRestaurantChange(e.target.value)}
          disabled={isLoading}
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      ) : error ? (
        <Card className="p-6">
          <div className="text-red-500">{error}</div>
        </Card>
      ) : analyticsData ? (
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
            <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-4">
                <div className="text-sm text-gray-500 mb-1">Total QR Code Views</div>
                <div className="text-3xl font-bold">{analyticsData.totalViews}</div>
              </Card>
              
              <Card className="p-4">
                <div className="text-sm text-gray-500 mb-1">Mobile Views</div>
                <div className="text-3xl font-bold">
                  {analyticsData.deviceBreakdown.find(d => d.deviceType === 'mobile')?.count || 0}
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="text-sm text-gray-500 mb-1">Most Views by Source</div>
                <div className="text-3xl font-bold capitalize">
                  {analyticsData.sourceBreakdown.sort((a, b) => b.count - a.count)[0]?.source || 'N/A'}
                </div>
              </Card>
            </div>
            
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Views Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.weeklyViews.map(item => ({
                      ...item,
                      date: formatDate(item.date)
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      name="Views" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="devices">
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Device Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.deviceBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="deviceType"
                      >
                        {analyticsData.deviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Device Usage</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.deviceBreakdown.map((device, index) => (
                        <tr key={device.deviceType}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                            {device.deviceType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {((device.count / analyticsData.totalViews) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="sources">
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Traffic Sources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.sourceBreakdown}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Views" fill="#8884d8">
                        {analyticsData.sourceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Source Breakdown</h3>
                  <div className="space-y-4">
                    {analyticsData.sourceBreakdown.map((source) => (
                      <div key={source.source} className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium capitalize">{source.source}</div>
                          <div className="text-sm font-bold">{source.count} views</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${(source.count / analyticsData.totalViews) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {((source.count / analyticsData.totalViews) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Source Definitions</h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <div className="font-medium">Scan:</div>
                  <div>Views that came from users scanning a QR code with their mobile device</div>
                </li>
                <li className="flex gap-3">
                  <div className="font-medium">Direct:</div>
                  <div>Views that came from users directly entering the URL or clicking a link</div>
                </li>
                <li className="flex gap-3">
                  <div className="font-medium">Share:</div>
                  <div>Views that came from shared links (e.g., via social media, email, or messaging apps)</div>
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
} 