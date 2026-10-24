// Shopping Cart Logic (localStorage)
// Industrial Training Project

const CART_STORAGE_KEY = 'mobile_store_cart';

// Get current cart array from localStorage
function getCart() {
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
}

// Save cart array to localStorage and update navbar count
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// Add a product to the cart
function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      stock: product.stock,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" to cart!`);
}

// Remove an item from the cart by its product ID
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  showToast('Item removed from cart');
}

// Update quantity of an item
function updateQuantity(productId, newQuantity) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);

  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    // Limit to stock if available
    if (item.stock && newQuantity > item.stock) {
      alert(`Sorry, only ${item.stock} units in stock!`);
      return;
    }
    item.quantity = newQuantity;
    saveCart(cart);
  }
}

// Empty the entire cart
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadge();
  showToast('Cart cleared');
}

// Calculate total cart price
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Calculate total quantity of items in cart
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Update the cart badge count in the navigation bar on every page
function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = getCartItemCount();
  }
}

// Format numbers as Indian Rupees (INR)
function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// Show friendly toast notification
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = 'toast show';

  setTimeout(() => {
    toast.className = 'toast';
  }, 2200);
}

// Quietly check backend status for the footer indicator
async function checkBackendStatus() {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  if (!dot || !text) return;

  // On GitHub Pages / static host, do not ping localhost to prevent Chrome PNA security warnings
  if (!isLocalhost || !API_URL) {
    dot.style.backgroundColor = '#3b82f6'; // Clean blue
    text.textContent = 'GitHub Pages Demo Mode • Run locally for MySQL';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/health`);
    if (res.ok) {
      dot.style.backgroundColor = '#10b981'; // Green
      text.textContent = 'Backend Online (Port 5000)';
    } else {
      dot.style.backgroundColor = '#f59e0b';
      text.textContent = 'Backend Error';
    }
  } catch (err) {
    dot.style.backgroundColor = '#ef4444'; // Red
    text.textContent = 'Backend Offline';
  }
}

// Automatically update cart badge and check status when any page loads
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  checkBackendStatus();
});
