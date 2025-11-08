
'use client';

import React, { useEffect } from 'react';
import { descope } from '@/lib/auth/descope';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  useEffect(() => {
    // Initialize Descope web component
    const setupDescope = async () => {
      try {
        // Create the Descope flow element
        const flowElement = document.createElement('descope-wc');
        flowElement.setAttribute('project-id', process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID || '');
        flowElement.setAttribute('flow-id', 'sign-up-or-in');
        
        // Add event listeners
        flowElement.addEventListener('success', (event) => {
          console.log('Authentication successful:', event);
          onSuccess();
        });
        
        flowElement.addEventListener('error', (event) => {
          console.error('Authentication error:', event);
        });

        // Mount the element
        const container = document.getElementById('descope-container');
        if (container) {
          container.appendChild(flowElement);
        }
      } catch (error) {
        console.error('Error setting up Descope:', error);
      }
    };

    setupDescope();
  }, [onSuccess]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to MentorIQ
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Transform your professional advice into lasting behavior change
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div id="descope-container" className="w-full" />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to connect your Google Calendar, Notion, and Slack accounts for seamless integration.
          </p>
        </div>
      </div>
    </div>
  );
}