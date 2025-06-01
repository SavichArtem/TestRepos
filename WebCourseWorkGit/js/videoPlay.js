function toggle() {
    var videoBody = document.querySelector(".video_popUp")
    var video = document.querySelector("video")
    videoBody.classList.toggle("active");
    video.pause();
    video.currentTime = 0;
}