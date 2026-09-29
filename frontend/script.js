// Utility: Load from Local Storage
function getProducts() {
  return JSON.parse(localStorage.getItem("products") || "[]");
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function autoDetectProductTitle() {
  const url = document.getElementById("imageUrl").value;
  const nameInput = document.getElementById("productName");
  const descInput = document.getElementById("productDescription");

  if (!url.trim()) {
    alert("Please enter an image URL first.");
    return;
  }

  try {
    const urlObj = new URL(url);
    const hostParts = urlObj.hostname.split('.');
    let brand = "";
    for (let part of hostParts) {
      if (!["www", "com", "net", "cdn", "assets", "static", "images", "img", "media"].includes(part)) {
        brand = part;
        break;
      }
    }

    brand = brand.charAt(0).toUpperCase() + brand.slice(1);

    const fileName = urlObj.pathname.split('/').pop().split('.')[0];
    let modelName = decodeURIComponent(fileName)
      .replace(/[_\-+]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim();

    const brandRegex = new RegExp(`^${brand}\\b`, 'i');
    modelName = modelName.replace(brandRegex, "").trim();

    const finalTitle = `${brand} ${modelName}`.trim();

    nameInput.value = finalTitle || "Unknown Product";
    descInput.value = modelName || "Auto-detected product";

  } catch (err) {
    console.error("❌ Invalid URL format:", err);
    alert("Invalid URL format.");
    nameInput.value = "";
    descInput.value = "";
  }
}

async function addProduct() {
  const name = document.getElementById("productName").value.trim();
  const desc = document.getElementById("productDescription").value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();

  if (!name || !desc || !imageUrl) {
    alert("Name, description, and image URL are required.");
    return;
  }

  try {
    const res = await fetch("/api/products");
    const products = await res.json();
    const exists = products.some(p => p.name.toLowerCase() === name.toLowerCase());

    if (exists) {
      alert("❌ A product with this name already exists.");
      return;
    }

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc, imageUrl })
    });

    if (!response.ok) throw new Error("Failed to add product");

    alert("✅ Product Added Successfully");
    window.location.href = "/product.html";
  } catch (err) {
    console.error(err);
    alert("❌ Error adding product.");
  }
}

async function displayProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;

  try {
    const res = await fetch("/api/products");
    const products = await res.json();
    const currentUser = getLoggedInUser();

    container.innerHTML = "";

    products.forEach(product => {
      const col = document.createElement("div");
      col.className = "col-md-6";

      const reviewsHtml = product.reviews && product.reviews.length > 0
        ? product.reviews.map(r => {
            const isOwner = currentUser && currentUser.name === r.username;
            return `
              <div class="border rounded p-2 mb-2" id="review-${r._id}">
                <strong>${r.username}</strong> ⭐ ${r.rating}
                <p>${r.comment}</p>
                ${isOwner ? `
                  <button class="btn btn-sm btn-outline-warning me-2" onclick="openEdit('${product._id}', '${r._id}', '${r.username}',${r.rating}, \`${r.comment.replace(/`/g, '\\`')}\`)">✏️ Patch</button>
                  <button class="btn btn-sm btn-outline-info me-2" onclick="openPutEdit('${product._id}', '${r._id}', '${r.username}',${r.rating}, \`${r.comment.replace(/`/g, '\\`')}\`)">🛠️ Put</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="deleteReview('${product._id}', '${r._id}')">🗑️ Delete</button>
                ` : ""}
              </div>
            `;
          }).join("")
        : "<p class='text-muted'>No reviews yet.</p>";

      const html = `
        <div class="card bg-dark text-light p-3 shadow rounded-4" data-product-id="${product._id}">
          ${product.imageUrl ? `<img src="${product.imageUrl}" class="product-img mb-3" />` : ""}
          <h4>${product.name}</h4>
          <p>${product.description}</p>
          <form onsubmit="submitReview(event, '${product._id}')">
            <input class="form-control mb-2" value="${currentUser?.name || currentUser?.email || ''}" readonly />
            <input type="number" class="form-control mb-2" placeholder="Rating (1-5)" min="1" max="5" required />
            <textarea class="form-control mb-2" placeholder="Comment" required></textarea>
            <button class="btn btn-outline-success w-100">💬 Add Review</button>
          </form>
          <button class="btn btn-sm btn-outline-danger mb-2 mt-2" onclick="deleteProduct('${product._id}')">🗑️ Delete Product</button>
          <div class="mt-3">${reviewsHtml}</div>
        </div>
      `;

      col.innerHTML = html;
      container.appendChild(col);
    });
  } catch (err) {
    console.error("❌ Failed to load products:", err);
    alert("Couldn't load products. Backend error.");
  }
}

async function submitReview(event, productId) {
  event.preventDefault();
  const form = event.target;

  const rating = parseInt(form[1].value);
  const comment = form[2].value.trim();

  const loggedInUser = getLoggedInUser();
  if (!loggedInUser || !loggedInUser.email) {
    alert("You must be logged in to submit a review.");
    return;
  }

  const username = loggedInUser.name || loggedInUser.email;

  if (!rating || !comment) {
    alert("All review fields are required.");
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, rating, comment })
    });

    if (!res.ok) throw new Error("Failed to submit review");

    form.reset();
    await displayProducts();
  } catch (err) {
    console.error("POST review failed:", err);
    alert("❌ Failed to submit review.");
  }
}

function openEdit(productId, reviewId, username, rating, comment) {
  const div = document.querySelector(`[data-product-id="${productId}"] #review-${reviewId}`);
  if (!div) return;

  div.innerHTML = `
    <form onsubmit="submitEdit(event, '${productId}', '${reviewId}', 'PATCH')">
      <input class="form-control mb-1" name="rating" value="${rating}" min="1" max="5" type="number" required />
      <textarea class="form-control mb-1" name="comment" required>${comment}</textarea>
      <button class="btn btn-success btn-sm">💾 Save</button>
      <button type="button" class="btn btn-secondary btn-sm ms-2" onclick="displayProducts()">❌ Cancel</button>
    </form>
  `;
}

function openPutEdit(productId, reviewId, username, rating, comment) {
  const div = document.querySelector(`[data-product-id="${productId}"] #review-${reviewId}`);
  if (!div) return;

  div.innerHTML = `
    <form onsubmit="submitEdit(event, '${productId}', '${reviewId}', 'PUT')">
      <input class="form-control mb-1" name="username" value="${username}" required />
      <input class="form-control mb-1" name="rating" value="${rating}" min="1" max="5" type="number" required />
      <textarea class="form-control mb-1" name="comment" required>${comment}</textarea>
      <button class="btn btn-info btn-sm">💾 Save</button>
      <button type="button" class="btn btn-secondary btn-sm ms-2" onclick="displayProducts()">❌ Cancel</button>
    </form>
  `;
}

async function submitEdit(event, productId, reviewId, method) {
  event.preventDefault();
  const form = event.target;

  const data = {
    rating: parseInt(form.rating?.value),
    comment: form.comment?.value.trim()
  };

  if (method === 'PUT') {
    data.username = form.username?.value.trim();
  }

  const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    await refreshSingleProduct(productId);
  } else {
    alert("❌ Failed to update review.");
  }
}

function deleteReview(productId, reviewId) {
  if (!confirm("🗑️ Are you sure you want to delete this review?")) return;

  fetch(`/api/products/${productId}/reviews/${reviewId}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => displayProducts())
    .catch(err => {
      console.error("DELETE failed:", err);
      alert("❌ Failed to delete review.");
    });
}

async function refreshSingleProduct(productId) {
  try {
    const res = await fetch(`/api/products/${productId}`);
    const product = await res.json();
    const currentUser = getLoggedInUser();

    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;

    const reviewsHtml = product.reviews?.length
      ? product.reviews.map((r, i) => {
          const isOwner = currentUser && currentUser.name === r.username;
          return `
            <div class="border rounded p-2 mb-2 ${i === product.reviews.length - 1 ? 'glow-review' : ''}" id="review-${r._id}">
              <strong>${r.username}</strong> ⭐ ${r.rating}
              <p>${r.comment}</p>
              ${isOwner ? `
                <button class="btn btn-sm btn-outline-warning me-2" onclick="openEdit('${product._id}', '${r._id}', '${r.username}',${r.rating}, \`${r.comment.replace(/`/g, '\\`')}\`)">✏️ Patch</button>
                <button class="btn btn-sm btn-outline-info me-2" onclick="openPutEdit('${product._id}', '${r._id}', '${r.username}',${r.rating}, \`${r.comment.replace(/`/g, '\\`')}\`)">🛠️ Put</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReview('${product._id}', '${r._id}')">🗑️ Delete</button>
              ` : ""}
            </div>
          `;
        }).join("")
      : "<p class='text-muted'>No reviews yet.</p>";

    const updatedHtml = `
      ${product.imageUrl ? `<img src="${product.imageUrl}" class="product-img mb-3" />` : ""}
      <h4>${product.name}</h4>
      <p>${product.description}</p>
      <form onsubmit="submitReview(event, '${product._id}')">
        <input class="form-control mb-2" value="${currentUser?.name || currentUser?.email || ''}" readonly />
        <input type="number" class="form-control mb-2" placeholder="Rating (1-5)" min="1" max="5" required />
        <textarea class="form-control mb-2" placeholder="Comment" required></textarea>
        <button class="btn btn-outline-success w-100">💬 Add Review</button>
      </form>
      <button class="btn btn-sm btn-outline-danger mb-2 mt-2" onclick="deleteProduct('${product._id}')">🗑️ Delete Product</button>
      <div class="mt-3">${reviewsHtml}</div>
    `;

    card.innerHTML = updatedHtml;
  } catch (err) {
    console.error("❌ Failed to refresh product card:", err);
  }
}

async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product and all its reviews?")) return;

  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete product");

    await displayProducts();
  } catch (err) {
    console.error("❌ Product delete failed:", err);
    alert("Failed to delete product.");
  }
}
