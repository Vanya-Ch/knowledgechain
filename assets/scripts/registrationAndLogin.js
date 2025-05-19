const loginBtn = document.querySelector('[data-js-login-btn]');
        const registerBtn = document.querySelector('[data-js-register-btn]');
        const loginForm = document.querySelector('[data-js-login-form]');
        const registerForm = document.querySelector('[data-js-register-form]');

        loginBtn.addEventListener('click', () => {
            loginBtn.classList.add('button-active');
            registerBtn.classList.remove('button-active');
            loginForm.classList.remove('visually-hidden');
            registerForm.classList.add('visually-hidden');
        });

        registerBtn.addEventListener('click', () => {
            registerBtn.classList.add('button-active');
            loginBtn.classList.remove('button-active');
            registerForm.classList.remove('visually-hidden');
            loginForm.classList.add('visually-hidden');
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.querySelector('[data-js-login-username]').value;
            const password = document.querySelector('[data-js-login-password]').value;

            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await res.json();
            if (res.ok) {
                alert('Вхід успішний!');
                window.location.href = '/';
            } else {
                alert(data.message || 'Помилка входу');
            }
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const login = document.querySelector('[data-js-register-login]').value;
            const name = document.querySelector('[data-js-register-name]').value;
            const password = document.querySelector('[data-js-register-password]').value;
            const confirm = document.querySelector('[data-js-register-confirm]').value;
            const errorEl = document.querySelector('[data-js-password-error]');

            if (password !== confirm) {
                errorEl.classList.remove('visually-hidden');
                return;
            }

            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: login, name, password }),
                credentials: 'include'
            });

            const data = await res.json();
            if (res.ok) {
                alert('Реєстрація успішна!');
                window.location.href = '/';
            } else {
                alert(data.message || 'Помилка реєстрації');
            }
        });