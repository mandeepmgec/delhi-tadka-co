const DISCOUNT_PERCENT = 20;
const PHONE_NUMBER = "918860432553";

// cart is a map: itemName -> { name, price, qty }
let cart = {};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("discountPercent").innerText = DISCOUNT_PERCENT;
  fetch("data/menu.json")
    .then(res => res.json())
    .then(data => {
      renderCategoryNav(data);
      renderMenu(data);
    });
});

function calculateDiscount(price) {
  if (DISCOUNT_PERCENT === 0) return price;
  return Math.round(price - (price * DISCOUNT_PERCENT / 100));
}

function renderCategoryNav(menuData) {
  const nav = document.createElement("nav");
  nav.className = "category-nav";
  menuData.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.textContent = cat.category;
    if (i === 0) btn.classList.add("active");
    btn.onclick = () => {
      document.querySelectorAll(".category-nav button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("cat-" + i).scrollIntoView({ behavior: "smooth", block: "start" });
    };
    nav.appendChild(btn);
  });
  document.querySelector("header").insertAdjacentElement("afterend", nav);
}

function renderMenu(menuData) {
  const menu = document.getElementById("menu");
  menu.innerHTML = "";

  menuData.forEach((category, catIndex) => {
    const section = document.createElement("div");
    section.className = "category";
    section.id = "cat-" + catIndex;
    section.innerHTML = `<h2>${category.category}</h2>`;

    category.items.forEach(item => {
      const finalPrice = calculateDiscount(item.price);
      const dot = item.veg ? "🟢" : "🔴";
      const itemKey = item.name;

      const div = document.createElement("div");
      div.className = "menu-item";

      const discountHTML = DISCOUNT_PERCENT
        ? `<span class="old-price">₹${item.price}</span>
           <span class="price">₹${finalPrice}</span>
           <span class="discount-badge">${DISCOUNT_PERCENT}% OFF</span>`
        : `<span class="price">₹${finalPrice}</span>`;

      div.innerHTML = `
        <div class="item-info">
          <h3>${dot} ${item.name}</h3>
          <p>${item.description}</p>
          <div class="price-row">${discountHTML}</div>
          <button class="add-btn" onclick="addToCart('${itemKey.replace(/'/g, "\\'")}', ${finalPrice})">
            + Add
          </button>
        </div>
        <div class="item-image">
          <img src="images/${item.image}" alt="${item.name}" loading="lazy">
        </div>
      `;

      section.appendChild(div);
    });

    menu.appendChild(section);
  });
}

function addToCart(name, price) {
  if (cart[name]) {
    cart[name].qty += 1;
  } else {
    cart[name] = { name, price, qty: 1 };
  }
  updateCartCount();
}

function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) {
    delete cart[name];
  }
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").innerText = total;
}

function openCart() {
  document.getElementById("cartModal").style.display = "block";
  renderCart();
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

// Close modal when clicking backdrop
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cartModal").addEventListener("click", function(e) {
    if (e.target === this) closeCart();
  });
});

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  cartItems.innerHTML = "";

  const items = Object.values(cart);

  if (items.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty">🛒 Your cart is empty</div>`;
    cartTotal.innerHTML = "";
    document.querySelector(".whatsapp-btn").disabled = true;
    return;
  }

  document.querySelector(".whatsapp-btn").disabled = false;

  let total = 0;
  items.forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div class="cart-row-name">${item.name}</div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
      </div>
      <div class="cart-row-price">₹${subtotal}</div>
    `;
    cartItems.appendChild(row);
  });

  cartTotal.innerHTML = `<strong>Total: ₹${total}</strong>`;
}

function checkout() {
  const items = Object.values(cart);
  if (items.length === 0) return;

  let message = "Hi Delhi Tadka Co,%0A%0AI want to order:%0A";
  let total = 0;

  items.forEach(item => {
    const subtotal = item.price * item.qty;
    message += `${item.qty}x ${item.name} - ₹${subtotal}%0A`;
    total += subtotal;
  });

  message += `%0ATotal: ₹${total}%0A%0ADelivery Address:%0A`;

  window.open(`https://wa.me/${PHONE_NUMBER}?text=${message}`, "_blank");

  cart = {};
  updateCartCount();
  closeCart();
}
