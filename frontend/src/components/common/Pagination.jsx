// src/components/common/Pagination.jsx
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from '../../hooks/useTranslation';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0,
  siblingCount = 1,
  className = ''
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageNumbers = siblingCount * 2 + 3;
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(totalPages, currentPage + siblingCount);

    if (totalPageNumbers >= totalPages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(1, currentPage - siblingCount);
      const rightSiblingIndex = Math.min(totalPages, currentPage + siblingCount);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount;
        for (let i = 1; i <= leftItemCount; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - (2 + 2 * siblingCount); i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}>
      <div className="text-sm text-gray-500">
        {t('common.showing')} {startItem} {t('common.to')} {endItem} {t('common.of')} {totalItems} {t('common.items')}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={t('common.previous')}
        >
          <FiChevronLeft size={18} />
        </button>

        {getPageNumbers().map((pageNumber, index) => (
          <button
            key={index}
            onClick={() => typeof pageNumber === 'number' && handlePageChange(pageNumber)}
            disabled={pageNumber === '...'}
            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
              pageNumber === currentPage
                ? 'bg-blue-600 text-white'
                : pageNumber === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={t('common.next')}
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;