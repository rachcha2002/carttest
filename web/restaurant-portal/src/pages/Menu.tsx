import React, { useState } from "react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

const Menu: React.FC = () => {
  const [menuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: "Butter Chicken",
      description: "Tender chicken in rich tomato gravy",
      price: 450,
      category: "Main Course",
      image: "https://source.unsplash.com/random/400x300/?curry",
    },
    {
      id: 2,
      name: "Paneer Tikka",
      description: "Grilled cottage cheese with spices",
      price: 350,
      category: "Starters",
      image: "https://source.unsplash.com/random/400x300/?paneer",
    },
    {
      id: 3,
      name: "Veg Biryani",
      description: "Fragrant rice with mixed vegetables",
      price: 300,
      category: "Rice",
      image: "https://source.unsplash.com/random/400x300/?biryani",
    },
  ]);

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-4xl font-bold text-gray-900">Menu Items</h1>
          <p className="mt-4 text-lg text-gray-700">
            Manage your restaurant's menu items, prices, and categories.
          </p>
        </div>
        <div className="mt-6 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#f29f05] px-6 py-3 text-lg font-medium text-white shadow-lg hover:bg-[#f29f05]/90 focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2 sm:w-auto"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add menu item
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-lg transition hover:shadow-xl"
          >
            <div className="aspect-w-3 aspect-h-2 bg-gray-200">
              <img
                src={item.image}
                alt={item.name}
                className="h-64 w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {item.name}
                </h3>
                <span className="inline-flex items-center rounded-full bg-[#f29f05]/10 px-3 py-1.5 text-base font-medium text-[#f29f05]">
                  {item.category}
                </span>
              </div>
              <p className="mt-3 text-lg text-gray-600">{item.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  Rs. {item.price.toFixed(2)}
                </span>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-[#f29f05] bg-white px-4 py-2 text-base font-medium text-[#f29f05] shadow-sm hover:bg-[#f29f05]/5 focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f29f05] focus:ring-offset-2"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
