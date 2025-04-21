'use client';

import { useEffect, useState } from 'react';
import { Button, Spinner, Form, Dropdown } from 'react-bootstrap';
import { useAuth } from '@/utils/context/authContext';
import { getBooks } from '@/api/bookData';
import { useRouter } from 'next/navigation';
import { TbDeviceDesktopCheck, TbDeviceMobileCheck } from 'react-icons/tb';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { RiMenu5Fill } from 'react-icons/ri';

function Home() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);  // Store all authors
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getBooks().then((bookList) => {
      setBooks(bookList);
      setFilteredBooks(bookList);

      // Extract authors and filter those with at least 1 book
      const authorBookCount = bookList.reduce((acc, book) => {
        const authorKey = book.author || 'Unknown Author';
        if (!acc[authorKey]) {
          acc[authorKey] = [];
        }
        acc[authorKey].push(book);
        return acc;
      }, {});

      // Filter authors with 1 or more books and sort alphabetically
      const authorsWithBooks = Object.entries(authorBookCount)
        .filter(([author, books]) => books.length >= 1) // Changed to >= 1
        .map(([author, books]) => ({
          name: author,
          books: books,
          pen_name: books[0]?.pen_name || '', // Ensuring that we use pen_name from the first book in the list
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort authors alphabetically

      setFilteredAuthors(authorsWithBooks);
      setAllAuthors(authorsWithBooks); // Save all authors to reset the filtered list
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (bookSearchTerm.trim() === '') {
      setFilteredBooks(books);
    } else {
      const lowerSearch = bookSearchTerm.toLowerCase();
      const filteredBooksList = books.filter((book) =>
        book.title?.toLowerCase().includes(lowerSearch)
      );
      setFilteredBooks(filteredBooksList);
    }

    if (authorSearchTerm.trim() === '') {
      // Reset to all authors if search term is cleared
      setFilteredAuthors(allAuthors);
    } else {
      const lowerSearch = authorSearchTerm.toLowerCase();
      const filteredAuthorsList = allAuthors.filter((author) =>
        author.name.toLowerCase().includes(lowerSearch) || 
        author.pen_name.toLowerCase().includes(lowerSearch)  // Include pen_name in the search
      );
      setFilteredAuthors(filteredAuthorsList);
    }
  }, [bookSearchTerm, authorSearchTerm, books, allAuthors]);

  return (
    <div
      className="text-center d-flex flex-column align-items-center"
      style={{ minHeight: '100vh', padding: '40px' }}
    >
      <div
        className="w-100"
        style={{
          maxWidth: '95%',
          backgroundColor: '#D9D9D9',
          borderRadius: '30px',
          padding: '40px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {/* Container for both cards, flexing side by side */}
        <div className="d-flex justify-content-between gap-4">
          
          {/* Left Card - Book List */}
          <div style={{ flex: 1 }}>
            {/* Horizontal layout for Search Bar and Total Books Counter */}
            <div className="d-flex justify-content-between mb-3">
              <Form.Control
                type="text"
                placeholder="Search books..."
                value={bookSearchTerm}
                onChange={(e) => setBookSearchTerm(e.target.value)}
                style={{
                  maxWidth: '300px',
                  borderRadius: '30px',
                  padding: '10px 15px',
                }}
              />
              <div className="text-black fw-bold fs-5" style={{ alignSelf: 'center' }}>
                Total: {filteredBooks.length}
              </div>
            </div>

            {loading ? (
              <Spinner animation="border" variant="dark" />
            ) : filteredBooks.length === 0 ? (
              <p className="text-black">No books found.</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <ul className="list-group">
                  {filteredBooks.map((book) => (
                    <li
                      key={book.firebaseKey}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{book.title}</strong>
                        {book.date && (
                          <small className="text-muted ms-2">({book.date})</small>
                        )}
                      </div>

                      <div className="d-flex align-items-center ms-auto gap-2">
                        {book.posted_to_facebook && (
                          <TbDeviceMobileCheck color="#007bff" size={20} />
                        )}
                        {book.posted_to_website && (
                          <TbDeviceDesktopCheck color="#28a745" size={20} />
                        )}
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => router.push(`/book/${book.firebaseKey}`)}
                          style={{
                            borderRadius: '50px',
                            backgroundColor: '#D9D9D9',
                            color: 'black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '36px',
                            border: 'none',
                            padding: '0 12px',
                            fontWeight: '500',
                          }}
                        >
                          <IoIosInformationCircleOutline size={22} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Card - Authors with 1 or more books */}
          <div style={{ flex: 1 }}>
            <Form.Control
              type="text"
              placeholder="Search authors..."
              value={authorSearchTerm}
              onChange={(e) => setAuthorSearchTerm(e.target.value)}
              style={{
                maxWidth: '300px',
                borderRadius: '30px',
                padding: '10px 15px',
                marginBottom: '20px',
              }}
            />
            {loading ? (
              <Spinner animation="border" variant="dark" />
            ) : filteredAuthors.length === 0 ? (
              <p className="text-black">No authors found.</p>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <ul className="list-group">
                  {filteredAuthors.map((author) => (
                    <li
                      key={author.name}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <strong>{author.name} | Pen Name: {author.pen_name || 'N/A'} : {author.books.length}</strong>
                      </div>

                      <Dropdown>
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          style={{
                            borderRadius: '50px',
                            backgroundColor: '#D9D9D9',
                            color: 'black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '36px',
                            border: 'none',
                            padding: '0 12px',
                            fontWeight: '500',
                          }}
                        >
                          <RiMenu5Fill size={22} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                          style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            minWidth: '300px', // Increase width of dropdown
                          }}
                        >
                          {author.books.map((book) => (
                            <Dropdown.Item key={book.firebaseKey} onClick={() => router.push(`/book/${book.firebaseKey}`)}>
                              {book.title}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
