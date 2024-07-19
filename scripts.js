// Import data and constants
import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Initial page and matches setup
let page = 1;
let matches = books;

// Function to render initial books and update book list
const renderBooks = (bookList) => {
    const fragment = document.createDocumentFragment();

    bookList.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const element = createBookElement(book);
        fragment.appendChild(element);
    });

    const listItems = document.querySelector('[data-list-items]');
    listItems.innerHTML = '';
    listItems.appendChild(fragment);

    updateShowMoreButton();
};

// Function to create a single book preview element
const createBookElement = ({ id, image, title, author }) => {
    const element = document.createElement('button');
    element.classList.add('preview');
    element.setAttribute('data-preview', id);

    element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

    return element;
};

// Function to update the "Show more" button state
const updateShowMoreButton = () => {
    const remainingBooks = matches.length - (page * BOOKS_PER_PAGE);
    const button = document.querySelector('[data-list-button]');
    button.innerText = `Show more (${remainingBooks > 0 ? remainingBooks : 0})`;
    button.disabled = remainingBooks <= 0;
};

// Function to handle form submission for search
const handleSearchFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);

    const result = books.filter(book => {
        let genreMatch = filters.genre === 'any';

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true; }
        }

        return (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        );
    });

    page = 1;
    matches = result;

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
    }

    renderBooks(matches);
};

// Function to handle "Show more" button click
const handleShowMoreButtonClick = () => {
    const fragment = document.createDocumentFragment();
    const startIndex = page * BOOKS_PER_PAGE;
    const endIndex = (page + 1) * BOOKS_PER_PAGE;

    matches.slice(startIndex, endIndex).forEach(book => {
        const element = createBookElement(book);
        fragment.appendChild(element);
    });

    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
    updateShowMoreButton();
};

// Event listeners setup
document.addEventListener('DOMContentLoaded', () => {
    renderBooks(matches);

    const genreDropdown = document.querySelector('[data-search-genres]');
    const authorDropdown = document.querySelector('[data-search-authors]');

    // Populate genre dropdown
    populateDropdown(genres, genreDropdown, 'All Genres');

    // Populate author dropdown
    populateDropdown(authors, authorDropdown, 'All Authors');

    // Theme initialization
    setTheme();

    // Event listeners
    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        setTheme();
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-search-form]').addEventListener('submit', handleSearchFormSubmit);

    document.querySelector('[data-list-button]').addEventListener('click', handleShowMoreButtonClick);
});

// Function to populate dropdown options
const populateDropdown = (data, dropdown, defaultOptionText) => {
    const fragment = document.createDocumentFragment();

    const defaultOption = document.createElement('option');
    defaultOption.value = 'any';
    defaultOption.innerText = defaultOptionText;
    fragment.appendChild(defaultOption);

    Object.entries(data).forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    });

    dropdown.appendChild(fragment);
};

// Function to set theme based on system preference
const setTheme = () => {
    const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    const root = document.documentElement;
    root.style.setProperty('--color-dark', theme === 'night' ? '255, 255, 255' : '10, 10, 20');
    root.style.setProperty('--color-light', theme === 'night' ? '10, 10, 20' : '255, 255, 255');
    document.querySelector('[data-settings-theme]').value = theme;
};

// Event listener to handle book preview click
document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const previewButton = event.target.closest('.preview');
    if (!previewButton) return;

    const bookId = previewButton.getAttribute('data-preview');
    const activeBook = books.find(book => book.id === bookId);

    if (activeBook) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = activeBook.image;
        document.querySelector('[data-list-image]').src = activeBook.image;
        document.querySelector('[data-list-title]').innerText = activeBook.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[activeBook.author]} (${new Date(activeBook.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = activeBook.description;
    }
});

// Event listeners to handle overlay interactions
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});
