document.addEventListener('DOMContentLoaded', async () => {
    const card = document.querySelector('.topic');
    const topicId = new URLSearchParams(window.location.search).get('id');
    if (!topicId) return window.location.href = '/';

    const res = await fetch(`/api/topics/${topicId}`);
    const topic = await res.json();

    const commentsRes = await fetch(`/api/comments/${topicId}`);
    const comments = await commentsRes.json();

    let user = null;
    try {
        const userRes = await fetch('/api/user/current', { credentials: 'include' });
        if (userRes.ok) user = await userRes.json();
    } catch (e) { }

    const isLiked = user ? topic.likes.includes(user._id) : false;
    const isAuthor = user ? String(topic.author._id) === String(user._id) : false;
    const isAdmin = user ? user.role === 'admin' : false;
    const date = new Date(topic.createdAt).toLocaleDateString('uk-UA');
    const likeClass = isLiked ? 'liked' : '';

    // Рендер коментаря
    function renderComment(comment, user) {
        const authorId = comment.author.userId || comment.author._id;
        const canDelete = user && (String(authorId) === String(user._id) || user.role === 'admin');

        console.log({ canDelete, authorId, userId: user?._id, role: user?.role, user });

        return `
            <div class="topic__comment comment" data-comment-id="${comment._id}" data-comment-author-id="${authorId}">
                <img class="user-image user-image--alt" src="${comment.author.avatarUrl || '../assets/images/default-avatar.png'}" alt="user avatar">
                <div class="comment__inner">
                    <p>${comment.text}</p>
                    <p class="comment__date">
                        <span>${comment.author.username}</span>
                        <span>${new Date(comment.createdAt).toLocaleDateString('uk-UA')}</span>
                        ${canDelete ? `
                            <button class="delete-comment-button" data-id="${comment._id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                            </button>` : ''}
                    </p>
                </div>
            </div>`;
    }

    // Вивід топіка та коментарів
    card.innerHTML = `
        <div class="topic__card card" data-topic-id="${topic._id}">
            <img class="card__image" src="${topic.imageUrl || '../assets/images/default-topic.jpg'}" alt="topic card">
            <div class="card__info">
                <h2 class="card__title">
                    ${topic.title}
                    ${topic.needHelp ? '<span class="badge">Need help</span>' : ''}
                    <button class="card__like ${likeClass}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${isLiked ? 'red' : '#bbb'}" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                                2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                                C13.09 3.81 14.76 3 16.5 3
                                19.58 3 22 5.42 22 8.5
                                c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                        </svg>
                        <span class="like-count">${topic.likes.length}</span>
                    </button>
                </h2>
                <div class="card__tags">
                    ${topic.tags?.map(tag => `<tag class="tag" title="${tag}">${tag}</tag>`).join('') || ''}
                </div>
                <p class="card__text">${topic.text}</p>
                <div class="card__creator-info">
                    <img src="${topic.author?.avatarUrl || '../assets/images/default-avatar.png'}" alt="creator avatar" class="card__creator-avatar">
                    <p class="card__creator-username">${topic.author?.username || 'Unknown'}</p>
                    <p class="card__date">${date}</p>
                    <div class="card__edit-buttons">
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
                        ${isAuthor ? `
                            <button class="edit-topic-button" data-id="${topic._id}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>

        ${user ? (
            user.isBanned ? `
        <div class="not-auth-comment">
            <p>Your account has been <strong>banned</strong>. You cannot leave comments.</p>
        </div>
    ` : `
        <form class="topic__comment-create">
            <textarea class="topic__textarea" placeholder="What do you think about it?" required></textarea>
            <button class="button comment__button" type="submit">Send</button>
        </form>
    `
        ) : `
    <div class="not-auth-comment">
        <p>You must <a href="/login">log in</a> to comment.</p>
    </div>
`}

        <div class="comments-section">
            ${comments.length ? comments.map(comment => renderComment(comment, user)).join('') : '<p>Here no comments yet</p>'}
        </div>
    `;

    // Кнопка видалення топіка
    const deleteTopicBtn = card.querySelector('.delete-topic-button');
    if (isAuthor || isAdmin) {
        deleteTopicBtn.classList.remove('visually-hidden');
    }

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
            window.location.href = '/';
        } else {
            alert('Помилка при видаленні топіка');
        }
    });

    // Кнопки видалення коментарів
    card.querySelectorAll('.delete-comment-button').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Видалити цей коментар?')) return;

            const commentId = btn.dataset.id;
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                btn.closest('.topic__comment').remove();
            } else {
                const data = await res.json();
                alert(data.message || 'Помилка при видаленні коментаря');
            }
        });
    });

    // Лайк
    const likeBtn = document.querySelector('.card__like');
    likeBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        const likeIcon = likeBtn.querySelector('svg');
        const likeCount = likeBtn.querySelector('.like-count');
        const liked = likeBtn.classList.contains('liked');

        likeBtn.classList.toggle('liked');
        likeCount.textContent = liked ? +likeCount.textContent - 1 : +likeCount.textContent + 1;
        likeIcon.setAttribute('fill', liked ? '#bbb' : 'red');

        try {
            await fetch(`/api/topics/${topicId}/like`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            likeBtn.classList.toggle('liked');
            likeCount.textContent = liked ? +likeCount.textContent + 1 : +likeCount.textContent - 1;
            likeIcon.setAttribute('fill', liked ? 'red' : '#bbb');
        }
    });

    // Додавання коментаря
    const commentForm = document.querySelector('.topic__comment-create');
    commentForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = commentForm.querySelector('textarea');
        const text = textarea.value.trim();
        if (!text) return;

        const res = await fetch(`/api/comments/${topicId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text })
        });

        if (res.ok) {
            const newComment = await res.json();
            const commentsSection = document.querySelector('.comments-section');
            commentsSection.insertAdjacentHTML('beforeend', renderComment(newComment, user));
            textarea.value = '';
        } else {
            alert('Помилка при додаванні коментаря');
        }
    });

    card.addEventListener('click', (e) => {
        if (e.target.closest('.edit-topic-button')) {
            const editorWrapper = document.createElement('div');
            editorWrapper.classList.add('edit-form-wrapper');

            editorWrapper.innerHTML = `
            <form class="edit-topic-form">
                <input type="text" name="title" class="edit-title-input" value="${topic.title}" required />
                <input name="tags" class="edit-tags-input" value='${JSON.stringify((topic.tags || []).map(tag => ({ value: tag })))}' placeholder="Add tags" />
                <div id="edit-editor" style="height: 200px;">${topic.text}</div>
                <input type="hidden" name="text" id="edit-hidden-text" />
                <label class="topic__checkbox">
                    <input class="topic__checkbox-button visually-hidden" name="needHelp" type="checkbox" ${topic.needHelp ? 'checked' : ''}>
                    Do you need any help with this? <span class="topic__checkbox-icon"></span>
                </label>

                <button type="submit" class="button">Зберегти</button>
                <button type="button" class="button cancel-edit-button">Скасувати</button>
            </form>
        `;

            const info = card.querySelector('.card__info');
            info.innerHTML = '';
            info.appendChild(editorWrapper);

            const editQuill = new Quill('#edit-editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });

            const editForm = card.querySelector('.edit-topic-form');
            const tagInput = editForm.querySelector('.edit-tags-input');
            const tagify = new Tagify(tagInput, {
                whitelist: [],
                dropdown: {
                    enabled: 0
                }
            });

            // Сабміт редагування
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = editForm.querySelector('.edit-title-input').value.trim();
                const needHelp = editForm.querySelector('[name="needHelp"]').checked;
                const text = editQuill.root.innerHTML;
                const tags = tagify.value.map(tag => tag.value);

                const res = await fetch(`/api/topics/${topic._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ title, text, needHelp, tags })
                });

                if (res.ok) {
                    alert('Пост оновлено!');
                    window.location.reload();
                } else {
                    const data = await res.json();
                    alert(data.message || 'Помилка оновлення');
                }
            });

            // Скасування
            editForm.querySelector('.cancel-edit-button').addEventListener('click', () => {
                window.location.reload();
            });
        }
    });
});


