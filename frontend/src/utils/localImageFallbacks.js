// This file provides local fallback images for different car types and brands

// Car model specific images
const carModelFallbacks = {
  // Toyota models
  'Toyota Corolla': '/images/corolla.jpeg',
  'Toyota Camry': '/images/camry.jpg',

  // Honda models
  'Honda Civic': '/images/civic.jpg',
  'Honda Accord': '/images/civic.jpg', // Fallback to civic if no Accord image

  // BMW models
  'BMW 3 Series': '/images/bmw.jpeg',
  'BMW 5 Series': '/images/bmw.jpeg',

  // Tesla models
  'Tesla Model 3': '/images/tesla.jpeg',
  'Tesla Model S': '/images/tesla.jpeg',
  'Tesla Model X': '/images/tesla.jpeg',
  'Tesla Model Y': '/images/tesla.jpeg',

  // Other models
  'Hyundai Elantra': '/images/elantra.jpeg',
  'Ford Mustang': '/images/mustang.jpeg',
  'Mercedes-Benz C-Class': '/images/cclass.jpeg',
  'Audi A4': '/images/audi.jpeg',
  'Nissan Altima': '/images/nissan.jpeg',
  'Kia Optima': '/images/kia.jpeg'
};

const typeFallbacks = {
  'Sedan': '/images/corolla.jpeg',
  'SUV': '/images/nissan.jpeg',
  'Hatchback': '/images/civic.jpg',
  'Convertible': '/images/mustang.jpeg',
  'Sports': '/images/mustang.jpeg',
  'Luxury': '/images/cclass.jpeg',
  'Van': '/images/nissan.jpeg',
  'Electric': '/images/tesla.jpeg'
};

const brandFallbacks = {
  'Toyota': '/images/corolla.jpeg',
  'Honda': '/images/civic.jpg',
  'Tesla': '/images/tesla.jpeg',
  'Ford': '/images/mustang.jpeg',
  'Jeep': '/images/nissan.jpeg',
  'BMW': '/images/bmw.jpeg',
  'Mercedes-Benz': '/images/cclass.jpeg',
  'Audi': '/images/audi.jpeg',
  'Chevrolet': '/images/nissan.jpeg',
  'Nissan': '/images/nissan.jpeg',
  'Kia': '/images/kia.jpeg',
  'Hyundai': '/images/elantra.jpeg'
};

// Generic fallback for any car
const genericCarFallback = '/images/nissan.jpeg';

/**
 * Get a fallback image URL for a car
 * @param {Object} car - The car object
 * @param {number} index - Optional index for multiple images of the same car
 * @returns {string} - The fallback image URL
 */
export const getLocalCarFallbackImage = (car, index = 0) => {
  if (!car) return genericCarFallback;

  // Try model-specific fallback first (combining brand and model)
  if (car.brand && car.model) {
    const fullModelName = `${car.brand} ${car.model}`;
    if (carModelFallbacks[fullModelName]) {
      return carModelFallbacks[fullModelName];
    }
  }

  // Try brand-specific fallback next
  if (car.brand && brandFallbacks[car.brand]) {
    return brandFallbacks[car.brand];
  }

  // Try type-specific fallback next
  if (car.type && typeFallbacks[car.type]) {
    return typeFallbacks[car.type];
  }

  // Use generic fallback as last resort
  return genericCarFallback;
};

export default {
  carModelFallbacks,
  typeFallbacks,
  brandFallbacks,
  genericCarFallback,
  getLocalCarFallbackImage
};
