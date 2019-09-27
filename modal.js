window.addEventListener("load", ()=>{
	const modal = document.querySelector("#infoModal");
	const infoBtn = document.querySelector("#infoBtn");
	const closeSpan = document.querySelector("#closeModal");
	infoBtn.addEventListener("click", ()=>{
		modal.style.display = "block";
	});
	closeSpan.addEventListener("click", ()=>{
		modal.style.display = "none";
	});
	window.addEventListener("click", (e)=>{
		if(e.target == modal){
			modal.style.display = "none";
		}
	});
});