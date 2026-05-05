const noticeList = document.getElementById("noticeList");
const noNoticeMsg = document.getElementById("noNoticeMsg");

let notices = JSON.parse(localStorage.getItem("notices")) || [];

function displayNotices() {
    noticeList.innerHTML = "";

    if (notices.length === 0) {
        noNoticeMsg.style.display = "block";
        return;
    }

    noNoticeMsg.style.display = "none";

    notices.forEach(msg => {
        const box = document.createElement("div");
        box.className = "notice-box";
        box.innerHTML = `<div class="scroll-text">${msg}</div>`;
        noticeList.appendChild(box);
    });
}

displayNotices();