import { transform } from '@babel/standalone';
import React from 'react';

export function executeReactCode(code: string): React.ComponentType {
  try {
    // Remove "use client" directive
    const cleanCode = code.replace(/["']use client["'];?\s*/g, '');

    // Transform TSX → JavaScript using Babel
    const result = transform(cleanCode, {
      presets: ['react', 'typescript'],
      filename: 'page.tsx',
    });

    if (!result.code) {
      throw new Error('Babel compilation failed');
    }

    // Create safe execution scope
    const fn = new Function(
      'React',
      'useState',
      'useEffect',
      `
        ${result.code}
        return (
          typeof exports !== 'undefined' && exports.default 
            ? exports.default 
            : Website
        );
      `
    );

    // Execute and get the component
    const Component = fn(React, React.useState, React.useEffect);

    if (!Component || typeof Component !== 'function') {
      throw new Error('No valid React component exported');
    }

    return Component;

  } catch (err: any) {
    console.error('❌ React execution failed:', err);
    
    // Return error display component
    return function ErrorComponent() {
      return (
        <div style={{
          padding: '3rem',
          margin: '2rem',
          background: '#fee2e2',
          border: '3px solid #ef4444',
          borderRadius: '16px',
          color: '#991b1b',
          fontFamily: 'system-ui',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
            ⚠️ React Code Compilation Error
          </h2>
          <pre style={{ 
            fontSize: '14px', 
            background: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            overflow: 'auto',
          }}>
            {err.message}
          </pre>
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              View Stack Trace
            </summary>
            <pre style={{ 
              fontSize: '12px', 
              marginTop: '0.5rem',
              background: '#fff',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              {err.stack}
            </pre>
          </details>
        </div>
      );
    };
  }
}
