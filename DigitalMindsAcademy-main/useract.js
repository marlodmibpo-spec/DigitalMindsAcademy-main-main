// Start empty; real data should be loaded from Supabase/API.
let activities = [];

document.addEventListener("DOMContentLoaded", () => {

renderActivities(activities);

setupMenu();
setupLogout();
setupDateFilter();

});



/* RENDER TABLE */

function renderActivities(data){

const table = document.getElementById("activityTable");
table.innerHTML = "";

if (!data || data.length === 0) {
table.innerHTML = `
<tr>
  <td class="empty-row" colspan="5">No activities yet. Upload to see them here.</td>
</tr>`;
return;
}

data.forEach((user,index)=>{

const fileList = user.files.join("<br>");

const statusClass = user.status === "Completed"
? "completed"
: "progress";

const row = `
<tr>

<td>${index+1}</td>

<td class="user">

<img src="images/logo-user-inteface.png">

<div>

<strong>${user.name}</strong>

<p class="files">${fileList}</p>

</div>

</td>

<td>${user.email}</td>

<td>
<span class="status ${statusClass}">
${user.status}
</span>
</td>

<td class="actions">
<i class="fa-solid fa-pen-to-square edit"></i>
<i class="fa-solid fa-trash delete"></i>
</td>

</tr>
`;

table.innerHTML += row;

});

}



/* DATE FILTER */

function setupDateFilter(){

const dateBtn = document.getElementById("dateBtn");
const dateInput = document.getElementById("dateFilter");

dateBtn.addEventListener("click", () => {
  dateInput.classList.add("visible");
  if (dateInput.showPicker) {
    dateInput.showPicker();
  } else {
    dateInput.click();
  }
});

dateInput.addEventListener("change", () => {
  const selectedDate = dateInput.value;
  const filtered = selectedDate
    ? activities.filter((activity) => activity.date === selectedDate)
    : activities;
  renderActivities(filtered);
});

}



/* MENU ACTIVE */

function setupMenu(){

const menuLinks = document.querySelectorAll(".menu a");

menuLinks.forEach(link=>{

link.addEventListener("click",(event)=>{

const href = link.getAttribute("href");

if(!href || href === "#"){
event.preventDefault();
}

menuLinks.forEach(item=>item.classList.remove("active"));
link.classList.add("active");

});

});

}



/* LOGOUT */

function setupLogout(){

const logoutBtn = document.querySelector(".logout");

logoutBtn.addEventListener("click", (event) => {
  event.preventDefault();
  // Global overlay/logout.js will handle confirmation and sign out.
  if (window.dispatchEvent) {
    // Optional: allow future hook
  }
});

}

// Logout handled globally by logout.js overlay
