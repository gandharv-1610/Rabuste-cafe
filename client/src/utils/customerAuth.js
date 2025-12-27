// Customer Authentication & Session Management

const CUSTOMER_SESSION_KEY = 'rabuste_customer_session';

/**
 * Get current customer session
 */
export const getCustomerSession = () => {
  try {
    const session = localStorage.getItem(CUSTOMER_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (e) {
    console.error('Error reading customer session:', e);
    return null;
  }
};

/**
 * Set customer session
 */
export const setCustomerSession = (customerData) => {
  try {
    const session = {
      mobile: customerData.mobile,
      name: customerData.name,
      email: customerData.email || '',
      customerId: customerData._id || customerData.customerId,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (e) {
    console.error('Error saving customer session:', e);
    return null;
  }
};

/**
 * Clear customer session (logout)
 */
export const clearCustomerSession = () => {
  try {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    return true;
  } catch (e) {
    console.error('Error clearing customer session:', e);
    return false;
  }
};

/**
 * Check if customer is logged in
 */
export const isCustomerLoggedIn = () => {
  const session = getCustomerSession();
  return session !== null && session.mobile;
};

/**
 * Get customer mobile from session
 */
export const getCustomerMobile = () => {
  const session = getCustomerSession();
  return session?.mobile || null;
};

/**
 * Get customer name from session
 */
export const getCustomerName = () => {
  const session = getCustomerSession();
  return session?.name || null;
};

/**
 * Get customer email from session
 */
export const getCustomerEmail = () => {
  const session = getCustomerSession();
  return session?.email || null;
};

