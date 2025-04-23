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
  const [allAuthors, setAllAuthors] = useState([]);
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getBooks().then((bookList) => {
      const sortedBooks = [...bookList].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    
      setBooks(sortedBooks);
      setFilteredBooks(sortedBooks);
      // Group books by author + pen_name combo 
      const authorGroups = {};
      bookList.forEach((book) => {
        const author = book.author || '';
        const penName = book.pen_name || '';
        const key = `${author}|||${penName}`;
        if (!authorGroups[key]) {
          authorGroups[key] = {
            author,
            pen_name: penName,
            books: [],
          };
        }
        authorGroups[key].books.push(book);
      });

      const authorEntries = Object.values(authorGroups).sort((a, b) =>
        a.author.localeCompare(b.author)
      );

      setFilteredAuthors(authorEntries);
      setAllAuthors(authorEntries);
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
      setFilteredAuthors(allAuthors);
    } else {
      const lowerSearch = authorSearchTerm.toLowerCase();
      const filteredAuthorsList = allAuthors.filter((entry) =>
        entry.author.toLowerCase().includes(lowerSearch) ||
        entry.pen_name.toLowerCase().includes(lowerSearch)
      );
      setFilteredAuthors(filteredAuthorsList);
    }
  }, [bookSearchTerm, authorSearchTerm, books, allAuthors]);

  return (
    <div className="text-center d-flex flex-column align-items-center" style={{ minHeight: '100vh', padding: '40px' }}> //order books newest on top to lowest bottom
      <div className="w-100" style={{
        maxWidth: '95%',
        backgroundColor: '#D9D9D9',
        borderRadius: '30px',
        padding: '40px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}>
        <div className="d-flex justify-content-between gap-4">
          {/* Book List */}
          <div style={{ flex: 1 }}>
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

                      {/* Authors List */}
            <div style={{ flex: 1 }}>
              <div className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search authors..."
                  value={authorSearchTerm}
                  onChange={(e) => setAuthorSearchTerm(e.target.value)}
                  style={{
                    maxWidth: '300px',
                    borderRadius: '30px',
                    padding: '10px 15px',
                  }}
                />
              </div>
              {loading ? (
                <Spinner animation="border" variant="dark" />
              ) : filteredAuthors.length === 0 ? (
                <p className="text-black">No authors found.</p>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <ul className="list-group">
                    {filteredAuthors.map((entry) => (
                      <li
                        key={`${entry.author}-${entry.pen_name}`}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <strong>
                            {entry.author}
                            {entry.pen_name && ` | ${entry.pen_name}`} : {entry.books.length}
                          </strong>
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
                              minWidth: '300px',
                            }}
                          >
                            {entry.books.map((book) => (
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
