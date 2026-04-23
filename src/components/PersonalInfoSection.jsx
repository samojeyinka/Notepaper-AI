import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import UserTypeSelect from './globals/UserTypeSelect';
import Toast from './globals/Toast';

export const PersonalInfoSection = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    userType: user?.type || '',
    profilePicture: user?.profile_picture || '',
  });

  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch available user types on mount
  useEffect(() => {
    userService.getUserTypes()
      .then(res => setUserTypes(res.data))
      .catch(err => console.error('Failed to load user types', err));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Create a local preview URL
    const localPreview = URL.createObjectURL(file);
    
    // 2. Update local form state
    handleInputChange('profilePicture', localPreview);
    
    // 3. Update global context INSTANTLY so Sidebar/Header sync immediatey
    updateUser({ profile_picture: localPreview });

    setUploading(true);
    setToast(null);

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.secure_url) {
        // 1. Update local state
        handleInputChange('profilePicture', result.secure_url);

        // 2. AUTO-SAVE to backend immediately
        const res = await userService.updatePersonalInfo({
          profile_picture: result.secure_url
        });

        // 3. Update global context with final backend data
        const updatedUser = res.data?.data || res.data;
        updateUser(updatedUser);

        setToast({ type: 'success', message: 'Portrait updated and saved successfully!' });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Image upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    setToast(null);

    try {
      const res = await userService.updatePersonalInfo({
        full_name: formData.fullName,
        type: formData.userType,
        profile_picture: formData.profilePicture,
      });

      // Update global context so other components (Header, Sidebar) update immediately
      // We check for res.data.data because Laravel Resources wrap output by default
      const updatedUser = res.data?.data || res.data;
      updateUser(updatedUser);
      setToast({ type: 'success', message: 'Personal information updated successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err?.message || 'Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="paper-scrap p-4 md:p-8 rounded-lg col-span-1 md:col-span-2 relative">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <button
        onClick={handleSaveChanges}
        disabled={loading || uploading}
        className="mb-3 md:mb-6 float-end px-3 md:px-6 py-1 md:py-2 bg-slate-900 text-white font-normal text-[12px] md:font-medium md:text-[14px] rounded-md md:rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Saving...
          </>
        ) : 'Save Changes'}
      </button>

      <div className="flex flex-col md:flex-row gap-6 md:gap-12 clear-both">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-2 md:gap-4 relative">
          <div className="photo-clip"></div>
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-sm bg-white p-2 shadow-md ring-1 ring-slate-200 rotate-2 group relative cursor-pointer overflow-hidden">
            <img
              alt="Profile photo"
              className={`w-full h-full object-cover grayscale-[0.2] transition-opacity ${uploading ? 'opacity-30' : 'opacity-100'}`}
              src={formData.profilePicture}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-600 rounded-full animate-spin"></span>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-1 md:mt-2 text-[10px] md:text-xs font-medium md:font-bold text-purple-600 hover:text-purple-700 hover:underline font-sketch uppercase tracking-wider disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Update Portrait'}
          </button>
          <p className="font-handwriting text-slate-400 text-[11px] md:text-[12px] mt-1 italic text-center">
            Click to pick a new snapshot
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-3 md:space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-slate-400">person</span>
            <h2 className="text-[14px] md:text-[17px] font-medium">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-[12px] md:text-xs font-medium md:font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent border-none focus:ring-0 paper-lined-input font-handwriting text-[12px] md:text-[15px] text-slate-700"
                placeholder="How shall we call you?"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              /> 
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] md:text-xs font-medium md:font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full bg-transparent border-none focus:ring-0 paper-lined-input font-handwriting text-[12px] md:text-[15px] text-slate-400 cursor-not-allowed"
                placeholder="your@email.com"
                value={formData.email}
                disabled
              />
            </div>

            {/* User Type Select */}
            <div className="md:col-span-2 relative">
              <UserTypeSelect
                value={formData.userType}
                onChange={(val) => handleInputChange('userType', val)}
                options={userTypes}
                loading={userTypes.length === 0}
                disabled={loading}
              />
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
};