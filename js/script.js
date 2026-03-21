document.addEventListener("DOMContentLoaded", () => {
  // 所有頁面都在根目錄，因此直接載入 partials
  const partialPathPrefix = "";

  /**
   * [1. 載入導覽列]
   * 從 partials/navbar.html 載入並初始化互動邏輯
   */
  const loadNavbar = async () => {
    const placeholder = document.getElementById("navbar-include");
    if (placeholder) {
      // 最小改動：先顯示快速 navbar skeleton，讓頁面不會延遲空白
      placeholder.innerHTML = `
      <header class="navbar">
        <div class="container">
          <a href="index.html" class="logo">PORTFOLIO.</a>
          <button class="menu-toggle" aria-controls="nav-menu" aria-expanded="false" aria-label="Toggle navigation">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </button>
          <ul id="nav-menu" class="nav-links">
            <li><a href="index.html">首頁</a></li>
            <li><a href="projects.html">作品集</a></li>
            <li><a href="about.html">關於我</a></li>
            <li><a href="skills.html">專業技能</a></li>
            <li><a href="contact.html">聯絡我</a></li>
          </ul>
        </div>
      </header>`;
      initNavbarLogic();
    }
    try {
      const res = await fetch(`${partialPathPrefix}partials/navbar.html`);
      if (!res.ok) throw new Error("導覽列檔案遺失");
      const html = await res.text();
      if (placeholder) {
        placeholder.innerHTML = html;
        initNavbarLogic();
      }
    } catch (err) {
      console.error("Navbar 載入失敗:", err);
    }
  };

  /**
   * [2. 載入頁尾]
   * 從 partials/footer.html 載入並附加到頁面底部
   */
  const loadFooter = async () => {
    try {
      const res = await fetch(`${partialPathPrefix}partials/footer.html`);
      if (!res.ok) throw new Error("頁尾檔案遺失");
      const html = await res.text();

      const footerContainer = document.createElement("div");
      footerContainer.innerHTML = html;
      document.body.appendChild(footerContainer.firstElementChild);
    } catch (err) {
      console.error("Footer 載入失敗:", err);
    }
  };

  /**
   * [3. 導覽列互動邏輯]
   * 處理漢堡選單、當前頁面高亮以及滾動漂浮效果
   */
  function initNavbarLogic() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const bars = document.querySelectorAll(".bar");

    // 漢堡選單切換 (含 ARIA 與樣式清理)
    if (menuToggle) {
      // 初始化 aria
      if (!menuToggle.hasAttribute('aria-expanded')) menuToggle.setAttribute('aria-expanded', 'false');

      menuToggle.addEventListener("click", () => {
        if (navLinks) navLinks.classList.toggle("active");
        menuToggle.classList.toggle("is-active");
        const expanded = menuToggle.classList.contains("is-active");
        menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");

        if (expanded) {
          if (bars[0]) bars[0].style.transform = "translateY(8px) rotate(45deg)";
          if (bars[1]) bars[1].style.opacity = "0";
          if (bars[2]) bars[2].style.transform = "translateY(-8px) rotate(-45deg)";
        } else {
          bars.forEach((bar) => {
            bar.style.transform = "";
            bar.style.opacity = "";
          });
        }
      });

      // 點擊外部區域時關閉選單（改善 UX）
      document.addEventListener('click', (e) => {
        if (menuToggle.classList.contains('is-active') && !e.target.closest('.navbar')) {
          menuToggle.classList.remove('is-active');
          if (navLinks) navLinks.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
          bars.forEach((bar) => {
            bar.style.transform = "";
            bar.style.opacity = "";
          });
        }
      });
    }

    // 向下捲動時加入 .scrolled（含存在性檢查）
    window.addEventListener("scroll", () => {
      const navbar = document.querySelector(".navbar");
      if (!navbar) return;
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });

    // 當前頁面高亮
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  /**
   * [4. 作品集渲染]
   * 僅在作品集頁面執行，自動產生卡片並帶入連結
   */
  function renderProjects(filterTag = "all") {
    const container = document.getElementById("project-list");
    if (!container || typeof projectsData === "undefined") return;

    // 篩選邏輯
    const filteredData =
      filterTag === "all"
        ? projectsData
        : projectsData.filter((p) => p.tags.includes(filterTag));

    container.innerHTML = filteredData
      .map(
        (p) => `
        <article class="project-card">
            <div class="project-img-container">
                <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: contain;">
                <div class="project-overlay">
                    <a href="${
                      p.link
                    }" class="view-btn" style="color: white; text-decoration: none;">
                        <i class="fas fa-link"></i> 訪問項目
                    </a>
                </div>
            </div>
            <div class="project-info">
                <h3 style="margin-bottom: 10px;">${p.title}</h3>
                <p style="font-size: 0.9rem; color: #64748b;">${p.desc}</p>
                <div class="tags">
                    ${p.hashTags ? p.hashTags.map((h) => `<span class="hashTag">${h}</span>`).join("") : ""}
                    ${p.tags
                      .map((t) => `<span class="tag">${t}</span>`)
                      .join("")}
                </div>
            </div>
        </article>
    `
      )
      .join("");
  }

  /**
   * 自動生成篩選按鈕並綁定事件
   */
  function initProjectFilters() {
    const filterContainer = document.getElementById("filter-buttons");
    if (!filterContainer) return;

    // 提取所有不重複的標籤
    const allTags = ["all", ...new Set(projectsData.flatMap((p) => p.tags))];

    filterContainer.innerHTML = allTags
      .map(
        (tag) => `
    <button class="filter-btn ${
      tag === "all" ? "active" : ""
    }" data-tag="${tag}">
      ${tag === "all" ? "全部" : tag}
    </button>
  `
      )
      .join("");

    // 綁定點擊事件
    filterContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("filter-btn")) {
        // 切換按鈕樣式
        document
          .querySelectorAll(".filter-btn")
          .forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");

        // 執行篩選渲染
        renderProjects(e.target.dataset.tag);
      }
    });
  }

  /**
   * [5. 作品卡片跑馬燈]
   * 產生無縫滾動卡片內容
   */
  function initMarquee() {
    const container = document.getElementById("marquee-content");
    // 檢查容器是否存在且資料是否載入
    if (!container || typeof projectsData === "undefined") return;

    // 產生 HTML 結構
    const itemsHTML = projectsData
      .map(
        (p) => `
      <a href="${p.link}" class="marquee-item">
        <div class="item-header">
          <div class="marquee-visual">
            <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">
          </div>
          <div class="marquee-info">
            <h4>${p.title}</h4>
          </div>
        </div>
        <p class="item-desc">${p.desc}</p>
        <div class="item-tags">
          ${p.hashTags ? p.hashTags.map((hashTag) => `<span class="hashTag">${hashTag}</span>`).join("") : ""}
          ${p.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
        </div>
      </a>
    `
      )
      .join("");

    // 重複兩次內容以達成無縫滾動
    container.innerHTML = itemsHTML + itemsHTML;
  }

  // 在 initMarquee 之後或啟動功能區加入
  function initTypingEffect() {
    const textElement = document.getElementById("typing-text");
    const phrases = [
      "Full-stack Developer",
      "Problem Solver",
      "Tech Enthusiast",
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        textElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        textElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2000; // 停頓時間
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    if (textElement) type();
  }

  /**
   * [NEW: 5. 統一設定網站圖標]
   * 自動在 <head> 中插入 Favicon 連結
   */
  const setupFavicon = () => {
    const iconPath = "images/happy-face.png"; // 你的圖片路徑
    
    // 檢查是否已經存在 favicon 標籤，若無則建立
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = iconPath;
    link.type = 'image/png'; // 修正為正確的 MIME 類型
  };

  // 啟動所有功能
  setupFavicon();
  loadNavbar();
  loadFooter();
  initProjectFilters();
  renderProjects();
  initMarquee(); // 啟動跑馬燈
  initTypingEffect();
});
