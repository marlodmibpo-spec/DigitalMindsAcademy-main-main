

document.getElementById("coursesCompleted").textContent = 12;
document.getElementById("certificates").textContent = 12;


/* ASSESSMENT CHART */

new Chart(
document.getElementById("assessmentChart"),
{
type:"bar",
data:{
labels:["Course1","Course2","Course3","Course4","Course5","Course6","Course7","Course8","Course9"],
datasets:[
{
label:"Attempt",
data:[2,1,3,2,1,2,2,3,3],
backgroundColor:"#021437"
},
{
label:"Correct",
data:[9,8,10,10,9,9,10,9,10],
backgroundColor:"#b0bf00"
},
{
label:"Wrong",
data:[0,2,0,0,1,1,0,1,0],
backgroundColor:"#ff2d2d"
}
]
},
options:{responsive:true}
}
);


/* PIE */

new Chart(
document.getElementById("completionChart"),
{
type:"pie",
data:{
labels:["Completed","In Progress"],
datasets:[{
data:[12,3],
backgroundColor:["#b0bf00","#021437"]
}]
}
}
);


/* LEADERBOARD */

const leaderboard = [
{name:"Alden Recharge",score:320},
{name:"Aliya Raymundo",score:120},
{name:"Jhong Hilarious",score:39},
{name:"Jhong Hilarious",score:37},
{name:"Aliya Raymundo",score:26},
{name:"Jhong Hilarious",score:24},
{name:"Aliya Raymundo",score:22},
{name:"Alden Recharge",score:19}
];

const list = document.getElementById("leaderboardList");

leaderboard.forEach((user,index)=>{

list.innerHTML += `
<li>
<span>${index+1}. ${user.name}</span>
<strong>${user.score} pts</strong>
</li>
`;

});