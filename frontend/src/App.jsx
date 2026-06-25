import { useState, useEffect, useCallback } from "react";
import { Search, ChevronRight, RefreshCw, Package, Tag, DollarSign, Clock, AlertCircle, Database } from "lucide-react";

const API_BASE = "http://localhost:3000";
const PAGE_SIZE = 30;

const CATEGORIES_COLORS = {
  Electronics: { bg: "bg-blue-50 border-blue-100 text-blue-700" },
  books: { bg: "bg-amber-50 border-amber-100 text-amber-700" },
  toys: { bg: "bg-pink-50 border-pink-100 text-pink-700" },
  Fashion: { bg: "bg-purple-50 border-purple-100 text-purple-700" },
  Cookware: { bg: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  Grocery: { bg: "bg-orange-50 border-orange-100 text-orange-700" }
};

function getCategoryStyle(cat) {
  return CATEGORIES_COLORS[cat] || { bg: "bg-gray-50 border-gray-100 text-gray-700" };
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-6 py-4"><div className="h-4 w-36 bg-gray-100 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-100 rounded animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded animate-pulse font-mono" /></td>
    </tr>
  );
}
export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiDown, setApiDown] = useState(false);

  // Cross-retaining filter input values
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // View window partition sliders
  const [screenIndex, setScreenIndex] = useState(0);
  const [nextCursorToken, setNextCursorToken] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories || data || []);
    } catch { }
  }, []);

  const fetchProducts = useCallback(async (cursorToken = null, cat = category, q = search) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: PAGE_SIZE });
      if (cat) params.set("category", cat);
      if (q) params.set("search", q);
      if (cursorToken) params.set("next_cursor", cursorToken);

      const res = await fetch(`${API_BASE}/products?${params}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      const newProducts = data.products || data.data || [];

      // LOGIC UPGRADE: Products are always appended onto the master pool array
      setProducts(prev => [...prev, ...newProducts]);
      setNextCursorToken(data.next_cursor);
      setHasMore(data.has_more ?? !!data.next_cursor);
      setApiDown(false);
    } catch (err) {
      if (err.message.includes("Failed to fetch") || err.message.includes("ERR_CONNECTION")) {
        setApiDown(true);
        setError("Cannot reach the backend server at localhost:3000.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [category, search]);
  // LOGIC UPGRADE: Wipes product pool completely and resets position to 0 on filter hits
  const applyFilter = useCallback((newCat, newSearch) => {
    setProducts([]);
    setNextCursorToken(null);
    setScreenIndex(0);
    fetchProducts(null, newCat, newSearch);
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
    applyFilter("", "");
  }, []);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    applyFilter(cat, search);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    applyFilter(category, searchInput);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setSearch("");
    applyFilter(category, "");
  };

  // LOGIC UPGRADE: Forward click requests new items if we hit the edge of what is loaded
  // Updated Forward Navigation Shifter
  const handleNextScreen = () => {
    const nextIdx = screenIndex + 1;
    setScreenIndex(nextIdx);

    if (nextIdx * PAGE_SIZE >= products.length) {
      fetchProducts(nextCursorToken, category, search);
    }
    // Removed window.scrollTo to preserve layout positioning
  };

  // Updated Backward Navigation Shifter
  const handlePrevScreen = () => {
    if (screenIndex === 0) return;
    setScreenIndex(prev => prev - 1);
    // Removed window.scrollTo to preserve layout positioning
  };


  const handleRefresh = () => {
    applyFilter(category, search);
  };

  // Extract the specific 50-item viewport slice out of our big accumulated master array pool
  const visibleProducts = products.slice(screenIndex * PAGE_SIZE, (screenIndex + 1) * PAGE_SIZE);
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 antialiased font-sans">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center shadow-md">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Product Viewer</h1>
              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                <Database size={10} /> product management
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={12} className={loading && products.length === 0 ? "animate-spin" : ""} />
            <span>Reset View</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search across product title catalog..."
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none placeholder-slate-400 shadow-sm"
              />
              {searchInput && (
                <button type="button" onClick={handleSearchClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 text-base">×</button>
              )}
            </div>
            <button type="submit" className="px-5 py-2.5 bg-neutral-700 text-white text-sm font-medium rounded-xl hover:bg-slate-800 shadow-sm">
              Query
            </button>
          </form>

          <div className="relative min-w-[200px]">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none appearance-none cursor-pointer text-slate-700 shadow-sm font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 mb-1 px-4 py-3 text-slate-100 rounded-xl text-xs shadow-sm font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-black"> Each page consisits of maximum {PAGE_SIZE} rows.</span>
        </div>

        {apiDown && (
          <div className="flex items-start gap-3 mb- px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertCircle size={18} className="text-amber-600 mt-0.5" />
            <p className="text-sm font-bold text-amber-900">Backend Server Offline. Make sure your local engine is up.</p>
          </div>
        )}

        {error && !apiDown && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm font-medium text-rose-800"><AlertCircle size={16} />{error}</div>
        )}
        <div className="flex gap-3 h-10 justify-end px-5 py-1">
              <button
                disabled={screenIndex === 0 || loading}
                onClick={handlePrevScreen}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                &larr; 
              </button>
              <button
                disabled={(!hasMore && (screenIndex + 1) * PAGE_SIZE >= products.length) || loading}
                onClick={handleNextScreen}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-neutral-700 border border-transparent rounded-xl hover:bg-slate-800 disabled:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
               &rarr;
              </button>
            </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          
          <div className="overflow-x-auto">
            
            <table className="w-full text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-medium">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase"><div className="flex items-center gap-1.5"><Package size={13} />Item Label</div></th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase"><div className="flex items-center gap-1.5"><Tag size={13} />Category Group</div></th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase"><div className="flex items-center gap-1.5"><DollarSign size={13} />Price Tier</div></th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase"><div className="flex items-center gap-1.5"><Clock size={13} />Created At</div></th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase font-mono">Product ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleProducts.length === 0 && loading ? (
                  Array.from({ length: 15 }).map((_, i) => <SkeletonRow key={i} />)
                ) : visibleProducts.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-24 text-center text-slate-400 font-medium">No document nodes matched this query criteria.</td></tr>
                ) : (
                  visibleProducts.map((product) => {
                    const style = getCategoryStyle(product.category);
                    const id = product._id || product.id || "—";
                    return (
                      <tr key={id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-slate-800">{product.name}</td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}>{product.category}</span></td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs font-medium">{formatDate(product.created_at)}</td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-400 select-all">{product.productId}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Fixed Button Row with Explicit Contrasts and Disabled Freeze Resets */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">SCREEN POSITION #{screenIndex + 1}</span>
              {screenIndex > 0 && <button onClick={handleRefresh} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors ml-2">Reset to Top</button>}
            </div>

            <div className="flex gap-3">
              <button
                disabled={screenIndex === 0 || loading}
                onClick={handlePrevScreen}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                &larr; Back
              </button>
              <button
                disabled={(!hasMore && (screenIndex + 1) * PAGE_SIZE >= products.length) || loading}
                onClick={handleNextScreen}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-neutral-700 border border-transparent rounded-xl hover:bg-slate-800 disabled:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
