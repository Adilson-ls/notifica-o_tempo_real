// ================== Authentication Scripts ==================
// Handles all Supabase authentication flows

// Import Supabase client
const { createClient } = window.supabase;

// Initialize Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Will be replaced with .env value
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Will be replaced with .env value

let supabase = null;

// Initialize on page load
function initSupabase() {
    try {
        // Check if Supabase is already loaded
        if (!window.supabase) {
            console.error('Supabase library not loaded. Make sure to include <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0"></script>');
            return false;
        }
        
        // In production, these should come from .env via backend
        // For now, we'll check localStorage for config
        const storedUrl = localStorage.getItem('supabase_url');
        const storedKey = localStorage.getItem('supabase_anon_key');
        
        if (!storedUrl || !storedKey) {
            console.error('Supabase credentials not configured. Please set them up first.');
            return false;
        }
        
        supabase = window.supabase.createClient(storedUrl, storedKey);
        console.log('✅ Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return false;
    }
}

// ==================== LOGIN PAGE ====================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    
    // Auto-fill demo credentials
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    
    if (emailInput && passwordInput) {
        // Check for saved credentials
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            emailInput.value = savedEmail;
            rememberCheckbox.checked = true;
        }
        
        // Show demo credentials
        const demoBox = document.querySelector('.demo-box');
        if (demoBox) {
            demoBox.innerHTML = '<strong>📝 Demo Credentials:</strong><br>Email: <code>demo@example.com</code><br>Senha: <code>Demo@12345</code>';
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    if (!initSupabase()) {
        showError('Supabase não foi configurado corretamente', 'loginForm');
        return;
    }
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked || false;
    
    // Validação básica
    if (!email || !password) {
        showError('Por favor, preencha todos os campos', 'loginForm');
        return;
    }
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            showError(`Erro ao fazer login: ${error.message}`, 'loginForm');
            return;
        }
        
        // Save credentials if "remember me" is checked
        if (remember) {
            localStorage.setItem('remembered_email', email);
        } else {
            localStorage.removeItem('remembered_email');
        }
        
        // Store user session
        if (data.session) {
            localStorage.setItem('auth_token', data.session.access_token);
            localStorage.setItem('user_id', data.user.id);
            localStorage.setItem('user_email', data.user.email);
        }
        
        showSuccess('Login realizado com sucesso! Redirecionando...', 'loginForm');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        showError(`Erro inesperado: ${error.message}`, 'loginForm');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ==================== SIGNUP PAGE ====================

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
    
    // Add real-time validation
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordStrength);
    }
    
    if (confirmInput) {
        confirmInput.addEventListener('input', validatePasswordMatch);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    if (!initSupabase()) {
        showError('Supabase não foi configurado corretamente', 'signupForm');
        return;
    }
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsCheckbox = document.getElementById('terms');
    
    // Validations
    if (!fullName || !email || !password || !confirmPassword) {
        showError('Por favor, preencha todos os campos', 'signupForm');
        return;
    }
    
    if (password.length < 8) {
        showError('A senha deve ter no mínimo 8 caracteres', 'signupForm');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('As senhas não correspondem', 'signupForm');
        return;
    }
    
    if (!termsCheckbox?.checked) {
        showError('Você deve aceitar os Termos de Serviço', 'signupForm');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Email inválido', 'signupForm');
        return;
    }
    
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        // Create user account
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        
        if (error) {
            showError(`Erro ao criar conta: ${error.message}`, 'signupForm');
            return;
        }
        
        showSuccess('Conta criada com sucesso! Verifique seu email para confirmar.', 'signupForm');
        
        // Optionally log in the user
        if (data.user) {
            localStorage.setItem('user_email', data.user.email);
            localStorage.setItem('user_id', data.user.id);
            
            // Redirect to login after delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
        
    } catch (error) {
        showError(`Erro inesperado: ${error.message}`, 'signupForm');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

function validatePasswordStrength() {
    const password = document.getElementById('password').value;
    
    const hints = {
        hintLength: password.length >= 8,
        hintUppercase: /[A-Z]/.test(password),
        hintNumber: /[0-9]/.test(password)
    };
    
    Object.entries(hints).forEach(([hintId, isValid]) => {
        const hintElement = document.getElementById(hintId);
        if (hintElement) {
            hintElement.classList.toggle('valid', isValid);
            hintElement.classList.toggle('invalid', !isValid);
        }
    });
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const mismatchElement = document.getElementById('passwordMismatch');
    
    if (mismatchElement) {
        if (confirmPassword && password !== confirmPassword) {
            mismatchElement.style.display = 'block';
        } else {
            mismatchElement.style.display = 'none';
        }
    }
}

// ==================== FORGOT PASSWORD PAGE ====================

const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
    forgotForm.addEventListener('submit', handleForgotPassword);
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    if (!initSupabase()) {
        showError('Supabase não foi configurado corretamente', 'forgotForm');
        return;
    }
    
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
        showError('Por favor, digite seu email', 'forgotForm');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Email inválido', 'forgotForm');
        return;
    }
    
    const submitBtn = forgotForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        
        if (error) {
            showError(`Erro ao enviar email: ${error.message}`, 'forgotForm');
            return;
        }
        
        showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.', 'forgotForm');
        
        // Clear form
        forgotForm.reset();
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 3000);
        
    } catch (error) {
        showError(`Erro inesperado: ${error.message}`, 'forgotForm');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ==================== RESET PASSWORD PAGE ====================

const resetForm = document.getElementById('resetForm');
if (resetForm) {
    resetForm.addEventListener('submit', handleResetPassword);
    
    // Add real-time validation
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordStrength);
    }
    
    if (confirmInput) {
        confirmInput.addEventListener('input', validatePasswordMatch);
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    
    if (!initSupabase()) {
        showError('Supabase não foi configurado corretamente', 'resetForm');
        return;
    }
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!password || !confirmPassword) {
        showError('Por favor, preencha todos os campos', 'resetForm');
        return;
    }
    
    if (password.length < 8) {
        showError('A senha deve ter no mínimo 8 caracteres', 'resetForm');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('As senhas não correspondem', 'resetForm');
        return;
    }
    
    const submitBtn = resetForm.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);
    
    try {
        // Get current session (should have auth token from email link)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            showError('Sessão expirada. Por favor, clique no link do email novamente.', 'resetForm');
            return;
        }
        
        const { error } = await supabase.auth.updateUser({
            password: password
        });
        
        if (error) {
            showError(`Erro ao atualizar senha: ${error.message}`, 'resetForm');
            return;
        }
        
        showSuccess('Senha redefinida com sucesso! Você será redirecionado para o login.', 'resetForm');
        
        // Clear stored auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        showError(`Erro inesperado: ${error.message}`, 'resetForm');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ==================== HELPER FUNCTIONS ====================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message, formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const errorElement = form.querySelector('.error-message');
    const successElement = form.querySelector('.success-message');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    if (successElement) {
        successElement.style.display = 'none';
    }
}

function showSuccess(message, formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const successElement = form.querySelector('.success-message');
    const errorElement = form.querySelector('.error-message');
    
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    const btnText = button.querySelector('#btnText');
    const btnLoader = button.querySelector('#btnLoader');
    
    button.disabled = isLoading;
    
    if (btnText) btnText.style.display = isLoading ? 'none' : 'inline';
    if (btnLoader) btnLoader.style.display = isLoading ? 'inline' : 'none';
}

// ==================== AUTO-LOGIN CHECK ====================

// Check if user is already logged in
window.addEventListener('load', () => {
    const authToken = localStorage.getItem('auth_token');
    const currentPage = window.location.pathname;
    
    // If on auth pages and already logged in, redirect to dashboard
    if (authToken && (currentPage.includes('login') || currentPage.includes('signup') || currentPage.includes('forgot') || currentPage.includes('reset'))) {
        window.location.href = 'index.html';
    }
});

// ==================== LOGOUT FUNCTION ====================

async function logout() {
    if (!initSupabase()) return;
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Erro ao fazer logout:', error);
        }
        
        // Clear local storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        
        // Redirect to login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro inesperado:', error);
    }
}

// Export functions for use in other scripts
window.logoutUser = logout;
