// Enhanced JWT decoder function
export const decodeJWT = (token) => {
  try {
    // JWT tokens are made of three parts: header.payload.signature
    // We only need the payload which is the second part
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decodedToken = JSON.parse(jsonPayload);

    // Log the token contents for debugging
    console.log('Decoded JWT token contents:', decodedToken);

    // Ensure we have a name property
    if (!decodedToken.name && decodedToken.given_name) {
      // If name is missing but given_name exists, construct a full name
      decodedToken.name = decodedToken.given_name;
      if (decodedToken.family_name) {
        decodedToken.name += ' ' + decodedToken.family_name;
      }
    }

    return decodedToken;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};
