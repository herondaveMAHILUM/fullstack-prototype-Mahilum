function showPage(pageId) {

    document.querySelectorAll(".page").forEach(function(page) {
        page.classList.remove("active");
    });
    document.getElementById(pageId).classList.add("active");
}

