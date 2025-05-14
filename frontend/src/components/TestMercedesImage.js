import React, { useState } from 'react';

const TestMercedesImage = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Mercedes Image Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Direct Image Reference</h3>
        <div 
          style={{ 
            width: '100%', 
            height: '400px', 
            backgroundColor: '#000',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}
        >
          <img 
            src="/images/mercedes.jpeg" 
            alt="Mercedes" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
            onError={(e) => {
              console.error("Error loading Mercedes image");
              setImageError(true);
            }}
          />
        </div>
        {imageError && <p style={{ color: 'red' }}>Error loading Mercedes image</p>}
      </div>

      <div>
        <h3>Image Information</h3>
        <p>Path: /images/mercedes.jpeg</p>
        <p>This test component helps verify that the Mercedes image is loading correctly.</p>
      </div>
    </div>
  );
};

export default TestMercedesImage;
