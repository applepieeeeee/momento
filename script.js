
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

function parseDate(date){
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function createCapsule(){

}