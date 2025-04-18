import React from "react";

interface Stat {
  name: string;
  stat: string;
  change: string;
  changeType: "increase" | "decrease";
}

interface Order {
  id: number;
  table: number;
  items: string[];
  total: number;
  status: "completed" | "preparing" | "pending";
}

const Dashboard: React.FC = () => {
  const stats: Stat[] = [
    {
      name: "Total Orders",
      stat: "71,897",
      change: "12%",
      changeType: "increase",
    },
    {
      name: "Revenue",
      stat: "Rs. 12,00,000",
      change: "8.1%",
      changeType: "increase",
    },
    {
      name: "Active Menu Items",
      stat: "58",
      change: "3.2%",
      changeType: "decrease",
    },
  ];

  const recentOrders: Order[] = [
    {
      id: 1,
      table: 5,
      items: ["Butter Chicken", "Naan"],
      total: 570,
      status: "completed",
    },
    {
      id: 2,
      table: 3,
      items: ["Paneer Tikka", "Veg Biryani"],
      total: 650,
      status: "preparing",
    },
    {
      id: 3,
      table: 8,
      items: ["Dal Makhani", "Roti"],
      total: 420,
      status: "pending",
    },
  ];

  const getStatusColor = (status: Order["status"]): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-[#f29f05]/10 text-[#f29f05]";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-4 text-lg text-gray-700">
          Get an overview of your restaurant's performance and recent orders.
        </p>
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-6 py-8 shadow"
          >
            <dt>
              <div className="absolute rounded-md bg-[#f29f05] p-4">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.172-2.303 0-3.182C10.536 7.719 11.768 7.5 12 7.5c1.45 0 2.9.44 4.121 1.318"
                  />
                </svg>
              </div>
              <p className="ml-20 truncate text-lg font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-20 flex items-baseline pb-6">
              <p className="text-3xl font-semibold text-gray-900">
                {item.stat}
              </p>
              <p
                className={`ml-3 flex items-baseline text-lg font-semibold ${
                  item.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <div className="rounded-lg bg-white shadow-lg">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-gray-900">
                Recent Orders
              </h3>
              <button
                type="button"
                className="inline-flex items-center text-lg font-medium text-[#f29f05] hover:text-[#f29f05]/80"
              >
                View all
                <svg
                  className="ml-2 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-8 flow-root">
              <ul role="list" className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="py-6">
                    <div className="flex items-center space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-medium text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="mt-2 text-lg text-gray-500">
                          Table {order.table} • {order.items.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span className="text-lg font-medium text-gray-900">
                          Rs. {order.total}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-4 py-2 text-base font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
