import { useEffect, useState } from 'react';

// A first-time visitor can request media before the streaming worker claims the
// page. Retry native players/previews once the worker is ready, without reloads.
export function useDriveMediaVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!navigator.serviceWorker) return;
    const refresh = () => setVersion(value => value + 1);
    navigator.serviceWorker.addEventListener('controllerchange', refresh);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', refresh);
  }, []);
  return version;
}
