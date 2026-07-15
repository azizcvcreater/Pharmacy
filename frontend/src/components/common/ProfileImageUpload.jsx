// src/components/common/ProfileImageUpload.jsx
import { useState, useRef } from 'react';
import { FiCamera, FiX, FiUser } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const ProfileImageUpload = ({ 
  currentImage, 
  onImageChange, 
  size = 'lg',
  editable = true
}) => {
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const sizes = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl',
    xl: 'w-32 h-32 text-5xl',
  };

  const handleImageClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(t('common.selectImage') || 'Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(t('common.imageSizeError') || 'Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        onImageChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative inline-block">
      <div 
        className={`${sizes[size]} rounded-full overflow-hidden border-4 border-white shadow-lg ${
          editable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleImageClick}
      >
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
            <FiUser size={32} />
          </div>
        )}

        {editable && isHovering && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 rounded-full">
            <FiCamera className="text-white text-2xl" />
          </div>
        )}
      </div>

      {editable && imagePreview && (
        <button
          onClick={handleRemoveImage}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
          aria-label={t('common.remove') || 'Remove image'}
        >
          <FiX size={16} />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        name="profile_image"
      />
    </div>
  );
};

export default ProfileImageUpload;