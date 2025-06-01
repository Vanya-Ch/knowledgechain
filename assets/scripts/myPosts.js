document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.topics');
    const searchInput = container.querySelector('.topics__search');
    const headingDiv = container.querySelector('.topics__heading');

    const TOPICS_PER_PAGE = 10;

    let allTopics = [];
    let currentPage = 1;

    try {
        // Отримуємо користувача
        const userRes = await fetch('/api/user/current', { credentials: 'include' });
        if (!userRes.ok) throw new Error('Not authorized');

        const user = await userRes.json();

        if (!user) {
            container.innerHTML += '<p>You must be logged in to see your topics.</p>';
            return;
        }

        // Отримуємо створені теми
        const res = await fetch('/api/topics/myPosts', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            const error = await res.json();
            console.error('Error fetching created topics:', error);
            container.innerHTML += '<p>Failed to load created topics.</p>';
            return;
        }

        allTopics = await res.json();

        if (!Array.isArray(allTopics) || allTopics.length === 0) {
            container.innerHTML += '<p>You haven\'t created any topics yet.</p>';
            return;
        }

        // Обробка пошуку
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTopics();
        });

        // Пагінація
        const renderPagination = (totalPages) => {
            const oldPagination = document.querySelector('.pagination');
            if (oldPagination) oldPagination.remove();

            const pagination = document.createElement('div');
            pagination.className = 'pagination';

            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.className = 'pagination__btn';
                if (i === currentPage) button.classList.add('active');

                button.addEventListener('click', () => {
                    currentPage = i;
                    renderTopics();
                });

                pagination.appendChild(button);
            }

            container.appendChild(pagination);
        };

        // Рендер топіків
        const renderTopics = () => {
            // Видаляємо старі картки та пагінацію
            document.querySelectorAll('.card-link').forEach(el => el.remove());
            const oldPagination = document.querySelector('.pagination');
            if (oldPagination) oldPagination.remove();

            const query = searchInput.value.toLowerCase();
            const filteredTopics = allTopics.filter(topic => topic.title.toLowerCase().includes(query));

            if (filteredTopics.length === 0) {
                container.innerHTML += '<p>No results found.</p>';
                return;
            }

            const totalPages = Math.ceil(filteredTopics.length / TOPICS_PER_PAGE);
            const startIndex = (currentPage - 1) * TOPICS_PER_PAGE;
            const pageTopics = filteredTopics.slice(startIndex, startIndex + TOPICS_PER_PAGE);

            pageTopics.forEach(topic => {
                const date = new Date(topic.createdAt).toLocaleDateString('uk-UA');
                const likeCount = topic.likes.length;

                const card = document.createElement('a');
                card.setAttribute('target', "_blank")
                card.href = `/topic?id=${topic._id}`;
                card.className = 'card-link card';
                card.dataset.topicId = topic._id;

                const isLiked = user && topic.likes.includes(user._id);
                const likeClass = isLiked ? 'liked' : '';

                card.innerHTML = `
                    <img class="card__image" src="${topic.imageUrl || '../assets/images/default-topic.jpg'}" alt="topic card">
                    <div class="card__info">
                        <h2 class="card__title">
                            ${topic.title}
                            ${topic.needHelp ? `<span class="badge badge--help">Need Help</span>` : ''}
                            <button class="card__like ${likeClass}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${isLiked ? 'red' : '#bbb'}" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                                            2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                                            C13.09 3.81 14.76 3 16.5 3
                                            19.58 3 22 5.42 22 8.5
                                            c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                                </svg>
                                <span class="like-count">${likeCount}</span>
                            </button>
                        </h2>
                        <div class="card__creator-info">
                            <img src="${topic.author?.avatarUrl || '../assets/images/default-avatar.png'}" alt="creator avatar" class="card__creator-avatar">
                            <p class="card__creator-username">${topic.author?.username || 'Unknown'}</p>
                            <p class="card__date">${date}</p>
                            <button class="delete-topic-button" data-id="${topic._id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                `;

                // Обробка кліку лайка
                const likeBtn = card.querySelector('.card__like');
                likeBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const topicId = card.dataset.topicId;
                    const likeIcon = likeBtn.querySelector('svg');
                    const likeCount = likeBtn.querySelector('.like-count');
                    const liked = likeBtn.classList.contains('liked');

                    likeBtn.classList.toggle('liked');
                    const newCount = liked ? +likeCount.textContent - 1 : +likeCount.textContent + 1;
                    likeCount.textContent = newCount;
                    likeIcon.setAttribute('fill', liked ? '#bbb' : 'red');

                    try {
                        await fetch(`/api/topics/${topicId}/like`, {
                            method: 'POST',
                            credentials: 'include'
                        });
                    } catch (err) {
                        console.error(err);
                        likeBtn.classList.toggle('liked');
                        likeCount.textContent = liked ? +likeCount.textContent + 1 : +likeCount.textContent - 1;
                        likeIcon.setAttribute('fill', liked ? '#FF5500' : '#bbb');
                    }
                });

                // Обробка кнопки видалення
                const deleteBtn = card.querySelector('.delete-topic-button');
                deleteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!confirm('Ви впевнені, що хочете видалити цей топік?')) return;

                    try {
                        const res = await fetch(`/api/topics/${topic._id}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });

                        if (res.ok) {
                            alert('Топік видалено');
                            allTopics = allTopics.filter(t => t._id !== topic._id);
                            renderTopics();
                        } else {
                            alert('Не вдалося видалити топік');
                        }
                    } catch (err) {
                        console.error('Delete error:', err);
                    }
                });

                headingDiv.insertAdjacentElement('afterend', card);
            });

            renderPagination(totalPages);
        };

        renderTopics();
    } catch (err) {
        console.error('Unexpected error:', err);
        container.innerHTML += '<p>Something went wrong.</p>';
    }
});
