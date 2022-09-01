// --------Excel file info-----------
const xlsx = require('xlsx');

const FILE_NAME_PATH = 'Masjid Huzaifah - Prayer Dashboard.xlsx'
const SHEET_NAME_IN_FILE = "Scar-PT-2022"
const FRIDAY_SHEET_NAME_IN_FILE = "all-fridays-2022"

const FAJR_CELL_NAME = "Fajr"
const FAJR_IQAMA_CELL_NAME = "fajr-iqama"
const ZUHR_CELL_NAME = "Zuhr"
const ZUHR_IQAMA_CELL_NAME = "zuhr-iqama"
const MAGHRIB_CELL_NAME = "Maghrib"
const MAGHRIB_IQAMA_CELL_NAME = "maghrib-iqama"
const ISHA_CELL_NAME = "Isha"
const ISHA_IQAMA_CELL_NAME = "isha-iqama"
const DUHA_CELL_NAME = "Duha"
const SUNRISE_CELL_NAME = "Sunrise"


const BAYAN1 = "BAYAN 1"
const BAYAN2 = "BAYAN 2"
const KHUTBAH1 = "KHUTBAH 1"
const KHUTBAH2 = "KHUTBAH 2"
// --------Excel file info-----------


// --------Implementation details-----------
var workbook = xlsx.readFile(FILE_NAME_PATH);
var salah_worksheet = workbook.Sheets[SHEET_NAME_IN_FILE];
var fridays_worksheet = workbook.Sheets[FRIDAY_SHEET_NAME_IN_FILE];


var today = new Date();
var tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

today_row  = xlsx.utils.sheet_to_json(salah_worksheet, {raw: false})[getNormalDayIndex(today)]
tomorrow_row = xlsx.utils.sheet_to_json(salah_worksheet, {raw: false})[getNormalDayIndex(tomorrow)]
friday_row = xlsx.utils.sheet_to_json(fridays_worksheet, {raw: false})[getFridayIndex()]


// Private helper function, use the above getters
function prayerTimes(iqama, tomorrow, cell_name, iqama_cell_name){
  if(iqama == false && tomorrow == false) return formatTime(today_row[cell_name], cell_name)
  if(iqama == false && tomorrow == true) return formatTime(tomorrow_row[cell_name], cell_name)
  if(iqama == true && tomorrow == false) return formatTime(today_row[iqama_cell_name], cell_name)
  if(iqama == true && tomorrow == true) return formatTime(tomorrow_row[iqama_cell_name], cell_name)
}

// https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
function daysIntoYear(date){
  return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
}

function getNormalDayIndex(date)
{
  return daysIntoYear(date) - 1
}

// Similar usage to daysIntoYear
function getNextFridayDayinYear() {
  today = daysIntoYear(new Date())
  next_friday = today + ((12 - new Date().getDay()) % 7)
  return next_friday;
}

function getFridayIndex()
{
  return Math.ceil(getNextFridayDayinYear() / 7) - 1
}

// format 12 hour time correctly
function formatTime (time, prayer) {
  // Check correct time format and split into components
  if(time.length == 4){
    time = '0' + time
  }

  // different format than rest
  if (prayer == "Zawal") //assuming that unlike rest this take has 0 prepended
  {
    if (time.slice(0,2) == "10" || time.slice(0,2) == "11")
    {
      time = time.split('');
      time[6] = "A"
      time = time.join('');
    }
    else
    {
      time = time.split('');
      time[6] = "P"
      time = time.join('');
    }

    if (time.slice(11,13) == "10" || time.slice(11,13) == "11")
    {
      time = time.split('');
      time[17] = "P"
      time = time.join('');
    }
    else
    {
      time = time.split('');
      time[17] = "P"
      time = time.join('');
    }

    return time
  }

  if(prayer == "Fajr" || prayer == "Sunrise" || prayer == "Duha")
  {
    append = " AM"
  }
  else if (prayer == "Asr" || prayer == "Maghrib" || prayer == "Isha")
  {
    append = " PM"
  }
  else if (prayer == "Zuhr")
  {
    if (time.slice(0,2) == "10" || time.slice(0,2) == "11") //zhur is at 11 or 10
    {
      append = " AM"
    }
    else
    {
      append = " PM"
    }
  }

  return time + append
}

// Unused right now
// https://stackoverflow.com/questions/13898423/javascript-convert-24-hour-time-of-day-string-to-12-hour-time-with-am-pm-and-no
// function formatTime24 (time) {

//   // Format gives doesn't have a prepended 0
//   if(time.length == 4){
//     time = '0' + time
//   }

//   time = time.match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
//   if (time.length > 1) { // If time format correct
//     time = time.slice (1);  // Remove full string match value
//     time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
//     time[0] = +time[0] % 12 || 12; // Adjust hours
//   }
//   return time.join (''); // return adjusted time or original string
// }
// --------Implementation details-----------


// --------Api for usage-----------
function getFajr(iqama, tomorrow){
  return prayerTimes(iqama, tomorrow, FAJR_CELL_NAME, FAJR_IQAMA_CELL_NAME)
}

function getZuhr(iqama, tomorrow){
  return prayerTimes(iqama, tomorrow, ZUHR_CELL_NAME, ZUHR_IQAMA_CELL_NAME)
}

function getMaghrib(iqama, tomorrow){
  return prayerTimes(iqama, tomorrow, MAGHRIB_CELL_NAME, MAGHRIB_IQAMA_CELL_NAME)
}

function getIsha(iqama, tomorrow){
  return prayerTimes(iqama, tomorrow, ISHA_CELL_NAME, ISHA_IQAMA_CELL_NAME)
}

function getSunrise(tomorrow){
  return prayerTimes(false, tomorrow, SUNRISE_CELL_NAME, SUNRISE_CELL_NAME)
}

function getDuha(tomorrow){
  return prayerTimes(false, tomorrow, DUHA_CELL_NAME, DUHA_CELL_NAME)
}

//bayan = true -> get bayan time, false -> get khutbah
function getJumah1(bayan) {
  if(bayan) return friday_row[BAYAN1]
  return friday_row[KHUTBAH1]
}

function getJumah2(bayan) {
  if(bayan) return friday_row[BAYAN2]
  return friday_row[KHUTBAH2]
}

function SetAllTimes()
{
  document.getElementById('Fajr Adhan').innerHTML = getFajr(false, false)
}