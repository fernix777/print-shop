// client/src/utils/enhancedMatching.js
// Enhanced Matching para mejorar Event Match Quality

let lastMatchingData = null;

/**
 * Configurar Enhanced Matching en el Pixel
 * Llamar cuando el usuario inicia sesión o completa un formulario
 */
export const setupEnhancedMatching = (userData) => {
  if (typeof fbq === 'undefined') return;

  const matchingData = {};

  // Email (el más importante para matching)
  if (userData.email) {
    matchingData.em = userData.email.toLowerCase().trim();
  }

  // Teléfono
  if (userData.phone) {
    matchingData.ph = userData.phone.replace(/\D/g, ''); // Solo números
  }

  // Nombre
  if (userData.firstName) {
    matchingData.fn = userData.firstName.toLowerCase().trim();
  }

  // Apellido
  if (userData.lastName) {
    matchingData.ln = userData.lastName.toLowerCase().trim();
  }

  // Código postal
  if (userData.zip) {
    matchingData.zp = userData.zip.trim();
  }

  // Ciudad
  if (userData.city) {
    matchingData.ct = userData.city.toLowerCase().trim();
  }

  // Estado/Provincia
  if (userData.state) {
    matchingData.st = userData.state.toLowerCase().trim();
  }

  // País
  if (userData.country) {
    matchingData.country = userData.country.toLowerCase().trim();
  }

  // Evitar inicialización duplicada con los mismos datos
  if (Object.keys(matchingData).length === 0) return;
  
  const currentDataStr = JSON.stringify(matchingData);
  if (lastMatchingData === currentDataStr) {
      return;
  }
  
  lastMatchingData = currentDataStr;

  // Actualizar el Pixel con los datos
  // Nota: Facebook recomienda llamar a init de nuevo para actualizar datos de usuario
  fbq('init', '1613812252958290', matchingData);
  
  console.log('✅ Enhanced Matching configurado:', matchingData);
};

/**
 * Limpiar Enhanced Matching (logout)
 */
export const clearEnhancedMatching = () => {
  lastMatchingData = null;
  if (typeof fbq === 'undefined') return;
  
  // Re-inicializar sin datos
  fbq('init', '1613812252958290');
  console.log('🔄 Enhanced Matching limpiado');
};

/**
 * Obtener datos de usuario para Enhanced Matching desde AuthContext
 */
export const getUserDataForMatching = (user) => {
  if (!user) return null;
  
  return {
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    city: user.city,
    state: user.state,
    zip: user.zip,
    country: user.country || 'ar'
  };
};
