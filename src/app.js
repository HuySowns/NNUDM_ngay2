// API URL - Load data từ db.json
const API_URL = './db.json';

// Global variables
let allProducts = [];
let filteredProducts = [];
let currentSort = 'none';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

/**
 * Load products from db.json
 */
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderTable(filteredProducts);
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        showErrorMessage('Không thể tải dữ liệu sản phẩm. Vui lòng kiểm tra db.json');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search input - onChanged event
    document.getElementById('searchInput').addEventListener('input', (e) => {
        onChanged(e.target.value);
    });

    // Sort buttons
    document.getElementById('sortNameAsc').addEventListener('click', () => {
        sortBy('nameAsc');
    });

    document.getElementById('sortNameDesc').addEventListener('click', () => {
        sortBy('nameDesc');
    });

    document.getElementById('sortPriceAsc').addEventListener('click', () => {
        sortBy('priceAsc');
    });

    document.getElementById('sortPriceDesc').addEventListener('click', () => {
        sortBy('priceDesc');
    });
}

/**
 * Handle search input change
 * @param {string} searchTerm - Search term from input
 */
function onChanged(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (term === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(term)
        );
    }

    // Reset sort when searching
    currentSort = 'none';
    renderTable(filteredProducts);
}

/**
 * Sort products
 * @param {string} sortType - Sort type (nameAsc, nameDesc, priceAsc, priceDesc)
 */
function sortBy(sortType) {
    let sorted = [...filteredProducts];

    switch (sortType) {
        case 'nameAsc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'nameDesc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'priceAsc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'priceDesc':
            sorted.sort((a, b) => b.price - a.price);
            break;
    }

    currentSort = sortType;
    filteredProducts = sorted;
    renderTable(filteredProducts);
    updateSortButtonsUI(sortType);
}

/**
 * Update UI for active sort button
 * @param {string} sortType - Current sort type
 */
function updateSortButtonsUI(sortType) {
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const buttonMap = {
        'nameAsc': '#sortNameAsc',
        'nameDesc': '#sortNameDesc',
        'priceAsc': '#sortPriceAsc',
        'priceDesc': '#sortPriceDesc'
    };

    if (buttonMap[sortType]) {
        document.querySelector(buttonMap[sortType]).classList.add('active');
    }
}

/**
 * Render products table
 * @param {array} products - Array of products to render
 */
function renderTable(products) {
    const tableBody = document.getElementById('productTableBody');
    const resultCount = document.getElementById('resultCount');
    const noResults = document.getElementById('noResults');

    resultCount.textContent = products.length;

    if (products.length === 0) {
        tableBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    tableBody.innerHTML = products.map(product => createTableRow(product)).join('');
}

/**
 * Create a table row HTML for a product
 * @param {object} product - Product object
 * @returns {string} HTML table row
 */
function createTableRow(product) {
    const category = product.category?.name || 'N/A';
    const price = product.price ? product.price.toLocaleString('vi-VN') : '0';
    const image = product.images?.[0] || 'https://via.placeholder.com/60';
    const description = product.description || 'Không có mô tả';

    return `
        <tr>
            <td><small class="text-muted">#${product.id}</small></td>
            <td>
                <strong>${escapeHtml(product.title)}</strong>
            </td>
            <td>
                <span class="category-badge">${escapeHtml(category)}</span>
            </td>
            <td>
                <span class="description-text">${escapeHtml(description)}</span>
            </td>
            <td>
                <span class="price-badge">${price}₫</span>
            </td>
            <td>
                <img src="${image}" alt="${escapeHtml(product.title)}" class="product-image" onerror="this.src='https://via.placeholder.com/60'">
            </td>
        </tr>
    `;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="6">
                <div class="alert alert-danger mb-0" role="alert">
                    <i class="fas fa-exclamation-circle"></i> ${message}
                </div>
            </td>
        </tr>
    `;
}
