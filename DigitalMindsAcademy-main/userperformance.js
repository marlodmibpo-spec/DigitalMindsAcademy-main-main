// SIMPLE SEARCH FILTER

const searchInput = document.getElementById("searchCourse");
const table = document.getElementById("performanceTable");

searchInput.addEventListener("keyup", function(){

const filter = searchInput.value.toLowerCase();
const rows = table.getElementsByTagName("tr");

for(let i = 1; i < rows.length; i++){

let course = rows[i].getElementsByTagName("td")[1];

if(course){

let text = course.textContent.toLowerCase();

rows[i].style.display = text.includes(filter) ? "" : "none";

}

}

});