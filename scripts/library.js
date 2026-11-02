export function initializeLibrary() {
    const grid = document.querySelector(".book-grid");
    const searchForm = document.querySelector(".search");
    const searchInput = searchForm?.querySelector('input[type="search"]');
    const status = document.querySelector("#search-status");

    if (!grid || !searchForm || !searchInput || !status) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll(".book-card"));
    const query = new URLSearchParams(location.search).get("q") ?? "";
    searchInput.value = query;

    const filterBooks = () => {
        const normalizedQuery = searchInput.value.trim().toLocaleLowerCase();
        let visibleCount = 0;

        for (const card of cards) {
            const matches = card.textContent?.toLocaleLowerCase().includes(normalizedQuery) ?? false;
            card.hidden = !matches;
            visibleCount += Number(matches);
        }

        status.textContent = normalizedQuery
            ? `${visibleCount} ${visibleCount === 1 ? "book" : "books"} found`
            : `${cards.length} books`;
    };

    searchInput.addEventListener("input", filterBooks);
    filterBooks();
}
