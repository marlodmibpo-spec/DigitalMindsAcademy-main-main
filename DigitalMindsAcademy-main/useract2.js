

const activities = [

{
course:"Work Smarter: Essential Computer Shortcut Keys",
type:"Quiz",
score:"9/10",
status:"Completed"
},

{
course:"Work Smarter: Essential Computer Shortcut Keys",
type:"Activity",
score:"10/10",
status:"Completed"
},

{
course:"Work Smarter: Essential Computer Shortcut Keys",
type:"Activity",
score:"Pending",
status:"Completed"
},

{
course:"Work Smarter: Essential Computer Shortcut Keys",
type:"Activity",
score:"--",
status:"Incomplete"
}

];


const outputs = [

{
course:"Work Smarter: Essential Computer Shortcut Keys",
file:"RechargeAlden_EssentialComputerShortcutKeys.pdf",
score:"9/10"
},

{
course:"Work Smarter: Essential Computer Shortcut Keys",
file:"RechargeAlden_EssentialComputerShortcutKeys.pdf",
score:"10/10"
}

];


const activitiesTable = document.getElementById("activitiesTable");
const outputsTable = document.getElementById("outputsTable");


activities.forEach((act,index)=>{

activitiesTable.innerHTML += `
<tr>

<td>${index+1}</td>

<td>${act.course}</td>

<td>${act.type}</td>

<td>${act.score}</td>

<td>
<span class="status ${act.status==="Completed" ? "completed":"incomplete"}">
${act.status}
</span>
</td>

</tr>
`;

});


outputs.forEach((out,index)=>{

outputsTable.innerHTML += `
<tr>

<td>${index+1}</td>

<td>${out.course}</td>

<td>
<a href="#">${out.file}</a>
</td>

<td>
<span class="score">${out.score}</span>
</td>

</tr>
`;

});