import React, { useState } from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  status: "pending" | "preparing" | "ready" | "delivered";
  total: number;
  orderTime: string;
}

const Orders: React.FC = () => {
  const [orders] = useState<Order[]>([
    {
      id: 1,
      tableNumber: 5,
      items: [
        { name: "Butter Chicken", quantity: 1, price: 450 },
        { name: "Naan", quantity: 2, price: 60 },
      ],
      status: "preparing",
      total: 570,
      orderTime: "2024-03-20T10:30:00",
    },
    {
      id: 2,
      tableNumber: 3,
      items: [
        { name: "Paneer Tikka", quantity: 1, price: 350 },
        { name: "Veg Biryani", quantity: 1, price: 300 },
      ],
      status: "pending",
      total: 650,
      orderTime: "2024-03-20T10:45:00",
    },
  ]);

  const getStatusColor = (status: Order["status"]): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-[#f29f05]/10 text-[#f29f05]";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-4xl font-bold text-gray-900">Orders</h1>
          <p className="mt-4 text-lg text-gray-700">
            Track and manage all incoming orders in real-time.
          </p>
        </div>
        <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#f29f05] px-6 py-3 text-lg font-medium text-white shadow-lg hover:bg-[#f29f05]/90 focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2"
          >
            <svg
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              />
            </svg>
            Filter Orders
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-4 pl-6 pr-3 text-left text-lg font-semibold text-gray-900"
                    >
                      Order ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-left text-lg font-semibold text-gray-900"
                    >
                      Table
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-left text-lg font-semibold text-gray-900"
                    >
                      Items
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-left text-lg font-semibold text-gray-900"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-left text-lg font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 text-left text-lg font-semibold text-gray-900"
                    >
                      Time
                    </th>
                    <th scope="col" className="relative py-4 pl-3 pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-lg font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-lg text-gray-600">
                        Table {order.tableNumber}
                      </td>
                      <td className="px-4 py-4">
                        <ul className="space-y-2">
                          {order.items.map((item, index) => (
                            <li
                              key={index}
                              className="flex justify-between text-lg"
                            >
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="text-gray-900 font-medium">
                                Rs. {item.price}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-lg font-semibold text-gray-900">
                        Rs. {order.total.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-4 py-2 text-base font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-lg text-gray-600">
                        {new Date(order.orderTime).toLocaleTimeString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-lg">
                        <button
                          type="button"
                          className="text-[#f29f05] hover:text-[#f29f05]/80 font-medium"
                        >
                          Update status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
