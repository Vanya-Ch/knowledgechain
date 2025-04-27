//avatar
const avatar = document.querySelector('[data-js-user-avatar]');
const avatarFormBg = document.querySelector('[data-js-user-form-bg]');
const avatarForm = document.querySelector('[data-js-user-form]');


avatar.addEventListener('click', () => { avatarForm.classList.remove('visually-hidden') })

avatarFormBg.addEventListener('click', (e) => {
  e.stopPropagation();
  if (e.target === avatarFormBg) {
    avatarForm.classList.add('visually-hidden');
  }
})


// burger
const navigation = document.querySelector('[data-js-overlay]')
const burgerButton = document.querySelector('[data-js-burger-button]')

burgerButton.addEventListener('click', () => {
  navigation.classList.toggle('is-active');
  burgerButton.classList.toggle('is-active');


  document.querySelector('.topic__checkbox-icon').classList.toggle('visually-hidden')

})

document.querySelector('.user__form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('avatar-input');
  const file = fileInput.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const res = await fetch('/api/user/update-avatar', {
      method: 'POST',
      body: formData,
      credentials: 'include', // якщо використовуються куки
    });

    const data = await res.json();

    if (data.success) {
      // 🔄 Оновити картинку
      document.querySelector('.header__user-image').src = data.avatarUrl + `?${Date.now()}`;
    } else {
      alert('Error updating avatar');
    }
  } catch (err) {
    console.error(err);
  }
});

//log out
document.querySelector('.user__log-out')?.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/logout', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.ok) {
      window.location.href = '/'; // перенаправлення на головну
    } else {
      console.error('Logout failed');
    }
  } catch (err) {
    console.error('Error during logout', err);
  }
});

//avatar reset
document.addEventListener('DOMContentLoaded', async () => {
  try {
      const res = await fetch('/api/user/me', {
          method: 'GET',
          credentials: 'include'
      });

      if (!res.ok) throw new Error('User not authenticated');

      const user = await res.json();

      const avatarImg = document.querySelector('[data-js-user-avatar] img');
      const usernameDiv = document.querySelector('.header__user-username');

      if (avatarImg && user.avatarUrl) {
          avatarImg.src = user.avatarUrl;
      }

      usernameDiv.textContent = user.username;

  } catch (err) {
      console.error('Error loading user info:', err);
  }
});