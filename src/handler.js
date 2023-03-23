const { nanoid } = require('nanoid')
const books = require('./books')

const saveBook = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
    };

    if (newBook.name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });

        response.code(400);
        return response;
    } else if (newBook.pageCount < newBook.readPage) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });

        response.code(400);
        return response;
    } else if (!(newBook.name === undefined) && (newBook.pageCount >= newBook.readPage)) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });

        books.push(newBook);

        response.code(201);
        return response;
    } else {
        const response = h.response({
            status: 'error',
            message: 'Buku gagal ditambahkan',
        });

        response.code(500);
        return response;
    }
}

const viewBook = (request, h) => {
    const { name, reading, finished } = request.query;

    if (!name && !reading && !finished) {
        // kalau tidak ada query
        const response = h
            .response({
                status: 'success',
                data: {
                    books: books.map((book) => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher,
                    })),
                },
            })
            .code(200);

        return response;
    }

    if (name) {
        const filteredBooksName = books.filter((book) => {
            // kalau ada query name
            const nameRegex = new RegExp(name, 'gi');
            return nameRegex.test(book.name);
        });

        const response = h
            .response({
                status: 'success',
                data: {
                    books: filteredBooksName.map((book) => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher,
                    })),
                },
            })
            .code(200);

        return response;
    }

    if (reading) {
        // kalau ada query reading
        const filteredBooksReading = books.filter(
            (book) => Number(book.reading) === Number(reading),
        );

        const response = h
            .response({
                status: 'success',
                data: {
                    books: filteredBooksReading.map((book) => ({
                        id: book.id,
                        name: book.name,
                        publisher: book.publisher,
                    })),
                },
            })
            .code(200);

        return response;
    }

    // kalau ada query finished
    const filteredBooksFinished = books.filter(
        (book) => Number(book.finished) === Number(finished),
    );

    const response = h
        .response({
            status: 'success',
            data: {
                books: filteredBooksFinished.map((book) => ({
                    id: book.id,
                    name: book.name,
                    publisher: book.publisher,
                })),
            },
        })
        .code(200);

    return response;
}

const getBook = (request, h) => {
    const { id } = request.params
    const book = books.filter((b) => b.id === id)[0]

    if (book !== undefined) {
        response = h.response({
            status: 'success',
            data: {
                book
            }
        })
        response.code(200)
        return response
    } else {
        const response = h.response({
            status: 'fail',
            message: 'Buku tidak ditemukan'
        })
        response.code(404)
        return response
    }
}

const editBook = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;
    const { id } = request.params
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;


    // check apakah nama ada, bila tidak return error
    if (!name) {
        response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        })
        response.code(400)
        return response
    }

    // check apakah readPage > pageCount, bila lebih return error
    if (readPage > pageCount) {
        response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
        })
        response.code(400)
        return response
    }

    const finished = pageCount === readPage;
    // cari index buku
    const index = books.findIndex((book) => book.id === id)

    if (index !== -1) {
        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            id,
            finished,
            insertedAt,
            updatedAt,
        }

        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui'
        })
        response.code(200)
        return response
    }
    // check apakah id buku ada, bila tidak return error
    response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan'
    })
    response.code(404)
    return response

}

const deleteBook = (request, h) => {
    const { id } = request.params
    const index = books.findIndex((book) => book.id === id)

    if (index !== -1) {
        books.splice(index, 1)
        const response = h
            .response({
                status: 'success',
                message: 'Buku berhasil dihapus'
            })
            .code(200)
        return response
    }

    response = h
        .response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan'
        })
        .code(404)
    return response
}

module.exports = {
    saveBook,
    viewBook,
    getBook,
    editBook,
    deleteBook
}