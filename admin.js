function renderPreview() {
  const importProducts = JSON.parse(localStorage.getItem("import")) || [];
  const exportProducts = JSON.parse(localStorage.getItem("export")) || [];
  let html = "";

  if (importProducts.length) {
    html += "<h2>Import Products</h2><div class='product-preview-list'>";
    importProducts.forEach(p => {
      html += `<div class="product-card"><img src="${p.img}" width="80"><p>${p.name}</p></div>`;
    });
    html += "</div>";
  }
  if (exportProducts.length) {
    html += "<h2>Export Products</h2><div class='product-preview-list'>";
    exportProducts.forEach(p => {
      html += `<div class="product-card"><img src="${p.img}" width="80"><p>${p.name}</p></div>`;
    });
    html += "</div>";
  }
  document.getElementById("productPreview").innerHTML = html;
  renderProductsTable();
}

document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const image = document.getElementById("image").files[0];

  if (!name || !image) {
    alert("Please enter product name and select an image.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    // حفظ اسم المنتج في جميع اللغات الحالية (يمكنك تعديل ذلك حسب الحاجة)
    const translations = {};
    const langs = ["en", "ar", "fr", "de", "es", "zh"];
    langs.forEach(l => {
      translations[l] = name;
    });
    const product = { name: name, img: reader.result, translations };
    const products = JSON.parse(localStorage.getItem(category)) || [];
    products.push(product);
    localStorage.setItem(category, JSON.stringify(products));
    // تحديث المنتجات في صفحة الموقع إذا كانت مفتوحة
    window.localStorage.setItem("products_updated", Date.now().toString());
    alert("Product added!");
    renderPreview();
    document.getElementById("productForm").reset();
  };
  reader.readAsDataURL(image);
});

// عرض المنتجات في جدول مع زر تعديل
function renderProductsTable() {
  const importProducts = JSON.parse(localStorage.getItem("import")) || [];
  const exportProducts = JSON.parse(localStorage.getItem("export")) || [];
  let html = "";

  // استخدم الترجمة للعناوين
  const lang = localStorage.getItem("lang") || "en";
  const t = key => (window.translations && translations[lang] && translations[lang][key]) ? translations[lang][key] : key;

  function tableRows(products, category) {
    return products.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><img src="${p.img}" /></td>
        <td>${p.name}</td>
        <td>
          <button class="edit-btn" onclick="editProduct('${category}',${i})" data-i18n="edit_product">${t("edit_product")}</button>
        </td>
      </tr>
    `).join("");
  }

  html += `<h2 data-i18n="all_products">${t("all_products")}</h2>`;
  html += `<table class="admin-table">
    <tr>
      <th>#</th>
      <th>Image</th>
      <th data-i18n="name">${t("name")}</th>
      <th data-i18n="actions">${t("actions")}</th>
    </tr>
    ${tableRows(importProducts, "import")}
    ${tableRows(exportProducts, "export")}
  </table>`;

  document.getElementById("productsTable").innerHTML = html;
}

// تعديل المنتج
window.editProduct = function(category, index) {
  const products = JSON.parse(localStorage.getItem(category)) || [];
  const product = products[index];
  const modal = document.getElementById("editModal");
  document.getElementById("editName").value = product.name;
  document.getElementById("editPreviewImg").src = product.img;
  document.getElementById("editPreviewImg").style.display = "block";
  modal.style.display = "flex";

  let newImg = product.img;

  // إضافة حقول ترجمة لكل لغة
  let langs = ["en", "ar", "fr", "de", "es", "zh"];
  // إزالة أي حقول ترجمة سابقة
  let translationFields = document.querySelectorAll('.edit-translation-field');
  translationFields.forEach(f => f.remove());
  langs.forEach(l => {
    let val = (product.translations && product.translations[l]) ? product.translations[l] : product.name;
    let input = document.createElement('input');
    input.type = "text";
    input.className = "edit-translation-field";
    input.placeholder = "Product Name (" + l + ")";
    input.value = val;
    input.setAttribute("data-lang", l);
    input.style.marginBottom = "0.5rem";
    document.getElementById("editPreviewImg").parentNode.insertBefore(input, document.getElementById("editPreviewImg"));
  });

  document.getElementById("editImage").onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function() {
        newImg = reader.result;
        document.getElementById("editPreviewImg").src = newImg;
      };
      reader.readAsDataURL(file);
    }
  };

  document.getElementById("saveEditBtn").onclick = function() {
    const newName = document.getElementById("editName").value;
    products[index].name = newName;
    products[index].img = newImg;
    // تحديث الترجمات من الحقول
    if (!products[index].translations) products[index].translations = {};
    document.querySelectorAll('.edit-translation-field').forEach(input => {
      const l = input.getAttribute("data-lang");
      products[index].translations[l] = input.value;
    });
    localStorage.setItem(category, JSON.stringify(products));
    modal.style.display = "none";
    renderPreview();
  };

  document.getElementById("cancelEditBtn").onclick = function() {
    modal.style.display = "none";
  };
};

// عرض الرسائل من localStorage
function renderMessages() {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];
  let html = "";
  const lang = localStorage.getItem("lang") || "en";
  const t = key => (window.translations && translations[lang] && translations[lang][key]) ? translations[lang][key] : key;

  if (messages.length === 0) {
    html = `<div style='color:#888;' data-i18n="no_messages">${t("no_messages")}</div>`;
  } else {
    html = messages.map(m =>
      `<div class="message-item">
        <b>${m.name}</b> &lt;${m.email}&gt;
        <span>${m.message}</span>
      </div>`
    ).join("");
  }
  document.getElementById("messagesList").innerHTML = html;
}

window.addEventListener("DOMContentLoaded", function() {
  renderPreview();
  renderMessages();
});