import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssets, createAsset, updateAsset, deleteAsset, getDepartments } from '../services/assetService';
import { getCurrentUser, isAuthenticated, logout } from '../services/authService';
import { getComplaints, createComplaint, updateComplaint, deleteComplaint } from '../services/complaintService';
import { getWorkOrders, createWorkOrder, updateWorkOrder, getWorkers } from '../services/workOrderService';
import AssetMap from '../components/AssetMap';

function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'complaints', 'orders', 'maintenance'
  const [assets, setAssets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering & Search for Assets
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  // Filtering & Search for Complaints
  const [searchComplaint, setSearchComplaint] = useState('');
  const [statusComplaintFilter, setStatusComplaintFilter] = useState('');
  const [categoryComplaintFilter, setCategoryComplaintFilter] = useState('');

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

  // Complaint Creation Modal Form State
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [compCategory, setCompCategory] = useState('Streetlight');
  const [compDesc, setCompDesc] = useState('');
  const [compSeverity, setCompSeverity] = useState('MEDIUM');
  const [compLat, setCompLat] = useState('19.0760');
  const [compLng, setCompLng] = useState('72.8777');
  const [compImage, setCompImage] = useState(null);
  const [compImageTab, setCompImageTab] = useState('link'); // 'link' or 'upload'
  const [compImageUrlInput, setCompImageUrlInput] = useState('');
  const [isPickingCoords, setIsPickingCoords] = useState(false);

  // Work Orders State
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [statusOrderFilter, setStatusOrderFilter] = useState('');

  // Dispatch Modal State (Officer dispatches complaint to worker)
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchComplaint, setDispatchComplaint] = useState(null);
  const [dispatchWorkerId, setDispatchWorkerId] = useState('');
  const [dispatchPriority, setDispatchPriority] = useState('MEDIUM');
  const [dispatchSlaHours, setDispatchSlaHours] = useState('48');
  const [dispatchDesc, setDispatchDesc] = useState('');

  // Complete Repair Modal State (Worker attaches completed photo and notes)
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeOrder, setCompleteOrder] = useState(null);
  const [completeAfterImage, setCompleteAfterImage] = useState('');
  const [completeAfterImageTab, setCompleteAfterImageTab] = useState('link'); // 'link' or 'upload'
  const [completeLocalFile, setCompleteLocalFile] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');

  // Load user data, assets, and complaints on startup
  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      navigate('/login');
      return;
    }
    const user = getCurrentUser();
    setCurrentUser(user);
    fetchAssets();
    fetchComplaints();
    fetchDepartments();
    fetchWorkOrders();
    if (user && ['ADMIN', 'OFFICER'].includes(user.role)) {
      fetchWorkers();
    }
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
      if (err.message && (err.message.includes('expired') || err.message.includes('token') || err.message.includes('Session'))) {
        handleLogout();
      }
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssets();
      setAssets(data);
      if (data.length > 0 && activeTab === 'assets') {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assets');
      if (err.message && (err.message.includes('expired') || err.message.includes('token') || err.message.includes('Session'))) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getComplaints();
      setComplaints(data);
      if (data.length > 0 && activeTab === 'complaints') {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaints');
      if (err.message && (err.message.includes('expired') || err.message.includes('token') || err.message.includes('Session'))) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const data = await getWorkOrders();
      setWorkOrders(data);
      if (data.length > 0 && !selectedWorkOrder) {
        setSelectedWorkOrder(data[0]);
      }
    } catch (err) {
      console.error('Failed to load work orders:', err);
      if (err.message && (err.message.includes('expired') || err.message.includes('token') || err.message.includes('Session'))) {
        handleLogout();
      }
    }
  };

  const fetchWorkers = async () => {
    const user = getCurrentUser();
    if (!user || !['ADMIN', 'OFFICER'].includes(user.role)) return;
    try {
      const data = await getWorkers();
      setWorkers(data || []);
      if (data && data.length > 0 && !dispatchWorkerId) {
        setDispatchWorkerId(data[0].id);
      }
    } catch (err) {
      // Non-officer users might not have permission
    }
  };

  const handleOpenDispatch = (complaint) => {
    setDispatchComplaint(complaint);
    setDispatchPriority(complaint.priority || complaint.severity || 'MEDIUM');
    setDispatchDesc(`Repair dispatch for ${complaint.category}: ${complaint.description}`);
    setShowDispatchModal(true);
  };

  const handleSubmitDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchComplaint || !dispatchWorkerId) return;
    setError('');
    try {
      const payload = {
        complaintId: dispatchComplaint.id,
        assetId: dispatchComplaint.assetId,
        assignedWorkerId: dispatchWorkerId,
        priority: dispatchPriority,
        description: dispatchDesc,
        slaHours: parseInt(dispatchSlaHours, 10)
      };
      await createWorkOrder(payload);
      setShowDispatchModal(false);
      setDispatchComplaint(null);
      fetchWorkOrders();
      fetchComplaints();
      setActiveTab('orders');
    } catch (err) {
      setError(err.message || 'Failed to dispatch work order');
    }
  };

  const handleStartWork = async (orderId) => {
    try {
      const updated = await updateWorkOrder(orderId, { status: 'IN_PROGRESS' });
      setWorkOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setSelectedWorkOrder(updated);
      fetchComplaints();
    } catch (err) {
      alert(err.message || 'Failed to start work');
    }
  };

  const handleOpenCompleteModal = (order) => {
    setCompleteOrder(order);
    setCompleteAfterImage('');
    setCompleteLocalFile(null);
    setCompleteAfterImageTab('link');
    setCompleteNotes('');
    setShowCompleteModal(true);
  };

  const handleCompleteImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompleteLocalFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCompleteWork = async (e) => {
    e.preventDefault();
    if (!completeOrder) return;
    setError('');
    try {
      const finalImage = completeAfterImageTab === 'link' ? (completeAfterImage.trim() || null) : completeLocalFile;
      const payload = {
        status: 'COMPLETED',
        afterImage: finalImage,
        repairNotes: completeNotes
      };
      const updated = await updateWorkOrder(completeOrder.id, payload);
      setWorkOrders(prev => prev.map(o => o.id === completeOrder.id ? updated : o));
      setSelectedWorkOrder(updated);
      setShowCompleteModal(false);
      setCompleteOrder(null);
      fetchComplaints();
    } catch (err) {
      setError(err.message || 'Failed to complete work order');
    }
  };

  const handleVerifyWorkOrder = async (orderId) => {
    if (!window.confirm('Verify this work order and mark the citizen complaint as Resolved?')) return;
    try {
      const updated = await updateWorkOrder(orderId, { status: 'VERIFIED' });
      setWorkOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      setSelectedWorkOrder(updated);
      fetchComplaints();
    } catch (err) {
      alert(err.message || 'Failed to verify work order');
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
      
      fetchAssets();
    } catch (err) {
      setError(err.message || 'Failed to create asset');
    }
  };

  const handleFileComplaint = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const selectedImage = compImageTab === 'link' ? (compImageUrlInput.trim() || null) : compImage;
      const payload = {
        category: compCategory,
        description: compDesc,
        severity: compSeverity,
        latitude: parseFloat(compLat),
        longitude: parseFloat(compLng),
        imageUrl: selectedImage
      };

      await createComplaint(payload);
      setShowComplaintModal(false);

      // Reset form
      setCompCategory('Streetlight');
      setCompDesc('');
      setCompSeverity('MEDIUM');
      setCompLat('19.0760');
      setCompLng('72.8777');
      setCompImage(null);
      setCompImageUrlInput('');
      setCompImageTab('link');

      fetchComplaints();
    } catch (err) {
      setError(err.message || 'Failed to file complaint');
    }
  };

  const handleComplaintStatusUpdate = async (id, newStatus) => {
    try {
      const updated = await updateComplaint(id, { status: newStatus });
      setComplaints(prev => prev.map(c => c.id === id ? updated : c));
      setSelectedComplaint(updated);
    } catch (err) {
      alert(err.message || 'Failed to update complaint status');
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

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    try {
      await deleteComplaint(id);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.message || 'Failed to delete complaint');
    }
  };

  const handleMapClick = (lat, lng) => {
    if (isPickingCoords) {
      setCompLat(lat.toFixed(6));
      setCompLng(lng.toFixed(6));
      setIsPickingCoords(false);
      setShowComplaintModal(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompImage(reader.result); // Base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${serverUrl}${path.startsWith('/') ? path : '/' + path}`;
  };

  // Filtered lists
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) || 
                          asset.id.toLowerCase().includes(search.toLowerCase()) ||
                          asset.assetType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? asset.status === statusFilter : true;
    const matchesCondition = conditionFilter ? asset.condition === conditionFilter : true;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const filteredComplaints = complaints.filter((comp) => {
    const matchesSearch = comp.description.toLowerCase().includes(searchComplaint.toLowerCase()) || 
                          comp.id.toLowerCase().includes(searchComplaint.toLowerCase()) ||
                          comp.category.toLowerCase().includes(searchComplaint.toLowerCase());
    const matchesStatus = statusComplaintFilter ? comp.status === statusComplaintFilter : true;
    const matchesCategory = categoryComplaintFilter ? comp.category === categoryComplaintFilter : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchOrder.toLowerCase()) ||
      (order.description && order.description.toLowerCase().includes(searchOrder.toLowerCase())) ||
      (order.asset?.name && order.asset.name.toLowerCase().includes(searchOrder.toLowerCase())) ||
      (order.assignedWorker && `${order.assignedWorker.firstName} ${order.assignedWorker.lastName}`.toLowerCase().includes(searchOrder.toLowerCase()));
    
    if (statusOrderFilter === 'BREACHED') {
      return matchesSearch && order.slaBreached;
    }
    const matchesStatus = statusOrderFilter ? order.status === statusOrderFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-primary-50 text-primary-800 overflow-hidden relative font-sans p-4 gap-4">
      
      {/* Map coordinate picking banner overlay */}
      {isPickingCoords && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-accent-600 border border-accent-500 text-white px-6 py-3 rounded-full shadow-medium z-50 flex items-center space-x-4 animate-bounce">
          <span className="text-sm font-bold flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-white mr-2 animate-ping"></span>
            📍 Click anywhere on the map to capture coordinates
          </span>
          <button 
            onClick={() => {
              setIsPickingCoords(false);
              setShowComplaintModal(true);
            }}
            className="bg-accent-700 hover:bg-red-600 text-white px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border border-accent-500/50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-white/90 backdrop-blur-xl border border-primary-200/80 rounded-2xl flex flex-col justify-between p-6 z-10 shadow-soft">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center shadow-md shadow-accent-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-primary-900 tracking-tight">CivicAsset</h2>
              <p className="text-[9px] text-accent-600 font-extrabold uppercase tracking-widest mt-0.5">Municipal GIS suite</p>
            </div>
          </div>

          {/* Current User Card */}
          {currentUser && (
            <div className="bg-primary-100/40 rounded-2xl p-4 border border-primary-200/50 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-primary-100 border border-primary-200/80 flex items-center justify-center text-accent-600 font-bold uppercase shadow-sm">
                {(currentUser?.firstName?.[0] || '') + (currentUser?.lastName?.[0] || '') || (currentUser?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="text-left flex-1 min-w-0">
                <h4 className="font-bold text-xs text-primary-900 truncate">
                  {(currentUser?.firstName && currentUser?.lastName) ? `${currentUser.firstName} ${currentUser.lastName}` : (currentUser?.email || 'User')}
                </h4>
                <span className="inline-flex mt-1 px-2 py-0.5 text-[8px] font-bold rounded-full bg-accent-50 border border-accent-100 text-accent-600 uppercase tracking-wider">
                  {currentUser?.role || 'CITIZEN'}
                </span>
              </div>
            </div>
          )}

          {/* Tab Navigation Menu */}
          <nav className="flex flex-col space-y-1 pt-4">
            <button
              onClick={() => setActiveTab('assets')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-3 border ${
                activeTab === 'assets' 
                  ? 'bg-accent-50 border-accent-200/55 text-accent-600 shadow-accent-glow' 
                  : 'border-transparent text-primary-600 hover:text-primary-950 hover:bg-primary-100/40'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v3m0 0h5.25m0 0v-3.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              <span>Municipal Assets</span>
            </button>
            
            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-3 border ${
                activeTab === 'complaints' 
                  ? 'bg-accent-50 border-accent-200/55 text-accent-600 shadow-accent-glow' 
                  : 'border-transparent text-primary-600 hover:text-primary-950 hover:bg-primary-100/40'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <span>Citizen Complaints</span>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                activeTab === 'orders' 
                  ? 'bg-accent-50 border-accent-200/55 text-accent-600 shadow-accent-glow' 
                  : 'border-transparent text-primary-600 hover:text-primary-950 hover:bg-primary-100/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-cyber-teal">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A1.75 1.75 0 1114.75 23.5l-5.83-5.83M11.42 15.17l2.42-2.42M11.42 15.17L9 12.75M13.84 12.75l2.42-2.42M13.84 12.75L11.42 10.33M11.42 10.33l2.42-2.42M11.42 10.33L9 7.91M9 7.91l2.42-2.42M9 7.91L6.58 5.5" />
                </svg>
                <span>Work Orders</span>
              </div>
              {workOrders.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20">
                  {workOrders.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-3 border ${
                activeTab === 'maintenance' 
                  ? 'bg-accent-50 border-accent-200/55 text-accent-600 shadow-accent-glow' 
                  : 'border-transparent text-primary-600 hover:text-primary-950 hover:bg-primary-100/40'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Maintenance Logs</span>
            </button>
          </nav>
        </div>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-600 border border-red-200 text-red-600 hover:text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* 2. Main Content Window */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Active View: Assets and Complaints Dashboard */}
        {(activeTab === 'assets' || activeTab === 'complaints') && (
          <div className="flex-1 flex overflow-hidden gap-4">
            
            {/* Sidebar list section */}
            <div className="w-96 bg-white/90 backdrop-blur-xl border border-primary-200/80 rounded-2xl flex flex-col p-6 overflow-hidden z-10 shadow-soft">
              
              {/* Assets Sidebar Panel */}
              {activeTab === 'assets' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold tracking-tight text-primary-900">Assets Register</h3>
                    {(currentUser?.role === 'ADMIN' || currentUser?.role === 'OFFICER') && (
                      <button
                        onClick={() => {
                          setNewDeptId(currentUser?.departmentId || (departments.length > 0 ? departments[0].id : ''));
                          setShowAddModal(true);
                        }}
                        className="bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-accent-600/10 flex items-center space-x-1"
                      >
                        <span>+ Add Asset</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.636z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-primary-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-primary-900 placeholder-primary-400 focus:outline-none focus:border-accent-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white border border-primary-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none text-primary-800 focus:border-accent-500"
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
                        className="bg-white border border-primary-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none text-primary-800 focus:border-accent-500"
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

                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {loading && <p className="text-xs text-primary-500 text-center py-8">Loading assets...</p>}
                    {!loading && filteredAssets.length === 0 && <p className="text-xs text-primary-500 text-center py-8">No assets found.</p>}
                    
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setSelectedAsset(asset);
                          setMapCenter([asset.latitude, asset.longitude]);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          selectedAsset?.id === asset.id 
                            ? 'bg-white border-accent-500 shadow-medium shadow-accent-500/5' 
                            : 'bg-white/40 border-primary-200/80 hover:bg-white hover:border-primary-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-primary-900 truncate w-40">{asset.name}</h4>
                          <span className="text-[9px] font-mono font-bold text-primary-500 bg-primary-100/50 px-1.5 py-0.5 rounded border border-primary-200">{asset.id}</span>
                        </div>
                        <p className="text-[10px] text-primary-500 mt-1 flex items-center">
                          <span className="w-1 h-1 rounded-full bg-primary-400 mr-1.5"></span>
                          {asset.assetType}
                        </p>
                        
                        <div className="flex space-x-2 mt-3">
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                            asset.status === 'OPERATIONAL' 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                          <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase bg-primary-100 border border-primary-200 text-primary-600">
                            {asset.condition}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Complaints Sidebar Panel */}
              {activeTab === 'complaints' && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold tracking-tight text-primary-900">Complaints Queue</h3>
                    <button
                      onClick={() => {
                        setError('');
                        setShowComplaintModal(true);
                      }}
                      className="bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-accent-600/10 flex items-center space-x-1"
                    >
                      <span>+ File Complaint</span>
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.636z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchComplaint}
                        onChange={(e) => setSearchComplaint(e.target.value)}
                        className="w-full bg-white border border-primary-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-primary-900 placeholder-primary-400 focus:outline-none focus:border-accent-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={statusComplaintFilter}
                        onChange={(e) => setStatusComplaintFilter(e.target.value)}
                        className="bg-white border border-primary-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none text-primary-800 focus:border-accent-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="CLOSED">Closed</option>
                      </select>

                      <select
                        value={categoryComplaintFilter}
                        onChange={(e) => setCategoryComplaintFilter(e.target.value)}
                        className="bg-white border border-primary-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none text-primary-800 focus:border-accent-500"
                      >
                        <option value="">All Categories</option>
                        <option value="Streetlight">Streetlight</option>
                        <option value="Road">Road</option>
                        <option value="Water Pipeline">Water Pipeline</option>
                        <option value="Transformer">Transformer</option>
                        <option value="Public Park">Public Park</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {loading && <p className="text-xs text-primary-500 text-center py-8">Loading complaints...</p>}
                    {!loading && filteredComplaints.length === 0 && <p className="text-xs text-primary-500 text-center py-8">No complaints logged.</p>}
                    
                    {filteredComplaints.map((comp) => (
                      <div
                        key={comp.id}
                        onClick={() => {
                          setSelectedComplaint(comp);
                          setMapCenter([comp.latitude, comp.longitude]);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          selectedComplaint?.id === comp.id 
                            ? 'bg-white border-accent-500 shadow-medium shadow-accent-500/5' 
                            : 'bg-white/40 border-primary-200/80 hover:bg-white hover:border-primary-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-primary-900 truncate w-40">{comp.category}</h4>
                          <span className="text-[9px] font-mono font-bold text-primary-500 bg-primary-100/50 px-1.5 py-0.5 rounded border border-primary-200">{comp.id}</span>
                        </div>
                        <p className="text-[10px] text-primary-600 mt-1.5 italic line-clamp-2">"{comp.description}"</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3 items-center">
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                            comp.status === 'SUBMITTED' ? 'bg-primary-100 border-primary-200 text-primary-600' :
                            comp.status === 'UNDER_REVIEW' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(comp.status) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {comp.status.replace('_', ' ')}
                          </span>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                            comp.severity === 'HIGH' ? 'bg-red-50 border-red-200 text-red-700' :
                            comp.severity === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-primary-100 border-primary-200 text-primary-500'
                          }`}>
                            {comp.severity} Severity
                          </span>
                          {comp.imageUrl && (
                            <span className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase border bg-indigo-50 border-indigo-200 text-indigo-700 flex items-center gap-1">
                              📷 Photo Link
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right Side: Leaflet GIS Map + Detail Drawer */}
            <div className="flex-1 flex flex-col relative h-full rounded-2xl overflow-hidden shadow-medium border border-primary-200/80 bg-white">
              
              {/* GIS Map Container */}
              <div className="flex-1 w-full h-full relative z-0">
                <AssetMap 
                  assets={filteredAssets} 
                  complaints={filteredComplaints}
                  selectedAsset={selectedAsset} 
                  selectedComplaint={selectedComplaint}
                  onSelectAsset={setSelectedAsset}
                  onSelectComplaint={setSelectedComplaint}
                  mapCenter={mapCenter} 
                  mode={activeTab}
                  isPickingCoords={isPickingCoords}
                  onMapClick={handleMapClick}
                />
              </div>

              {/* Selected Asset Detail Overlay (Drawer) */}
              {activeTab === 'assets' && selectedAsset && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl p-5 rounded-2xl border border-primary-200 shadow-2xl z-10 text-left flex justify-between items-center gap-6 animate-fade-in">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold font-mono text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-100">{selectedAsset.id}</span>
                      <h3 className="text-lg font-bold text-primary-900 tracking-tight">{selectedAsset.name}</h3>
                    </div>
                    <p className="text-xs text-primary-600 max-w-2xl">{selectedAsset.description || 'No description provided.'}</p>
                    
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-primary-500 pt-1">
                      <div>Type: <strong className="text-primary-800 font-semibold">{selectedAsset.assetType}</strong></div>
                      <div>Status: <strong className="text-primary-800 font-semibold">{selectedAsset.status}</strong></div>
                      <div>Condition: <strong className="text-primary-800 font-semibold">{selectedAsset.condition}</strong></div>
                      {selectedAsset.estimatedValue && (
                        <div>Value: <strong className="text-emerald-600 font-semibold">${selectedAsset.estimatedValue.toLocaleString()}</strong></div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 flex-shrink-0">
                    {currentUser?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(selectedAsset.id)}
                        className="bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/30 hover:border-transparent transition-all px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Delete Asset
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="bg-primary-100 hover:bg-primary-200 text-primary-700 border border-primary-200 transition-all px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Selected Complaint Detail Overlay (Drawer) */}
              {activeTab === 'complaints' && selectedComplaint && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl p-5 rounded-2xl border border-primary-200 shadow-2xl z-10 text-left flex gap-6 items-center justify-between animate-fade-in">
                  <div className="flex gap-5 items-center min-w-0">
                    {/* Thumbnail attachment if exists */}
                    {selectedComplaint.imageUrl && (
                      <div className="relative group w-20 h-20 bg-primary-100 rounded-xl overflow-hidden border border-primary-200 flex-shrink-0 shadow-sm">
                        <img 
                          src={getImageUrl(selectedComplaint.imageUrl)} 
                          alt="Complaint attachment" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onClick={() => window.open(getImageUrl(selectedComplaint.imageUrl), '_blank', 'noopener,noreferrer')}
                          title="Click to open photo in new tab"
                        />
                        <div 
                          onClick={() => window.open(getImageUrl(selectedComplaint.imageUrl), '_blank', 'noopener,noreferrer')}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          title="Open photo link"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-bold font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{selectedComplaint.id}</span>
                        <h3 className="text-lg font-bold text-primary-900 tracking-tight">{selectedComplaint.category} Issue</h3>
                        {selectedComplaint.imageUrl && (
                          <a
                            href={getImageUrl(selectedComplaint.imageUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold hover:bg-indigo-100 hover:text-indigo-900 transition-all cursor-pointer shadow-xs"
                            title="Open photo link in new tab - accessible from any computer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            <span>Open Photo Link ↗</span>
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-primary-600 italic line-clamp-2">"{selectedComplaint.description}"</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-primary-500 pt-1">
                        <div>Severity: <strong className={`font-semibold ${selectedComplaint.severity === 'HIGH' ? 'text-red-600' : 'text-primary-800'}`}>{selectedComplaint.severity}</strong></div>
                        <div>Status: <strong className="text-primary-850 font-semibold">{selectedComplaint.status.replace('_', ' ')}</strong></div>
                        {selectedComplaint.citizen && (
                          <div>Reported By: <strong className="text-primary-800 font-semibold">{selectedComplaint.citizen.firstName} {selectedComplaint.citizen.lastName}</strong></div>
                        )}
                        {selectedComplaint.department && (
                          <div>Dept: <strong className="text-accent-600 font-semibold">{selectedComplaint.department.name}</strong></div>
                        )}
                      </div>

                      {/* Officer action drop-down & Dispatch Work Order button */}
                      {['ADMIN', 'OFFICER'].includes(currentUser?.role) && (
                        <div className="flex items-center flex-wrap gap-2.5 mt-2 pt-2 border-t border-primary-100">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-primary-500 font-bold uppercase tracking-wider">Status:</span>
                            <select
                              value={selectedComplaint.status}
                              onChange={(e) => handleComplaintStatusUpdate(selectedComplaint.id, e.target.value)}
                              className="bg-white border border-primary-200 rounded-lg px-2.5 py-1 text-xs text-primary-900 focus:outline-none focus:border-accent-500"
                            >
                              <option value="SUBMITTED">Submitted</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="ASSIGNED">Assigned</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="VERIFIED">Verified</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenDispatch(selectedComplaint)}
                            className="bg-gradient-to-r from-teal-600 to-accent-600 hover:from-teal-500 hover:to-accent-500 text-white font-bold px-3 py-1 rounded-lg text-[10px] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                            title="Dispatch field technician for this complaint"
                          >
                            <span>⚡ Dispatch Work Order</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 flex-shrink-0">
                    {currentUser?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteComplaint(selectedComplaint.id)}
                        className="bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/30 hover:border-transparent transition-all px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Delete Complaint
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="bg-primary-100 hover:bg-primary-200 text-primary-700 border border-primary-200 transition-all px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active View: Work Orders Tab (Field Repairs & Inspection Studio) */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col min-w-0 bg-primary-100/10 overflow-hidden">
            {/* Orders Header / Filters Bar */}
            <div className="bg-white border-b border-primary-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center text-accent-600 font-black">
                  WO
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-extrabold text-primary-900 tracking-tight">Work Orders & Repair Studio</h2>
                    <span className="bg-accent-100/60 text-accent-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-accent-200/50">
                      {filteredWorkOrders.length} {filteredWorkOrders.length === 1 ? 'Order' : 'Orders'}
                    </span>
                  </div>
                  <p className="text-xs text-primary-500">Dispatch field technicians, track SLA deadlines, and verify Before / After repairs</p>
                </div>
              </div>

              {/* Search & Status Filters */}
              <div className="flex items-center flex-wrap gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    placeholder="Search WO ID, worker, asset..."
                    className="bg-primary-50/50 border border-primary-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-primary-900 placeholder:text-primary-400 focus:outline-none focus:border-accent-500 w-56"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-primary-400 absolute left-2.5 top-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>

                <div className="flex items-center bg-primary-100/70 p-0.5 rounded-xl border border-primary-200">
                  {['', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'BREACHED'].map((filterVal) => (
                    <button
                      key={filterVal}
                      onClick={() => setStatusOrderFilter(filterVal)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        statusOrderFilter === filterVal
                          ? 'bg-white text-accent-700 shadow-xs border border-primary-200/50'
                          : 'text-primary-600 hover:text-primary-900'
                      }`}
                    >
                      {filterVal === '' ? 'ALL' : filterVal.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area: 2 Columns (Orders List on Left, Before/After Studio on Right) */}
            <div className="flex-1 flex min-h-0 overflow-hidden p-6 gap-6">
              
              {/* Left Column: Work Order Cards Queue */}
              <div className="w-1/2 flex flex-col bg-white rounded-2xl border border-primary-200/80 shadow-xs overflow-hidden">
                <div className="p-3.5 border-b border-primary-100 bg-primary-50/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Dispatched Queue</span>
                  <span className="text-[11px] font-medium text-primary-500">{filteredWorkOrders.length} items</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-primary-100 p-2 space-y-2">
                  {filteredWorkOrders.length === 0 ? (
                    <div className="p-12 text-center text-primary-400">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.09 1.976 1.053 1.976 2.188V8.25m-17.25 0h17.25m-17.25 0v11.25c0 1.243 1.007 2.25 2.25 2.25h12.75c1.243 0 2.25-1.007 2.25-2.25V8.25m-15 0h15" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-primary-600">No work orders match the current filter</p>
                      <p className="text-[11px] text-primary-400 mt-1">Officers can dispatch new work orders directly from Citizen Complaints.</p>
                    </div>
                  ) : (
                    filteredWorkOrders.map((order) => {
                      const isSelected = selectedWorkOrder?.id === order.id;
                      const isBreached = order.slaBreached;
                      const slaDate = order.slaDeadline ? new Date(order.slaDeadline) : null;
                      const isPast = slaDate && slaDate < new Date();

                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedWorkOrder(order)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-accent-50/60 border-accent-400 shadow-sm ring-1 ring-accent-400/30' 
                              : 'bg-white hover:bg-primary-50/50 border-primary-200/70 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-extrabold font-mono text-primary-900 bg-primary-100/80 px-2 py-0.5 rounded border border-primary-200">
                                {order.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                order.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                order.status === 'COMPLETED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                order.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {order.status.replace('_', ' ')}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                order.priority === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-200' :
                                order.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                'bg-blue-50 text-blue-600 border border-blue-200'
                              }`}>
                                {order.priority}
                              </span>
                            </div>

                            {/* SLA Badge */}
                            {slaDate && (
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                                isBreached || isPast 
                                  ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <span>⏱</span>
                                <span>{isBreached || isPast ? 'SLA Breached' : `Due ${slaDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-primary-800 line-clamp-1 mb-2">
                            {order.description || (order.complaint ? `${order.complaint.category}: ${order.complaint.description}` : 'Field Maintenance Operation')}
                          </p>

                          <div className="flex flex-wrap items-center justify-between text-[11px] text-primary-500 pt-2 border-t border-primary-100/70 gap-y-1">
                            <div className="flex items-center space-x-2">
                              <span>👷 {order.assignedWorker ? `${order.assignedWorker.firstName} ${order.assignedWorker.lastName}` : 'Unassigned'}</span>
                              {order.complaintId && (
                                <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                  {order.complaintId}
                                </span>
                              )}
                            </div>

                            {/* Quick Action Button on Card */}
                            <div className="flex items-center space-x-1.5">
                              {order.status === 'ASSIGNED' && (currentUser?.role === 'WORKER' || ['ADMIN', 'OFFICER'].includes(currentUser?.role)) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartWork(order.id);
                                  }}
                                  className="text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded transition-colors cursor-pointer"
                                >
                                  ▶ Start Repair
                                </button>
                              )}

                              {order.status === 'IN_PROGRESS' && (currentUser?.role === 'WORKER' || ['ADMIN', 'OFFICER'].includes(currentUser?.role)) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCompleteModal(order);
                                  }}
                                  className="text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <span>📷 Complete & Upload</span>
                                </button>
                              )}

                              {order.status === 'COMPLETED' && ['ADMIN', 'OFFICER'].includes(currentUser?.role) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyWorkOrder(order.id);
                                  }}
                                  className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors cursor-pointer"
                                >
                                  ✓ Verify Repair
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Work Order Details & Before/After Inspection Studio */}
              <div className="w-1/2 flex flex-col bg-white rounded-2xl border border-primary-200/80 shadow-xs overflow-hidden">
                {selectedWorkOrder ? (
                  <div className="flex-1 flex flex-col overflow-y-auto">
                    {/* Header */}
                    <div className="p-5 border-b border-primary-200 bg-primary-50/30 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2.5">
                          <span className="text-sm font-black font-mono text-primary-900 bg-primary-100 px-2.5 py-0.5 rounded border border-primary-200">
                            {selectedWorkOrder.id}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            selectedWorkOrder.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            selectedWorkOrder.status === 'COMPLETED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            selectedWorkOrder.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {selectedWorkOrder.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-primary-900 mt-1">
                          {selectedWorkOrder.description || (selectedWorkOrder.complaint ? `${selectedWorkOrder.complaint.category} Repair` : 'Maintenance Work Order')}
                        </h3>
                      </div>

                      {/* Action Button inside Studio */}
                      <div>
                        {selectedWorkOrder.status === 'ASSIGNED' && (currentUser?.role === 'WORKER' || ['ADMIN', 'OFFICER'].includes(currentUser?.role)) && (
                          <button
                            type="button"
                            onClick={() => handleStartWork(selectedWorkOrder.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            ▶ Start Repair Work
                          </button>
                        )}
                        {selectedWorkOrder.status === 'IN_PROGRESS' && (currentUser?.role === 'WORKER' || ['ADMIN', 'OFFICER'].includes(currentUser?.role)) && (
                          <button
                            type="button"
                            onClick={() => handleOpenCompleteModal(selectedWorkOrder)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <span>📷 Upload Completion Photo</span>
                          </button>
                        )}
                        {selectedWorkOrder.status === 'COMPLETED' && ['ADMIN', 'OFFICER'].includes(currentUser?.role) && (
                          <button
                            type="button"
                            onClick={() => handleVerifyWorkOrder(selectedWorkOrder.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <span>✓ Approve & Resolve Complaint</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="px-5 py-3 bg-primary-50/50 border-b border-primary-100 flex flex-wrap gap-x-5 gap-y-1 text-xs text-primary-600">
                      <div>Technician: <strong className="text-primary-850 font-semibold">{selectedWorkOrder.assignedWorker ? `${selectedWorkOrder.assignedWorker.firstName} ${selectedWorkOrder.assignedWorker.lastName}` : 'Unassigned'}</strong></div>
                      <div>Officer: <strong className="text-primary-850 font-semibold">{selectedWorkOrder.assignedOfficer ? `${selectedWorkOrder.assignedOfficer.firstName} ${selectedWorkOrder.assignedOfficer.lastName}` : 'System Dispatch'}</strong></div>
                      {selectedWorkOrder.complaintId && (
                        <div>Complaint: <strong className="text-indigo-600 font-mono font-semibold">{selectedWorkOrder.complaintId}</strong></div>
                      )}
                      {selectedWorkOrder.slaDeadline && (
                        <div>SLA Target: <strong className={`font-semibold ${selectedWorkOrder.slaBreached ? 'text-red-600 font-bold' : 'text-primary-850'}`}>{new Date(selectedWorkOrder.slaDeadline).toLocaleString()}</strong></div>
                      )}
                    </div>

                    {/* BEFORE / AFTER PHOTO COMPARISON STUDIO */}
                    <div className="p-5 flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>🔍</span> Before & After Inspection Evidence
                        </h4>
                        <span className="text-[10px] text-primary-400 font-medium">Side-by-side photographic verification</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* BEFORE PHOTO (Citizen Complaint) */}
                        <div className="border border-primary-200 rounded-xl overflow-hidden bg-primary-50/30 flex flex-col">
                          <div className="px-3 py-2 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                              <span>⚠️</span> Before (Reported Issue)
                            </span>
                            {selectedWorkOrder.beforeImage && (
                              <a
                                href={getImageUrl(selectedWorkOrder.beforeImage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                              >
                                Full Photo ↗
                              </a>
                            )}
                          </div>

                          <div className="h-48 bg-primary-100 flex items-center justify-center relative overflow-hidden group">
                            {selectedWorkOrder.beforeImage ? (
                              <>
                                <img
                                  src={getImageUrl(selectedWorkOrder.beforeImage)}
                                  alt="Initial Issue Before Repair"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center text-primary-400 text-xs p-4 text-center">
                                  Image URL could not be rendered
                                </div>
                                <div 
                                  onClick={() => window.open(getImageUrl(selectedWorkOrder.beforeImage), '_blank', 'noopener,noreferrer')}
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                  title="Open photo link"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-4 text-primary-400">
                                <span className="text-2xl block mb-1">📷</span>
                                <span className="text-[11px]">No citizen photo attached</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AFTER PHOTO (Completed Repair) */}
                        <div className="border border-primary-200 rounded-xl overflow-hidden bg-primary-50/30 flex flex-col">
                          <div className="px-3 py-2 bg-emerald-50/80 border-b border-emerald-200/60 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                              <span>✅</span> After (Completed Work)
                            </span>
                            {selectedWorkOrder.afterImage && (
                              <a
                                href={getImageUrl(selectedWorkOrder.afterImage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                              >
                                Full Photo ↗
                              </a>
                            )}
                          </div>

                          <div className="h-48 bg-primary-100 flex items-center justify-center relative overflow-hidden group">
                            {selectedWorkOrder.afterImage ? (
                              <>
                                <img
                                  src={getImageUrl(selectedWorkOrder.afterImage)}
                                  alt="Completed Repair After Fix"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-full flex items-center justify-center text-primary-400 text-xs p-4 text-center">
                                  Image URL could not be rendered
                                </div>
                                <div 
                                  onClick={() => window.open(getImageUrl(selectedWorkOrder.afterImage), '_blank', 'noopener,noreferrer')}
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                  title="Open photo link"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <div className="text-center p-4 text-primary-400 flex flex-col items-center">
                                <span className="text-2xl block mb-1">⏳</span>
                                <span className="text-[11px] font-semibold text-primary-600">Awaiting Completion Photo</span>
                                <span className="text-[10px] text-primary-400 mt-0.5">Technician will upload photo when repair is finished</span>
                                {(currentUser?.role === 'WORKER' || ['ADMIN', 'OFFICER'].includes(currentUser?.role)) && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCompleteModal(selectedWorkOrder)}
                                    className="mt-3 bg-white hover:bg-primary-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-3 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                                  >
                                    + Upload Photo Now
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Technical Repair Notes */}
                      <div className="bg-primary-50/60 rounded-xl p-4 border border-primary-200/80">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Technician Repair Notes</span>
                          {selectedWorkOrder.completionTimestamp && (
                            <span className="text-[10px] text-primary-400">
                              Completed: {new Date(selectedWorkOrder.completionTimestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary-800 leading-relaxed font-sans">
                          {selectedWorkOrder.repairNotes || (
                            <span className="italic text-primary-400">No technical notes recorded yet.</span>
                          )}
                        </p>
                      </div>

                      {/* Verification Status Banner */}
                      {selectedWorkOrder.status === 'COMPLETED' && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                          <div className="text-xs text-purple-900">
                            <strong>Repair Completed:</strong> Field technician has uploaded completion evidence. Review before/after photos above.
                          </div>
                          {['ADMIN', 'OFFICER'].includes(currentUser?.role) && (
                            <button
                              type="button"
                              onClick={() => handleVerifyWorkOrder(selectedWorkOrder.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer flex-shrink-0"
                            >
                              ✓ Verify & Close
                            </button>
                          )}
                        </div>
                      )}

                      {selectedWorkOrder.status === 'VERIFIED' && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-800">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-emerald-600 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span><strong>Verified & Closed:</strong> This work order was verified by municipal authorities. The linked citizen complaint is marked as Resolved.</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-primary-400">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200/60 flex items-center justify-center text-primary-400 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-primary-700">Before & After Photo Studio</h4>
                    <p className="text-xs text-primary-500 max-w-xs mt-1">
                      Select any work order on the left to inspect evidence photos, monitor SLA compliance, and verify technician repairs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active View: Maintenance Tab (Under Maintenance) */}
        {activeTab === 'maintenance' && (
          <div className="flex-1 flex items-center justify-center p-12 bg-primary-100/10">
            <div className="glass-panel p-10 max-w-md w-full text-center border-t-2 border-t-accent-500 shadow-medium space-y-6 animate-fade-in bg-white">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-50 text-accent-600 border border-accent-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A1.75 1.75 0 1114.75 23.5l-5.83-5.83M11.42 15.17l2.42-2.42M11.42 15.17L9 12.75M13.84 12.75l2.42-2.42M13.84 12.75L11.42 10.33M11.42 10.33l2.42-2.42M11.42 10.33L9 7.91M9 7.91l2.42-2.42M9 7.91L6.58 5.5" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-primary-900 mb-2">Module Under Construction</h2>
                <p className="text-primary-600 text-xs leading-relaxed">
                  The <strong className="text-accent-600 uppercase tracking-wider">{activeTab}</strong> component is currently undergoing visual re-engineering to fit light layouts.
                </p>
              </div>

              <div className="bg-primary-50 rounded-xl p-3.5 border border-primary-200/80 text-[10px] font-mono text-primary-500 flex justify-between items-center">
                <span>Code: 503_MAINTENANCE</span>
                <span className="text-accent-600 font-extrabold uppercase tracking-widest text-[9px]">Active Upgrades</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full border-t-2 border-t-accent-500 shadow-2xl relative text-left bg-white animate-fade-in">
            <h3 className="text-xl font-extrabold mb-6 tracking-tight text-primary-900">Create New Municipal Asset</h3>
            
            {error && (
              <div className="bg-danger/5 border border-danger/25 text-danger text-xs rounded-xl p-4 mb-4 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-danger flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500 placeholder-primary-400"
                    placeholder="E.g., North Main Pipeline"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Asset Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-950 text-xs focus:outline-none focus:border-accent-500"
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
                <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500 h-20 placeholder-primary-400"
                  placeholder="Enter condition notes or installation details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLat}
                    onChange={(e) => setNewLat(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newLng}
                    onChange={(e) => setNewLng(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500 placeholder-primary-400"
                    placeholder="E.g., 5000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Warranty Info</label>
                  <input
                    type="text"
                    value={newWarranty}
                    onChange={(e) => setNewWarranty(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500 placeholder-primary-400"
                    placeholder="E.g., 2 Year Standard"
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Department</label>
                <select
                  required
                  value={newDeptId}
                  onChange={(e) => setNewDeptId(e.target.value)}
                  className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500"
                >
                  {departments.length === 0 && <option value="">Loading departments...</option>}
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-primary-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-primary-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-accent-600/10"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-primary-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full border-t-2 border-t-accent-500 shadow-2xl relative text-left bg-white animate-fade-in">
            <h3 className="text-xl font-extrabold mb-6 tracking-tight text-primary-900">File New Citizen Complaint</h3>
            
            {error && (
              <div className="bg-danger/5 border border-danger/25 text-danger text-xs rounded-xl p-4 mb-4 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-danger flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleFileComplaint} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-950 text-xs focus:outline-none focus:border-accent-500"
                  >
                    <option value="Streetlight">Streetlight</option>
                    <option value="Road">Road</option>
                    <option value="Water Pipeline">Water Pipeline</option>
                    <option value="Transformer">Transformer</option>
                    <option value="Public Park">Public Park</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Severity</label>
                  <select
                    value={compSeverity}
                    onChange={(e) => setCompSeverity(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-950 text-xs focus:outline-none focus:border-accent-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  required
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500 h-24 placeholder-primary-400"
                  placeholder="Describe the issue in detail (e.g. flickering, leakages, size of potholes)..."
                />
              </div>

              {/* Coordinates with map picker trigger */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={compLat}
                    onChange={(e) => setCompLat(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={compLng}
                    onChange={(e) => setCompLng(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-accent-500"
                  />
                </div>
              </div>

              {/* Action row to pick from map */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowComplaintModal(false);
                    setIsPickingCoords(true);
                  }}
                  className="bg-accent-50 hover:bg-accent-100 border border-accent-200 text-accent-700 px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-accent-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>Pick Coordinates From Map</span>
                </button>
              </div>

              {/* Photo Attachment section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Photo Evidence</label>
                  <div className="flex items-center bg-primary-100/70 p-0.5 rounded-lg border border-primary-200">
                    <button
                      type="button"
                      onClick={() => setCompImageTab('link')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        compImageTab === 'link' 
                          ? 'bg-white text-indigo-700 shadow-xs border border-primary-200/50' 
                          : 'text-primary-600 hover:text-primary-900'
                      }`}
                    >
                      🌐 Public Image Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompImageTab('upload')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        compImageTab === 'upload' 
                          ? 'bg-white text-indigo-700 shadow-xs border border-primary-200/50' 
                          : 'text-primary-600 hover:text-primary-900'
                      }`}
                    >
                      📁 Upload File
                    </button>
                  </div>
                </div>

                {compImageTab === 'link' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="url"
                        value={compImageUrlInput}
                        onChange={(e) => setCompImageUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/... or any public photo link"
                        className="w-full bg-primary-50/50 border border-primary-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-primary-900 placeholder:text-primary-400 outline-none transition-all pr-16"
                      />
                      {compImageUrlInput && (
                        <button
                          type="button"
                          onClick={() => setCompImageUrlInput('')}
                          className="absolute right-2 top-2 text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded cursor-pointer border border-red-100"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick Preset Buttons for immediate testing */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] text-primary-400 font-bold uppercase tracking-wider">Quick Samples:</span>
                      {[
                        { label: '💡 Streetlight', url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80' },
                        { label: '🕳️ Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
                        { label: '💧 Water Leak', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80' },
                        { label: '🗑️ Waste', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80' },
                      ].map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => setCompImageUrlInput(sample.url)}
                          className="text-[9px] font-bold px-2 py-1 rounded-lg bg-primary-100/70 hover:bg-indigo-50 hover:text-indigo-700 text-primary-700 transition-colors border border-primary-200 cursor-pointer"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>

                    {/* Live Preview for Image URL */}
                    {compImageUrlInput.trim() && (
                      <div className="mt-2 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={compImageUrlInput.trim()}
                            alt="Live link preview"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            className="w-12 h-12 object-cover rounded-lg border border-indigo-200 flex-shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-indigo-900 block truncate">Public Photo Attached</span>
                            <span className="text-[9px] text-indigo-600 block truncate max-w-[200px]">{compImageUrlInput.trim()}</span>
                          </div>
                        </div>
                        <a
                          href={compImageUrlInput.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex-shrink-0 underline"
                        >
                          Test Link ↗
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="border border-dashed border-primary-200 hover:border-indigo-500/50 rounded-xl p-4 transition-all bg-primary-50/50 text-center relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center space-y-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-primary-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <span className="text-[11px] text-primary-700 font-bold">Click or drag photo file to upload</span>
                        <span className="text-[9px] text-primary-400">Supports PNG, JPG, JPEG</span>
                      </div>
                    </div>
                    
                    {compImage && (
                      <div className="mt-3 flex items-center justify-between bg-primary-100/50 p-2.5 rounded-xl border border-primary-200">
                        <span className="text-[11px] text-primary-700 truncate w-60">📷 Local File Selected</span>
                        <button
                          type="button"
                          onClick={() => setCompImage(null)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-primary-100">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-primary-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-accent-600/10"
                >
                  File Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Dispatch Work Order Modal */}
      {showDispatchModal && dispatchComplaint && (
        <div className="fixed inset-0 bg-primary-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full border-t-2 border-t-teal-600 shadow-2xl relative text-left bg-white animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold tracking-tight text-primary-900">Dispatch Work Order</h3>
              <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {dispatchComplaint.id}
              </span>
            </div>

            {/* Complaint Summary Box */}
            <div className="p-3 bg-primary-50 rounded-xl border border-primary-200/80 mb-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary-900">{dispatchComplaint.category} Issue</span>
                <span className="text-[10px] font-bold text-primary-500 uppercase">{dispatchComplaint.severity} Severity</span>
              </div>
              <p className="text-xs text-primary-600 italic line-clamp-2">"{dispatchComplaint.description}"</p>
            </div>

            {error && (
              <div className="bg-danger/5 border border-danger/25 text-danger text-xs rounded-xl p-3.5 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitDispatch} className="space-y-4">
              {/* Field Technician Selector */}
              <div>
                <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1.5">
                  Assign Field Technician *
                </label>
                <select
                  required
                  value={dispatchWorkerId}
                  onChange={(e) => setDispatchWorkerId(e.target.value)}
                  className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-950 text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select a field worker...</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.firstName} {w.lastName} ({w.department?.name || 'Municipal Works'}) - {w.email}
                    </option>
                  ))}
                </select>
                {workers.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">No field workers loaded yet or user lacks permission.</p>
                )}
              </div>

              {/* Priority & SLA Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1.5">Priority</label>
                  <select
                    value={dispatchPriority}
                    onChange={(e) => setDispatchPriority(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-950 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1.5">SLA Target Resolution</label>
                  <select
                    value={dispatchSlaHours}
                    onChange={(e) => setDispatchSlaHours(e.target.value)}
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-950 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="12">12 Hours (Emergency)</option>
                    <option value="24">24 Hours (Urgent)</option>
                    <option value="48">48 Hours (Standard)</option>
                    <option value="72">72 Hours (Routine)</option>
                    <option value="168">7 Days (Low Priority)</option>
                  </select>
                </div>
              </div>

              {/* Technical Work Instructions */}
              <div>
                <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1.5">
                  Work Order Instructions
                </label>
                <textarea
                  required
                  value={dispatchDesc}
                  onChange={(e) => setDispatchDesc(e.target.value)}
                  className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-teal-500 h-20 placeholder-primary-400"
                  placeholder="Detail tools, parts required, or safety notes for the field technician..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-primary-100">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-primary-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!dispatchWorkerId}
                  className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-teal-600/10"
                >
                  ⚡ Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Complete Repair Modal (Worker attaches completed photo and notes) */}
      {showCompleteModal && completeOrder && (
        <div className="fixed inset-0 bg-primary-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 max-w-lg w-full border-t-2 border-t-purple-600 shadow-2xl relative text-left bg-white animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold tracking-tight text-primary-900">Submit Completed Repair</h3>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {completeOrder.id}
              </span>
            </div>

            <p className="text-xs text-primary-600 mb-4">
              Record repair completion, attach photographic proof of fix, and submit technical maintenance notes for officer verification.
            </p>

            {error && (
              <div className="bg-danger/5 border border-danger/25 text-danger text-xs rounded-xl p-3.5 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitCompleteWork} className="space-y-4">
              {/* After Photo Evidence Attachment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">
                    Completed Repair Photo Evidence *
                  </label>
                  <div className="flex items-center bg-primary-100/70 p-0.5 rounded-lg border border-primary-200">
                    <button
                      type="button"
                      onClick={() => setCompleteAfterImageTab('link')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        completeAfterImageTab === 'link' 
                          ? 'bg-white text-purple-700 shadow-xs border border-primary-200/50' 
                          : 'text-primary-600 hover:text-primary-900'
                      }`}
                    >
                      🌐 Public Image Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompleteAfterImageTab('upload')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        completeAfterImageTab === 'upload' 
                          ? 'bg-white text-purple-700 shadow-xs border border-primary-200/50' 
                          : 'text-primary-600 hover:text-primary-900'
                      }`}
                    >
                      📁 Upload File
                    </button>
                  </div>
                </div>

                {completeAfterImageTab === 'link' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="url"
                        value={completeAfterImage}
                        onChange={(e) => setCompleteAfterImage(e.target.value)}
                        placeholder="https://images.unsplash.com/... or public image URL"
                        className="w-full bg-primary-50/50 border border-primary-200 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-primary-900 placeholder:text-primary-400 outline-none transition-all pr-16"
                      />
                      {completeAfterImage && (
                        <button
                          type="button"
                          onClick={() => setCompleteAfterImage('')}
                          className="absolute right-2 top-2 text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded cursor-pointer border border-red-100"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick presets for completed fixes */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] text-primary-400 font-bold uppercase tracking-wider">Quick Samples:</span>
                      {[
                        { label: '💡 Repaired Light', url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=80' },
                        { label: '🛣️ Fresh Asphalt Paved', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80' },
                        { label: '💧 Pipe Sealed & Insulated', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80' },
                        { label: '🧹 Site Cleaned', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80' },
                      ].map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => setCompleteAfterImage(sample.url)}
                          className="text-[9px] font-bold px-2 py-1 rounded-lg bg-primary-100/70 hover:bg-purple-50 hover:text-purple-700 text-primary-700 transition-colors border border-primary-200 cursor-pointer"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>

                    {/* Live Preview */}
                    {completeAfterImage.trim() && (
                      <div className="mt-2 p-2.5 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={completeAfterImage.trim()}
                            alt="Repair live preview"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            className="w-12 h-12 object-cover rounded-lg border border-purple-200 flex-shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-purple-900 block truncate">Photo Attached</span>
                            <span className="text-[9px] text-purple-600 block truncate max-w-[200px]">{completeAfterImage.trim()}</span>
                          </div>
                        </div>
                        <a
                          href={completeAfterImage.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex-shrink-0 underline"
                        >
                          Test Link ↗
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="border border-dashed border-primary-200 hover:border-purple-500/50 rounded-xl p-4 transition-all bg-primary-50/50 text-center relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCompleteImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center space-y-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-purple-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <span className="text-[11px] text-primary-700 font-bold">Click or drag completion photo to upload</span>
                        <span className="text-[9px] text-primary-400">Supports PNG, JPG, JPEG</span>
                      </div>
                    </div>

                    {completeLocalFile && (
                      <div className="mt-3 flex items-center justify-between bg-primary-100/50 p-2.5 rounded-xl border border-primary-200">
                        <span className="text-[11px] text-primary-700 truncate w-60">📷 Local File Selected</span>
                        <button
                          type="button"
                          onClick={() => setCompleteLocalFile(null)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Technical Notes */}
              <div>
                <label className="block text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1.5">
                  Technical Maintenance Notes *
                </label>
                <textarea
                  required
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  className="w-full bg-white border border-primary-200 rounded-xl px-4 py-2.5 text-primary-900 text-xs focus:outline-none focus:border-purple-500 h-24 placeholder-primary-400"
                  placeholder="Describe parts replaced, pressure/lux readings, structural checks, or technician sign-off..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-primary-100">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-primary-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-600/10"
                >
                  ✓ Submit Completed Repair
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
