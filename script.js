
/* hi there */

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

function normalizeDateToDay(date){
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d;
}

/* local storage 4 capsules */
function loadCapsules(){
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    capsules = data ? JSON.parse(data) : [];
    capsules.sort((a,b) => b.id.localeCompare(a.id));
}

function saveCapsules(){
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(capsules));
}

/*
goalssss: 
update the date display
calc start + end dates
creates div elements for each day
check if capsule exists for each day
*/


function renderCalendar(){
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    document.getElementById('current-month-year').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1);

    let startDayIndex = firstDay.getDay();

    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - startDayIndex);
 
    for (let i = 0; i < 42; i++){
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);

        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day-cell');

        if (day.getMonth() != currentMonth){
            dayCell.classList.add('dimmed');
        } else {
            dayCell.onclick = () => handleDayClick(day.getTime());
        }

        dayCell.textContent = day.getDate();

        const currId = formatDateId(normalizeDateToDay(day));
        const hasCapsule = capsules.some(c => c.id === currId);

        if (hasCapsule && day.getMonth() === currentMonth){
            dayCell.classList.add('has-capsule');
        }

        if (currentSelectedCapsuleId == currId && day.getMonth() == currentMonth){
            dayCell.classList.add('selected-day');
            dayCell.classList.remove('has-capsule');
        }

        calendarGrid.appendChild(dayCell);
    }
}

function handleDayClick(timestamp){
    const clickedDate = new Date(timestamp);
    const normalizedClickedDate = normalizeDateToDay(clickedDate);
    
    currentSelectedCapsuleId = formatDateId(normalizedClickedDate);
    renderCalendar();
    renderSelectedCapsule();
}

/* update calendar when buttons press */
document.getElementById('prev-month-btn').addEventListener('click', () => {
    currentMonth--;
    if(currentMonth < 0){
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

document.getElementById('next-month-btn').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11){
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

function selectCapsule(capsuleId){
    currentSelectedCapsuleId = capsuleId;
    renderCalendar();
    renderSelectedCapsule();
}

function renderSelectedCapsule(){
    const capsuleContentDiv = document.getElementById('capsule-content');
    capsuleContentDiv.innerHTML = '';
    
    const selectedCapsule = capsules.find(c => c.id === currentSelectedCapsuleId);
    const currentSelectedDate = normalizeDateToDay(new Date(currentSelectedCapsuleId));

    if (!selectedCapsule){
        capsuleContentDiv.innerHTML = `
            <div class="create-capsule-button-wrapper">
                <p>no capsule found for ${parseDate(currentSelectedDate)}.</p>
                <button id="create-capsule-for-day-btn" class="create-capsule-button">
                    + create a capsule for this day
               </button>
            </div>
        `;

        document.getElementById('create-capsule-for-day-btn').addEventListener('click', () => {
            createCapsule(currentSelectedCapsuleId);
        });
        return;
    }

    const headerHtml = `
        <div class="capsule-header">
            <h2>capsule for ${parseDate(currentSelectedDate)}</h2>
            <p>capsule id: ${selectedCapsule.id}</p>
        </div>
    `;  

    capsuleContentDiv.insertAdjacentHTML('beforeend', headerHtml);

    capsuleContentDiv.insertAdjacentHTML('beforeend', renderSection('notes', selectedCapsule.notes));
    capsuleContentDiv.insertAdjacentHTML('beforeend', renderSection('memories', selectedCapsule.memories));
    capsuleContentDiv.insertAdjacentHTML('beforeend', renderSection('filesLinks', selectedCapsule.filesLinks));
    capsuleContentDiv.insertAdjacentHTML('beforeend', renderSection('music', selectedCapsule.music));

    capsuleContentDiv.insertAdjacentHTML('beforeend', `
        <div class = "add-item-to-capsule-button-wrapper">
            <button id = "add-new-item-btn" class = "add-new-item-button">
                + add new item 
            </button>
        </div>        
    `);
    document.getElementById('add-new-item-btn').addEventListener('click', showModal);
}

function initializeModalItemForm(){
    const form = document.getElementById('add-item-form');
    const itemTypeSelect = document.getElementById('item-type-select');
    const noteForm = document.getElementById('note-form');
    const fileForm = document.getElementById('file-form');
    const memoryForm = document.getElementById('memory-form');
    const musicForm = document.getElementById('music-form');

    itemTypeSelect.addEventListener('change', (e) => {
        noteForm.style.display = 'none';
        fileForm.style.display = 'none';
        memoryForm.style.display = 'none';
        musicForm.style.display = 'none';

        switch (e.target.value) {
            case 'note':
                noteForm.style.display = 'block';
                break;
            case 'file':
                fileForm.style.display = 'block';
                break;
            case 'memory':
                memoryForm.style.display = 'block';
                break;
            case 'music':
                musicForm.style.display = 'block';
                break;
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = itemTypeSelect.value;
        let data = {};

        switch(type){
            case 'note':
                const noteContent = document.getElementById('note-text-input').value.trim();
                if (noteContent) {
                    data.content = noteContent;
                    addItemToCapsule(type, data);
                }
                break;
            case 'file':
                const fileLink = document.getElementById('file-link-input').value.trim();
                const fileTitle = document.getElementById('file-title-input').value.trim() || 'untitled file :(';

                if (fileLink) {
                    data.url = fileLink;
                    data.title = fileTitle;
                    addItemToCapsule(type, data);
                }
                break;
            case 'memory':
                const memoryUrl = document.getElementById('memory-image-input').value.trim();
                const memoryDesc = document.getElementById('memory-description-input').value.trim() || 'no description yet :(';
                
                if (memoryUrl) {
                    data.url = memoryUrl;
                    data.description = memoryDesc;
                    addItemToCapsule(type, data);
                }
                break;
            case 'music':
                const musicUrl = document.getElementById('music-link-input').value.trim();
                const musicTitle = document.getElementById('music-title-input').value.trim() || 'untitled track :(';
                if (musicUrl) {
                    data.url = musicUrl;
                    data.title = musicTitle;
                    addItemToCapsule(type, data);
                }
                break;
        }
        hideModal(); //after u submit
    });
}

function renderSection(sectionName, items){
    const sectionTitleMap = {
        notes: 'notes',
        memories: 'memories',
        filesLinks: 'files & links',
        music: 'music'
    }

    const hasItems = items && items.length > 0;

    const itemsHtml = hasItems ? items.map(item => {

        const deleteBtnHtml = `<button class="action-button delete-btn" onclick="deleteItem('${currentSelectedCapsuleId}', 
                                '${sectionName}', '${item.id}')"><i class="fas fa-trash"></i></button>`;

        const editBtnHtml = `<button class="action-button edit-btn" onclick="editItem('${currentSelectedCapsuleId}', 
                                '${sectionName}', '${item.id}')"><i class="fas fa-edit"></i></button>`;
        
        let itemContentHtml = '';
        switch(sectionName){
            case 'notes':
                itemContentHtml = `<div class = "note-card item-card"><h4>note</h4><p>${item.content}</p><div class = "note-action">${editBtnHtml}${deleteBtnHtml}</div></div>`;
                break;
            case 'filesLinks':
                itemContentHtml = `<div class="item-card file-link-item"><span><a href = "${item.url}" target="_blank">${item.title}</a></span>${deleteBtnHtml}</div>`;
                break;
            case 'memories':
                const placeholderUrl = "https://placehold.co/150x150/bdb7b0/ffffff?text=Image";
                itemContentHtml = `<div class="memory-item item-card"><img src="${item.url}" alt="${item.description}" onerror="this.src='${placeholderUrl}'"> <p>${item.description}</p> ${deleteBtnHtml}</div>`;
                break;
            case 'music':
                itemContentHtml = `<div class='item-card music-item'><span>${item.title}</span><audio controls src="${item.url}"></audio>${deleteBtnHtml}</div>`;
                break;
            default:
                itemContentHtml = '';
                break;
        }
        return itemContentHtml;

    }).join('') : `<p class = "empty-message"> no ${sectionTitleMap[sectionName]} found.</p>`;

    return `
        <div class = "capsule-section">
            <h3>${sectionTitleMap[sectionName]}</h3>
            <div class = "section-items-list">
                ${itemsHtml}
            </div>
        </div>
    `;
}

function createCapsule(currentDayId){
    const dayReadable = parseDate(new Date(currentDayId));

    if (capsules.some(c => c.id === currentDayId)){
        console.warn(`a capsule for ${dayReadable} alr exists`);
        selectCapsule(currentDayId);
        return;
    }

    const newCapsule = {
        id: currentDayId,
        date: dayReadable,
        notes: [],
        filesLinks: [],
        memories: [],
        music: []
    };

    capsules.push(newCapsule);
    saveCapsules();
    selectCapsule(newCapsule.id);
}

function showModal(){
    const modal = document.getElementById('item-modal');
    modal.style.display = 'flex';

    document.getElementById('add-item-form').reset();
    document.getElementById('item-type-select').value = 'note';
    document.getElementById('note-form').style.display = 'block';
    document.getElementById('file-form').style.display = 'none';
    document.getElementById('memory-form').style.display = 'none';
    document.getElementById('music-form').style.display = 'none';
}

function hideModal(){
    const modal = document.getElementById('item-modal');
    modal.style.display = 'none';
    document.getElementById('add-item-form').reset();
}

function addItemToCapsule(type, data){
    const capsule = capsules.find(c => c.id === currentSelectedCapsuleId);
    if (!capsule) return;

    data.id = generateID();

    switch(type){
        case 'note':
            capsule.notes.push(data);
            break;
        case 'file':
            capsule.filesLinks.push(data);
            break;
        case 'memory':
            capsule.memories.push(data);
            break;
        case 'music':
            capsule.music.push(data);
            break;
    }
    saveCapsules();
    renderSelectedCapsule();
}

function deleteItem(capsuleId, section, itemId){
    const capsule = capsules.find(c => c.id === capsuleId);
    if (!capsule) return;

    const index = capsule[section].findIndex(item => item.id === itemId);
    if (index > -1){
        capsule[section].splice(index,1);
        saveCapsules();
        renderSelectedCapsule();
    }
}

function editItem(capsuleId, section, itemId){
    if (section !== 'notes') return;

    const capsule = capsules.find(c => c.id === capsuleId);
    if (!capsule ) return;

    const itemToEdit = capsule[section].find(item => item.id === itemId);
    if (!itemToEdit) return;

    const newContent = prompt("edit ur note", itemToEdit.content);
    if (newContent !== null){
        itemToEdit.content = newContent;
        saveCapsules();
        renderSelectedCapsule();
    }
}

/* search func */
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm.length == 0){
        renderCalendar();
        renderSelectedCapsule();
        return;
    }
    const filteredCapsules = capsules.filter(capsule =>
        capsule.notes.some(note => note.content.toLowerCase().includes(searchTerm)) ||
        capsule.filesLinks.some(file => file.title.toLowerCase().includes(searchTerm)) || file.url.toLowerCase().includes(searchTerm) ||
        capsule.memories.some(memory => memory.description.toLowerCase().includes(searchTerm)) || memory.url.toLowerCase().includes(searchTerm) ||
        capsule.music.some(music => music.title.toLowerCase().includes(searchTerm)) || music.url.toLowerCase().includes(searchTerm)
    );

    if (filteredCapsules.length > 0){
        const firstM = filteredCapsules[0];
        currentSelectedCapsuleId = firstM.id;
        renderCalendar();
        renderSelectedCapsule();
    } else {
        const capdiv = document.getElementById('capsule-content');
        capdiv.innerHTML = '<p class="placeholder"> no capsules found </p>';
        
        const dayCells = document.querySelectorAll('.calendar-day-cell');
        dayCells.forEach(cell => cell.classList.remove('selected-day'));
        currentSelectedCapsuleId = null;
    }
});

document.getElementById('close-modal-btn').addEventListener('click', hideModal);
document.getElementById('item-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideModal();
});


// on loaddd
document.addEventListener('DOMContentLoaded', () => {
    loadCapsules();
    renderCalendar();
    initializeModalItemForm();

    if (capsules.length > 0){
        currentSelectedCapsuleId = capsules[0].id;
        renderCalendar();
        renderSelectedCapsule();
    } else {
        const capsuleContentDiv = document.getElementById('capsule-content');
        capsuleContentDiv.innerHTML = `<p class = "placeholder"> select a calendar date to view its capsule :D </p>`;
    }
});
