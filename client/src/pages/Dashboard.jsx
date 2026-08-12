import React, { useState, useEffect } from 'react';
import { getAssets, createAsset, updateAsset, deleteAsset, getDepartments } from '../services/assetService';
import { getCurrentUser } from '../services/authService';
import AssetMap from '../components/AssetMap';

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'complaints', 'orders', 'maintenance'
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  // Map Center State (Defaults to Mumbai)
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]);

  // Asset Creation Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('Streetlight');
  const [newLat, setNewLat] = useState('19.0760');
  const [newLng, setNewLng] = useState('72.8777');
  const [newValue, setNewValue] = useState('');
  const [newWarranty, setNewWarranty] = useState('');
  const [newDeptId, setNewDeptId] = useState('');
  const [departments, setDepartments] = useState([]);

  // Load user data and assets on startup
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    fetchAssets();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
      if (data.length > 0) {
        setNewDeptId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssets();
      setAssets(data);
      if (data.length > 0) {
        // Set map center to first asset location if it exists
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const selectedDeptId = newDeptId || currentUser?.departmentId || (departments.length > 0 ? departments[0].id : null);
      if (!selectedDeptId) {
        throw new Error('Please select a valid department');
      }

      const payload = {
        name: newName,
        description: newDesc,
        assetType: newType,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLng),
        estimatedValue: newValue ? parseFloat(newValue) : null,
        warrantyInfo: newWarranty,
        departmentId: selectedDeptId
      };

      // Since we just need a departmentId in schema, if user has none, we fetch first dept or fallback
      // In seed, Works department has id, we will mock linking.
      // Let's call endpoint
      await createAsset(payload);
      setShowAddModal(false);
      
      // Reset form
      setNewName('');
      setNewDesc('');
      setNewType('Streetlight');
      setNewLat('19.0760');
      setNewLng('72.8777');
      setNewValue('');
      setNewWarranty('');
      
      // Refresh list
      fetchAssets();
    } catch (err) {
      setError(err.message || 'Failed to create asset');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      setSelectedAsset(null);
      fetchAssets();
    } catch (err) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Filtered Assets list
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) || 
                          asset.id.toLowerCase().includes(search.toLowerCase()) ||
                          asset.assetType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? asset.status === statusFilter : true;
    const matchesCondition = conditionFilter ? asset.condition === conditionFilter : true;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  return (
    <div className="flex h-screen bg-primary-950 text-white overflow-hidden">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-primary-900 border-r border-primary-800 flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-accent-400 tracking-tight">CivicAsset</h2>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mt-1">Municipal Intel</p>
          </div>

          {/* Current User Card */}
          {currentUser && (
            <div className="bg-primary-950/50 rounded-xl p-4 border border-primary-800/60">
              <p className="text-xs text-primary-400 uppercase tracking-widest font-bold">Logged In As</p>
              <h4 className="font-semibold text-white mt-1">{currentUser.firstName} {currentUser.lastName}</h4>
              <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded bg-accent-500/20 text-accent-300 uppercase">
                {currentUser.role}
              </span>
            </div>
          )}

          {/* Tab Navigation Menu */}
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab('assets')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'assets' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/10' : 'text-primary-300 hover:bg-primary-800'
              }`}
            >
              🏢 Municipal Assets
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'complaints' ? 'bg-accent-500 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-800'
              }`}
            >
              ⚠️ Citizen Complaints
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-accent-500 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-800'
              }`}
            >
              🛠️ Work Orders
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'maintenance' ? 'bg-accent-500 text-white shadow-lg' : 'text-primary-300 hover:bg-primary-800'
              }`}
            >
              ⚙️ Maintenance Logs
            </button>
          </nav>
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-200 font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </aside>

      {/* 2. Main Content Window */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Active View: Assets Manager */}
        {activeTab === 'assets' && (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Side: Search, Filter, list of assets */}
            <div className="w-96 bg-primary-900/40 border-r border-primary-800/60 flex flex-col p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Assets Register</h3>
                
                {/* Add Asset Button (Admins & Officers only) */}
                {(currentUser?.role === 'ADMIN' || currentUser?.role === 'OFFICER') && (
                  <button
                    onClick={() => {
                      // Attempt to pre-fill active user's department
                      setNewDeptId(currentUser.departmentId || (departments.length > 0 ? departments[0].id : ''));
                      setShowAddModal(true);
                    }}
                    className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    + Add Asset
                  </button>
                )}
              </div>

              {/* Search & Filter Options */}
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-primary-900 border border-primary-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="OPERATIONAL">Operational</option>
                    <option value="UNDER_MAINTENANCE">Maintenance</option>
                    <option value="DAMAGED">Damaged</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>

                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="bg-primary-900 border border-primary-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="">All Conditions</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              {/* Assets List */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {loading && <p className="text-sm text-primary-400">Loading assets...</p>}
                {!loading && filteredAssets.length === 0 && <p className="text-sm text-primary-400">No assets found.</p>}
                
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setMapCenter([asset.latitude, asset.longitude]);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedAsset?.id === asset.id 
                        ? 'bg-primary-800 border-accent-500' 
                        : 'bg-primary-900/60 border-primary-800 hover:border-primary-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm truncate w-40">{asset.name}</h4>
                      <span className="text-[10px] font-mono text-primary-400">{asset.id}</span>
                    </div>
                    <p className="text-xs text-primary-300 mt-1">{asset.assetType}</p>
                    
                    <div className="flex space-x-2 mt-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        asset.status === 'OPERATIONAL' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-primary-800 text-primary-300">
                        {asset.condition}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Leaflet GIS Map + Detail Drawer */}
            <div className="flex-1 flex flex-col relative h-full">
              
              {/* GIS Map Container */}
              <div className="flex-1 w-full h-full relative">
                <AssetMap 
                  assets={filteredAssets} 
                  selectedAsset={selectedAsset} 
                  onSelectAsset={setSelectedAsset} 
                  mapCenter={mapCenter} 
                />
              </div>

              {/* Selected Asset Detail Overlay (Drawer) */}
              {selectedAsset && (
                <div className="absolute bottom-6 left-6 right-6 bg-primary-900/95 backdrop-blur-md p-6 rounded-2xl border border-primary-800 shadow-2xl z-10 text-left flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono text-accent-400">{selectedAsset.id}</span>
                      <h3 className="text-xl font-bold text-white">{selectedAsset.name}</h3>
                    </div>
                    <p className="text-sm text-primary-300 max-w-xl">{selectedAsset.description || 'No description provided.'}</p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-primary-400 pt-2">
                      <div>Type: <strong className="text-white">{selectedAsset.assetType}</strong></div>
                      <div>Status: <strong className="text-white">{selectedAsset.status}</strong></div>
                      <div>Condition: <strong className="text-white">{selectedAsset.condition}</strong></div>
                      {selectedAsset.estimatedValue && (
                        <div>Value: <strong className="text-white">${selectedAsset.estimatedValue}</strong></div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="bg-primary-800 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Close Details
                    </button>
                    {currentUser?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(selectedAsset.id)}
                        className="bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Delete Asset
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active View: Other tabs (Under Maintenance) */}
        {activeTab !== 'assets' && (
          <div className="flex-1 flex items-center justify-center p-12 bg-primary-950">
            <div className="glass-panel p-10 max-w-md w-full text-center border-t-4 border-t-accent-500 shadow-2xl space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A1.75 1.75 0 1114.75 23.5l-5.83-5.83M11.42 15.17l2.42-2.42M11.42 15.17L9 12.75M13.84 12.75l2.42-2.42M13.84 12.75L11.42 10.33M11.42 10.33l2.42-2.42M11.42 10.33L9 7.91M9 7.91l2.42-2.42M9 7.91L6.58 5.5M6.58 5.5a1.75 1.75 0 112.5-2.5L14.91 8.83a1.75 1.75 0 11-2.5 2.5L6.58 5.5z" />
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Under Maintenance</h2>
                <p className="text-primary-300 text-sm">
                  The <strong className="text-accent-400 uppercase tracking-wide">{activeTab}</strong> module is currently undergoing system repairs. 
                  Please check back shortly!
                </p>
              </div>

              <div className="bg-primary-900/60 rounded-xl p-4 border border-primary-800 text-xs font-mono text-primary-400 flex justify-between items-center">
                <span>Error Code: 503_MAINTENANCE</span>
                <span className="text-accent-400 font-bold uppercase tracking-widest">Repairing</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Add Asset Modal (Visible when showAddModal is true) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full border-t-4 border-t-accent-500 shadow-2xl relative text-left">
            <h3 className="text-2xl font-bold mb-6">Create New Municipal Asset</h3>
            
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
                    placeholder="E.g., North Main Pipeline"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Asset Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
                  >
                    <option value="Streetlight">Streetlight</option>
                    <option value="Road">Road</option>
                    <option value="Water Pipeline">Water Pipeline</option>
                    <option value="Transformer">Transformer</option>
                    <option value="Public Park">Public Park</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500 h-20"
                  placeholder="Enter condition notes or installation details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Warranty Info</label>
                  <input
                    type="text"
                    value={newWarranty}
                    onChange={(e) => setNewWarranty(e.target.value)}
                    className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
                    placeholder="E.g., 2 Year Standard"
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-bold text-primary-300 uppercase tracking-wider mb-2">Department</label>
                <select
                  required
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full bg-primary-900 border border-primary-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
                >
                  {departments.length === 0 && <option value="">Loading departments...</option>}
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-primary-800 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
