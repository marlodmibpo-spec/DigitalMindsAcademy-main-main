const certificates = [

{
title:"Computer Shortcut Keys",
image:"images/certificate.png"
},

{
title:"Time Management Course",
image:"images/certificate.png"
},

{
title:"Workplace Communication",
image:"images/certificate.png"
}

];


const certList = document.getElementById("certificateList");
const certPreview = document.getElementById("certificateImage");


function loadCertificates(){

certificates.forEach((cert,index)=>{

const certItem = document.createElement("div");

certItem.classList.add("cert-item");

certItem.innerHTML = `
<img src="${cert.image}">
`;

certItem.addEventListener("click",function(){

certPreview.src = cert.image;

});

certList.appendChild(certItem);

});

}


loadCertificates();