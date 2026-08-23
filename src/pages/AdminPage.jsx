import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Image as ImageIcon,
  Calendar,
  BookOpen,
  ShoppingBag,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  LogOut,
  Tag,
  Upload,
  X,
  Edit,
  Pin,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from 'lucide-react';

import { API_BASE_URL, getImageUrl } from '../config/api';
import Toast from '../components/Toast';
import LightboxModal from '../components/LightboxModal';

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('kaalo_admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!token);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('gallery');
  const [toast, setToast] = useState(null);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Backend Data States
  const [artists, setArtists] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form Inputs for Adding Data
  const [newArtist, setNewArtist] = useState({ name: '', title: '', bio: '', instagram: '', handle: '' });
  const [artistImageFile, setArtistImageFile] = useState(null);

  const [newWork, setNewWork] = useState({ artistId: '', title: '', caption: '' });
  const [workImageFile, setWorkImageFile] = useState(null);

  const [newGalleryPhoto, setNewGalleryPhoto] = useState({ title: '', caption: '', category: 'General' });
  const [galleryImageFile, setGalleryImageFile] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', description: '' });
  const [productImageFile, setProductImageFile] = useState(null);

  // Edit Modal States
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [editGalleryFile, setEditGalleryFile] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductFile, setEditProductFile] = useState(null);

  const [editingArtist, setEditingArtist] = useState(null);
  const [editArtistFile, setEditArtistFile] = useState(null);

  const [editingWork, setEditingWork] = useState(null);
  const [editWorkFile, setEditWorkFile] = useState(null);

  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseFile, setEditCourseFile] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Admin Tab Pagination States (12 Items Per Page)
  const [galleryPage, setGalleryPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);
  const [enrollmentPage, setEnrollmentPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [artistWorkPages, setArtistWorkPages] = useState({});
  const adminItemsPerPage = 12;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeWithAMPM = (timeStr) => {
    if (!timeStr) return 'Flexible';
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
      return timeStr;
    }
    const [h, m] = timeStr.split(':');
    if (!h) return timeStr;
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${m || '00'} ${ampm}`;
  };

  // Verify Admin Token and Load Backend Data
  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // Clean legacy permanent tokens from localStorage for maximum security
    localStorage.removeItem('kaalo_admin_token');

    // Test token authorization against protected endpoint
    fetch(`${API_BASE_URL}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          // Token is invalid, expired, or forbidden
          handleLogout();
        } else {
          setIsAuthenticated(true);
          fetchData();
        }
      })
      .catch(() => {
        // Server offline or connection error
      });
  }, [token]);

  const fetchData = () => {
    // 1. Fetch Artists
    fetch(`${API_BASE_URL}/artists`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setArtists(data);
          if (data.length > 0 && !newWork.artistId) {
            setNewWork(prev => ({ ...prev, artistId: data[0].id }));
          }
        }
      })
      .catch(err => console.error('Fetch artists error:', err));

    // 2. Fetch Gallery
    fetch(`${API_BASE_URL}/gallery`)
      .then(res => res.json())
      .then(data => Array.isArray(data) && setGallery(data))
      .catch(err => console.error('Fetch gallery error:', err));

    // 3. Fetch Products & Categories
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => Array.isArray(data) && setProducts(data))
      .catch(err => console.error('Fetch products error:', err));

    fetch(`${API_BASE_URL}/products/categories`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const list = data.filter(c => c !== 'All');
          setCategories(list);
          if (list.length > 0 && !newProduct.category) {
            setNewProduct(prev => ({ ...prev, category: list[0] }));
          }
        }
      })
      .catch(err => console.error('Fetch categories error:', err));

    fetch(`${API_BASE_URL}/courses`)
      .then(res => res.json())
      .then(data => Array.isArray(data) && setCourses(data))
      .catch(err => console.error('Fetch courses error:', err));

    // 4. Admin Auth-Protected Requests (Bookings, Enrollments, Orders)
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_BASE_URL}/bookings`, { headers })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setBookings(data))
      .catch(err => console.error('Fetch bookings error:', err));

    fetch(`${API_BASE_URL}/enrollments`, { headers })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setEnrollments(data))
      .catch(err => console.error('Fetch enrollments error:', err));

    fetch(`${API_BASE_URL}/orders`, { headers })
      .then(res => res.json())
      .then(data => Array.isArray(data) && setOrders(data))
      .catch(err => console.error('Fetch orders error:', err));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: loginPassword })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem('kaalo_admin_token', data.token);
        localStorage.removeItem('kaalo_admin_token');
        setToken(data.token);
        setIsAuthenticated(true);
        setLoginPassword('');
        showToast('Successfully logged into Admin Dashboard!');
      } else {
        setLoginError(data.error || 'Invalid password.');
        showToast(data.error || 'Invalid password', 'error');
      }
    } catch (err) {
      setLoginError('Server connection error. Make sure backend is running on port 5000.');
      showToast('Backend server offline', 'error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('kaalo_admin_token');
    localStorage.removeItem('kaalo_admin_token');
    setToken('');
    setIsAuthenticated(false);
    setLoginPassword('');
    showToast('Logged out of Admin Session.');
  };

  // 1. GALLERY PHOTO CRUD
  const handleAddGalleryPhoto = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newGalleryPhoto.title);
    formData.append('caption', newGalleryPhoto.caption);
    formData.append('category', newGalleryPhoto.category || 'General');
    if (galleryImageFile) {
      formData.append('image', galleryImageFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/gallery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setNewGalleryPhoto({ title: '', caption: '', category: 'General' });
        setGalleryImageFile(null);
        fetchData();
        showToast('✨ Studio gallery photo uploaded successfully!');
      }
    } catch (err) {
      console.error('Gallery upload error:', err);
      showToast('Failed to upload gallery photo', 'error');
    }
  };

  const handleUpdateGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!editingGalleryItem) return;

    const formData = new FormData();
    formData.append('title', editingGalleryItem.title);
    formData.append('caption', editingGalleryItem.caption || '');
    if (editGalleryFile) {
      formData.append('image', editGalleryFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/gallery/${editingGalleryItem.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setEditingGalleryItem(null);
        setEditGalleryFile(null);
        fetchData();
        showToast('✏️ Gallery photo updated successfully!');
      }
    } catch (err) {
      console.error('Update gallery error:', err);
      showToast('Failed to update gallery photo', 'error');
    }
  };

  const handleDeleteGalleryPhoto = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery photo?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('🗑️ Gallery photo deleted successfully!');
      }
    } catch (err) {
      console.error('Delete gallery error:', err);
      showToast('Failed to delete photo', 'error');
    }
  };

  // 2. PRODUCT & CATEGORY CRUD
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (res.ok) {
        setNewCategoryName('');
        fetchData();
        showToast(`🏷️ Category "${newCategoryName.trim()}" created successfully!`);
      }
    } catch (err) {
      console.error('Add category error:', err);
      showToast('Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"? Warning: All products listed under "${catName}" will also be deleted from the database.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories/${encodeURIComponent(catName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast(`🗑️ Category "${catName}" and all associated products deleted.`);
      }
    } catch (err) {
      console.error('Delete category error:', err);
      showToast('Failed to delete category', 'error');
    }
  };

  const handleToggleProductStock = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}/toggle-stock`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('🏷️ Product availability updated!');
      }
    } catch (err) {
      console.error('Toggle stock error:', err);
      showToast('Failed to update product availability', 'error');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category || categories[0] || 'Apparel');
    formData.append('description', newProduct.description);
    if (productImageFile) {
      formData.append('image', productImageFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setNewProduct({ name: '', price: '', category: categories[0] || 'Apparel', description: '' });
        setProductImageFile(null);
        fetchData();
        showToast('🛍️ Product added to shop successfully!');
      }
    } catch (err) {
      console.error('Add product error:', err);
      showToast('Failed to create product', 'error');
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('price', editingProduct.price);
    formData.append('category', editingProduct.category);
    formData.append('description', editingProduct.description || '');
    if (editProductFile) {
      formData.append('image', editProductFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setEditingProduct(null);
        setEditProductFile(null);
        fetchData();
        showToast('✏️ Product updated successfully!');
      }
    } catch (err) {
      console.error('Update product error:', err);
      showToast('Failed to update product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('🗑️ Product deleted successfully!');
      }
    } catch (err) {
      console.error('Delete product error:', err);
      showToast('Failed to delete product', 'error');
    }
  };

  // 3. ARTIST & PORTFOLIO WORK CRUD
  const handleAddArtist = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', newArtist.name);
    formData.append('title', newArtist.title);
    formData.append('bio', newArtist.bio);
    formData.append('instagram', newArtist.instagram);
    formData.append('handle', newArtist.handle);
    if (artistImageFile) {
      formData.append('profileImage', artistImageFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/artists`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setNewArtist({ name: '', title: '', bio: '', instagram: '', handle: '' });
        setArtistImageFile(null);
        fetchData();
        showToast('🎨 Resident artist profile created!');
      }
    } catch (err) {
      console.error('Add artist error:', err);
      showToast('Failed to create artist profile', 'error');
    }
  };

  const handleUpdateArtist = async (e) => {
    e.preventDefault();
    if (!editingArtist) return;

    const formData = new FormData();
    formData.append('name', editingArtist.name);
    formData.append('title', editingArtist.title);
    formData.append('bio', editingArtist.bio || '');
    formData.append('instagram', editingArtist.instagram || '#');
    formData.append('handle', editingArtist.handle || `@${editingArtist.name.toLowerCase().replace(/\s+/g, '')}`);
    if (editArtistFile) {
      formData.append('profileImage', editArtistFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/artists/${editingArtist.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setEditingArtist(null);
        setEditArtistFile(null);
        fetchData();
        showToast('✏️ Artist profile updated successfully!');
      }
    } catch (err) {
      console.error('Update artist error:', err);
      showToast('Failed to update artist profile', 'error');
    }
  };

  const handleDeleteArtist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artist profile?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/artists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('🗑️ Artist profile removed.');
      }
    } catch (err) {
      console.error('Delete artist error:', err);
      showToast('Failed to delete artist', 'error');
    }
  };

  const handleAddArtistWork = async (e) => {
    e.preventDefault();
    if (!newWork.artistId || !workImageFile) {
      showToast('Please select an artist and choose an image file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', newWork.title);
    formData.append('caption', newWork.caption);
    formData.append('workImage', workImageFile);

    try {
      const res = await fetch(`${API_BASE_URL}/artists/${newWork.artistId}/works`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setNewWork(prev => ({ ...prev, title: '', caption: '' }));
        setWorkImageFile(null);
        fetchData();
        showToast('📸 Photo added to artist portfolio!');
      }
    } catch (err) {
      console.error('Add artist work error:', err);
      showToast('Failed to upload work photo', 'error');
    }
  };

  const handleUpdateArtistWork = async (e) => {
    e.preventDefault();
    if (!editingWork) return;

    const formData = new FormData();
    formData.append('title', editingWork.title || 'Tattoo Work');
    formData.append('caption', editingWork.caption || '');
    if (editWorkFile) {
      formData.append('workImage', editWorkFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/artists/works/${editingWork.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setEditingWork(null);
        setEditWorkFile(null);
        fetchData();
        showToast('✏️ Artist portfolio photo updated!');
      }
    } catch (err) {
      console.error('Update artist work error:', err);
      showToast('Failed to update portfolio photo', 'error');
    }
  };

  const handleDeleteArtistWork = async (workId) => {
    if (!window.confirm('Are you sure you want to remove this work photo from artist portfolio?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/artists/works/${workId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('🗑️ Portfolio work photo deleted successfully!');
      }
    } catch (err) {
      console.error('Delete artist work error:', err);
      showToast('Failed to delete portfolio photo', 'error');
    }
  };

  const handleTogglePinWork = async (workId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/artists/works/${workId}/pin`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        fetchData();
        showToast(data.message || 'Updated pin status!');
      } else {
        showToast(data.error || 'Limit reached: Maximum 3 pinned photos allowed per artist.', 'error');
      }
    } catch (err) {
      console.error('Toggle pin error:', err);
      showToast('Failed to toggle pin photo', 'error');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    const formData = new FormData();
    formData.append('title', editingCourse.title);
    formData.append('duration', editingCourse.duration);
    formData.append('price', editingCourse.price);
    formData.append('description', editingCourse.description || '');
    if (editCourseFile) {
      formData.append('courseImage', editCourseFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setEditingCourse(null);
        setEditCourseFile(null);
        fetchData();
        showToast('🎓 Class course cover photo & details updated!');
      }
    } catch (err) {
      console.error('Update course error:', err);
      showToast('Failed to update course', 'error');
    }
  };

  const handleVerifyOrderPayment = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/verify`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        showToast('✅ Order payment receipt verified and approved!');
      }
    } catch (err) {
      console.error('Verify order error:', err);
      showToast('Failed to verify order payment', 'error');
    }
  };

  // Helper Pagination Bar Component (12 Items Per Page)
  const renderPaginationBar = (currentPage, totalItems, onPageChange) => {
    const totalPages = Math.ceil(totalItems / adminItemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/15 font-nav text-xs uppercase tracking-[1px]">
        <span className="text-gray-400">
          Showing Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({totalItems} total items)
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-white/20 hover:border-white disabled:opacity-30 disabled:hover:border-white/20 transition rounded-xs text-white"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-7 h-7 border text-[11px] font-bold transition rounded-xs flex items-center justify-center ${
                currentPage === pageNum
                  ? 'border-white bg-white text-black'
                  : 'border-white/20 text-gray-400 hover:border-white hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-white/20 hover:border-white disabled:opacity-30 disabled:hover:border-white/20 transition rounded-xs text-white"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent text-white font-body flex items-center justify-center p-6 pt-32 pb-24">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <div className="max-w-md w-full border border-white/20 bg-black/70 backdrop-blur-md p-8 rounded-sm text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 flex items-center justify-center mx-auto overflow-hidden">
            <img src="/images/logo.png" alt="Kaalo Ink Logo" className="w-full h-full object-contain" />
          </div>

          <div>
            <h1 className="font-heading text-2xl tracking-[4px] uppercase font-bold text-white">
              Studio Admin Portal
            </h1>
            <p className="font-nav text-xs text-gray-400 mt-1">
              Authorized Kaalo Ink personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left" autoComplete="off">
            {/* Hidden trap inputs to catch browser auto-fill & password suggestion popups */}
            <input type="text" name="prevent_autofill_user" style={{ display: 'none' }} tabIndex={-1} />
            <input type="password" name="prevent_autofill_pass" style={{ display: 'none' }} tabIndex={-1} />

            <div>
              <label className="block font-nav text-xs tracking-[1px] text-gray-300 uppercase mb-2">
                Admin Password
              </label>
              <input
                type="password"
                required
                name="admin_entry_key"
                id="admin_entry_key"
                autoComplete="one-time-code"
                data-lpignore="true"
                data-form-type="other"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full bg-black/60 border border-white/20 focus:border-white px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-nav">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-white text-black font-nav text-xs tracking-[3px] uppercase py-3.5 font-semibold hover:bg-gray-200 transition duration-300"
            >
              Log In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-body pt-28 pb-24">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-white/15 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <img src="/images/logo.png" alt="Kaalo Ink Logo" className="h-14 sm:h-16 w-auto object-contain bg-transparent shrink-0" />
            <div>
              <div className="flex items-center gap-2 text-gray-400 font-nav text-xs uppercase tracking-[2px] mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Studio Administrator Portal</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl tracking-[3px] font-bold text-white uppercase">
                KAALO INK CONTROL CENTER
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2.5 font-nav text-xs tracking-[2px] uppercase transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 font-nav">
          <div className="border border-white/15 bg-black/60 p-4 text-center">
            <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs uppercase text-gray-400">Artists</p>
            <p className="font-heading text-2xl font-bold text-white mt-1">{artists.length}</p>
          </div>

          <div className="border border-white/15 bg-black/60 p-4 text-center">
            <ImageIcon className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs uppercase text-gray-400">Gallery</p>
            <p className="font-heading text-2xl font-bold text-white mt-1">{gallery.length}</p>
          </div>

          <div className="border border-white/15 bg-black/60 p-4 text-center">
            <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs uppercase text-gray-400">Bookings</p>
            <p className="font-heading text-2xl font-bold text-white mt-1">{bookings.length}</p>
          </div>

          <div className="border border-white/15 bg-black/60 p-4 text-center">
            <BookOpen className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs uppercase text-gray-400">Enrollments</p>
            <p className="font-heading text-2xl font-bold text-white mt-1">{enrollments.length}</p>
          </div>

          <div className="border border-white/15 bg-black/60 p-4 text-center">
            <ShoppingBag className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs uppercase text-gray-400">Products</p>
            <p className="font-heading text-2xl font-bold text-white mt-1">{products.length}</p>
          </div>

          <div className="border border-white/15 bg-black/60 p-4 text-center">
            <CreditCard className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs uppercase text-gray-400">Orders</p>
            <p className="font-heading text-2xl font-bold text-white mt-1">{orders.length}</p>
          </div>
        </div>

        {/* DASHBOARD TAB NAVIGATION */}
        <div className="flex flex-wrap gap-2 sm:gap-3 border-b border-white/15 pb-4 mb-8 font-nav text-xs tracking-[2px] uppercase">
          {[
            { id: 'gallery', label: 'Studio Gallery' },
            { id: 'products', label: 'Shop Products & Categories' },
            { id: 'artists', label: 'Artists Team & Portfolios' },
            { id: 'bookings', label: 'Bookings' },
            { id: 'enrollments', label: 'Classes Enrollments' },
            { id: 'orders', label: 'Orders' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 border transition ${
                activeTab === tab.id
                  ? 'border-white bg-white text-black font-semibold'
                  : 'border-white/20 text-gray-400 hover:text-white hover:border-white/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: GALLERY MANAGERS (FULL CRUD WITH 12-ITEM PAGINATION) */}
        {activeTab === 'gallery' && (() => {
          const paginatedGallery = gallery.slice((galleryPage - 1) * adminItemsPerPage, galleryPage * adminItemsPerPage);

          return (
            <div className="space-y-8">
              <div className="border border-white/15 bg-zinc-950 p-6 sm:p-8 rounded-sm">
                <h3 className="font-heading text-xl tracking-[2px] uppercase font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Upload New Studio Gallery Photo (From Computer)
                </h3>
                <form onSubmit={handleAddGalleryPhoto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Artwork / Piercing Title *"
                    value={newGalleryPhoto.title}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, title: e.target.value })}
                    className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                  />

                  <div className="bg-black border border-white/20 p-2 flex items-center gap-2 file-upload-box">
                    <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setGalleryImageFile(e.target.files[0])}
                      className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Caption / Description (e.g. Ear Piercing, Custom Tattoo)"
                    value={newGalleryPhoto.caption}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, caption: e.target.value })}
                    className="bg-black border border-white/20 p-3 text-sm text-white outline-none md:col-span-2"
                  />

                  <button
                    type="submit"
                    className="bg-white text-black font-nav text-xs uppercase tracking-[2px] py-3.5 px-6 font-semibold hover:bg-gray-200 transition md:col-span-2"
                  >
                    Upload & Save Photo to Database
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedGallery.map(item => (
                  <div key={item.id} className="border border-white/15 bg-black/60 p-4 rounded-sm relative group flex flex-col justify-between admin-photo-card">
                    <div>
                      <div
                        onClick={() => setSelectedLightboxImage({
                          image: getImageUrl(item.image),
                          title: item.title,
                          caption: item.caption || `Category: ${item.category || 'Gallery Work'}`
                        })}
                        className="w-full h-56 sm:h-64 relative overflow-hidden mb-3 rounded-xs border border-white/10 bg-zinc-950 cursor-pointer group"
                        title="Click to view full high-res photo"
                      >
                        <img src={getImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      </div>
                      <h4 className="font-heading text-sm font-bold text-white truncate">{item.title}</h4>
                      {item.caption && <p className="font-body text-xs text-gray-400 mt-1 line-clamp-2">{item.caption}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => setEditingGalleryItem(item)}
                        className="border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white font-nav text-xs uppercase py-1.5 transition flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGalleryPhoto(item.id)}
                        className="border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white font-nav text-xs uppercase py-1.5 transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {renderPaginationBar(galleryPage, gallery.length, setGalleryPage)}
            </div>
          );
        })()}

        {/* TAB 2: SHOP PRODUCTS & CATEGORIES (FULL CRUD WITH 12-ITEM PAGINATION) */}
        {activeTab === 'products' && (() => {
          const paginatedProducts = products.slice((productPage - 1) * adminItemsPerPage, productPage * adminItemsPerPage);

          return (
            <div className="space-y-8">
              {/* Manage Product Categories */}
              <div className="border border-white/15 bg-zinc-950 p-6 sm:p-8 rounded-sm space-y-4">
                <h3 className="font-heading text-xl tracking-[2px] uppercase font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Manage Product Categories (Bookmarks, Apparel, Art Prints...)
                </h3>

                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="New Category Name (e.g. Bookmarks, Art Prints) *"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-black border border-white/20 p-3 text-sm text-white outline-none flex-1"
                  />
                  <button
                    type="submit"
                    className="bg-white text-black font-nav text-xs uppercase tracking-[2px] py-3 px-6 font-semibold hover:bg-gray-200 transition shrink-0"
                  >
                    Create Category
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map(cat => (
                    <div key={cat} className="bg-black/60 border border-white/20 px-3 py-1.5 rounded text-xs font-nav flex items-center gap-2 text-gray-200">
                      <span>{cat}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-red-400 hover:text-red-300"
                        title="Remove Category"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Merchandise Product Form */}
              <div className="border border-white/15 bg-zinc-950 p-6 sm:p-8 rounded-sm">
                <h3 className="font-heading text-xl tracking-[2px] uppercase font-bold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Product (Select Category)
                </h3>

                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    placeholder="Product Name *"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                  />

                  <input
                    type="number"
                    required
                    placeholder="Price (NPR) *"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                  />

                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <div className="bg-black border border-white/20 p-2 flex items-center gap-2 md:col-span-3 file-upload-box">
                    <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setProductImageFile(e.target.files[0])}
                      className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                    />
                  </div>

                  <textarea
                    rows="2"
                    placeholder="Product Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="bg-black border border-white/20 p-3 text-sm text-white outline-none md:col-span-3 resize-none"
                  />

                  <button
                    type="submit"
                    className="bg-white text-black font-nav text-xs uppercase tracking-[2px] py-3.5 px-6 font-semibold hover:bg-gray-200 transition md:col-span-3"
                  >
                    Save Product to Database
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map(p => (
                  <div key={p.id} className="border border-white/15 hover:border-white/50 bg-black/60 backdrop-blur-sm p-4 rounded-none transition-all duration-400 ease-out group flex flex-col justify-between admin-photo-card space-y-3 hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                    <div>
                      <div
                        onClick={() => setSelectedLightboxImage({
                          image: getImageUrl(p.image),
                          title: p.name,
                          caption: `Category: ${p.category} • Price: NPR ${parseFloat(p.price).toLocaleString()} • Status: ${p.inStock !== false ? 'In Stock' : 'Out of Stock'}`
                        })}
                        className="aspect-square overflow-hidden mb-3 rounded-none border border-white/[0.08] relative cursor-pointer bg-black/60"
                        title="Click to view full high-res product photo"
                      >
                        <img
                          src={getImageUrl(p.image)}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition duration-300 flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-none text-[9px] font-nav uppercase font-semibold tracking-[1.5px] shadow-md z-10 backdrop-blur-md ${p.inStock !== false ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300' : 'bg-red-950/80 border border-red-500/60 text-red-300'}`}>
                          {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <span className="font-nav text-[9px] font-medium tracking-[2.5px] uppercase text-gray-500 block mb-0.5">{p.category}</span>
                      <h4 className="font-heading text-base font-semibold text-white truncate tracking-[0.5px] uppercase">{p.name}</h4>
                      <p className="font-nav text-sm font-bold tracking-[0.5px] text-[#e6d8c3] mt-0.5">NPR {parseFloat(p.price).toLocaleString()}</p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 font-nav text-xs pt-1">
                      <button
                        onClick={() => handleToggleProductStock(p.id)}
                        className={`w-full py-1.5 px-2 font-semibold uppercase tracking-[1px] border transition flex items-center justify-center gap-1 ${p.inStock !== false ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black' : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black'}`}
                      >
                        {p.inStock !== false ? 'Mark Out of Stock' : 'Mark In Stock'}
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white px-3 py-1.5 transition flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {renderPaginationBar(productPage, products.length, setProductPage)}
            </div>
          );
        })()}

        {/* TAB 3: ARTISTS TEAM & PORTFOLIOS (FULL CRUD WITH 12-ITEM PORTFOLIO PAGINATION) */}
        {activeTab === 'artists' && (
          <div className="space-y-8">
            {/* Create New Artist Form */}
            <div className="border border-white/15 bg-zinc-950 p-6 sm:p-8 rounded-sm">
              <h3 className="font-heading text-xl tracking-[2px] uppercase font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Resident Artist Profile
              </h3>
              <form onSubmit={handleAddArtist} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Artist Name *"
                  value={newArtist.name}
                  onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
                  className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                />

                <input
                  type="text"
                  required
                  placeholder="Title (e.g. Fine Line Specialist) *"
                  value={newArtist.title}
                  onChange={(e) => setNewArtist({ ...newArtist, title: e.target.value })}
                  className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                />

                <input
                  type="url"
                  placeholder="Instagram Profile Link (e.g. https://www.instagram.com/_kaal.0_/)"
                  value={newArtist.instagram}
                  onChange={(e) => setNewArtist({ ...newArtist, instagram: e.target.value })}
                  className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                />

                <input
                  type="text"
                  placeholder="Instagram Handle (e.g. @_kaal.0_)"
                  value={newArtist.handle}
                  onChange={(e) => setNewArtist({ ...newArtist, handle: e.target.value })}
                  className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                />

                <div className="bg-black border border-white/20 p-2 flex items-center gap-2 md:col-span-2 file-upload-box">
                  <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setArtistImageFile(e.target.files[0])}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                  />
                </div>

                <textarea
                  rows="2"
                  required
                  placeholder="Artist Biography *"
                  value={newArtist.bio}
                  onChange={(e) => setNewArtist({ ...newArtist, bio: e.target.value })}
                  className="bg-black border border-white/20 p-3 text-sm text-white outline-none md:col-span-2 resize-none"
                />

                <button
                  type="submit"
                  className="bg-white text-black font-nav text-xs uppercase tracking-[2px] py-3.5 px-6 font-semibold hover:bg-gray-200 transition md:col-span-2"
                >
                  Save Artist Profile
                </button>
              </form>
            </div>

            {/* Add Portfolio Work Photo to Artist Form */}
            <div className="border border-white/15 bg-zinc-950 p-6 sm:p-8 rounded-sm">
              <h3 className="font-heading text-xl tracking-[2px] uppercase font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Upload Portfolio Work Photo to Artist
              </h3>
              <form onSubmit={handleAddArtistWork} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newWork.artistId}
                  onChange={(e) => setNewWork({ ...newWork, artistId: e.target.value })}
                  className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                >
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Tattoo Work Title (Optional)"
                  value={newWork.title}
                  onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                  className="bg-black border border-white/20 p-3 text-sm text-white outline-none"
                />

                <div className="bg-black border border-white/20 p-2 flex items-center gap-2 file-upload-box">
                  <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setWorkImageFile(e.target.files[0])}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-white text-black font-nav text-xs uppercase tracking-[2px] py-3 px-6 font-semibold hover:bg-gray-200 transition md:col-span-3"
                >
                  Upload & Save Photo to Artist Portfolio
                </button>
              </form>
            </div>

            {/* Current Artists & Portfolio Gallery List */}
            <div className="space-y-6">
              {artists.map(artist => {
                const workPage = artistWorkPages[artist.id] || 1;
                const totalPortfolioCount = artist.portfolio?.length || 0;
                const paginatedWorks = artist.portfolio?.slice((workPage - 1) * adminItemsPerPage, workPage * adminItemsPerPage);

                return (
                  <div key={artist.id} className="border border-white/15 bg-black/60 p-6 rounded-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          onClick={() => setSelectedLightboxImage({
                            image: getImageUrl(artist.profileImage),
                            title: `${artist.name} (Profile Photo)`,
                            caption: `Title: ${artist.title} • Handle: ${artist.handle || 'N/A'}`
                          })}
                          className="w-16 h-16 relative border border-white/20 rounded-xs cursor-pointer overflow-hidden group bg-zinc-950 flex items-center justify-center shrink-0"
                          title="Click to view full high-res profile photo"
                        >
                          <img src={getImageUrl(artist.profileImage)} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                            <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-heading text-xl font-bold text-white">{artist.name}</h4>
                          <p className="font-nav text-xs text-gray-400">{artist.title}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingArtist(artist)}
                          className="text-emerald-400 hover:text-emerald-300 font-nav text-xs uppercase tracking-[1px] flex items-center gap-1 border border-emerald-500/40 px-3 py-1.5"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Artist</span>
                        </button>

                        <button
                          onClick={() => handleDeleteArtist(artist.id)}
                          className="text-red-400 hover:text-red-300 font-nav text-xs uppercase tracking-[1px] flex items-center gap-1 border border-red-500/40 px-3 py-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Portfolio Works Gallery */}
                    <div>
                      {(() => {
                        const pinnedCount = artist.portfolio?.filter(w => typeof w === 'object' && w.isPinned).length || 0;
                        return (
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-nav text-xs uppercase tracking-[2px] text-gray-400">
                              Portfolio Tattoo Works ({totalPortfolioCount})
                            </h5>
                            <span className={`font-nav text-[10px] uppercase tracking-[1px] px-2 py-0.5 rounded border ${
                              pinnedCount >= 3
                                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                                : 'bg-zinc-900 border-white/15 text-gray-400'
                            }`}>
                              📌 Pinned to Top: <strong className="text-white">{pinnedCount}/3</strong>
                            </span>
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {paginatedWorks?.map((workImg, idx) => {
                          const isObj = typeof workImg === 'object' && workImg !== null;
                          const workObj = isObj ? workImg : { id: idx, image: workImg, title: 'Tattoo Work', isPinned: false };
                          const imgSrc = getImageUrl(workObj.image);

                          return (
                            <div
                              key={workObj.id || idx}
                              className={`relative group border p-1 rounded-xs overflow-hidden transition admin-photo-card ${
                                workObj.isPinned
                                  ? 'border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                                  : 'border-white/15 bg-zinc-900'
                              }`}
                            >
                              <div
                                onClick={() => setSelectedLightboxImage({
                                  image: imgSrc,
                                  title: `${artist.name} - ${workObj.title || 'Tattoo Work'}`,
                                  caption: `Artist: ${artist.name} • Status: ${workObj.isPinned ? '📌 Pinned to Top' : 'Standard Work'}`
                                })}
                                className="w-full h-36 sm:h-44 relative overflow-hidden rounded-xs cursor-pointer group bg-zinc-950 mb-1"
                                title="Click to view full high-res work photo"
                              >
                                <img src={imgSrc} alt={workObj.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                  <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                                </div>
                              </div>
                              
                              {workObj.isPinned && (
                                <span className="absolute top-1 left-1 bg-amber-500 text-black font-nav text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-[1px] uppercase shadow flex items-center gap-1 z-10">
                                  <Pin className="w-2.5 h-2.5 fill-black" />
                                  Pinned
                                </span>
                              )}

                              <div className="absolute top-1 right-1 flex gap-1 z-10">
                                {workObj.id && (
                                  <button
                                    onClick={() => handleTogglePinWork(workObj.id)}
                                    className={`p-1.5 transition rounded shadow-lg ${
                                      workObj.isPinned
                                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                                        : 'bg-black/70 text-gray-300 hover:text-amber-400 hover:bg-black'
                                    }`}
                                    title={workObj.isPinned ? 'Unpin Photo' : 'Pin Photo to Top (Max 3)'}
                                  >
                                    <Pin className={`w-3.5 h-3.5 ${workObj.isPinned ? 'fill-black' : ''}`} />
                                  </button>
                                )}

                                {workObj.id && (
                                  <button
                                    onClick={() => setEditingWork(workObj)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 transition rounded shadow-lg"
                                    title="Edit Photo Title / Replace File"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {workObj.id && (
                                  <button
                                    onClick={() => handleDeleteArtistWork(workObj.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 transition rounded shadow-lg"
                                    title="Delete Photo from Portfolio"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {renderPaginationBar(workPage, totalPortfolioCount, (newPage) => setArtistWorkPages(prev => ({ ...prev, [artist.id]: newPage })))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BOOKINGS (WITH 12-ITEM PAGINATION) */}
        {activeTab === 'bookings' && (() => {
          const paginatedBookings = bookings.slice((bookingPage - 1) * adminItemsPerPage, bookingPage * adminItemsPerPage);

          return (
            <div className="space-y-6">
              <h3 className="font-heading text-2xl tracking-[2px] uppercase font-bold text-white">
                Submitted Appointment Bookings ({bookings.length})
              </h3>

              {bookings.length === 0 ? (
                <div className="border border-white/10 bg-zinc-950 p-12 text-center text-gray-400 font-nav">
                  No bookings found in database.
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto border border-white/15">
                    <table className="w-full text-left font-nav text-xs">
                      <thead className="bg-zinc-900 uppercase text-gray-400 border-b border-white/15">
                        <tr>
                          <th className="p-4">Submission Date & Time</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Service & Artist</th>
                          <th className="p-4">Custom Tattoo Reference Photo</th>
                          <th className="p-4">Requested Appointment</th>
                          <th className="p-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {paginatedBookings.map(b => (
                          <tr key={b.id} className="hover:bg-white/5 align-middle">
                            <td className="p-4">
                              <span className="font-semibold text-emerald-400 block">{formatDateTime(b.createdAt || b.created_at)}</span>
                            </td>
                            <td className="p-4 font-semibold text-white">{b.customer_name || b.customerName}</td>
                            <td className="p-4 text-gray-300">{b.phone}<br/>{b.email}</td>
                            <td className="p-4 text-gray-300">{b.service}<br/><span className="text-gray-400">({b.artist})</span></td>
                            <td className="p-4">
                              {b.referenceImage || b.reference_image ? (
                                <div
                                  onClick={() => setSelectedLightboxImage({
                                    image: getImageUrl(b.referenceImage || b.reference_image),
                                    title: `Custom Tattoo Reference (${b.customer_name || b.customerName})`,
                                    caption: `Service: ${b.service} • Artist: ${b.artist || 'Any'} • Phone: ${b.phone} • Submitted: ${formatDateTime(b.createdAt || b.created_at)}`
                                  })}
                                  className="w-24 h-24 sm:w-28 sm:h-28 relative border border-white/20 rounded-xs cursor-pointer overflow-hidden group bg-zinc-950 flex items-center justify-center shrink-0 shadow-md"
                                  title="Click to view full custom tattoo reference photo"
                                >
                                  <img
                                    src={getImageUrl(b.referenceImage || b.reference_image)}
                                    alt="Custom Tattoo Reference"
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                    <ZoomIn className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic text-[11px]">No Photo Uploaded</span>
                              )}
                            </td>
                            <td className="p-4 text-gray-300">
                              <span className="text-white font-medium block">
                                {b.preferredDate || b.preferred_date ? new Date(b.preferredDate || b.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                              </span>
                              <span className="text-emerald-400 text-[11px] font-semibold block mt-0.5">
                                {formatTimeWithAMPM(b.preferredTime || b.preferred_time)}
                              </span>
                            </td>
                            <td className="p-4 text-gray-400 max-w-xs truncate">{b.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {renderPaginationBar(bookingPage, bookings.length, setBookingPage)}
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 5: CLASS ENROLLMENTS & COURSE COVER PHOTOS (WITH 12-ITEM PAGINATION) */}
        {activeTab === 'enrollments' && (() => {
          const paginatedEnrollments = enrollments.slice((enrollmentPage - 1) * adminItemsPerPage, enrollmentPage * adminItemsPerPage);

          return (
            <div className="space-y-8">
              {/* Manage Class Courses & Cover Photos */}
              <div className="border border-white/15 bg-zinc-950 p-6 sm:p-8 rounded-sm space-y-4">
                <div>
                  <h3 className="font-heading text-xl tracking-[2px] uppercase font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    Academy Class Courses & Cover Photos
                  </h3>
                  <p className="font-nav text-xs text-gray-400 mt-1">
                    Upload and change cover photos displayed on the Tattoo Academy Classes page
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {courses.map(course => (
                    <div key={course.id} className="border border-white/15 bg-black/60 p-4 rounded-sm flex flex-col justify-between admin-photo-card space-y-3">
                      <div>
                        <div
                          onClick={() => setSelectedLightboxImage({
                            image: getImageUrl(course.imageUrl || course.image),
                            title: course.title,
                            caption: `Duration: ${course.duration} • Fee: ${course.price}`
                          })}
                          className="aspect-square overflow-hidden mb-3 rounded-xs border border-white/10 relative bg-zinc-950 cursor-pointer group"
                          title="Click to view full high-res cover photo"
                        >
                          <img src={getImageUrl(course.imageUrl || course.image)} alt={course.title} className="w-full h-full object-cover scale-[1.05] group-hover:scale-110 transition duration-300" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                          </div>
                        </div>
                        <span className="font-nav text-[10px] tracking-[2px] uppercase text-gray-400 block">{course.duration}</span>
                        <h4 className="font-nav text-sm font-semibold text-white truncate">{course.title}</h4>
                        <p className="font-nav text-xs font-medium text-emerald-400 mt-0.5">{course.price}</p>
                        {course.description && <p className="font-body text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>}
                      </div>

                      <button
                        onClick={() => setEditingCourse(course)}
                        className="w-full border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white py-2 font-nav text-xs uppercase tracking-[1px] transition flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Change Photo & Details</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-heading text-2xl tracking-[2px] uppercase font-bold text-white">
                  Student Class Registrations ({enrollments.length})
                </h3>

              {enrollments.length === 0 ? (
                <div className="border border-white/10 bg-zinc-950 p-12 text-center text-gray-400 font-nav">
                  No class enrollments submitted yet.
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto border border-white/15">
                    <table className="w-full text-left font-nav text-xs">
                      <thead className="bg-zinc-900 uppercase text-gray-400 border-b border-white/15">
                        <tr>
                          <th className="p-4">Registration Date & Time</th>
                          <th className="p-4">Student Name</th>
                          <th className="p-4">Contact Info</th>
                          <th className="p-4">Selected Course</th>
                          <th className="p-4">Experience & Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {paginatedEnrollments.map(e => (
                          <tr key={e.id} className="hover:bg-white/5">
                            <td className="p-4">
                              <span className="font-semibold text-emerald-400 block">{formatDateTime(e.createdAt || e.created_at)}</span>
                              <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{e.enrollmentCode || e.enrollment_code}</span>
                            </td>
                            <td className="p-4 font-semibold text-white">{e.fullName || e.full_name}</td>
                            <td className="p-4 text-gray-300">{e.phone}<br/>{e.email}</td>
                            <td className="p-4 text-emerald-400 font-semibold">{e.courseTitle || e.course_title}</td>
                            <td className="p-4 text-gray-400 max-w-sm">{e.message || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {renderPaginationBar(enrollmentPage, enrollments.length, setEnrollmentPage)}
                </div>
              )}
            </div>
          </div>
        );
      })()}

        {/* TAB 6: CUSTOMER ORDERS & RECEIPT VERIFICATION (WITH 12-ITEM PAGINATION) */}
        {activeTab === 'orders' && (() => {
          const paginatedOrders = orders.slice((orderPage - 1) * adminItemsPerPage, orderPage * adminItemsPerPage);

          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-heading text-2xl tracking-[2px] uppercase font-bold text-white">
                    Customer Merchandise Orders & Payment Receipts ({orders.length})
                  </h3>
                  <p className="font-nav text-xs text-gray-400 mt-1">
                    Review uploaded Mobile Banking / Bank QR payment receipts and approve customer orders
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="border border-white/10 bg-zinc-950 p-12 text-center text-gray-400 font-nav">
                  No merchandise orders submitted yet. Customer orders will appear here.
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto border border-white/15">
                    <table className="w-full text-left font-nav text-xs">
                      <thead className="bg-zinc-900 uppercase text-gray-400 border-b border-white/15">
                        <tr>
                          <th className="p-4">Order ID & Date/Time</th>
                          <th className="p-4">Customer Info</th>
                          <th className="p-4">Purchased Items</th>
                          <th className="p-4">Payment Receipt Screenshot</th>
                          <th className="p-4">Total Amount</th>
                          <th className="p-4">Payment Status & Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {paginatedOrders.map(o => (
                          <tr key={o.id} className="hover:bg-white/5 align-top">
                            <td className="p-4">
                              <span className="font-bold text-white font-mono block text-sm">{o.orderId}</span>
                              <span className="text-emerald-400 font-semibold text-[11px] mt-1 block">{formatDateTime(o.createdAt || o.date || o.created_at)}</span>
                            </td>

                            <td className="p-4">
                              <p className="font-semibold text-white">{o.customer?.fullName}</p>
                              <p className="text-gray-300 mt-0.5">{o.customer?.phone}</p>
                              {o.customer?.email && <p className="text-gray-400 text-[11px]">{o.customer?.email}</p>}
                              <p className="text-gray-400 text-[11px] mt-1">{o.customer?.address}, {o.customer?.city}</p>
                            </td>

                            <td className="p-4 min-w-[220px] max-w-[320px]">
                              <div className="space-y-2">
                                {o.items && o.items.length > 0 ? (
                                  o.items.map((item, idx) => (
                                    <div key={idx} className="bg-black/80 border border-white/15 p-2.5 rounded-sm flex flex-col gap-1 text-xs">
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-white font-semibold leading-snug break-words">
                                          {item.name}
                                        </span>
                                        <span className="text-amber-400 font-bold shrink-0 bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.5 rounded-xs text-[11px]">
                                          x{item.quantity}
                                        </span>
                                      </div>
                                      <div className="text-gray-400 text-[11px] flex justify-between items-center pt-1 border-t border-white/10">
                                        <span>Price: NPR {Number(item.price || 0).toLocaleString()}</span>
                                        <span className="text-emerald-400 font-semibold">
                                          Total: NPR {(Number(item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400 italic">Merchandise Item Details</span>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              {o.paymentProof ? (
                                <div
                                  onClick={() => setSelectedLightboxImage({
                                    image: getImageUrl(o.paymentProof),
                                    title: `Payment Receipt Screenshot (Order #${o.orderCode || o.id})`,
                                    caption: `Customer: ${o.customerName || o.customer_name} • Phone: ${o.phone} • Total: NPR ${o.totalAmount?.toLocaleString()}`
                                  })}
                                  className="w-24 h-24 sm:w-28 sm:h-28 relative border border-amber-500/60 rounded-xs cursor-pointer overflow-hidden group bg-zinc-950 flex items-center justify-center shrink-0 shadow-lg"
                                  title="Click to view full payment receipt screenshot"
                                >
                                  <img src={getImageUrl(o.paymentProof)} alt="Uploaded Payment Receipt" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                    <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 italic text-xs">No receipt attached</span>
                              )}
                            </td>

                            <td className="p-4 font-semibold text-white text-sm">
                              NPR {o.totalAmount?.toLocaleString()}
                            </td>

                            <td className="p-4 space-y-2">
                              {o.paymentStatus?.toLowerCase().includes('verified') || o.paymentStatus?.toLowerCase().includes('paid') ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs font-semibold text-[11px] uppercase tracking-[1px] bg-emerald-950/80 border border-emerald-500/60 text-emerald-300">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Paid & Verified</span>
                                </span>
                              ) : (
                                <div className="space-y-2">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[10px] uppercase tracking-[1px] bg-amber-950/80 border border-amber-500/60 text-amber-300">
                                    Pending Verification
                                  </span>
                                  <button
                                    onClick={() => handleVerifyOrderPayment(o.id)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase px-3 py-1.5 rounded-xs transition block w-full text-center"
                                  >
                                    Approve & Mark Paid
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {renderPaginationBar(orderPage, orders.length, setOrderPage)}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* EDIT GALLERY PHOTO MODAL */}
      {editingGalleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/20 p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-heading text-lg font-bold text-white uppercase flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Edit Gallery Photo
              </h4>
              <button onClick={() => setEditingGalleryItem(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGalleryPhoto} className="space-y-4 font-nav text-xs">
              <div>
                <label className="block text-gray-300 mb-1 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={editingGalleryItem.title}
                  onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Caption / Description</label>
                <input
                  type="text"
                  value={editingGalleryItem.caption || ''}
                  onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, caption: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Replace Computer Photo File (Optional)</label>
                <div className="bg-black border border-white/20 p-2 flex items-center gap-2 file-upload-box">
                  <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditGalleryFile(e.target.files[0])}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGalleryItem(null)}
                  className="border border-white/20 px-4 py-2 text-gray-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-black px-6 py-2 font-bold uppercase hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/20 p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-heading text-lg font-bold text-white uppercase flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Edit Shop Merchandise Product
              </h4>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 font-nav text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Price (NPR)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Category</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Description</label>
                <textarea
                  rows="2"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Replace Computer Photo File (Optional)</label>
                <div className="bg-black border border-white/20 p-2 flex items-center gap-2 file-upload-box">
                  <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditProductFile(e.target.files[0])}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="border border-white/20 px-4 py-2 text-gray-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-black px-6 py-2 font-bold uppercase hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ARTIST MODAL */}
      {editingArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/20 p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-heading text-lg font-bold text-white uppercase flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Edit Resident Artist Profile
              </h4>
              <button onClick={() => setEditingArtist(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateArtist} className="space-y-4 font-nav text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Artist Name</label>
                  <input
                    type="text"
                    required
                    value={editingArtist.name}
                    onChange={(e) => setEditingArtist({ ...editingArtist, name: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Title / Specialty</label>
                  <input
                    type="text"
                    required
                    value={editingArtist.title}
                    onChange={(e) => setEditingArtist({ ...editingArtist, title: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Instagram Profile Link</label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/..."
                    value={editingArtist.instagram || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, instagram: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Instagram Handle</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={editingArtist.handle || ''}
                    onChange={(e) => setEditingArtist({ ...editingArtist, handle: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Biography</label>
                <textarea
                  rows="3"
                  required
                  value={editingArtist.bio}
                  onChange={(e) => setEditingArtist({ ...editingArtist, bio: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Replace Profile Photo File (Optional)</label>
                <div className="bg-black border border-white/20 p-2 flex items-center gap-2 file-upload-box">
                  <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditArtistFile(e.target.files[0])}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingArtist(null)}
                  className="border border-white/20 px-4 py-2 text-gray-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-black px-6 py-2 font-bold uppercase hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PORTFOLIO WORK MODAL */}
      {editingWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-white/20 p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-heading text-lg font-bold text-white uppercase flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Edit Portfolio Tattoo Work
              </h4>
              <button onClick={() => setEditingWork(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateArtistWork} className="space-y-4 font-nav text-xs">
              <div>
                <label className="block text-gray-300 mb-1 uppercase">Tattoo Title</label>
                <input
                  type="text"
                  value={editingWork.title || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                  placeholder="e.g. Oriental Dragon Sleeve"
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Replace Computer Photo File (Optional)</label>
                <div className="bg-black border border-white/20 p-2 flex items-center gap-2 file-upload-box">
                  <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditWorkFile(e.target.files[0])}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWork(null)}
                  className="border border-white/20 px-4 py-2 text-gray-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-black px-6 py-2 font-bold uppercase hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLASS COURSE COVER PHOTO MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-950 border border-white/20 p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-heading text-lg font-bold text-white uppercase flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-400" />
                Change Class Course Cover Photo
              </h4>
              <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4 font-nav text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Course Title</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.title}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 uppercase">Price</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: e.target.value })}
                    className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Duration</label>
                <input
                  type="text"
                  required
                  value={editingCourse.duration}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Description</label>
                <textarea
                  rows="2"
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full bg-black border border-white/20 p-3 text-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 uppercase">Upload New Class Cover Photo (From Computer)</label>
                <div className="bg-black border border-white/20 p-2 flex items-center gap-2 file-upload-box">
                  <Upload className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditCourseFile(e.target.files[0])}
                    className="text-xs text-gray-300 outline-none w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="border border-white/20 px-4 py-2 text-gray-400 hover:text-white uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 text-black px-6 py-2 font-bold uppercase hover:bg-emerald-400"
                >
                  Save & Update Cover Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW FULL PAYMENT RECEIPT SCREENSHOT MODAL */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setViewingReceipt(null)}>
          <div className="relative max-w-2xl w-full bg-zinc-950 border border-amber-500/40 p-4 rounded-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3 font-nav">
              <h4 className="text-sm font-bold text-amber-300 uppercase tracking-[1px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Customer Uploaded Payment Receipt
              </h4>
              <button onClick={() => setViewingReceipt(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto flex items-center justify-center bg-black p-2">
              <img
                src={viewingReceipt}
                alt="Payment Receipt Screenshot"
                className="max-h-[70vh] w-auto object-contain rounded border border-white/10 shadow-2xl"
              />
            </div>

            <div className="pt-3 text-right">
              <button
                onClick={() => setViewingReceipt(null)}
                className="bg-white text-black font-nav text-xs uppercase tracking-[1px] px-5 py-2 font-semibold hover:bg-gray-200"
              >
                Close Receipt View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN HIGH-RES LIGHTBOX MODAL */}
      <LightboxModal
        isOpen={!!selectedLightboxImage}
        onClose={() => setSelectedLightboxImage(null)}
        image={selectedLightboxImage?.image}
        title={selectedLightboxImage?.title}
        caption={selectedLightboxImage?.caption}
        type="admin"
      />
    </div>
  );
}
