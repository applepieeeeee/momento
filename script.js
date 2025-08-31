/* vars */
const LOCAL_STORAGE_KEY = 'momentoCapsules';
let capsules = [];
let currentSelectedCapsuleId = null; // that is, year/month/day of selected
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const monthNames = ["january", "february", "march", "april", "may", 
                    "june", "july", "august", "september", "october",
                    "november", "december"];


/* unique id to store items*/
function generateID(){
    return 'xxxxxxxx-xxxx-4xxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/* all date function lol*/ 
function parseDate(date){
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function formatDateId(date){
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// find if date alr has a capsule
function getCapsuleForDate(date){
    const dateId = formatDateId(date);
    return capsules.find(capsule => capsule.id === dateId);
}

// load all capsule when the page loads
function loadCapsules(){
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if(stored){
        capsules = JSON.parse(stored);
    } else {
        capsules = [];
    }
}

function saveCapsules(){
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(capsules));
}

/* goals:  
update the date display
calc start + end dates
creates div elements for each day
check if capsule exists for each day
*/


function renderCalendar(){
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();

    const currMonthName = monthNames[currentMonth];
    document.querySelector('.current-month').textContent = `${currMonthName} ${currentYear}`;

    for (let i = 0; i < firstDay; i++){
        const empty = document.createElement('div');
        empty.classList.add('calendar-day-cell', 'dimmed');
        calendarGrid.appendChild(empty);
    }

    for (let day = 1; day < daysInMonth; day++){
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day-cell');
        dayCell.textContent = day;

        const dateId = formatDateId(new Date(currentYear, currentMonth, day));
        if (capsules.some(capsule => capsule.id === dateId)){
            dayCell.classList.add('has-capsule');
        }

        if (dateId === currentSelectedCapsuleId){
            dayCell.classList.add('selected-day');
        }

        dayCell.addEventListener('click', () => {
            currentSelectedCapsuleId = dateId;
            renderCalendar();
            renderSelectedCapsule();
        });
        
        calendarGrid.appendChild(dayCell);
    }
}

function clearSelectedDay(){
    const dayCells = document.querySelectorAll('.calendar-day-cell');
    dayCells.forEach(cell => cell.classList.remove('selected-day'));
}

function renderSelectedCapsule(){
    const capsuleContentDiv = document.getElementById('capsule-content');
    const capsuleHeaderDate = document.getElementById('capsule-header-date');
    const addBtn = document.getElementById('add-new-capsule-btn');

    capsuleContentDiv.innerHTML = '';

    const selectedDate = new Date(currentSelectedCapsuleId);
    if (isNaN(selectedDate.getTime())){
        capsuleHeaderDate.textContent = 'select a date';
        capsuleContentDiv.classList.add('empty-state');
        capsuleContentDiv.innerHTML = '<p class = "placeholder"> select a date to view or create a capsule. </p>';
        
        addBtn.style.display = 'none';
        return;
    }

    capsuleHeaderDate.textContent = parseDate(selectedDate);
    addBtn.style.display = 'block';

    const capsule = getCapsuleForDate(selectedDate);
    if (capsule && capsule.items && capsule.items.length > 0){
        capsuleContentDiv.classList.remove('empty-state');
        capsule.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('capsule-item');
            itemDiv.dataset.itemId = item.id;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', () => deleteItem(capsule.id, item.id));

            let itemContent = '';
            
            if (item.type === 'note'){
                itemContent = `
                    <h4> note </h4>
                    <p class = "note-text"> ${item.text} </p>
                `;

                const editBtn = document.createElement('button');
                editBtn.classList.add('edit-btn');
                editBtn.innerHTML = '<i class = "fas fa-edit"></i>';

                editBtn.style.position = 'absolute';
                editBtn.style.top = '10px';
                editBtn.style.right = '40px';
                editBtn.style.background = 'none';
                editBtn.style.border = 'none';
                editBtn.style.fontSize = '18px';
                editBtn.style.cursor = 'url("assets/cursor.ico")';
                editBtn.style.color = 'var(--navy)';

                editBtn.addEventListener('click', () => editNote(item.id, item.text));
                itemDiv.appendChild(editBtn);

            } else if (item.type === 'memory'){
                itemContent = `
                    <h4>memory</h4>
                    <p>${item.description}</p>
                    
                    ${item.url ?`
                        <${item.mediaType === 'video' ? 'video controls' : 'img'}
                            src = "${item.url}"
                            class = "capsule-item-image"
                            alt = "${item.description}">
                        </${item.mediaType === 'video' ? 'video' : 'img'}>
                    ` : ''}
                `;
            } else if (item.type === 'music'){
                itemContent =  `
                    <h4> music </h4>
                    <p> ${item.title} </p>
                    <a href = "${item.url}" target = "_blank" class = "capsule-item-music-link">listen here</a>
                `;
            } else if (item.type === 'file'){
                let fileContent = '';
                
                if (item.mimeType.startsWith('image/')){
                    fileContent = `<img src = "${item.data}" alt = ${item.description}" class = "capsule-item-image">`;
                } else if (item.mimeType.startsWith('audio/')){
                    fileContent = `<audio controls src = "${item.data}" class = "capsule-item-audio"></audio>`;
                } else {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = item.data;
                    downloadLink.download = item.fileName;
                    downloadLink.innerHTML = '<i class = "fas fa-download"></i> ${item.fileName}';

                    itemContent =  `
                        <h4> file </h4>
                        <p>${item.description || 'no description'}<p>
                        <div class = "capsule-item-file"></div>
                    `;
                    itemDiv.innerHTML = itemContent;
                    itemDiv.querySelector('.capsule-item-file').appendChild(downloadLink);
                }

                if (fileContent){
                    itemContent = `
                        <h4> file </h4>
                        <p> ${item.description || 'no description'}</p>
                        ${fileContent}
                    `;
                }
            }

            if (item.type !== 'file' || !item.data){
                itemDiv.innerHTML = itemContent;
            }
            
            itemDiv.appendChild(deleteBtn);
            capsuleContentDiv.appendChild(itemDiv);
        });
    } else {
        capsuleContentDiv.classList.add('empty-state');
        capsuleContentDiv.innerHTML = '';
    }
}


function editNote(itemId, currentText){
    const modal = document.getElementById('edit-note-modal');
    const textarea = document.getElementById('edit-note-text-input');
    const form = document.getElementById('edit-note-form-element');

    textarea.value = currentText;
    modal.style.display = 'flex';

    form.onsubmit = (e) => {
        e.preventDefault();
        const updated = textarea.value.trim();
        if (updated){
            const capsule = getCapsuleForDate(new Date(currentSelectedCapsuleId));
            if (capsule){
                const newI = capsule.items.find(item => item.id === itemId);
                if (newI){
                    newI.text = updated;
                    saveCapsules();
                    renderSelectedCapsule();
                }
            }
        }
        modal.style.display = 'none';
    };
}

document.getElementById('close-edit-modal-btn').addEventListener('click', () => {
    document.getElementById('edit-note-modal').style.display = 'none';
});


function deleteItem(capsuleId, itemId){
    const capsuleIndex = capsules.findIndex(capsule => capsule.id === capsuleId);

    if (capsuleIndex > -1){
        const iIndex = capsules[capsuleIndex].items.findIndex(item => item.id === itemId);
        if (iIndex > -1){
            capsules[capsuleIndex].items.splice(iIndex, 1);

            if (capsules[capsuleIndex].items.length === 0){
                capsules.splice(capsuleIndex, 1);
            }
            renderCalendar();
            renderSelectedCapsule();
            saveCapsules();
        }
    }
}

function showModal(){
    document.getElementById('item-modal').style.display = 'flex';
    document.getElementById('add-item-form').reset();
    document.querySelectorAll('.item-form-group').forEach(
        group => group.style.display = 'none'
    );
    document.getElementById('note-form').style.display = 'flex';

    document.querySelectorAll(
        '.item-type-selector button'
    ).forEach(btn => btn.classList.remove('selected'));
    document.querySelector('.item-type-selector button[data-type="note"]').classList.add('selected');
}

function hideModal(){
    document.getElementById('item-modal').style.display = 'none';
}

document.querySelectorAll('.item-type-selector button').forEach(button => {
    button.addEventListener('click', (e) => {
        const selecttype = e.target.dataset.type;

        document.querySelectorAll('.item-type-selector button').forEach(
            btn => btn.classList.remove('selected')
        );
        e.target.classList.add('selected');

        document.querySelectorAll('.item-form-group').forEach(grou => {
            group.style.display = 'none';
        });
        document.getElementById(`${selecttype}-form`).style.display = 'flex';
    });
});

document.getElementById('add-new-capsule-btn').addEventListener('click', showModal);

document.getElementById('add-item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const popcorn = document.querySelector('.item-type-selector button.selected').dataset.type;

    let newItem = { id: generateID(), type: active};

    if (popcorn === 'note'){
        const noteText = document.getElementById('note-text-input').value.trim();
        if (!noteText) return;
        newItem.text = noteText;
    } else if (popcorn === 'memory'){
        newItem.url = document.getElementById('memory-image-input').value.trim();
        newItem.description = document.getElementById('memory-description-input').value.trim();
        if(!newItem.url) return;
    } else if (popcorn === 'music'){
        newItem.url = document.getElementById('music-link-input').value.trim();
        newItem.title = document.getElementById('music-title-input').value.trim();
        if (!newItem.url) return;
    } else if (popcorn === 'file'){
        const fileInput = document.getElementById('file-upload-input');
        const fileLink = document.getElementById('file-link-input').value.trim();
        const fileTitle = document.getElementById('file-title-input').value.trim();
        const file = fileInput.files[0];

        if(!file && !fileLink) return;

        if (file){
            const reader = new FileReader();
            reader.onload = function(event){
                newItem.data = event.target.result;
                newItem.fileName = file.name;
                newItem.mimeType = file.type;
                newItem.description = fileTitle;

                let existing = getCapsuleForDate(new Date(currentSelectedCapsuleId));
                if (!existing)
                    existing = { id: currentSelectedCapsuleId, items: []};
                    capsules.push(existing);
                }
                existing.item.push(newItem);

                saveCapsules();
                renderCalendar();
                renderSelectedCapsule();
                hideModal();
                form.reset();
            };
            reader.readAsDataURL(file);
            return;
        } else if (fileLink){
            newItem.data = fileLink;
            newItem.fileName = fileTitle || 'File Link';
            newItem.mimeType = 'link';
            newItem.description = fileTitle;
        }

    if (newItem.type !== 'file' || newItem.data){
        let existing = getCapsuleForDate(new Date(currentSelectedCapsuleId));
        if (!existing) {
            existing = { id: currentSelectedCapsuleId, items: []};
            capsules.push(existing);
        }
        existing.items.push(newItem);
        saveCapsules();
        renderCalendar();
        renderSelectedCapsule();
        hideModal();
        form.reset();
    }
});

/* update calendar when buttons press */
document.getElementById('prev-month-btn').addEventListener('click', () => {
    currentMonth--;
    if(currentMonth < 0){
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
    clearSelectedDay();
    currentSelectedCapsuleId = null;
    renderSelectedCapsule();
});

document.getElementById('next-month-btn').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11){
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
    clearSelectedDay();
    currentSelectedCapsuleId = null;
    renderSelectedCapsule();
});

document.getElementById('search-bar').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    if (searchTerm === ''){
        renderCalendar();
        renderSelectedCapsule();
        return;
    }

    const filteredCaps = capsules.filter(capsule => 
        capsule.id.includes(term) ||
        capsule.items.some(item =>
            (item.type === 'note' && item.text.toLowerCase().includes(term)) || 
            (item.type === 'memory' && item.description.toLowerCase().includes(term)) ||
            (item.type === 'file' && (item.description.toLowerCase().includes(term) || (item.fileName && item.fileName.toLowerCase().includes(term)) )) ||
            (item.type === 'music' && item.title.toLowerCase().includes(term) ) ||
            (item.type === 'music' && item.url.toLowerCase().include(term))
        )
    );

    const foundIds = filteredCaps.map(c => c.id);
    const firstFoundId = foundIds.length > 0 ? foundIds[0] : null;

    const dayCells = document.querySelectorAll('.calendar-day-cell');
    dayCells.forEach(cell => {
        const cellDate = new Date(currentYear, currentMonth, parseInt(cell.textContent));
        const dateId = formatDateId(cellDate);
        cell.classList.remove('has-capsule', 'selected-day');

        if (foundIds.includes(dateId)) cell.classList.add('has-capsule');
    })

    if (firstFoundId){
        renderCalendar();
        renderSelectedCapsule();
    } else {
        const capdiv = document.getElementById('capsule-content');
        capdiv.innerHTML = '<p class = "placeholder"> no capsules found :( </p>';

        const dayCells = document.querySelectorAll('.calendar-day-cell');
        dayCells.forEach(cell => cell.classList.remove('selected-day'));
        currentSelectedCapsuleId = null;
    }
})

document.getElementById('close-modal-btn').addEventListener('click', hideModal);
document.getElementById('item-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
});

// on load //
document.addEventListener('DOMContentLoaded', () => {
    loadCapsules();
    renderCalendar();

    if (capsules.length > 0){
        currentSelectedCapsuleId = capsules[0].id;
        renderCalendar();
        renderSelectedCapsule();
    } else {
        const capsuleContentDiv = document.getElementById('capsule-content');
        const capsuleHeaderDate = document.getElementById('capsule-header-date');
        const addBtn = document.getElementById('add-new-capsule-btn');

        capsuleContentDiv.classList.add('empty-state');
        capsuleContentDiv.innerHTML = '<p class="placeholder"> select a date to view or create a capsule</p>';
        capsuleHeaderDate.textContent = 'select a date';
        addBtn.style.display = 'none';
    }
});