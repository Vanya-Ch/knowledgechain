document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Отримуємо поточного користувача
        const res = await fetch('/api/user/current', {
            credentials: 'include'
        });

        if (!res.ok) return;

        const user = await res.json();

        if (!user?.likedTopics || !Array.isArray(user.likedTopics)) return;

        // Для кожної кнопки лайку перевіряємо чи лайкнута
        document.querySelectorAll('.card__like').forEach(button => {
            const card = button.closest('.card-link');
            const topicId = card?.dataset.topicId;

            if (user.likedTopics.includes(topicId)) {
                button.classList.add('liked');

                // Оновлюємо колір серця
                const svg = button.querySelector('svg');
                if (svg) svg.setAttribute('fill', '#f00');
            }
        });
    } catch (err) {
        console.error('Failed to mark liked topics:', err);
    }
});
