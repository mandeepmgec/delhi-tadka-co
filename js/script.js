const DISCOUNT_PERCENT = 20;
const PHONE_NUMBER = "918860432553";

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("discountPercent").innerText = DISCOUNT_PERCENT;
  fetch("data/menu.json")
    .then(res => res.json())
    .then(data => renderMenu(data));
});

function calculateDiscount(price) {
  if (DISCOUNT_PERCENT === 0) return price;
  return Math.round(price - (price * DISCOUNT_PERCENT / 100));
}

function renderMenu(menuData) {
  const menu = document.getElementById("menu");
  menu.innerHTML = "";

  menuData.forEach(category => {
    const section = document.createElement("div");
    section.className = "category";
    section.innerHTML = `<h2>${category.category}</h2>`;

    category.items.forEach(item => {
      const finalPrice = calculateDiscount(item.price);
      const dot = item.veg ? "🟢" : "🔴";

      const div = document.createElement("div");
      div.className = "menu-item";

      div.innerHTML = `
        <div class="item-info">
          <h3>${dot} ${item.name}</h3>
          <p>${item.description}</p>
          ${DISCOUNT_PERCENT ?
            `<div class="old-price">₹${item.price}</div>
             <div class="price">₹${finalPrice}</div>`
            :
            `<div class="price">₹${item.price}</div>`
          }
          <button onclick="addToCart('${item.name}', ${finalPrice})">
            Add to Cart
          </button>
        </div>
        <div class="item-image">
          <img src="images/${item.image}" alt="${item.name}">
        </div>
      `;

      section.appendChild(div);
    });

    menu.appendChild(section);
  });
}

function addToCart(name, price) {
  cart.push({ name, price });
  document.getElementById("cartCount").innerText = cart.length;
}

function openCart() {
  document.getElementById("cartModal").style.display = "block";
  renderCart();
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

function renderCart() {
  let total = 0;
  const cartItems = document.getElementById("cartItems");
  cartItems.innerHTML = "";

  cart.forEach(item => {
    total += item.price;
    cartItems.innerHTML += `<p>${item.name} – ₹${item.price}</p>`;
  });

  document.getElementById("cartTotal").innerHTML =
    `<strong>Total: ₹${total}</strong>`;
}

function checkout() {
  let message = "Hi Delhi Tadka Co,%0A%0AI want to order:%0A";
  let total = 0;

  cart.forEach(item => {
    message += `${item.name} - ₹${item.price}%0A`;
    total += item.price;
  });

  message += `%0ATotal: ₹${total}%0A%0ADelivery Address:%0A`;

  window.open(
    `https://wa.me/${PHONE_NUMBER}?text=${message}`,
    "_blank"
  );

  cart = [];
  document.getElementById("cartCount").innerText = 0;
  closeCart();
}
