'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { Button, Row, Col, Container } from 'react-bootstrap';
import { useAuth } from '@/utils/context/authContext';
import { createBook, updateBook } from '@/api/bookData';
import { getDatabase, ref, get } from 'firebase/database';
import PropTypes from 'prop-types';

const initialState = {
  title: '',
  author: '',
  genre: '',
  sub_genre: '',
  pen_name: '',
  date: '',
  amazonLink: '',
  image: '',
  word_count: '',
  hours: '',
  hourly_rate: '',
  invoiced_amount: '',
  wph: '',
  status: '',
  posted_to_facebook: '',
  posted_to_website: ''
};

function BookForm({ obj = initialState }) {
  const [formInput, setFormInput] = useState(initialState);
  const [userRole, setUserRole] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const db = getDatabase();

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) setUserRole(snapshot.val().role);
      });
    }
  }, [user]);

  useEffect(() => {
    if (obj && Object.keys(obj).length > 0) {
      setFormInput(obj);
    }
  }, [obj]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedInput = { ...formInput, [name]: value };

    const wordCount = Number(updatedInput.word_count);
    const hoursWorked = Number(updatedInput.hours);
    const invoicedAmount = Number(updatedInput.invoiced_amount);

    if (hoursWorked > 0) {
      if (wordCount > 0) {
        updatedInput.wph = (wordCount / hoursWorked).toFixed(2);
      }

      if (invoicedAmount > 0) {
        updatedInput.hourly_rate = (invoicedAmount / hoursWorked).toFixed(4); // changed this to 4 decimal places
      }
    }

    setFormInput(updatedInput);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userRole !== 'admin') return;

    const payload = {
      ...formInput,
      uid: user.uid,
      image: formInput.image || '/images/defaultImage.png',
    };

    if (formInput.firebaseKey) {
      updateBook(formInput.firebaseKey, payload).then(() => {
        router.push(`/book/${formInput.firebaseKey}`);
      });
    } else {
      createBook(payload).then(({ firebaseKey }) => {
        updateBook(firebaseKey, { firebaseKey }).then(() => {
          router.push('/');
        });
      });
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <div
        style={{
          backgroundColor: '#D9D9D9',
          borderRadius: '30px',
          padding: '50px',
          width: '95%',
          maxWidth: '1100px',
        }}
      >
        <h2 className="text-black mb-4 text-center">
          {formInput.firebaseKey ? 'Update' : 'Create'} Book
        </h2>
        <Form onSubmit={handleSubmit}>
          <Row xs={1} md={2} className="g-4">
            <Col>
              <FloatingLabel controlId="title" label="Book Title">
                <Form.Control type="text" name="title" value={formInput.title} onChange={handleChange} required />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel controlId="author" label="Author">
                <Form.Control type="text" name="author" value={formInput.author} onChange={handleChange} required />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel controlId="genre" label="Genre">
                <Form.Control type="text" name="genre" value={formInput.genre} onChange={handleChange} required />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel controlId="sub_genre" label="Sub Genre">
                <Form.Control type="text" name="sub_genre" value={formInput.sub_genre} onChange={handleChange} />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel controlId="pen_name" label="Pen Name">
                <Form.Control type="text" name="pen_name" value={formInput.pen_name} onChange={handleChange} />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel controlId="date" label="Date">
                <Form.Control type="date" name="date" value={formInput.date} onChange={handleChange} required />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel controlId="amazonLink" label="Amazon Link">
                <Form.Control type="url" name="amazonLink" value={formInput.amazonLink} onChange={handleChange} />
              </FloatingLabel>
            </Col>

            <Col>
              <FloatingLabel controlId="image" label="Image URL">
                <Form.Control type="text" name="image" value={formInput.image} onChange={handleChange} />
              </FloatingLabel>
            </Col>

            {userRole === 'admin' && (
              <>
                <Col>
                  <FloatingLabel controlId="word_count" label="Word Count">
                    <Form.Control type="number" name="word_count" value={formInput.word_count} onChange={handleChange} />
                  </FloatingLabel>
                </Col>

                <Col>
                  <FloatingLabel controlId="hours" label="Hours Worked">
                    <Form.Control type="number" name="hours" value={formInput.hours} onChange={handleChange} />
                  </FloatingLabel>
                </Col>

                <Col>
                  <FloatingLabel controlId="hourly_rate" label="Hourly Rate ($)">
                    <Form.Control type="number" name="hourly_rate" value={formInput.hourly_rate} onChange={handleChange} />
                  </FloatingLabel>
                </Col>

                <Col>
                  <FloatingLabel controlId="invoiced_amount" label="Invoiced Amount ($)">
                    <Form.Control type="number" name="invoiced_amount" value={formInput.invoiced_amount} onChange={handleChange} />
                  </FloatingLabel>
                </Col>

                <Col>
                  <FloatingLabel controlId="wph" label="Words Per Hour (Auto)">
                    <Form.Control type="text" name="wph" value={formInput.wph} readOnly />
                  </FloatingLabel>
                </Col>

                <Col>
                  <FloatingLabel controlId="status" label="Service">
                    <Form.Select name="status" value={formInput.status} onChange={handleChange}>
                      <option value="">Select Service</option>
                      <option value="Proofed">Proofed</option>
                      <option value="Copyedit">Copyedit</option>
                      <option value="Line Edit">Line Edit</option>
                    </Form.Select>
                  </FloatingLabel>
                </Col>

                <Col>
                  <FloatingLabel controlId="posted_to_facebook" label="Posted to Facebook">
                    <Form.Control type="date" name="posted_to_facebook" value={formInput.posted_to_facebook || ''} onChange={handleChange} />
                  </FloatingLabel>
                </Col>

                <Col>
                  <FloatingLabel controlId="posted_to_website" label="Posted to Website">
                    <Form.Control type="date" name="posted_to_website" value={formInput.posted_to_website || ''} onChange={handleChange} />
                  </FloatingLabel>
                </Col>
              </>
            )}
          </Row>

          {userRole === 'admin' && (
            <div className="text-center mt-4">
              <Button type="submit" variant="dark" size="lg" style={{ borderRadius: '30px', padding: '10px 40px' }}>
                {formInput.firebaseKey ? 'Update' : 'Create'} Book
              </Button>
            </div>
          )}
        </Form>
      </div>
    </Container>
  );
}

BookForm.propTypes = {
  obj: PropTypes.shape({
    firebaseKey: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    genre: PropTypes.string,
    sub_genre: PropTypes.string,
    pen_name: PropTypes.string,
    date: PropTypes.string,
    amazonLink: PropTypes.string,
    image: PropTypes.string,
    word_count: PropTypes.string,
    hours: PropTypes.string,
    hourly_rate: PropTypes.string,
    invoiced_amount: PropTypes.string,
    wph: PropTypes.string,
    status: PropTypes.string,
    posted_to_facebook: PropTypes.string,
    posted_to_website: PropTypes.string
  }),
};

export default BookForm;
