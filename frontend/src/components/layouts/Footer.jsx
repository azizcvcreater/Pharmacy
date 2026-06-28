export function Footer() {
  return (
    <footer className='border-t border-gray-200/60 bg-white/80 py-3 px-4 sm:py-4 sm:px-6 text-center text-xs sm:text-sm text-gray-500 backdrop-blur-sm'>
      © {new Date().getFullYear()} MediTrack. All rights reserved.
    </footer>
  );
}
