document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.getElementById('nav');
    const mobileSearch = document.querySelector('.mobile-search');
    const searchOverlay = document.querySelector('.search-overlay');
    const closeSearch = document.querySelector('.close-search');

    // Login/Signup elements
    const loginBtn = document.querySelector('.login');
    const signupBtn = document.querySelector('.signup');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const userProfile = document.querySelector('.user-profile');
    const logoutBtn = document.querySelector('.logout-btn');
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');
    const GOOGLE_CLIENT_ID = '594467072263-lf728772tc2cmm2vsshnpns6jptlr268.apps.googleusercontent.com';

    // Google Sign-In
    function handleGoogleSignIn(response) {
        const id_token = response.credential;
        fetch('http://localhost:5000/api/users/google-signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: id_token }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Update UI with user data from backend
                updateUIAfterLogin(data.user);
                loginModal.classList.remove('active');
                signupModal.classList.remove('active');
            } else {
                alert(data.message || 'Google Sign-In failed.');
            }
        })
        .catch(error => {
            console.error('Google Sign-In error:', error);
            alert('An error occurred during Google Sign-In.');
        });
    }

    window.onload = function () {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn
        });
        google.accounts.id.renderButton(
            googleSignInBtn,
            { theme: "outline", size: "large", type: "standard", text: "signin_with" }
        );
        google.accounts.id.renderButton(
            googleSignUpBtn,
            { theme: "outline", size: "large", type: "standard", text: "signup_with" }
        );
        google.accounts.id.prompt(); // Also display the One Tap dialog
    };


    // Toggle mobile menu
    mobileMenu.addEventListener('click', function () {
        nav.classList.toggle('active');

        // Change icon based on menu state
        const icon = this.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Toggle search overlay for mobile
    mobileSearch.addEventListener('click', function () {
        searchOverlay.classList.add('active');
    });

    closeSearch.addEventListener('click', function () {
        searchOverlay.classList.remove('active');
    });

    // Close search overlay when clicking outside
    searchOverlay.addEventListener('click', function (e) {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('active');
        }
    });

    // Close menu when clicking on a link (for mobile)
    const navLinks = document.querySelectorAll('#nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 992) {
                nav.classList.remove('active');
                const icon = mobileMenu.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Close menu when clicking outside (for mobile)
    document.addEventListener('click', function (event) {
        if (window.innerWidth <= 992) {
            const isClickInsideNav = nav.contains(event.target);
            const isClickOnMenu = mobileMenu.contains(event.target);

            if (!isClickInsideNav && !isClickOnMenu && nav.classList.contains('active')) {
                nav.classList.remove('active');
                const icon = mobileMenu.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 992) {
            nav.classList.remove('active');
            const icon = mobileMenu.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            searchOverlay.classList.remove('active');
        }
    });

    // Login/Signup functionality
    loginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        loginModal.classList.add('active');
    });

    signupBtn.addEventListener('click', function (e) {
        e.preventDefault();
        signupModal.classList.add('active');
    });

    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            loginModal.classList.remove('active');
            signupModal.classList.remove('active');
        });
    });

    // Switch between login and signup modals
    showSignupLink.addEventListener('click', function (e) {
        e.preventDefault();
        loginModal.classList.remove('active');
        signupModal.classList.add('active');
    });

    showLoginLink.addEventListener('click', function (e) {
        e.preventDefault();
        signupModal.classList.remove('active');
        loginModal.classList.add('active');
    });

    // Close modals when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
        if (e.target === signupModal) {
            signupModal.classList.remove('active');
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Update UI with user data from backend
                updateUIAfterLogin(data.user);
                loginModal.classList.remove('active');
                loginForm.reset();
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Update UI with user data from backend
                updateUIAfterLogin(data.user);
                signupModal.classList.remove('active');
                signupForm.reset();
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup.');
        }
    });

    // Handle logout
    logoutBtn.addEventListener('click', function () {
        userProfile.classList.remove('active');
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
    });

    // Renamed from simulateLogin to better reflect its purpose
    function updateUIAfterLogin(user) {
        const userAvatar = document.querySelector('.user-avatar');
        const userNameElement = document.querySelector('.user-name');

        // If user has a profile picture from Google, use it
        if (user.picture) {
            userAvatar.style.backgroundImage = `url(${user.picture})`;
            userAvatar.textContent = ''; // Clear the initial letter
        } else {
            // Otherwise, fall back to the first letter of the name
            userAvatar.style.backgroundImage = 'none';
            const firstLetter = user.name.charAt(0).toUpperCase();
            userAvatar.textContent = firstLetter;
        }

        // Set user name
        userNameElement.textContent = user.name;

        // Show user profile, hide login/signup buttons
        userProfile.classList.add('active');
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';

        // Show success message
        alert(`Welcome, ${user.name}! You have successfully logged in.`);
    }
});