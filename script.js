// Initialize Supabase client
const SUPABASE_URL = 'https://xrweblfijwzrsoqdzqye.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyd2VibGZpand6cnNvcWR6cXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDk4NTMsImV4cCI6MjA2ODI4NTg1M30.lhm1uj1RM9xV8ihy-Ot0uN2te_JmIX6y6zOPPl5KXBg';
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get DOM elements
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

let editingId = null; // To keep track of the section being edited

// Function to fetch and display content sections
async function fetchContentSections() {
    const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching content sections:', error.message);
        return;
    }

    contentTableBody.innerHTML = ''; // Clear existing rows
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
            imgCell.appendChild(img);
        } else {
            imgCell.textContent = '';
        }
        row.insertCell().textContent = section.button_text || '';
        row.insertCell().textContent = section.button_url || '';
        row.insertCell().textContent = section.order_index;
        row.insertCell().textContent = section.is_active ? 'Yes' : 'No';

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit');
        editButton.addEventListener('click', () => editContentSection(section));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete');
        deleteButton.addEventListener('click', () => deleteContentSection(section.id));
        actionsCell.appendChild(deleteButton);
    });
}

// Function to handle form submission (Add/Update)
contentForm.addEventListener('submit', async (event) => {
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
        // Update existing section
        const { error } = await supabase
            .from('content_sections')
            .update(newSection)
            .eq('id', editingId);

        if (error) {
            console.error('Error updating content section:', error.message);
        } else {
            alert('Content section updated successfully!');
            resetForm();
            fetchContentSections();
        }
    } else {
        // Add new section
        const { error } = await supabase
            .from('content_sections')
            .insert([newSection]);

        if (error) {
            console.error('Error adding content section:', error.message);
        } else {
            alert('Content section added successfully!');
            contentForm.reset();
            fetchContentSections();
        }
    }
});

// Function to populate form for editing
function editContentSection(section) {
    editingId = section.id;
    sectionIdInput.value = section.id; // Store ID in hidden input for reference if needed
    sectionNameInput.value = section.section_name;
    titleInput.value = section.title;
    subtitleInput.value = section.subtitle || '';
    contentInput.value = section.content || '';
    imageUrlInput.value = section.image_url || '';
    buttonTextInput.value = section.button_text || '';
    buttonUrlInput.value = section.button_url || '';
    orderIndexInput.value = section.order_index;
    isActiveInput.checked = section.is_active;

    submitButton.textContent = 'Update Section';
    cancelButton.style.display = 'inline-block';
}

// Function to reset the form
function resetForm() {
    editingId = null;
    contentForm.reset();
    sectionIdInput.value = '';
    submitButton.textContent = 'Add Section';
    cancelButton.style.display = 'none';
    isActiveInput.checked = true; // Default to active
}

// Cancel button functionality
cancelButton.addEventListener('click', resetForm);

// Function to delete a content section
async function deleteContentSection(id) {
    if (confirm('Are you sure you want to delete this content section?')) {
        const { error } = await supabase
            .from('content_sections')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting content section:', error.message);
        } else {
            alert('Content section deleted successfully!');
            fetchContentSections(); // Refresh the table
        }
    }
}

// Initial fetch when the page loads
document.addEventListener('DOMContentLoaded', fetchContentSections);
