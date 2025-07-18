// Initialize Supabase client
const SUPABASE_URL = 'https://xrweblfijwzrsoqdzqye.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyd2VibGZpand6cnNvcWR6cXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDk4NTMsImV4cCI6MjA2ODI4NTg1M30.lhm1uj1RM9xV8ihy-Ot0uN2te_JmIX6y6zOPPl5KXBg';
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
const contentCardsContainer = document.getElementById('contentCards');

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

// FETCH AND DISPLAY CONTENT SECTIONS AS CARDS
async function fetchContentSections() {
    const { data, error } = await supabaseClient
        .from('content_sections')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error al obtener las secciones de contenido:', error.message);
        return;
    }

    contentCardsContainer.innerHTML = '';

    data.forEach(section => {
        const card = document.createElement('div');
        card.classList.add('content-card');
        card.setAttribute('data-id', section.id);

        card.innerHTML = `
            ${section.image_url ? `<img src="${section.image_url}" alt="${section.title}">` : ''}
            <div class="title">${section.title}</div>
            <div class="subtitle">${section.subtitle || ''}</div>
            <div class="content">${section.content || ''}</div>
            <div class="info">
                <strong>Nombre de la Sección:</strong> ${section.section_name}<br>
                <strong>Orden:</strong> ${section.order_index} | <strong>Activo:</strong> ${section.is_active ? 'Sí' : 'No'}
            </div>
            <div class="actions">
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Eliminar</button>
            </div>
        `;

        card.querySelector('.edit-btn').addEventListener('click', () => {
            editContentSection(section);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        card.querySelector('.delete-btn').addEventListener('click', () => deleteContentSection(section.id));

        contentCardsContainer.appendChild(card);
    });
}

// FORM SUBMIT
contentForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const sectionData = {
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

    let error;
    if (editingId) {
        const { error: updateError } = await supabaseClient
            .from('content_sections')
            .update(sectionData)
            .eq('id', editingId);
        error = updateError;
    } else {
        const { error: insertError } = await supabaseClient
            .from('content_sections')
            .insert([sectionData]);
        error = insertError;
    }

    if (error) {
        console.error('Error al guardar la sección:', error.message);
        alert('Error al guardar la sección: ' + error.message);
    } else {
        alert(`Sección ${editingId ? 'actualizada' : 'agregada'} con éxito`);
        resetForm();
        fetchContentSections();
    }
});

// EDIT SECTION: Populate form with section data
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
    if (confirm('¿Seguro que deseas eliminar esta sección? Esta acción no se puede deshacer.')) {
        const { error } = await supabaseClient
            .from('content_sections')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar la sección:', error.message);
            alert('Error al eliminar la sección: ' + error.message);
        } else {
            alert('Sección eliminada con éxito');
            fetchContentSections();
        }
    }
}
