import { useEffect } from 'react';

export function useClickOutside(refs, handler, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event) => {
      const clickedOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target),
      );
      if (clickedOutside) handler();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, handler, isActive]);
}
