export function generateAutoPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    
    password += chars[Math.floor(Math.random() * 26)];
    password += chars[26 + Math.floor(Math.random() * 26)];
    password += chars[52 + Math.floor(Math.random() * 10)];
    password += chars[62 + Math.floor(Math.random() * 10)];
    
    for (let i = 4; i < 8 + Math.floor(Math.random() * 13); i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}