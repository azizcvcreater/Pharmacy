// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from '../hooks/useTranslation';
import { FiSave, FiUser, FiMail, FiLock, FiEdit2, FiArrowLeft } from 'react-icons/fi';
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProfileImageUpload from "../components/common/ProfileImageUpload";
import { useToast } from "../components/common/ToastContainer";

export default function Profile() {
  const { t, isRTL } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/me");
      
      if (res.data) {
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
        });
        setProfileImagePreview(res.data.profile_image_url || null);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.message || 'Failed to load user profile');
      
      // Try to get user from localStorage as fallback
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setFormData({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
          });
          setProfileImagePreview(parsedUser.profile_image_url || null);
          setError(null);
        } catch (e) {
          console.error('Error parsing cached user:', e);
        }
      }
      
      // If no user data at all, redirect to login
      if (!localStorage.getItem('token')) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (file) => {
    if (file) {
      setProfileImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImageFile(null);
      setRemoveImage(true);
      setProfileImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);

      if (passwordData.password) {
        formDataToSend.append('password', passwordData.password);
        formDataToSend.append('password_confirmation', passwordData.password_confirmation);
      }

      if (profileImageFile) {
        formDataToSend.append('profile_image', profileImageFile);
      }
      
      if (removeImage && !profileImageFile) {
        formDataToSend.append('remove_profile_image', 'true');
      }

      const res = await API.post('/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = res.data.user || res.data;
      if (res.data.profile_image_url) {
        updatedUser.profile_image_url = res.data.profile_image_url;
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileImagePreview(updatedUser.profile_image_url || null);
      
      showToast(t('success.updated'), 'success');
      setEditMode(false);
      setPasswordData({
        password: "",
        password_confirmation: "",
      });
      setShowPasswordSection(false);
      
      // Refresh user data
      await fetchUser();
    } catch (err) {
      console.error('Update error:', err);
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessage = Object.values(errors).flat()[0];
        showToast(errorMessage || t('errors.generic'), 'error');
      } else {
        showToast(err.response?.data?.message || t('errors.generic'), 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setProfileImageFile(null);
    setRemoveImage(false);
    setProfileImagePreview(user?.profile_image_url || null);
    setPasswordData({
      password: "",
      password_confirmation: "",
    });
    setShowPasswordSection(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('common.error')}</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchUser} variant="secondary">
              {t('common.retry')}
            </Button>
            <Button onClick={() => navigate('/dashboard')}>
              {t('common.backToDashboard')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('profile.noUserData')}</h3>
          <p className="text-gray-600 mb-4">{t('profile.noUserDataMessage')}</p>
          <Button onClick={() => navigate('/dashboard')}>
            {t('common.backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ProfileImageUpload
              currentImage={profileImagePreview}
              onImageChange={handleImageChange}
              size="xl"
              editable={editMode}
            />
            <div className="text-center md:text-left text-white flex-1">
              <h2 className="text-2xl font-bold">{user?.name || t('common.user')}</h2>
              <p className="text-blue-100">{user?.email || t('common.noEmail')}</p>
              <p className="text-blue-200 text-sm mt-1">
                {user?.role === 'admin' ? t('profile.role.admin') : t('profile.role.staff')}
              </p>
            </div>
            <div className="flex-shrink-0">
              {!editMode ? (
                <Button
                  onClick={() => setEditMode(true)}
                  icon={<FiEdit2 size={18} />}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  {t('profile.edit')}
                </Button>
              ) : (
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={saving}
                    icon={<FiSave size={18} />}
                  >
                    {t('profile.save')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.personalInfo')}</h3>
                <div className="space-y-4">
                  <Input
                    label={t('profile.fullName')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('placeholders.enterName')}
                    icon={<FiUser className="text-gray-400" />}
                    disabled={!editMode}
                    required
                  />
                  <Input
                    label={t('profile.email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('placeholders.enterEmail')}
                    icon={<FiMail className="text-gray-400" />}
                    disabled={!editMode}
                    required
                  />
                </div>
              </div>

              {editMode && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                    className={`flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium ${isRTL() ? 'flex-row-reverse' : ''}`}
                  >
                    <FiLock />
                    {showPasswordSection ? t('profile.hidePassword') : t('profile.changePassword')}
                  </button>

                  {showPasswordSection && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">{t('profile.changePassword')}</h4>
                      <div className="space-y-4">
                        <Input
                          label={t('profile.newPassword')}
                          name="password"
                          type="password"
                          value={passwordData.password}
                          onChange={handlePasswordChange}
                          placeholder={t('placeholders.enterPassword')}
                          icon={<FiLock className="text-gray-400" />}
                        />
                        <Input
                          label={t('profile.confirmNewPassword')}
                          name="password_confirmation"
                          type="password"
                          value={passwordData.password_confirmation}
                          onChange={handlePasswordChange}
                          placeholder={t('placeholders.enterPassword')}
                          icon={<FiLock className="text-gray-400" />}
                        />
                        {passwordData.password && passwordData.password_confirmation && (
                          <div className={`flex items-center gap-2 ${isRTL() ? 'flex-row-reverse' : ''}`}>
                            {passwordData.password === passwordData.password_confirmation ? (
                              <span className="text-green-600 text-sm">✓ {t('profile.passwordMatch')}</span>
                            ) : (
                              <span className="text-red-500 text-sm">✗ {t('profile.passwordMismatch')}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}