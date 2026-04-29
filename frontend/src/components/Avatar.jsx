import { useState, useEffect } from 'react';
import { loadProtectedImage } from '../api';

function Avatar({ user, size = 'w-7 h-7', textSize = 'text-xs' }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!user?.avatar_url) return;
    loadProtectedImage(user.avatar_url).then(setSrc);
    return () => { if (src) URL.revokeObjectURL(src); };
  }, [user?.avatar_url]);

  const initials = (user?.name || user?.email || '?')[0].toUpperCase();
  const display  = user?.name || user?.email?.split('@')[0] || '';

  if (src) return (
    <img src={src} alt={display} title={display}
      className={`${size} rounded-full object-cover shrink-0`} />
  );

  return (
    <div className={`${size} rounded-full bg-indigo-100 text-indigo-600 ${textSize} font-bold flex items-center justify-center shrink-0`}
      title={display}>
      {initials}
    </div>
  );
}

export default Avatar;
