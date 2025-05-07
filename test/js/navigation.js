function openNav() {
    document.getElementById("myNav").style.width = "100%";
    document.body.style.overflow = "hidden";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%"
    document.body.style.overflow = "visible";
    document.body.style.overflowX ="hidden";
}