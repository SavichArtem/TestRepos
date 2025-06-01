export async function checkFieldExists(field, value) {
  try {
    const response = await fetch(
      `http://localhost:3000/users?${field}=${encodeURIComponent(value)}`
    );
    if (!response.ok) throw new Error("Network error");
    return (await response.json()).length > 0;
  } catch (error) {
    console.error("Check error:", error);
    return false;
  }
}

export async function checkUsernameExists(username) {
  return checkFieldExists("username", username);
}

export async function checkEmailExists(email) {
  return checkFieldExists("email", email);
}

export async function checkPhoneExists(phone) {
  return checkFieldExists("phone", phone);
}


export async function fetchWithAuth(url, options = {}) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (currentUser) {
            headers['Authorization'] = `Bearer ${currentUser.id}`;
        }
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Network error');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}