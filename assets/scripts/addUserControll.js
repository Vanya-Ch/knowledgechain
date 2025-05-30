let allUsers = [];

async function loadUsers() {
  try {
    const response = await fetch('/api/user/users');
    const users = await response.json();
    allUsers = users;
    renderUsers(allUsers);
  } catch (err) {
    console.error('Помилка при завантаженні користувачів:', err);
  }
}

function renderUsers(users) {
  const usersList = document.querySelector('.users__list');
  if (!usersList) return;

  usersList.innerHTML = '';

  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.className = 'users-item';
    userElement.innerHTML = `
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Role:</strong> ${user.role}</p>
      <p><strong>State:</strong> ${user.isBanned ? 'Banned' : 'No ban'}</p>
      <button onclick="toggleBan('${user._id}', ${user.isBanned})">
        ${user.isBanned ? 'Unban' : 'Ban'}
      </button>
      <button onclick="toggleRole('${user._id}', '${user.role}')">
        Change role to ${user.role === 'admin' ? 'user' : 'admin'}
      </button>
    `;
    usersList.appendChild(userElement);
  });
}

async function toggleBan(userId, currentStatus) {
  try {
    const response = await fetch(`/api/user/${userId}/ban`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned: !currentStatus })
    });

    if (response.ok) {
      loadUsers();
    } else {
      console.error('Не вдалося змінити стан користувача');
    }
  } catch (err) {
    console.error('Помилка при зміні стану:', err);
  }
}

async function toggleRole(userId, currentRole) {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';

  try {
    const response = await fetch(`/api/user/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });

    if (response.ok) {
      loadUsers();
    } else {
      console.error('Не вдалося змінити роль');
    }
  } catch (err) {
    console.error('Помилка при зміні ролі:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();

  const searchInput = document.querySelector('.users__search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm)
      );
      renderUsers(filteredUsers);
    });
  }
});
