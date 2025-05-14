// This file provides fallback images for different car types and brands
// These are used when the primary images fail to load

const typeFallbacks = {
  'Sedan': 'https://cdn.pixabay.com/photo/2014/09/07/22/34/car-438467_1280.jpg',
  'SUV': 'https://cdn.pixabay.com/photo/2018/02/21/03/15/jeep-wrangler-3169359_1280.jpg',
  'Electric': 'https://cdn.pixabay.com/photo/2021/01/15/16/49/tesla-5919764_1280.jpg',
  'Sports': 'https://cdn.pixabay.com/photo/2016/04/01/12/16/car-1300629_1280.png',
  'Luxury': 'https://cdn.pixabay.com/photo/2016/12/03/18/57/car-1880381_1280.jpg',
  'Compact': 'https://cdn.pixabay.com/photo/2015/05/28/23/12/auto-788747_1280.jpg',
  'Convertible': 'https://cdn.pixabay.com/photo/2017/03/27/14/56/auto-2179220_1280.jpg',
  'Van': 'https://cdn.pixabay.com/photo/2016/11/18/12/51/automobile-1834274_1280.jpg'
};

const brandFallbacks = {
  'Toyota': 'https://cdn.pixabay.com/photo/2014/04/05/11/39/toyota-316711_1280.jpg',
  'Honda': 'https://cdn.pixabay.com/photo/2017/08/31/05/47/honda-2699217_1280.jpg',
  'Tesla': 'https://cdn.pixabay.com/photo/2021/01/15/16/49/tesla-5919764_1280.jpg',
  'Ford': 'https://cdn.pixabay.com/photo/2019/07/07/14/03/ford-4322521_1280.jpg',
  'Jeep': 'https://cdn.pixabay.com/photo/2016/11/18/12/51/jeep-1834086_1280.jpg',
  'BMW': 'https://cdn.pixabay.com/photo/2015/09/02/12/25/bmw-918408_1280.jpg',
  'Mercedes-Benz': 'https://cdn.pixabay.com/photo/2016/12/03/18/57/car-1880381_1280.jpg',
  'Audi': 'https://cdn.pixabay.com/photo/2015/01/19/13/51/car-604019_1280.jpg',
  'Chevrolet': 'https://cdn.pixabay.com/photo/2016/05/06/16/32/car-1376190_1280.jpg',
  'Nissan': 'https://cdn.pixabay.com/photo/2016/02/13/13/11/cuba-1197800_1280.jpg'
};

// Generic fallback for any car
const genericCarFallback = 'https://cdn.pixabay.com/photo/2016/04/01/12/16/car-1300629_1280.png';

/**
 * Get a fallback image URL for a car
 * @param {Object} car - The car object
 * @param {number} index - Optional index for multiple images of the same car
 * @returns {string} - The fallback image URL
 */
export const getCarFallbackImage = (car, index = 0) => {
  if (!car) return genericCarFallback;
  
  // Try brand-specific fallback first
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
  typeFallbacks,
  brandFallbacks,
  genericCarFallback,
  getCarFallbackImage
};
