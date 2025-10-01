const API  = 'http://localhost:3005';
document.getElementById('apiUrl').textContent = API;

//elements
const listEl = document.getElementById('list');
const refreshBtn = document.getElementById('refreshBtn');
const newBtn = document.getElementById('newBtn');
const studentForm = document.getElementById('studentForm');
const formTitle = document.getElementById('formTitle');
const studentIdEl = document.getElementById('studentId');
const nameEl = document.getElementById('name');
const ageEl = document. getElementById('age');
const gradeEl = document.getElementById('grade' );
const statusEl = document.getElementById('status');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');


//utility show status
function setStatus(msg, isError=false){
    statusEl.textContent = msg || '';
    statusEl.style.color = isError ? 'red' : 'green';
}
//load list 
async function loadStudents(){
    setStatus('Loading students...');
    try {
        const res = await fetch(API + '/students');
        if(!res.ok) throw new Error ('Failed to fetch stufents ' + res.status);
        const students = await res.json();
        renderList(students);
        setStatus('Loaded' + students.length + ' students.');
        } catch (err) {
        setStatus('Error loading students' + err.message, true);
    }
}

//render list
function renderList(students){
    listEl.innerHTML = '';
    if(!students || students.length === 0){
        listEl.innerHTML = '<div class="muted" style="padding:12px">No students found.</div>';
        return;
    }

    students.forEach(s => {
        const row = document.createElement('div');
        row.className = 'list-row';

        const left = document.createElement('div');
        left.innerHTML = `<strong>${s.name}</strong> ( ${s.age} ) - ${s.grade}`;

        const right = document.createElement('div');
        right.className = 'controls';

        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.onclick = () => {
            loadStudent(s._id);
        };

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
            editStudents(s);
        };

        right.appendChild(viewBtn);
        right.appendChild(editBtn);

        row.appendChild(left);
        row.appendChild(right);
        listEl.appendChild(row);
    });
}

//load single student
async function loadStudent(id){
    setStatus('Loading student...');
    try {
        const res = await fetch(API + '/students/' + encodeURIComponent(id));
        if(res.status === 404) return setStatus('Student not found', true);
        if(!res.ok) return setStatus('Error loading student: ' + res.status, true);
        const s = await res.json();
    fillForm(s);
    setStatus('Student loaded.');
    } catch (err) {
        console.error(err);
        setStatus('Error loading student: ' + err.message, true);
    }
    
}
//fill the form with student for editing/viewing
function fillForm(student){
    studentIdEl.value = student._id || '';
    nameEl.value = student.name || '';
    ageEl.value = student.age || '';
    gradeEl.value = student.grade || '';
    formTitle.textContent = student._id ? 'Edit Student' : 'New Student';
    deleteBtn.classList.remove('hidden');
};

//prepare editing existing student 
function editStudents(student){
    fillForm(student);
    window.scrollTo({top:0,behavior:'smooth'});
}

//clear form for new student
function clearForm(){
    studentIdEl.value = '';
    nameEl.value = '';
    ageEl.value = '';
    gradeEl.value = '';
    formTitle.textContent = 'Create New Student';
    deleteBtn.classList.add('hidden');
}

//submit form (create or update)
studentForm.onsubmit = async (e) => {
    e.preventDefault();

    const id = studentIdEl.value;
    const studentData = {
        name: nameEl.value.trim(),
        age: ageEl.value ? Number(ageEl.value) : null,
        grade: gradeEl.value
    };

    try {
        if(id){
            setStatus('Updating student...');
            const res = await fetch(API + '/students/' + encodeURIComponent(id), {  
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(studentData)
            });
            if(res.status === 404) return setStatus('Student not found', true);
            if(!res.ok) throw new Error('Failed to update student: ' + res.status);
            await res.json(); 
            setStatus('Student updated successfully.');
    }else{
        setStatus('Creating student...');
        const res = await fetch(API + '/students', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(studentData)
        });
        if(!res.ok) throw new Error('Failed to create student: ' + res.status);
        await res.json();
        setStatus('Student created successfully.');
    }
    await loadStudents();
    clearForm();
    } catch (error) {
        console.error(error);
        setStatus('Error: ' + error.message, true);
    }
};

//delete student
deleteBtn.onclick = async () => {
    const id = studentIdEl.value;
    if(!id) return;

    if(!confirm('Are you sure you want to delete this student?')) return;

    try {
        setStatus('Deleting student...');
        const res = await fetch(API + '/students/' + encodeURIComponent(id), {
            method: 'DELETE'
        });
        if(res.status === 404) return setStatus('Student not found', true);
        if(!res.ok) throw new Error('Failed to delete student: ' + res.status);
        await res.json();
        setStatus('Student deleted successfully.');
        clearForm();
        await loadStudents();
    } catch (error) {
        console.error(error);
        setStatus('Error: ' + error.message, true);
    }
};

// buttons
refreshBtn.onclick = loadStudents;
newBtn.onclick = () => {
    clearForm();
    setStatus('Ready to create a new student.');
    window.scrollTo({top:0, behavior:'smooth'});
};
cancelBtn.onclick = () => {
    clearForm();
    setStatus('Form cleared.');
};
//initial load
loadStudents();