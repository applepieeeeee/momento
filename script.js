
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
function generateUUID(){
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
    const day = d.getDate.toString().padStart(2, '0');

    return '${year}-${month}-${day}';
}

function normalizeDateToDay(date){
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d;
}

/* local storage 4 capsules */
function loadCapsules(){
    const date = localStorage.getItem(LOCAL_STORAGE_KEY);
    capsules = data ? JSON.parse(data) : [];
    capsules.sort((a,b) => b.id.localeCompare(a.id));
}
 
function saveCapsules(){
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(capsules));
}