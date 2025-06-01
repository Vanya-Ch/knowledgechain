document.addEventListener('DOMContentLoaded', async () => {
    const topicsContainer = document.querySelector('.topics');
    const heading = document.querySelector('.topics__heading');
    const searchInput = document.querySelector('.topics__search');
    const tagFilterInput = document.getElementById('tag-filter');
    const tagFilter = new Tagify(tagFilterInput);

    fetch('/api/tags')
        .then(res => res.json())
        .then(tags => tagFilter.settings.whitelist = tags);

    const TOPICS_PER_PAGE = 10;
    let allTopics = [];
    let currentPage = 1;
    let currentUserId = null;
    let currentUserRole = null;

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/user/current', { credentials: 'include' });
            if (!res.ok) throw new Error('Не вдалося отримати поточного користувача');
            const user = await res.json();
            currentUserId = user._id;
            currentUserRole = user.role;
        } catch (err) {
            console.error('Помилка при завантаженні поточного користувача:', err);
        }
    };

    const fetchTopics = async () => {
        const res = await fetch('/api/topics', { credentials: 'include' });
        const data = await res.json();
        return data;
    };

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

        topicsContainer.appendChild(pagination);
    };

    const renderTopics = () => {
        document.querySelectorAll('.card-link.card').forEach(el => el.remove());

        const searchQuery = searchInput.value.trim().toLowerCase();
        const selectedTags = tagFilter.value.map(tag => tag.value);

        const filteredTopics = allTopics.filter(topic => {
            const matchesTitle = topic.title.toLowerCase().includes(searchQuery);
            const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => topic.tags.includes(tag));
            return matchesTitle && matchesTags;
        });

        const totalPages = Math.ceil(filteredTopics.length / TOPICS_PER_PAGE);
        const start = (currentPage - 1) * TOPICS_PER_PAGE;
        const currentTopics = filteredTopics.slice(start, start + TOPICS_PER_PAGE);

        currentTopics.forEach(topic => {
            const card = document.createElement('a');
            card.setAttribute('target', "_blank")
            card.href = `/topic?id=${topic._id}`;
            card.className = 'card-link card';
            card.dataset.topicId = topic._id;

            const createdAt = new Date(topic.createdAt);
            const formattedDate = `${String(createdAt.getDate()).padStart(2, '0')}.${String(createdAt.getMonth() + 1).padStart(2, '0')}.${createdAt.getFullYear()}`;

            const isLiked = topic.likes.includes(currentUserId);
            const isAuthor = String(topic.author._id) === String(currentUserId);
            const isAdmin = currentUserRole === 'admin';


            card.innerHTML = `
                <img class="card__image" src="${topic.imageUrl || '../assets/images/default-topic.jpg'}" alt="topic card">
                <div class="card__info">
                    <h2 class="card__title">
                        ${topic.title}
                        ${topic.needHelp ? '<span class="badge">Need Help</span>' : ''}
                        <button class="card__like ${isLiked ? 'liked' : ''}">
                            ${isLiked ? `
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#FF5500" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                                            2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                                            C13.09 3.81 14.76 3 16.5 3
                                            19.58 3 22 5.42 22 8.5
                                            c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>` : `
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#bbb" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                                            2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                                            C13.09 3.81 14.76 3 16.5 3
                                            19.58 3 22 5.42 22 8.5
                                            c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>`}
                            <span class="like-count">${topic.likes.length}</span>
                        </button>
                    </h2>
                    <div class="card__tags">
                        ${topic.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="card__creator-info">
                        <img src="${topic.author.avatarUrl}" alt="creator avatar" class="card__creator-avatar">
                        <p class="card__creator-username">${topic.author.username}</p>
                        <p class="card__date">${formattedDate}</p>
                        <button class="delete-topic-button visually-hidden" data-id="${topic._id}">
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

            const deleteTopicBtn = card.querySelector('.delete-topic-button');
            if (isAuthor || isAdmin) {
                deleteTopicBtn.classList.remove('visually-hidden');
            }

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
                likeIcon.setAttribute('fill', liked ? '#FF5500' : 'red');

                try {
                    await fetch(`/api/topics/${topicId}/like`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                } catch (err) {
                    console.error(err);
                    likeBtn.classList.toggle('liked');
                    likeCount.textContent = liked ? +likeCount.textContent + 1 : +likeCount.textContent - 1;
                    likeIcon.setAttribute('fill', liked ? 'red' : '#bbb');
                }
            });

            deleteTopicBtn?.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!confirm('Ви впевнені, що хочете видалити цей топік?')) return;

                const topicId = deleteTopicBtn.dataset.id;
                const res = await fetch(`/api/topics/${topicId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (res.ok) {
                    alert('Топік успішно видалено');
                    card.remove();
                    allTopics = allTopics.filter(t => t._id !== topicId);
                    renderTopics();
                } else {
                    alert('Помилка при видаленні топіка');
                }
            });

            topicsContainer.insertBefore(card, heading.nextSibling);
        });

        renderPagination(totalPages);
    };

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderTopics();
    });

    tagFilter.on('change', () => {
        currentPage = 1;
        renderTopics();
    });


    try {
        await fetchCurrentUser();
        allTopics = await fetchTopics();
        renderTopics();
    } catch (err) {
        console.error('Помилка при завантаженні топіків:', err);
    }
});
