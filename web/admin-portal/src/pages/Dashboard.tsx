import { useState } from "react";
import Layout from "../components/Layout";

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
}

const Dashboard = () => {
  const [stats] = useState<StatCard[]>([
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: "👥",
    },
    {
      title: "Active Restaurants",
      value: "89",
      change: "+5%",
      trend: "up",
      icon: "🍽️",
    },
    {
      title: "Total Orders",
      value: "5,678",
      change: "-2%",
      trend: "down",
      icon: "📦",
    },
    {
      title: "Revenue",
      value: "$45,678",
      change: "+8%",
      trend: "up",
      icon: "💰",
    },
  ]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Orders Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Orders
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Orders chart will be displayed here
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Revenue Overview
            </h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">
                Revenue chart will be displayed here
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                      {item}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      New order received
                    </p>
                    <p className="text-sm text-gray-500">
                      Order #{1000 + item} was placed by Customer {item}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">2 hours ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
