// Start with no dummy data; courses will be populated once real data is wired up.
const courses = [];

document.addEventListener("DOMContentLoaded", () => {

const courseGrid = document.getElementById("courseGrid");
if (!courseGrid) return;

const filterDropdown = document.querySelector(".course-filter");


/* LOAD COURSES FUNCTION */
function loadCourses(filter = "All Course"){

courseGrid.innerHTML = "";

let filteredCourses = courses;

if(filter === "Published"){
filteredCourses = courses.filter(course => course.status === "Published");
}

if(filter === "Draft"){
filteredCourses = courses.filter(course => course.status === "Draft");
}

if (filteredCourses.length === 0) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = "No courses yet. Click Add Course to create one.";
  courseGrid.appendChild(empty);
  return;
}

filteredCourses.forEach((course, index) => {

const card = document.createElement("div");
card.classList.add("course-card");
card.setAttribute("data-index", index);

card.innerHTML = `
<div class="course-img">
<i class="fa fa-image"></i>
</div>

<div class="course-title">
${course.title}
</div>

<span class="chapter">${course.chapter}</span>

<div class="students">
${course.students} Students Completed
</div>

<div class="status ${course.status.toLowerCase()}">
${course.status}
</div>

<div class="actions">

<span class="view-btn">
<i class="fa fa-eye"></i> View
</span>

<span class="edit-btn">
<i class="fa fa-pen"></i> Edit
</span>

<span class="delete-btn">
<i class="fa fa-trash"></i> Delete
</span>

</div>
`;

courseGrid.appendChild(card);


/* VIEW BUTTON EVENT */
const viewBtn = card.querySelector(".view-btn");

viewBtn.addEventListener("click", () => {

const quizModal = document.getElementById("quizModal");

if(quizModal){
quizModal.style.display = "flex";
}

});

});

} // END loadCourses()


/* DROPDOWN FILTER */
if (filterDropdown) {

filterDropdown.addEventListener("change", function(){

const selectedFilter = this.value;
loadCourses(selectedFilter);

});

}


/* INITIAL LOAD */
loadCourses();


/* MODAL ELEMENTS */
const addCourseBtn = document.querySelector(".add-course");
const addCourseModal = document.getElementById("addCourseModal");
const closeCourseModal = document.getElementById("closeCourseModal");

const uploadBtn = document.querySelector(".upload-btn");
const courseImage = document.getElementById("courseImage");


/* OPEN ADD COURSE MODAL */
if (addCourseBtn && addCourseModal) {

addCourseBtn.onclick = () => {

addCourseModal.style.display = "flex";

};

}


/* CLOSE ADD COURSE MODAL */
if (closeCourseModal && addCourseModal) {

closeCourseModal.onclick = () => {

addCourseModal.style.display = "none";

};

}


/* CLICK OUTSIDE ADD COURSE MODAL */
if (addCourseModal) {

window.addEventListener("click", (e) => {

if(e.target === addCourseModal){
addCourseModal.style.display = "none";
}

});

}


/* IMAGE UPLOAD BUTTON */
if (uploadBtn && courseImage) {

uploadBtn.onclick = () => {

courseImage.click();

};

}


/* CLOSE QUIZ MODAL WHEN CLICK OUTSIDE */
const quizModal = document.getElementById("quizModal");

window.addEventListener("click", (e) => {

if(e.target === quizModal){
quizModal.style.display = "none";
}

});

});
