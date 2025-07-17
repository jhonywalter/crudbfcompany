// Initialize Supabase client
const SUPABASE_URL = 'https://xrweblfijwzrsoqdzqye.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyd2VibGZpand6cnNvcWR6cXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDk4NTMsImV4cCI6MjA2ODI4NTg1M30.lhm1uj1RM9xV8ihy-Ot0uN2te_JmIX6y6zOPPl5KXBg'; // <- reemplaza por tu clave real
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM references
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const adminPanel = document.getElementById('adminPanel');

const contentForm = document.getElementById('contentForm');
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
const contentTableBody = document.querySelector('#contentTable tbody');

let editingId = null;

// LOGIN HANDLING
loginButton?.addEventListener('click', async () => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: loginEmail.value,
        password: loginPassword.value,
    });

    if (error) {
        alert('Error de inicio de sesión: ' + error.message);
    } else {
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        fetchContentSections();
    }
});

// CHECK IF SESSION IS ACTIVE
supabaseClient.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        loginForm.style.display = 'none';
        adminPanel.style.display = 'block';
        fetchContentSections();
    }
});

// FETCH CONTENT SECTIONS
async function fetchContentSections() {
    const { data, error } = await supabaseClient
        .from('content_sections')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching content sections:', error.message);
        return;
    }

    contentTableBody.innerHTML = '';

    data.forEach(section => {
        const row = contentTableBody.insertRow();
        row.setAttribute('data-id', section.id);

        row.insertCell().textContent = section.id;
        row.insertCell().textContent = section.section_name;
        row.insertCell().textContent = section.title;
        row.insertCell().textContent = section.subtitle || '';
        row.insertCell().textContent = section.content || '';

        const imgCell = row.insertCell();
        if (section.image_url) {
            const img = document.createElement('img');
            img.src = section.image_url;
            img.alt = section.title;
            img.style.maxWidth = '100px';
            imgCell.appendChild(img);
        } else {
            imgCell.textContent = '';
        }

        row.insertCell().textContent = section.button_text || '';
        row.insertCell().textContent = section.button_url || '';
        row.insertCell().textContent = section.order_index;
        row.insertCell().textContent = section.is_active ? 'Sí' : 'No';

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => editContentSection(section));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => deleteContentSection(section.id));
        actionsCell.appendChild(deleteButton);
    });
}

// FORM SUBMIT
contentForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

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

        if (error) {
            console.error('Error updating section:', error.message);
        } else {
            alert('Sección actualizada con éxito');
            resetForm();
            fetchContentSections();
        }
    } else {
        const { error } = await supabaseClient
            .from('content_sections')
            .insert([newSection]);

        if (error) {
            console.error('Error adding section:', error.message);
        } else {
            alert('Sección agregada con éxito');
            contentForm.reset();
            fetchContentSections();
        }
    }
});

// EDIT SECTION
function editContentSection(section) {
    editingId = section.id;
    sectionIdInput.value = section.id;
    sectionNameInput.value = section.section_name;
    titleInput.value = section.title;
    subtitleInput.value = section.subtitle || '';
    contentInput.value = section.content || '';
    imageUrlInput.value = section.image_url || '';
    buttonTextInput.value = section.button_text || '';
    buttonUrlInput.value = section.button_url || '';
    orderIndexInput.value = section.order_index;
    isActiveInput.checked = section.is_active;

    submitButton.textContent = 'Actualizar Sección';
    cancelButton.style.display = 'inline-block';
}

// RESET FORM
function resetForm() {
    editingId = null;
    contentForm.reset();
    sectionIdInput.value = '';
    submitButton.textContent = 'Agregar Sección';
    cancelButton.style.display = 'none';
    isActiveInput.checked = true;
}

// CANCEL EDIT
cancelButton?.addEventListener('click', resetForm);

// DELETE SECTION
async function deleteContentSection(id) {
    if (confirm('¿Seguro que deseas eliminar esta sección?')) {
        const { error } = await supabaseClient
            .from('content_sections')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting section:', error.message);
        } else {
            alert('Sección eliminada');
            fetchContentSections();
        }
    }
}
