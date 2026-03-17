document.addEventListener("DOMContentLoaded", () => {

loadProfile();
setupStartButton();

});

function loadProfile(){

const name = localStorage.getItem("userName");

if(name){
document.getElementById("profileName").textContent = name;
}

}

function setupStartButton(){

const startBtn = document.querySelector(".start-btn");

startBtn.addEventListener("click", ()=>{

window.location.href = "userguide.html";

});

}