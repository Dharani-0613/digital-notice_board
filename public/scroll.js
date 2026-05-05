const box = document.getElementById("scrollBox");

setInterval(() => {
    box.scrollTop += 1;

    if (box.scrollTop >= box.scrollHeight - box.clientHeight) {
        box.scrollTop = 0;
    }
}, 50);