const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    }
  });

  const form = document.querySelector('.topic');
  form.addEventListener('submit', function (e) {
    const contentInput = document.querySelector('#hidden-topic-content');
    contentInput.value = quill.root.innerHTML;
  });