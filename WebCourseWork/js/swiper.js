var swiper  = new Swiper(".swiper", {
    spaceBetween: 30,
    slidesPerView: 1,
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        type: "fraction",

    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    mousewhell: true,
    keyboard: true,
});