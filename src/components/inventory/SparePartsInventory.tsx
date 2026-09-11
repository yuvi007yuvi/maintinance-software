import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  IndianRupee,
} from 'lucide-react';

export default function SparePartsInventory() {
  const { parts, jobCardParts, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(parts.map((p) => p.category)))];
  }, [parts]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'All' || part.category === categoryFilter;

      let matchesStock = true;
      if (stockStatusFilter === 'Low') {
        matchesStock = part.current_stock <= part.min_stock;
      } else if (stockStatusFilter === 'Adequate') {
        matchesStock = part.current_stock > part.min_stock;
      } else if (stockStatusFilter === 'Out') {
        matchesStock = part.current_stock === 0;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [parts, searchTerm, categoryFilter, stockStatusFilter]);

  const totalValuation = useMemo(() => {
    return parts.reduce(
      (sum, p) => sum + (p.current_stock || 0) * (p.purchase_price || 0),
      0
    );
  }, [parts]);

  const lowStockCount = useMemo(() => {
    return parts.filter((p) => p.current_stock <= p.min_stock).length;
  }, [parts]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Loading spare parts inventory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Spare Parts & Central Inventory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track mechanical inventory, reorder thresholds, and workshop consumption
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total SKUs Tracked</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{parts.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Low Stock Alerts</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">{lowStockCount} Items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inventory Valuation</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{totalValuation.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Issued To Repairs</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{jobCardParts.length} Records</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search part name, part number, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="All">All Stocks</option>
            <option value="Low">Low Stock Only</option>
            <option value="Adequate">Adequate Stock</option>
            <option value="Out">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Part Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Min. Threshold</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredParts.map((part) => {
                const isLow = part.current_stock <= part.min_stock;
                const isOut = part.current_stock === 0;

                return (
                  <tr key={part.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {part.part_name}
                      </div>
                      <div className="font-mono text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        {part.part_number} • For: {part.compatible_vehicle_types}
                      </div>
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {part.category}
                    </td>

                    <td className="p-4">
                      <span className={`font-mono font-bold text-sm ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                        {part.current_stock}
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">{part.unit}</span>
                    </td>

                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">
                      {part.min_stock} {part.unit}
                    </td>

                    <td className="p-4 font-mono font-semibold text-slate-900 dark:text-slate-200">
                      ₹{part.purchase_price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300">
                          <TrendingDown className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5" /> Reorder Soon
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Stock
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {part.supplier}
                    </td>
                  </tr>
                );
              })}

              {filteredParts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No spare parts found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
