import React from 'react';

function ProductRiskCategories({ categories }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Product Categories at Risk</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-300">{category.name}</span>
            <span className={`${category.colorClass} font-bold`}>{category.risk}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductRiskCategories;
