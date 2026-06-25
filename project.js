const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const totalField = document.getElementById('total');
const hAverageField = document.getElementById('hAverage');
const cAverageField = document.getElementById('cAverage');

function getGrade(score){
    if(score >= 90) return 'A';
    if(score >= 80) return 'B';
    if(score >= 70) return 'C';
    if(score >= 60) return 'D';
    return 'F';
}

function capitalizeName(name){
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function capitalizeCourse(course){
    return course.charAt(0).toUpperCase() + course.slice(1).toLowerCase();
}

function updateStatistics(){
    const rows = tableBody.querySelectorAll('tr:not(#placeholderROW)');
    const total = rows.length;

    if(total === 0){
        totalField.value = 0;
        hAverageField.value = 0;
        cAverageField.value = 0;
        return;
    }

    let scores = [];
    rows.forEach(row => {
        const score = parseFloat(row.dataset.score);
        if(!isNaN(score)) scores.push(score);
    });

    totalField.value = total;
    hAverageField.value = Math.max(...scores).toFixed(1);
    cAverageField.value = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
}

function addStudent(e){
    e.preventDefault();

    const sID = document.getElementById('sID').value.trim();
    const sName = capitalizeName(document.getElementById('sName').value.trim());
    const cName = capitalizeCourse(document.getElementById('cName').value.trim());
    const ass = document.getElementById('ass').value.trim();
    const eScore = parseFloat(document.getElementById('eScore').value);

    if(!sID || !sName || !cName || !ass || isNaN(eScore)){
        alert('Please fill in all fields correctly.');
        return;
    }

    if(eScore < 0 || eScore > 100){
        alert('Exam score must be between 0 and 100.');
        return;
    }

    const placeholder = document.getElementById('placeholderROW');
    if(placeholder) placeholder.remove();

    const row = document.createElement('tr');
    row.dataset.score = eScore;
    row.dataset.name = sName.toLowerCase();

    row.innerHTML = `
        <td>${sID}</td>
        <td>${sName}</td>
        <td>${cName}</td>
        <td>${eScore}</td>
        <td>${getGrade(eScore)}</td>
        <td><button class="deleteBtn" onclick="deleteRow(this)">🗑 Delete</button></td>
    `;

    tableBody.appendChild(row);
    updateStatistics();
    saveData();
    clearForm();
}

function deleteRow(button){
    button.closest('tr').remove();

    if(tableBody.querySelectorAll('tr').length === 0){
        const placeholder = document.createElement('tr');
        placeholder.id = 'placeholderROW';
        placeholder.innerHTML = `<td colspan="6">No students added yet</td>`;
        tableBody.appendChild(placeholder);
    }

    updateStatistics();
    saveData();
}

function clearForm(){
    document.getElementById('sID').value = '';
    document.getElementById('sName').value = '';
    document.getElementById('cName').value = '';
    document.getElementById('ass').value = '';
    document.getElementById('eScore').value = '';
}

function searchStudent(){
    const query = searchInput.value.toLowerCase().trim();
    const rows = tableBody.querySelectorAll('tr:not(#placeholderROW)');

    rows.forEach(row => {
        row.style.display = row.dataset.name.includes(query) ? '' : 'none';
    });
}

function saveData(){
    let students = [];
    const rows = tableBody.querySelectorAll('tr:not(#placeholderROW)');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        students.push({
            id: cells[0].innerText,
            studentName: cells[1].innerText,
            course: cells[2].innerText,
            score: cells[3].innerText,
            grade: cells[4].innerText
        });
    });

    fetch('http://localhost:5000/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(students)
    });
}

function exportData(e){
    e.preventDefault();
    e.stopPropagation();

    let students = [];
    const rows = tableBody.querySelectorAll('tr:not(#placeholderROW)');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        students.push({
            id: cells[0].innerText,
            studentName: cells[1].innerText,
            course: cells[2].innerText,
            score: cells[3].innerText,
            grade: cells[4].innerText
        });
    });

    fetch('http://localhost:5000/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(students)
    });
}

function loadData(){
    fetch('http://localhost:5000/load', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(students => {
        if(students.length === 0) return;
        const placeholder = document.getElementById('placeholderROW');
        if(placeholder) placeholder.remove();
        students.forEach(student => {
            const row = document.createElement("tr");
            row.dataset.score = student.score;
            row.dataset.name = student.studentName.toLowerCase();

            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.studentName}</td>
                <td>${student.course}</td>
                <td>${student.score}</td>
                <td>${student.grade}</td>
                <td><button class="deleteBtn" onclick="deleteRow(this)">🗑 Delete</button></td>
            `;

            tableBody.appendChild(row);
        });
        updateStatistics();
    });
}

document.getElementById('form').addEventListener('submit', function(e){
    e.preventDefault();
});

const export_Btn = document.getElementById('exportBtn');
export_Btn.addEventListener('click', exportData);

document.getElementById('addBtn').addEventListener('click', addStudent);
document.getElementById('clearBtn').addEventListener('click', clearForm);
searchInput.addEventListener('input', searchStudent);

loadData();