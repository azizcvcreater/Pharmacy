// src/pages/CreateStaff.jsx
import { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from '../hooks/useTranslation';
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function CreateStaff() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const createStaff = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/create-staff", formData);
      setSuccess(t('createStaff.success'));
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => nav("/dashboard"), 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        setError(Object.values(errors).flat()[0]);
      } else {
        setError(err.response?.data?.message || t('createStaff.error'));
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

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">{t('createStaff.title')}</h2>

        <form onSubmit={createStaff}>
          <div className="space-y-4">
            <Input
              label={t('createStaff.fullName')}
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder={t('placeholders.enterName')}
              icon={<FiUser className="text-gray-400" />}
            />

            <Input
              label={t('createStaff.email')}
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder={t('placeholders.enterEmail')}
              icon={<FiMail className="text-gray-400" />}
            />

            <Input
              label={t('createStaff.password')}
              name="password"
              type="password"
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('placeholders.enterPassword')}
              icon={<FiLock className="text-gray-400" />}
            />

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {t('createStaff.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}