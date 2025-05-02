const productContainer = document.getElementById("product-container");

function showCategory(category) {
  const products = JSON.parse(localStorage.getItem(category)) || [];
  // عرض الاسم الأصلي فقط بدون ترجمة
  productContainer.innerHTML = products.map((p, i) => `
    <div class="product-card" data-index="${i}" data-category="${category}">
      <img src="${p.img}" width="120">
      <p>${p.name}</p>
      ${p.desc ? `<div class="product-desc" style="margin-top:0.5rem;font-size:0.98em;color:#444;">${p.desc && p.desc["en"] ? p.desc["en"] : ""}</div>` : ""}
    </div>`).join("");
  document.querySelectorAll('.product-card').forEach(card => {
    card.onclick = function() {
      const img = this.querySelector('img').src;
      const name = this.querySelector('p').innerText;
      let desc = "";
      const descDiv = this.querySelector('.product-desc');
      if (descDiv) desc = descDiv.innerHTML;
      showImageModal(img, name, desc);
    };
  });
}

function showImageModal(imgSrc, name, desc) {
  let modal = document.getElementById('img-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'img-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content-centered">
        <button class="modal-close-btn" aria-label="Close">&times;</button>
        <img src="" alt="" />
        <div class="modal-title"></div>
        <div class="modal-desc" style="margin-top:0.5rem;font-size:1em;color:#444;"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close-btn').onclick = () => modal.style.display = 'none';
    modal.querySelector('.modal-backdrop').onclick = () => modal.style.display = 'none';
  }
  modal.querySelector('img').src = imgSrc;
  modal.querySelector('.modal-title').innerText = name;
  modal.querySelector('.modal-desc').innerHTML = desc || "";
  modal.style.display = 'flex';
  modal.querySelector('.modal-close-btn').focus();
}

window.addEventListener("storage", function(e) {
  if (
    e.key === "import" ||
    e.key === "export" ||
    e.key === "products_updated"
  ) {
    const current = document.querySelector(".product-buttons button.active");
    if (current) {
      showCategory(current.dataset.category);
    } else {
      showCategory("import");
    }
  }
});

document.querySelectorAll(".product-buttons button").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".product-buttons button").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    showCategory(this.dataset.category || (this.innerText.includes("Import") ? "import" : "export"));
  });
});

window.onload = () => {
  const importBtn = document.querySelector('.product-buttons button[data-i18n="import"]');
  if (importBtn) importBtn.classList.add("active");
  showCategory("import");
};