'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Spinner, Button } from 'react-bootstrap';
import { getDatabase, ref, get, remove, update } from 'firebase/database';
import { useAuth } from '@/utils/context/authContext';

export default function BookDetails() {
  const { firebaseKey } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const db = getDatabase();

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid && firebaseKey) {
        try {
          const userSnap = await get(ref(db, `users/${user.uid}`));
          if (userSnap.exists()) setRole(userSnap.val().role);
          else setRole('va');

          const bookSnap = await get(ref(db, `books/${firebaseKey}`));
          if (bookSnap.exists()) setBook(bookSnap.val());
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user, firebaseKey]);

  const handleDelete = () => {
    remove(ref(db, `books/${firebaseKey}`)).then(() => {
      router.push('/');
    });
  };

  const handlePost = (platform) => {
    const today = new Date().toISOString().split('T')[0];
    const updatePath = platform === 'facebook' ? 'posted_to_facebook' : 'posted_to_website';

    update(ref(db, `books/${firebaseKey}`), {
      [updatePath]: today,
    }).then(() => {
      setBook((prev) => ({ ...prev, [updatePath]: today }));
    });
  };

  if (loading || !book) return <Spinner animation="border" className="text-center m-5" />;

  return (
    <div className="d-flex justify-content-center p-5">
      <Card style={{ width: '100%', maxWidth: '1100px', minHeight: '600px', display: 'flex', flexDirection: 'row', backgroundColor: '#D9D9D9', border: 'none', borderRadius: '30px' }}>
        {/* Left - Image */}
        <div style={{ 
          flex: 1, 
          borderTopLeftRadius: '30px', 
          borderBottomLeftRadius: '30px',
          backgroundColor: '#D9D9D9', // same as the card background
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Card.Img
            src={book.image || '/images/defaultImage.png'}
            alt={book.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/defaultImage.png';
            }}
          />
        </div>

        {/* Right - Content */}
        <Card.Body style={{ flex: 1.2, padding: '40px', color: 'black' }}>
        <h2 className="mb-2">{book.title}</h2>
        <p className="mb-1"><strong>Author:</strong> {book.author}</p>
        <p className="mb-4"><strong>{book.genre}</strong> | {book.sub_genre || 'N/A'}</p>


          <p><strong>Date Completed:</strong> {book.date}</p>

          {role === 'admin' && (
            <div className="my-3">
              <p><strong>Word Count:</strong> {book.word_count}</p>
              <p><strong>Hours:</strong> {book.hours} | <strong>Hourly Rate:</strong> ${book.hourly_rate}</p>
              <p><strong>Rate:</strong> {Number(book.rate).toFixed(3)} | <strong>Invoiced:</strong> ${book.invoiced_amount}</p>
              <p><strong>WPH:</strong> {book.wph}</p>
            </div>
          )}

          {book.amazonLink && (
            <p><strong>Amazon:</strong> <a href={book.amazonLink} target="_blank" rel="noreferrer">{book.amazonLink}</a></p>
          )}

          {/* Post Buttons */}
          {(role === 'admin' || role === 'va') && (
            <div className="d-flex flex-column gap-2 mt-4">
              <Button
                variant="info"
                onClick={() => handlePost('facebook')}
                disabled={!!book.posted_to_facebook}
                className="w-50 rounded-pill"
              >
                {book.posted_to_facebook ? `Posted to FB: ${book.posted_to_facebook}` : 'Post to FB'}
              </Button>

              <Button
                variant="info"
                onClick={() => handlePost('website')}
                disabled={!!book.posted_to_website}
                className="w-50 rounded-pill"
              >
                {book.posted_to_website ? `Posted to Web: ${book.posted_to_website}` : 'Post to Website'}
              </Button>
            </div>
          )}

          {/* Admin Buttons */}
          {role === 'admin' && (
            <div className="d-flex gap-2 mt-4">
              <Button className="w-25 rounded-pill" variant="primary" onClick={() => router.push(`/book/edit/${firebaseKey}`)}>
                Edit
              </Button>
              <Button className="w-25 rounded-pill" variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}

          {/* VA Button */}
          {role === 'va' && (
            <div className="d-flex gap-2 mt-4">
              <Button className="w-25 rounded-pill" variant="secondary" onClick={() => router.push(`/book/vaEdit/${firebaseKey}`)}>
                VA Edit
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
