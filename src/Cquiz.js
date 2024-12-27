import React, { useState } from 'react';
import Header from './components/header';
import Footer from './components/footer';

const Cquiz = () => {
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('');
  const [numQuestions, setNumQuestions] = useState('');
  const [maxQuestions, setMaxQuestions] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
    setMaxQuestions(0); // Reset max questions when a new file is uploaded
    setQuestions([]);
    setError('');
  };

  const fetchMaxQuestions = async () => {
    if (!file) {
      setError('Please upload a file before fetching max questions.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5001/getmaxques', {
        method: 'POST', // POST is required for file uploads
        body: formData, // Attach the FormData containing the file
      });

      if (response.ok) {
        const data = await response.json();
        setMaxQuestions(data.max_questions || 0); // Set the maximum questions from the response
        setError('');
      } else {
        const errorText = await response.text();
        setError('Failed to fetch max questions: ' + errorText);
      }
    } catch (err) {
      console.error('Error fetching max questions:', err);
      setError('Error fetching max questions: ' + err.message);
    }
  };

  const handleSubmit = async () => {
    if (!file || !questionType || !numQuestions) {
      setError('Please upload a file and select all fields.');
      return;
    }

    const email = localStorage.getItem('email');
    if (!email) {
      setError('Email is required. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionType', questionType);
    formData.append('numQuestions', numQuestions);
    formData.append('email', email);

    try {
      const response = await fetch('http://localhost:5001/api/upload-and-generate-questions', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
        setError('');
      } else {
        const errorText = await response.text();
        setError('Failed to fetch questions: ' + errorText);
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Error generating questions: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <section style={{ flex: 1, padding: '0', paddingTop: '6%' }}>
        <div style={styles.formContainer}>
          <input
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          <button
            style={styles.fetchButton}
            onClick={fetchMaxQuestions}
            disabled={!file}
          >
            Fetch Max Questions
          </button>
          {maxQuestions > 0 && (
            <p>Maximum Questions Available: {maxQuestions}</p>
          )}
          <select
            style={styles.dropdown}
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            disabled={!maxQuestions}
          >
            <option value="">Select Number of Questions</option>
            {Array.from({ length: maxQuestions }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <select
            style={styles.dropdown}
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
          >
            <option value="">Select Question Type</option>
            <option value="mcq">MCQ's</option>
            <option value="True_or_false">Booleans</option>
            <option value="short_qa">Short Answers</option>
            <option value="fill_in_the_blanks">Fill in the blanks</option>
          </select>
          <button
            style={styles.submitButton}
            onClick={handleSubmit}
            disabled={!file || !questionType || !numQuestions}
          >
            Submit
          </button>
        </div>
        <hr style={styles.blackLine} />
        <div style={styles.questionBox}>
          <h3 style={styles.questionTitle}>Generated Questions:</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {questions.length > 0 ? (
            <ul style={styles.questionList}>
              {questions.map((q, index) => (
                <li key={index} style={styles.questionItem}>
                  <p><strong>Q{index + 1}:</strong> {q.question}</p>
                  {q.options && q.options.length > 0 && (
                    <ul>
                      {q.options.map((option, idx) => (
                        <li key={idx}>
                          {String.fromCharCode(65 + idx)}. {option}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p><strong>Answer:</strong> {q.answer}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.noQuestions}>No questions generated yet.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

const styles = {
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    maxWidth: '55%',
    margin: 'auto',
    marginTop: '20px',
  },
  dropdown: {
    margin: '10px 0',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
  },
  fileInput: {
    margin: '10px 0',
  },
  fetchButton: {
    margin: '10px 0',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  submitButton: {
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  blackLine: {
    border: 'none',
    borderTop: '2px solid black',
    width: '80%',
    margin: '20px auto',
  },
  questionBox: {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    maxWidth: '60%',
    margin: '20px auto',
    backgroundColor: '#f9f9f9',
  },
  questionTitle: {
    marginBottom: '10px',
  },
  questionList: {
    listStyleType: 'none',
    padding: 0,
  },
  questionItem: {
    marginBottom: '20px',
  },
  noQuestions: {
    color: '#999',
  },
};

export default Cquiz;
