// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } from 'react-icons/fi';
import { FaPills } from 'react-icons/fa';
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import ProfileImageUpload from "../components/common/ProfileImageUpload";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

export default function Register() {
  const { t } = useTranslation();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!agreeTerms) {
      setError(t('auth.termsAgree'));
      return;
    }

    setLoading(true);

    const result = await register({
      ...formData,
      profile_image: profileImage,
    });
    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const handleImageChange = (file) => {
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setProfileImagePreview(null);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <FaPills className="text-white text-3xl" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">{t('auth.createAccount')}</h2>
          <p className="mt-2 text-sm text-gray-600">{t('auth.register')}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            <span className="text-green-600 text-xs font-medium">{t('auth.adminNote')}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="flex flex-col items-center">
              <ProfileImageUpload
                currentImage={profileImagePreview}
                onImageChange={handleImageChange}
                size="lg"
                editable={true}
              />
              <p className="text-xs text-gray-500 mt-2">{t('profile.uploadImage')}</p>
            </div>

            <Input
              label={t('auth.fullName')}
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              icon={<FiUser className="h-5 w-5 text-gray-400" />}
              className="rounded-xl"
            />

            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={<FiMail className="h-5 w-5 text-gray-400" />}
              className="rounded-xl"
            />

            <Input
              label={t('auth.password')}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<FiLock className="h-5 w-5 text-gray-400" />}
              className="rounded-xl"
            />

            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{getPasswordStrengthText()}</span>
                </div>
                <p className="text-xs text-gray-400">{t('auth.passwordMinLength')}</p>
              </div>
            )}

            <Input
              label={t('auth.confirmPassword')}
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<FiLock className="h-5 w-5 text-gray-400" />}
              className="rounded-xl"
            />

            {formData.password && formData.password_confirmation && (
              <div className="mt-1">
                {formData.password === formData.password_confirmation ? (
                  <p className="text-xs text-green-600">✓ {t('profile.passwordMatch')}</p>
                ) : (
                  <p className="text-xs text-red-500">✗ {t('profile.passwordMismatch')}</p>
                )}
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-600">
                {t('auth.termsAgree')}
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full rounded-xl"
              size="lg"
              icon={<FiUserPlus size={20} />}
            >
              {t('auth.createAccount')}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('auth.haveAccount')}{" "}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  {t('auth.signIn')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}