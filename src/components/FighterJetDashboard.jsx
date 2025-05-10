import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";

const API_URL = "http://localhost:3000/api/jets";

export default function FighterJetDashboard() {
  const [jets, setJets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentJet, setCurrentJet] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    topSpeed: "",
    range: "",
    sort: ""
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Load jets from API
  const fetchJets = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      
      // Add filters to query
      if (filters.name) queryParams.append("name", filters.name);
      if (filters.topSpeed) queryParams.append("topSpeed", filters.topSpeed);
      if (filters.range) queryParams.append("range", filters.range);
      if (filters.sort) queryParams.append("sort", filters.sort);
      
      const response = await fetch(`${API_URL}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch jets");
      }
      
      const data = await response.json();
      setJets(data.jets);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message);
      setJets([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchJets();
  }, [currentPage, filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      name: "",
      topSpeed: "",
      range: "",
      sort: ""
    });
  };

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Delete a jet
  const deleteJet = async (id) => {
    if (!window.confirm("Are you sure you want to delete this jet?")) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete jet");
      }
      
      // Refresh the list
    //   fetchJets();
      // Redirect to home page
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  };

  // Open modal for creating/editing
  const openJetModal = (jet = null) => {
    setCurrentJet(jet);
    setModalOpen(true);
  };
  
  // Handle form submission for create/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const jetData = {
      name: formData.get("name"),
      manufacturer: formData.get("manufacturer"),
      role: formData.get("role"),
      topSpeed: Number(formData.get("topSpeed")),
      range: Number(formData.get("range")),
      active: formData.get("active") === "true",
      maidenFlight: formData.get("maidenFlight"),
      crew: Number(formData.get("crew")),
      armament: formData.get("armament").split(",").map(item => item.trim()),
      origin: formData.get("origin")
    };
    
    try {
      let response;
      
      if (currentJet) {
        // Update existing jet
        response = await fetch(`${API_URL}/${currentJet._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jetData)
        });
      } else {
        // Create new jet
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jetData)
        });
      }
      
      if (!response.ok) {
        throw new Error(currentJet ? "Failed to update jet" : "Failed to create jet");
      }
      
      // Close modal and refresh list
      setModalOpen(false);
      fetchJets();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="container">
          <h1>Fighter Jet Dashboard</h1>
          <p className="header-subtitle">Manage your fighter jet database with ease</p>
            {/* Dark Mode Toggle */}
            <button
                className="dark-toggle"
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
                {darkMode ? '🌙' : '☀️'}
            </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container main-content">
        {/* Filters and Actions */}
        <div className="panel filter-panel">
          <div className="filter-header">
            <h2>Filter Jets</h2>
            <button 
              onClick={() => openJetModal()}
              className="btn btn-primary add-jet-btn"
            >
              <Plus size={18} className="icon" />
              Add New Jet
            </button>
          </div>
          
          <div className="filter-grid">
            <div className="search-container">
              <div className="search-icon">
                <Search size={18} />
              </div>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by name"
                className="input-field"
              />
            </div>
            
            <div>
              <input
                type="number"
                name="topSpeed"
                value={filters.topSpeed}
                onChange={handleFilterChange}
                placeholder="Min Top Speed (km/h)"
                className="input-field"
              />
            </div>
            
            <div>
              <input
                type="number"
                name="range"
                value={filters.range}
                onChange={handleFilterChange}
                placeholder="Min Range (km)"
                className="input-field"
              />
            </div>
            
            <div>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="input-field"
              >
                <option value="">Sort by...</option>
                <option value="name:asc">Name (A-Z)</option>
                <option value="name:desc">Name (Z-A)</option>
                <option value="topSpeed:desc">Top Speed (High-Low)</option>
                <option value="topSpeed:asc">Top Speed (Low-High)</option>
                <option value="range:desc">Range (High-Low)</option>
                <option value="range:asc">Range (Low-High)</option>
              </select>
            </div>
          </div>
          
          <div className="clear-filters">
            <button
              onClick={clearFilters}
              className="btn-text"
            >
              <X size={16} className="icon" />
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {/* Jets Table */}
        <div className="panel">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Manufacturer</th>
                  <th>Role</th>
                  <th>Top Speed (km/h)</th>
                  <th>Range (km)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      Loading fighter jets...
                    </td>
                  </tr>
                ) : jets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      No fighter jets found.
                    </td>
                  </tr>
                ) : (
                  jets.map((jet) => (
                    <tr key={jet._id} className="table-row">
                      <td>
                        <div className="jet-name">{jet.name}</div>
                      </td>
                      <td>{jet.manufacturer}</td>
                      <td>{jet.role}</td>
                      <td>{jet.topSpeed}</td>
                      <td>{jet.range}</td>
                      <td>
                        <span className={`status-badge ${jet.active ? 'status-active' : 'status-inactive'}`}>
                          {jet.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openJetModal(jet)}
                            className="btn-icon btn-edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteJet(jet._id)}
                            className="btn-icon btn-delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-mobile">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`btn btn-pagination ${currentPage === 1 ? 'btn-disabled' : ''}`}
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`btn btn-pagination ${currentPage === totalPages ? 'btn-disabled' : ''}`}
              >
                Next
              </button>
            </div>
            <div className="pagination-desktop">
              <div>
                <p className="pagination-info">
                  Showing page <span className="pagination-current">{currentPage}</span> of{" "}
                  <span className="pagination-total">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="pagination-nav">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`pagination-arrow ${currentPage === 1 ? 'pagination-disabled' : ''}`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="icon" aria-hidden="true" />
                  </button>
                  
                  {/* Display page numbers */}
                  {[...Array(totalPages).keys()].map(i => {
                    const pageNum = i + 1;
                    // Only show a window of pages around current page to avoid too many buttons
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`pagination-number ${currentPage === pageNum ? 'pagination-current-page' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for skipped pages
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className="pagination-ellipsis"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`pagination-arrow ${currentPage === totalPages ? 'pagination-disabled' : ''}`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="icon" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                {currentJet ? "Edit Fighter Jet" : "Add New Fighter Jet"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name*</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={currentJet?.name || ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    defaultValue={currentJet?.manufacturer || ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    name="role"
                    defaultValue={currentJet?.role || ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Origin Country</label>
                  <input
                    type="text"
                    name="origin"
                    defaultValue={currentJet?.origin || ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Top Speed (km/h)</label>
                  <input
                    type="number"
                    name="topSpeed"
                    defaultValue={currentJet?.topSpeed || ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Range (km)</label>
                  <input
                    type="number"
                    name="range"
                    defaultValue={currentJet?.range || ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Crew Size</label>
                  <input
                    type="number"
                    name="crew"
                    defaultValue={currentJet?.crew || ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Maiden Flight</label>
                  <input
                    type="date"
                    name="maidenFlight"
                    defaultValue={currentJet?.maidenFlight ? new Date(currentJet.maidenFlight).toISOString().split('T')[0] : ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Armament (comma separated)</label>
                  <input
                    type="text"
                    name="armament"
                    defaultValue={currentJet?.armament ? currentJet.armament.join(", ") : ""}
                    className="input-field"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="active"
                    defaultValue={currentJet?.active?.toString() || "true"}
                    className="input-field"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {currentJet ? "Update Jet" : "Create Jet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="footer">
        <div className="container">
          &copy; {new Date().getFullYear()} Fighter Jet Dashboard
        </div>
      </footer>
    </div>
  );
}