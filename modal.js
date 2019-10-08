window.addEventListener("load", ()=>{
	for(const modal of document.querySelectorAll(".modal")){
		const closeSpan = modal.querySelector("#closeModal");

		closeSpan.addEventListener("click", ()=>{
			modal.style.display = "none";
		});
		window.addEventListener("click", (e)=>{
			if(e.target == modal){
				modal.style.display = "none";
			}
		});
	}

	// Info Button
	const infoBtn = document.querySelector("#infoBtn");
	const infoModal = document.querySelector("#infoModal");
	infoBtn.addEventListener("click", ()=>{
		infoModal.style.display = "block";
	});
});