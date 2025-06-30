// Utility: Load from Local Storage
function getProducts() {
  return JSON.parse(localStorage.getItem("products") || "[]");
}

// Utility: Save to Local Storage
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

// Auto-detect product name from image (placeholder logic)
function autoDetectProductTitle() {
  const url = document.getElementById("imageUrl").value;
  const nameInput = document.getElementById("productName");

  if (url.trim() === "") {
    alert("Please enter an image URL first.");
    return;
  }

  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split("/");

    // Extract brand from hostname (word before ".com")
    let hostParts = urlObj.hostname.split(".");
    let brand = "";

    for (let i = 0; i < hostParts.length; i++) {
      if (hostParts[i] === "com" && i > 0) {
        brand = hostParts[i - 1];
        break;
      }
    }

    brand = brand.charAt(0).toUpperCase() + brand.slice(1); // Capitalize

    const tIndex = pathSegments.indexOf("t");
    if (tIndex !== -1 && pathSegments.length > tIndex + 1) {
      let productSlug = pathSegments[tIndex + 1];
      let productTitle = productSlug
        .replace(/-/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

      let finalTitle = `${brand} ${productTitle}`;
      nameInput.value = finalTitle;
    } else {
      nameInput.value = "Unknown Product";
    }
  } catch (error) {
    alert("Invalid URL format.");
    nameInput.value = "";
  }
}

// Add Product (called from add.html)
async function addProduct() {
  const name = document.getElementById("productName").value.trim();
  const desc = document.getElementById("productDescription").value.trim();

  if (!name || !desc) {
    alert("Name and description are required.");
    return;
  }

  // ✅ Fetch all products and check for duplicate name
  const res = await fetch("http://localhost:5000/api/products");
  const products = await res.json();
  const exists = products.some(p => p.name.toLowerCase() === name.toLowerCase());

  if (exists) {
    alert("❌ A product with this name already exists.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: desc })
    });

    if (!response.ok) throw new Error("Failed to add product");

    alert("✅ Product Added Successfully");
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert("❌ Error adding product.");
  }
}

async function displayProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;

  try {
    const res = await fetch("http://localhost:5000/api/products");
    const products = await res.json();

    container.innerHTML = "";

    products.forEach(product => {
      const col = document.createElement("div");
      col.className = "col-md-6";

      const html = `
        <div class="card bg-dark text-light p-3 shadow rounded-4" data-product-id="${product._id}">
          ${product.img ? `<img src="${product.img}" class="product-img mb-3" />` : ""}
          <h4>${product.name}</h4>
          <p>${product.description}</p>
          <form onsubmit="submitReview(event, '${product._id}')">
            <input class="form-control mb-2" placeholder="Name" required />
            <input type="number" class="form-control mb-2" placeholder="Rating (1-5)" min="1" max="5" required />
            <textarea class="form-control mb-2" placeholder="Comment"></textarea>
            <button class="btn btn-outline-success w-100">💬 Add Review</button>
          </form>
          <button class="btn btn-sm btn-outline-danger mb-2" onclick="deleteProduct('${product._id}')">🗑️ Delete Product</button>

          <div class="mt-3">
            ${
              product.reviews && product.reviews.length > 0
                ? product.reviews.map(r => `
                    <div class="border rounded p-2 mb-2" id="review-${r._id}">
                      <strong>${r.username}</strong> ⭐ ${r.rating}
                      <p>${r.comment}</p>
                      <button class="btn btn-sm btn-outline-warning me-2" onclick="openEdit('${product._id}', '${r._id}', '${r.username}', ${r.rating}, \`${r.comment.replace(/`/g, '\\`')}\`)">✏️ Patch</button>
                      <button class="btn btn-sm btn-outline-info me-2" onclick="openPutEdit('${product._id}', '${r._id}', '${r.username}', ${r.rating}, \`${r.comment.replace(/`/g, '\\`')}\`)">🛠️ Put</button>
                      <button class="btn btn-sm btn-outline-danger" onclick="deleteReview('${product._id}', '${r._id}')">🗑️ Delete</button>
                    </div>
                  `).join("")
                : "<p class='text-muted'>No reviews yet.</p>"
            }
          </div>
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

  const username = form[0].value.trim();
  const rating = parseInt(form[1].value);
  const comment = form[2].value.trim();

  if (!username || !rating || !comment) {
    alert("All review fields are required.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, rating, comment })
    });

    if (!res.ok) {
      throw new Error("Failed to submit review");
    }

    // ✅ Clear the form
    form.reset();

    // ✅ Refresh the products list to show new review
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
function deleteReview(productId, reviewId) {
  if (!confirm("🗑️ Are you sure you want to delete this review?")) return;

  fetch(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`, {
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
    const res = await fetch(`http://localhost:5000/api/products/${productId}`);
    const product = await res.json();

    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;

    const updatedHtml = `
      ${product.img ? `<img src="${product.img}" class="product-img mb-3" />` : ""}
      <h4>${product.name}</h4>
      <p>${product.description}</p>
      <form onsubmit="submitReview(event, '${product._id}')">
        <input class="form-control mb-2" placeholder="Name" required />
        <input type="number" class="form-control mb-2" placeholder="Rating (1-5)" min="1" max="5" required />
        <textarea class="form-control mb-2" placeholder="Comment"></textarea>
        <button class="btn btn-outline-success w-100">💬 Add Review</button>
      </form>
      <div class="mt-3">
        ${product.reviews.map((r, i) => `
  <div class="border rounded p-2 mb-2 ${i === product.reviews.length - 1 ? 'glow-review' : ''}">

            <strong>${r.username}</strong> ⭐ ${r.rating}
            <p>${r.comment}</p>
            <button class="btn btn-sm btn-outline-warning me-2" onclick="openEdit('${product._id}', '${r._id}', '${r.username}', ${r.rating}, \`${r.comment.replace(/`/g, '\\`')}\`)">✏️ Patch</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteReview('${product._id}', '${r._id}')">🗑️ Delete</button>
          </div>
        `).join("") || "<p class='text-muted'>No reviews yet.</p>"}
      </div>
    `;

    card.innerHTML = updatedHtml;
  } catch (err) {
    console.error("Failed to refresh product card:", err);
  }
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

  const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    await displayProducts(); // reload all products
  } else {
    alert("❌ Failed to update review.");
  }
}
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product and all its reviews?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete product");

    await displayProducts(); // Refresh the product list
  } catch (err) {
    console.error("❌ Product delete failed:", err);
    alert("Failed to delete product.");
  }
}
