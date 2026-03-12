// Slider 邏輯
let currentSlide = 0;

function moveSlide(step) {
  const wrapper = document.getElementById("sliderWrapper");
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;
  currentSlide = (currentSlide + step + slides.length) % slides.length;

  wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
  updateIndicators();
}

function updateIndicators() {
  // 更新藍點
  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));

  // 更新縮圖
  const thumbs = document.querySelectorAll(".thumb");
  thumbs.forEach((thumb, i) =>
    thumb.classList.toggle("active", i === currentSlide)
  );
}


document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.getElementById("sliderDots");
  const thumbsContainer = document.getElementById("sliderThumbs");

  slides.forEach((slide, i) => {
    // 生成藍點
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.onclick = () => {
      currentSlide = i;
      moveSlide(0);
    };
    dotsContainer.appendChild(dot);

    // 生成縮圖 (抓取大圖 src)
    const imgSource = slide.querySelector("img").src;
    const thumb = document.createElement("img");
    thumb.src = imgSource;
    thumb.classList.add("thumb");
    if (i === 0) thumb.classList.add("active");
    thumb.onclick = () => {
      currentSlide = i;
      moveSlide(0);
    };
    thumbsContainer.appendChild(thumb);
  });
});
