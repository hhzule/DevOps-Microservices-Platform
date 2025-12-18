'use client';

import { useEffect, useState } from 'react';

type HealthStatus = 'online' | 'offline' | 'loading';

export default function SystemHealth() {
  const [apiStatus, setApiStatus] = useState<HealthStatus>('loading');
  const [recStatus, setRecStatus] = useState<HealthStatus>('loading');
  const [dbStatus, setDbStatus] = useState<HealthStatus>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // API Service
        const apiRes = await fetch('http://127.0.0.1:3003/health');
        setApiStatus(apiRes.ok ? 'online' : 'offline');

        // Recommendation Service
        const recRes = await fetch('http://127.0.0.1:5000/health');
        setRecStatus(recRes.ok ? 'online' : 'offline');

        // Database (usually part of API health)
        const dbRes = await fetch('http://127.0.0.1:3003/api/products');
        setDbStatus(dbRes.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
        setRecStatus('offline');
        setDbStatus('offline');
      }
    };

    checkHealth();
  }, []);

  const statusDot = (status: HealthStatus) => {
    if (status === 'loading') {
      return <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />;
    }

    return (
      <div
        className={`w-3 h-3 rounded-full ${
          status === 'online'
            ? 'bg-green-500 animate-pulse'
            : 'bg-red-500'
        }`}
      />
    );
  };

  const statusText = (label: string, status: HealthStatus) =>
    `${label}: ${status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Checking...'}`;

  return (
    <section className="mt-12">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          System Health
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            {statusDot(apiStatus)}
            <span className="text-gray-700">
              {statusText('API Service', apiStatus)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {statusDot(recStatus)}
            <span className="text-gray-700">
              {statusText('Recommendation', recStatus)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {statusDot(dbStatus)}
            <span className="text-gray-700">
              {statusText('Database', dbStatus)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
