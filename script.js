const SUPABASE_URL = 'https://xrweblfijwzrsoqdzqye.supabase.co';
const SUPABASE_ANON_KEY = 'ey...'; // reemplaza con tu clave real

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const adminPanel = document.getElementById('adminPanel');
const contentForm = document.getElementById('contentForm');
const contentCards = document.getElementById('contentCards');

const sectionIdInput = document.getElementById('sectionId');
const sectionNameInput = document.getElementById('section_name');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const contentInput = document.getElementById('content');
const imageUrlInput = document.getElementById('image_url');
const buttonTextInput = document.getElementById('button_text');
const buttonUrlInput = document.getElementById('button_url');
const orderIndexInput = document.getElementById('order_index');
const isActiveInput = document.getElementById('is_active');
const submitButton = document.getElementById('submitButton');
const cancelButton = document.getElementById('cancelButton');

let editingId = null;

loginButton.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: loginEmail.value,
    password: loginPassword.value,
  });

  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    fetchContentSections();
  }
});

supabaseClient.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    fetchContentSections();
  }
});

async function fetchContentSections() {
  const { data, error } = await supabaseClient
    .from('content_sections')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  contentCards.innerHTML = '';
  data.forEach((section) => {
    const card = document.createElement('div');
    card.className = 'content-card';

    if (section.image_url) {
      const img = document.createElement('img');
      img.src = section.image_url;
      img.alt = section.title;
      card.appendChild(img);
    }

    card.innerHTML += `
      <div class="title">${section.title}</div>
      <div class="subtitle">${section.subtitle || ''}</div>
      <p>${section.content || ''}</p>
      ${section.button_text ? `<a href="${section.button_url}" target="_blank">${section.button_text}</a>` : ''}
    `;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => loadSectionToForm(section);
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteSection(section.id);
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
    contentCards.appendChild(card);
  });
}

function loadSectionToForm(section) {
  editingId = section.id;
  sectionIdInput.value = section.id;
  sectionNameInput.value = section.section_name;
  titleInput.value = section.title;
  subtitleInput.value = section.subtitle;
  contentInput.value = section.content;
  imageUrlInput.value = section.image_url;
  buttonTextInput.value = section.button_text;
  buttonUrlInput.value = section.button_url;
  orderIndexInput.value = section.order_index;
  isActiveInput.checked = section.is_active;
  submitButton.textContent = 'Update Section';
  cancelButton.style.display = 'inline-block';
}

contentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newSection = {
    section_name: sectionNameInput.value,
    title: titleInput.value,
    subtitle: subtitleInput.value,
    content: contentInput.value,
    image_url: imageUrlInput.value,
    button_text: buttonTextInput.value,
    button_url: buttonUrlInput.value,
    order_index: parseInt(orderIndexInput.value),
    is_active: isActiveInput.checked,
  };

  if (editingId) {
    const { error } = await supabaseClient
      .from('content_sections')
      .update(newSection)
      .eq('id', editingId);
    if (error) return alert('Error updating: ' + error.message);
    alert('Updated!');
  } else {
    const { error } = await supabaseClient
      .from('content_sections')
      .insert([newSection]);
    if (error) return alert('Error adding: ' + error.message);
    alert('Added!');
  }

  resetForm();
  fetchContentSections();
});

cancelButton.addEventListener('click', resetForm);

function resetForm() {
  editingId = null;
  contentForm.reset();
  submitButton.textContent = 'Add Section';
  cancelButton.style.display = 'none';
}

async function deleteSection(id) {
  if (!confirm('Are you sure you want to delete this section?')) return;
  const { error } = await supabaseClient.from('content_sections').delete().eq('id', id);
  if (error) return alert('Error deleting: ' + error.message);
  alert('Deleted!');
  fetchContentSections();
}