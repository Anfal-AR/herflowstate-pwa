// components/ServiceWorkerDebug.tsx
'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerDetails {
  message: string;
}

export default function ServiceWorkerDebug() {
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [swDetails, setSwDetails] = useState<ServiceWorkerDetails[]>([]);

  useEffect(() => {
    const checkServiceWorker = async () => {
      const details: ServiceWorkerDetails[] = [];
      
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        setSwStatus('❌ Service Worker not supported');
        return;
      }
      
      details.push({ message: '✅ Service Worker API supported' });
      
      try {
        // Check for existing registrations
        const registrations = await navigator.serviceWorker.getRegistrations();
        details.push({ message: `📋 Found ${registrations.length} existing registrations` });
        
        registrations.forEach((reg, index) => {
          details.push({ message: `Registration ${index + 1}:` });
          details.push({ message: `  - Scope: ${reg.scope}` });
          details.push({ message: `  - Active: ${reg.active ? '✅' : '❌'}` });
          details.push({ message: `  - Installing: ${reg.installing ? '✅' : '❌'}` });
          details.push({ message: `  - Waiting: ${reg.waiting ? '✅' : '❌'}` });
          if (reg.active) {
            details.push({ message: `  - Script URL: ${reg.active.scriptURL}` });
            details.push({ message: `  - State: ${reg.active.state}` });
          }
        });
        
        // Try to register manually
        details.push({ message: '🔄 Attempting manual registration...' });
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        details.push({ message: '✅ Manual registration successful!' });
        details.push({ message: `  - Scope: ${registration.scope}` });
        details.push({ message: `  - Installing: ${registration.installing ? '✅' : '❌'}` });
        details.push({ message: `  - Waiting: ${registration.waiting ? '✅' : '❌'}` });
        details.push({ message: `  - Active: ${registration.active ? '✅' : '❌'}` });
        
        setSwStatus('✅ Service Worker registered successfully');
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          details.push({ message: '🔄 Service Worker update found' });
          setSwDetails([...details]);
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        details.push({ message: `❌ Registration failed: ${errorMessage}` });
        setSwStatus('❌ Service Worker registration failed');
      }
      
      setSwDetails(details);
    };
    
    checkServiceWorker();
  }, []);

  const checkFiles = async () => {
    const filesToCheck = ['/sw.js', '/manifest.json'];
    const results: ServiceWorkerDetails[] = [];
    
    for (const file of filesToCheck) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          results.push({ message: `✅ ${file} - Status: ${response.status}` });
          if (file === '/sw.js') {
            const content = await response.text();
            results.push({ message: `📄 SW file size: ${content.length} characters` });
            results.push({ message: `🔍 Contains 'workbox': ${content.includes('workbox') ? '✅' : '❌'}` });
          }
        } else {
          results.push({ message: `❌ ${file} - Status: ${response.status}` });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ message: `❌ ${file} - Error: ${errorMessage}` });
      }
    }
    
    setSwDetails(prev => [...prev, { message: '--- File Check Results ---' }, ...results]);
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">SW Debug</h3>
        <button 
          onClick={checkFiles}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Check Files
        </button>
      </div>
      
      <div className="mb-2">
        <strong>Status:</strong>
        <div className="text-sm">{swStatus}</div>
      </div>
      
      <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
        {swDetails.map((detail, index) => (
          <div key={index} className="font-mono">
            {detail.message}
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t text-xs">
        <div>Protocol: {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</div>
        <div>Host: {typeof window !== 'undefined' ? window.location.host : 'N/A'}</div>
      </div>
    </div>
  );
}