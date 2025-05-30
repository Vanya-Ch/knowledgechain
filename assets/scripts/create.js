const fileInput = document.getElementById('topic-image');
const fileNameDisplay = document.querySelector('[data-js-filename]');

const tagInput = document.getElementById('topic-tags');
const tagify = new Tagify(tagInput);

fetch('/api/tags')
  .then(res => res.json())
  .then(tags => tagify.settings.whitelist = tags);



fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  fileNameDisplay.textContent = file ? file.name : '';
});

document.querySelector('.topic')?.addEventListener('submit', async (e) => {
  e.preventDefault();


  const title = document.querySelector('[data-js-topic-title]').value.trim();
  const text = document.querySelector('[data-js-topic-text]').value.trim();
  const imageInput = document.getElementById('topic-image');
  const needHelp = document.querySelector('.topic__checkbox-button').checked;
  const tags = tagify.value.map(tag => tag.value);

  const formData = new FormData();
  formData.append('title', title);
  formData.append('text', text);
  formData.append('needHelp', needHelp);
  formData.append('tags', JSON.stringify(tags));

  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const res = await fetch('/api/topics', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      alert('Topic created!');
      window.location.reload();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error('Topic creation failed', err);
  }


});