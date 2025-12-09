document.addEventListener('DOMContentLoaded', function() {
    const authorSelect = document.getElementById('authorSelect');
    const editorialSelect = document.getElementById('editorialSelect');
    const priceRange = document.getElementById('priceRange');
    const booksContainer = document.getElementById('booksContainer');
    
    let allBooks = [];
    let currentAuthor = '0';
    let currentEditorial = '0';
    let currentPriceRange = '0';
    
    // Cargar autores al iniciar
    loadAuthors();
    
    // Event listeners para los filtros
    authorSelect.addEventListener('change', function() {
        currentAuthor = this.value;
        if (currentAuthor === '0') {
            loadAllBooks();
        } else {
            loadBooksByAuthor(currentAuthor);
        }
    });
    
    editorialSelect.addEventListener('change', function() {
        currentEditorial = this.value;
        filterBooks();
    });
    
    priceRange.addEventListener('change', function() {
        currentPriceRange = this.value;
        filterBooks();
    });
    
    // Función para cargar todos los autores
    function loadAuthors() {
        showLoading();
        
        fetch('servidor2.php?action=getAuthors')
            .then(response => response.json())
            .then(authors => {
                authors.forEach(author => {
                    const option = document.createElement('option');
                    option.value = author.autor;
                    option.textContent = author.autor;
                    authorSelect.appendChild(option);
                });
                
                // Cargar todas las editoriales
                loadEditorials();
            })
            .catch(error => {
                console.error('Error al cargar autores:', error);
                showError('Error al cargar los autores');
            });
    }
    
    // Función para cargar todas las editoriales
    function loadEditorials() {
        fetch('servidor2.php?action=getEditorials')
            .then(response => response.json())
            .then(editorials => {
                editorials.forEach(editorial => {
                    const option = document.createElement('option');
                    option.value = editorial.editorial;
                    option.textContent = editorial.editorial;
                    editorialSelect.appendChild(option);
                });
                
                // Cargar todos los libros inicialmente
                loadAllBooks();
            })
            .catch(error => {
                console.error('Error al cargar editoriales:', error);
                // Si no hay endpoint para editoriales, continuamos sin ellas
                loadAllBooks();
            });
    }
    
    // Función para cargar todos los libros
    function loadAllBooks() {
        showLoading();
        
        fetch('servidor2.php?action=getAllBooks')
            .then(response => response.json())
            .then(books => {
                allBooks = books;
                displayBooks(allBooks);
            })
            .catch(error => {
                console.error('Error al cargar libros:', error);
                showError('Error al cargar los libros');
            });
    }
    
    // Función para cargar libros por autor
    function loadBooksByAuthor(author) {
        showLoading();
        
        fetch(`servidor2.php?action=getBooksByAuthor&autor=${encodeURIComponent(author)}`)
            .then(response => response.json())
            .then(books => {
                allBooks = books;
                displayBooks(books);
            })
            .catch(error => {
                console.error('Error al cargar libros:', error);
                showError('Error al cargar los libros del autor seleccionado');
            });
    }
    
    // Función para filtrar libros según los criterios seleccionados
    function filterBooks() {
        let filteredBooks = allBooks;
        
        // Filtrar por editorial
        if (currentEditorial !== '0') {
            filteredBooks = filteredBooks.filter(book => 
                book.editorial === currentEditorial
            );
        }
        
        // Filtrar por rango de precio
        if (currentPriceRange !== '0') {
            filteredBooks = filteredBooks.filter(book => {
                const price = parseFloat(book.precio);
                switch(currentPriceRange) {
                    case '1': return price < 10;
                    case '2': return price >= 10 && price <= 20;
                    case '3': return price > 20;
                    default: return true;
                }
            });
        }
        
        displayBooks(filteredBooks);
    }
    
    // Función para mostrar los libros en el contenedor
    function displayBooks(books) {
        booksContainer.innerHTML = '';
        
        if (books.length === 0) {
            booksContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No se encontraron libros</h3>
                    <p>Intenta cambiar los filtros para ver más resultados</p>
                </div>
            `;
            return;
        }
        
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            bookCard.innerHTML = `
                <h3 class="book-title">${book.titulo}</h3>
                <p class="book-author">${book.autor || 'Autor no disponible'}</p>
                <div class="book-details">
                    <div class="book-meta">
                        <span class="book-price">$${book.precio}</span>
                        <span class="book-editorial">${book.editorial}</span>
                    </div>
                    <a href="${book.enlace}" target="_blank" class="book-link">Ver Detalles</a>
                </div>
            `;
            
            booksContainer.appendChild(bookCard);
        });
    }
    
    // Función para mostrar estado de carga
    function showLoading() {
        booksContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando libros...</p>
            </div>
        `;
    }
    
    // Función para mostrar error
    function showError(message) {
        booksContainer.innerHTML = `
            <div class="empty-state">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
});