// src/pages/Setting.jsx
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FiShield } from 'react-icons/fi';
import { SearchInput } from '../components/SearchInput';
import { TablePagination } from '../components/TablePagination';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function Setting() {
  const { isAdmin, user } = useAuth();
  const { staffPermissions, toggleStaffPermission, loadingPermissions } =
    useSettings();
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // adjust as needed

  useEffect(() => {
    if (!isAdmin) return;
    const fetchStaff = async () => {
      try {
        const res = await api.get('/users?role=staff');
        let staffData = res.data.data || res.data;
        staffData = staffData.filter((staff) => staff.id !== user?.id);
        setStaffList(staffData);
      } catch (error) {
        console.error('Failed to fetch staff:', error);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [isAdmin, user?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (!isAdmin) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-xl p-8 text-center max-w-md'>
          <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FiShield className='w-10 h-10 text-red-500' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            Access Denied
          </h2>
          <p className='text-gray-600'>
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = loadingStaff || loadingPermissions;

  return (
    <div className='space-y-6'>
      {/* Header & Search in one line */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-800'>
            Staff Permissions
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Control which staff members can edit or delete records. Admin always
            has full access.
          </p>
        </div>
        <div className='sm:w-72'>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder='Search by name or email...'
          />
        </div>
      </div>

      {/* Table Card */}
      <div className='rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden'>
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredStaff.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>
              {searchTerm
                ? 'No matching staff found.'
                : 'No staff members registered yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Name
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Email
                    </th>

                    <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Permission
                    </th>
                    <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {paginatedStaff.map((staff) => (
                    <tr key={staff.id} className='hover:bg-gray-50'>
                      <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-800'>
                        {staff.name}
                      </td>
                      <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-600'>
                        {staff.email}
                      </td>

                      <td className='whitespace-nowrap px-4 py-3 text-sm'>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            staffPermissions[staff.id]
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {staffPermissions[staff.id]
                            ? 'Can Edit/Delete'
                            : 'Read Only'}
                        </span>
                      </td>
                      <td className='whitespace-nowrap px-4 py-3 text-right text-sm'>
                        <button
                          onClick={() => toggleStaffPermission(staff.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            staffPermissions[staff.id]
                              ? 'bg-indigo-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${
                              staffPermissions[staff.id]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        )}
      </div>

      {/* Info Footer */}
      <div className='text-center text-sm text-gray-500'>
        <p>
          ⚡ Changes are saved automatically. Staff permissions apply to
          edit/delete actions only.
        </p>
        <p className='mt-1'>
          🔒 Admin users always have full access regardless of these settings.
        </p>
      </div>
    </div>
  );
}
