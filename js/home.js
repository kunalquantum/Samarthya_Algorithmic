document.addEventListener('DOMContentLoaded', function() {
    function searchByCategory() {
        const selectedCategory = document.querySelector('.category-dropdown').value;
        const items = document.querySelectorAll('.course-category-item');

        items.forEach(item => {
            const category = item.querySelector('.category-subtitle').textContent.toLowerCase();
            if (category.includes(selectedCategory.toLowerCase()) || selectedCategory === "") {
                item.style.display = 'block'; // Show item if it matches
            } else {
                item.style.display = 'none'; // Hide item if it doesn't match
            }
        });
    }

    // Example: Add event listeners or functionality here
    console.log("Home page script loaded.");

    document.querySelector('.search-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const query = document.querySelector('.search-input').value.toLowerCase();
        const items = document.querySelectorAll('.course-category-item');

        items.forEach(item => {
            const title = item.querySelector('.category-title a').textContent.toLowerCase();
            if (title.includes(query)) {
                item.style.display = 'block'; // Show item if it matches
            } else {
                item.style.display = 'none'; // Hide item if it doesn't match
            }
        });
    });
});
