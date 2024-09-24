document.addEventListener('DOMContentLoaded', () => {
    loadBooks(); // Memuat buku saat halaman dimuat

    document.getElementById('bookForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addBook(); 
    });

    document.addEventListener('click', function(event) {
        const bookItem = event.target.closest('[data-bookid]');
        
        if (event.target.matches('[data-testid="bookItemDeleteButton"]') && bookItem) {
            deleteBook(bookItem);
            saveBooks(); 
        } else if (event.target.matches('[data-testid="bookItemEditButton"]') && bookItem) {
            editBook(bookItem);
            saveBooks(); 
        } else if (event.target.matches('[data-testid="bookItemIsCompleteButton"]') && bookItem) {
            toggleComplete(bookItem);
            saveBooks(); 
        }
    });    

    document.getElementById('searchBook').addEventListener('submit', function(event) {
        event.preventDefault(); 

        const searchQuery = document.getElementById('searchBookTitle').value.toLowerCase();
        const books = JSON.parse(localStorage.getItem('books')) || [];

        clearBookLists(); 

        if (searchQuery === '') {
            loadBooks();
            return;
        }

        const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchQuery));

        if (filteredBooks.length > 0) {
            filteredBooks.forEach(book => {
                const bookItem = createBookElement(book);
                const bookList = book.isComplete ? document.getElementById('completeBookList') : document.getElementById('incompleteBookList');
                bookList.appendChild(bookItem);
            });
        } else {
            const noResults = document.createElement('p');
            noResults.textContent = 'Tidak ada buku yang ditemukan.';
            document.getElementById('incompleteBookList').appendChild(noResults.cloneNode(true));
            document.getElementById('completeBookList').appendChild(noResults);
        }
    });
}); 

// Fungsi untuk mengosongkan daftar buku
function clearBookLists() {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    
    while (incompleteBookList.firstChild) {
        incompleteBookList.removeChild(incompleteBookList.firstChild);
    }
    
    while (completeBookList.firstChild) {
        completeBookList.removeChild(completeBookList.firstChild);
    }
}

function addBook() {
    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const year = parseInt(document.getElementById('bookFormYear').value, 10);
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const bookId = new Date().getTime();

    const bookItem = createBookElement({ id: bookId, title, author, year, isComplete });
    const bookList = isComplete ? document.getElementById('completeBookList') : document.getElementById('incompleteBookList');
    bookList.appendChild(bookItem);
    
    document.getElementById('bookForm').reset();
    saveBooks();
}

function createBookElement(book) {
    const bookItem = document.createElement('div');
    bookItem.setAttribute('data-bookid', book.id);
    bookItem.setAttribute('data-testid', 'bookItem');

    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.textContent = book.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.textContent = `Penulis: ${book.author}`;

    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.textContent = `Tahun: ${book.year}`;

    const buttonContainer = document.createElement('div');
    const completeButton = document.createElement('button');
    completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    completeButton.textContent = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.textContent = 'Hapus Buku';

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.textContent = 'Edit Buku';

    buttonContainer.appendChild(completeButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    bookItem.appendChild(bookTitle);
    bookItem.appendChild(bookAuthor);
    bookItem.appendChild(bookYear);
    bookItem.appendChild(buttonContainer);

    return bookItem;
}

function deleteBook(bookItem) {
    const bookId = bookItem.getAttribute('data-bookid');
    bookItem.remove(); // Hapus dari tampilan

    // Menghapus buku dari localStorage
    let books = JSON.parse(localStorage.getItem('books')) || [];
    books = books.filter(book => book.id !== bookId); 
    localStorage.setItem('books', JSON.stringify(books));

    console.log('Books after deletion:', books); 
}

function editBook(bookItem) {
    const bookId = bookItem.getAttribute('data-bookid');
    const title = bookItem.querySelector('[data-testid="bookItemTitle"]').textContent;
    const author = bookItem.querySelector('[data-testid="bookItemAuthor"]').textContent.replace('Penulis: ', '');
    const year = parseInt(bookItem.querySelector('[data-testid="bookItemYear"]').textContent.replace('Tahun: ', ''), 10);
    const isComplete = bookItem.querySelector('[data-testid="bookItemIsCompleteButton"]').textContent === 'Selesai dibaca';

    // Memasukkan data ke form
    document.getElementById('bookFormTitle').value = title;
    document.getElementById('bookFormAuthor').value = author;
    document.getElementById('bookFormYear').value = year;
    document.getElementById('bookFormIsComplete').checked = isComplete;

    const form = document.getElementById('bookForm');

    // Menghapus buku dari tampilan (jika ada)
    bookItem.remove();

    // Menambahkan event listener pada form untuk menyimpan perubahan
    form.onsubmit = function(event) {
        event.preventDefault();
        
        const updatedTitle = document.getElementById('bookFormTitle').value.trim();
        const updatedAuthor = document.getElementById('bookFormAuthor').value.trim();
        const updatedYear = parseInt(document.getElementById('bookFormYear').value, 10);
        const updatedIsComplete = document.getElementById('bookFormIsComplete').checked;
    
        // Validasi input
        if (!updatedTitle || !updatedAuthor || isNaN(updatedYear)) {
            alert('Harap isi semua bidang dengan benar!');
            return;
        }
    
        const updatedBook = {
            id: bookId, 
            title: updatedTitle,
            author: updatedAuthor,
            year: updatedYear,
            isComplete: updatedIsComplete,
        };
    
        // Simpan buku yang diperbarui ke tampilan
        const newBookItem = createBookElement(updatedBook);
        const bookList = updatedBook.isComplete ? document.getElementById('completeBookList') : document.getElementById('incompleteBookList');
        bookList.appendChild(newBookItem);
    
        // Simpan buku yang diperbarui ke localStorage
        saveBooks(); 
        form.reset(); 
    };
}

function toggleComplete(bookItem) {
    const bookId = bookItem.getAttribute('data-bookid');
    const isComplete = bookItem.querySelector('[data-testid="bookItemIsCompleteButton"]').textContent === 'Belum selesai dibaca';
    const updatedBookItem = { 
        id: bookId, 
        title: bookItem.querySelector('[data-testid="bookItemTitle"]').textContent, 
        author: bookItem.querySelector('[data-testid="bookItemAuthor"]').textContent.replace('Penulis: ', ''),
        year: parseInt(bookItem.querySelector('[data-testid="bookItemYear"]').textContent.replace('Tahun: ', ''), 10),
        isComplete: !isComplete 
    };

    bookItem.remove(); // Hapus dari tampilan

    const newBookElement = createBookElement(updatedBookItem);
    const bookList = updatedBookItem.isComplete ? document.getElementById('completeBookList') : document.getElementById('incompleteBookList');
    bookList.appendChild(newBookElement);
}

function saveBooks() {
    const books = [];

    // Mengambil semua buku dari kedua daftar dan menyimpannya ke dalam array
    document.querySelectorAll('#incompleteBookList [data-bookid]').forEach(bookItem => {
        books.push({
            id: bookItem.getAttribute('data-bookid'),
            title: bookItem.querySelector('[data-testid="bookItemTitle"]').textContent,
            author: bookItem.querySelector('[data-testid="bookItemAuthor"]').textContent.replace('Penulis: ', ''),
            year: parseInt(bookItem.querySelector('[data-testid="bookItemYear"]').textContent.replace('Tahun: ', ''), 10),
            isComplete: false
        });
    });

    document.querySelectorAll('#completeBookList [data-bookid]').forEach(bookItem => {
        books.push({
            id: bookItem.getAttribute('data-bookid'),
            title: bookItem.querySelector('[data-testid="bookItemTitle"]').textContent,
            author: bookItem.querySelector('[data-testid="bookItemAuthor"]').textContent.replace('Penulis: ', ''),
            year: parseInt(bookItem.querySelector('[data-testid="bookItemYear"]').textContent.replace('Tahun: ', ''), 10),
            isComplete: true
        });
    });

    localStorage.setItem('books', JSON.stringify(books));
}

function loadBooks() {
    const books = JSON.parse(localStorage.getItem('books')) || [];

    books.forEach(book => {
        const bookItem = createBookElement(book);
        const bookList = book.isComplete ? document.getElementById('completeBookList') : document.getElementById('incompleteBookList');
        bookList.appendChild(bookItem);
    });
}