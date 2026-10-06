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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    handleInputChange('profilePicture', localPreview);
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
        handleInputChange('profilePicture', result.secure_url);
        const res = await userService.updatePersonalInfo({ profile_picture: result.secure_url });
        const updatedUser = res.data?.data || res.data;
        updateUser(updatedUser);
        setToast({ type: 'success', message: 'Portrait updated and saved.' });
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
      const updatedUser = res.data?.data || res.data;
      updateUser(updatedUser);
      setToast({ type: 'success', message: 'Personal information updated.' });
    } catch (err) {
      setToast({ type: 'error', message: err?.message || 'Failed to save changes.' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:ring-2 focus:ring-plum-200 transition-colors';
  const labelCls =
    'block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5';

  return (
    <section className="bg-white ring-1 ring-stone-200/70 p-6 md:p-8 h-full flex flex-col">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display-serif text-[20px] font-semibold text-stone-900 leading-tight">Personal information</h2>
          <p className="text-stone-500 text-[12.5px] mt-1">How we know you — name, photo and role.</p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={loading || uploading}
          className="shrink-0 bg-stone-900 text-white px-5 py-2 text-sm font-semibold hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          Save changes
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 sm:gap-10">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative w-28 h-28 bg-stone-100 ring-1 ring-stone-200 overflow-hidden">
            <img
              alt="Profile photo"
              className={`w-full h-full object-cover ${uploading ? 'opacity-40' : ''}`}
              src={formData.profilePicture}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-plum-500/40 border-t-plum-600 rounded-full animate-spin" />
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
            className="text-[12px] font-semibold text-plum-700 hover:text-plum-600 underline underline-offset-4 decoration-plum-200 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading…' : 'Change photo'}
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelCls}>Full name</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Email address</label>
            <input
              type="email"
              className={`${inputCls} text-stone-400 bg-stone-50 cursor-not-allowed`}
              placeholder="your@email.com"
              value={formData.email}
              disabled
            />
          </div>

          <div className="sm:col-span-2">
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
    </section>
  );
};
