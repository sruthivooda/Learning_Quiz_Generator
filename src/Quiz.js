
// import React, { useState } from 'react';
// import Header from './components/header';
// import Footer from './components/footer';

// const Quiz = () => {
//     const [topic, setTopic] = useState('');
//     const [subTopic, setSubTopic] = useState('');
//     const [questionType, setQuestionType] = useState('');
//     const [numQuestions, setNumQuestions] = useState('');
//     const [questions, setQuestions] = useState([]);
//     const [error, setError] = useState('');

//     const topicMapping = {
//         OS: ["OS Basics", "Structure of OS", "Types of OS", "Process Management", "CPU Scheduling", "Threads", "Process Synchronization", "Critical Section Problem", "Deadlocks", "Memory Management", "Page Replacement", "Storage Management"],
//         DBMS: ["Basics of DBMS", "ER Model", "Relational Model", "Relational Algebra", "Functional Dependencies", "Normalisation", "TnC Control", "Indexing, B and B+ Trees", "File Organisation"],
//         Java: ["Data Types in Java", "Variables in Java", "Operators in Java", "Control Statements", "OOPS", "Exception Handling", "Multithreading and Concurrency", "Collections Framework", "Generics", "I/O Streams", "Java-8 Features", "File Handling", "JDBC", "Java Memory Management", "Spring Framework"],
//         JavaScript: ["Basics in JavaScript", "Arrow Function", "Regular Functions", "High Order Functions", "DOM Manipulation", "Events and Event Handling", "Closures and Scopes", "Prototypes and Inheritance", "Asynchronous Programming", "ES+6 Features", "Fetch API and AJAX", "JSON", "React JS", "Vue JS", "Angular JS", "Node JS"]
//     };
    

//     const handleSubmit = async () => {
//         setError('');
//         setQuestions([]); // Clear previous questions on new submission
//         if (!topic || !subTopic || !questionType || !numQuestions) {
//             setError('Please select all fields');
//             return;
//         }

//         try {
//             const email = localStorage.getItem('email');
//             if (!email) {
//                 setError('Email is required. Please log in again.');
//                 return;
//             }

//             const response = await fetch('http://localhost:5001/api/generate-questions', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ topic, subTopic, questionType, numQuestions, email }),
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 if (data && Array.isArray(data.questions)) {
//                     setQuestions(data.questions);
//                 } else {
//                     setError('No questions generated or invalid response format.');
//                 }
//             } else {
//                 const errorData = await response.json();
//                 setError(errorData.message || 'Failed to fetch questions');
//             }
//         } catch (error) {
//             setError('Error fetching data: ' + error.message);
//         }
//     };

//     return (
//         <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
//             <Header />
//             <section style={{ flex: 1, padding: '0', paddingTop: '6%' }}>
//                 <div style={styles.formContainer}>
//                     <select style={styles.dropdown} value={topic} onChange={(e) => { 
//                         setTopic(e.target.value); 
//                         setSubTopic('');
//                     }}>
//                         <option value="">Select Topic</option>
//                         {Object.keys(topicMapping).map((key) => (
//                             <option key={key} value={key}>{key}</option>
//                         ))}
//                     </select>
//                     <select style={styles.dropdown} value={subTopic} onChange={(e) => setSubTopic(e.target.value)}>
//                         <option value="">Select Subtopic</option>
//                         {topic && topicMapping[topic].map((sub, index) => (
//                             <option key={index} value={sub}>{sub}</option>
//                         ))}
//                     </select>
//                     <select style={styles.dropdown} value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
//                         <option value="">Select Question Type</option>
//                         <option value="mcq">MCQ's</option>
//                         <option value="True_or_false">Booleans</option>
//                         <option value="short_qa">Short Answers</option>
//                         <option value="fill_in_the_blanks">Fill in the blanks</option>
//                     </select>
//                     <select style={styles.dropdown} value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)}>
//                         <option value="">Select Number of Questions</option>
//                         {[1, 2, 3, 4, 5].map((num) => (
//                             <option key={num} value={num}>{num}</option>
//                         ))}
//                     </select>
//                     <button
//                         style={styles.submitButton}
//                         onClick={handleSubmit}
//                         disabled={!topic || !subTopic || !questionType || !numQuestions}
//                     >
//                         Submit
//                     </button>
//                 </div>
//                 <hr style={styles.blackLine} />
//                 <div style={styles.questionBox}>
//                     <h3 style={styles.questionTitle}>Generated Questions:</h3>
//                     {error && <p style={{ color: 'red' }}>{error}</p>}
//                     {questions.length > 0 ? (
//                         <ul style={styles.questionList}>
//                             {questions.map((q, index) => (
//                                 <li key={index} style={styles.questionItem}>
//                                     <p><strong>Q{index + 1}:</strong> {q.question}</p>
//                                     {q.options && q.options.length > 0 && (
//                                         <ul>
//                                             {q.options.map((option, idx) => (
//                                                 <li key={idx}>{String.fromCharCode(65 + idx)}. {option}</li>
//                                             ))}
//                                         </ul>
//                                     )}
//                                     <p><strong>Answer:</strong> {q.answer}</p>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p style={styles.noQuestions}>No questions generated yet.</p>
//                     )}
//                 </div>
//             </section>
//             <Footer />
//         </div>
//     );
// };

// const styles = {
//     formContainer: {
//         display: 'flex',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: '20px',
//         border: '1px solid #ccc',
//         borderRadius: '5px',
//         maxWidth: '55%',
//         margin: 'auto',
//         marginTop: '20px',
//         flexWrap: 'wrap',
//     },
//     dropdown: {
//         marginRight: '10px',
//         marginBottom: '10px',
//         padding: '5px',
//         borderRadius: '4px',
//         border: '1px solid #ccc',
//         flex: '1 1 200px',
//     },
//     submitButton: {
//         padding: '8px 15px',
//         backgroundColor: '#007bff',
//         color: '#fff',
//         border: 'none',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         flex: '1 1 auto',
//     },
//     blackLine: {
//         border: 'none',
//         borderTop: '2px solid black',
//         width: '80%',
//         margin: '20px auto',
//     },
//     questionBox: {
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '20px',
//         border: '1px solid #ccc',
//         borderRadius: '5px',
//         maxWidth: '60%',
//         margin: '20px auto',
//         backgroundColor: '#f9f9f9',
//     },
//     questionTitle: {
//         marginBottom: '10px',
//     },
//     questionList: {
//         listStyleType: 'none',
//         padding: 0,
//     },
//     questionItem: {
//         marginBottom: '20px',
//         textAlign: 'left',
//     },
//     noQuestions: {
//         color: '#999',
//     },
// };

// export default Quiz;

import React, { useState } from 'react';
import Header from './components/header';
import Footer from './components/footer';

const Quiz = () => {
    const [topic, setTopic] = useState('');
    const [subTopic, setSubTopic] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [maxQuestions, setMaxQuestions] = useState(0);
    const [numQuestions, setNumQuestions] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');

    const topicMapping = {
        OS: ["OS Basics", "Structure of OS", "Types of OS", "Process Management", "CPU Scheduling", "Threads", "Process Synchronization", "Critical Section Problem", "Deadlocks", "Memory Management", "Page Replacement", "Storage Management"],
        DBMS: ["Basics of DBMS", "ER Model", "Relational Model", "Relational Algebra", "Functional Dependencies", "Normalisation", "TnC Control", "Indexing, B and B+ Trees", "File Organisation"],
        Java: ["Data Types in Java", "Variables in Java", "Operators in Java", "Control Statements", "OOPS", "Exception Handling", "Multithreading and Concurrency", "Collections Framework", "Generics", "I/O Streams", "Java-8 Features", "File Handling", "JDBC", "Java Memory Management", "Spring Framework"],
        JavaScript: ["Basics in JavaScript", "Arrow Function", "Regular Functions", "High Order Functions", "DOM Manipulation", "Events and Event Handling", "Closures and Scopes", "Prototypes and Inheritance", "Asynchronous Programming", "ES+6 Features", "Fetch API and AJAX", "JSON", "React JS", "Vue JS", "Angular JS", "Node JS"]
    };

    const fetchMaxQuestions = async () => {
        if (!topic || !subTopic) {
            setError('Please select a topic and sub-topic first.');
            return;
        }
        setError('');
        setMaxQuestions(0);

        try {
            const response = await fetch(`http://localhost:5001/getnumques?topic=${topic}&subTopic=${subTopic}`);
            if (response.ok) {
                const data = await response.json();
                setMaxQuestions(data.max_questions);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch the maximum number of questions.');
            }
        } catch (error) {
            setError('Error fetching max questions: ' + error.message);
        }
    };

    const handleSubmit = async () => {
        setError('');
        setQuestions([]);
        if (!topic || !subTopic || !questionType || !numQuestions) {
            setError('Please select all fields.');
            return;
        }

        try {
            const email = localStorage.getItem('email');
            if (!email) {
                setError('Email is required. Please log in again.');
                return;
            }

            const response = await fetch('http://localhost:5001/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, subTopic, questionType, numQuestions, email }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.questions)) {
                    setQuestions(data.questions);
                } else {
                    setError('No questions generated or invalid response format.');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch questions.');
            }
        } catch (error) {
            setError('Error fetching data: ' + error.message);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <section style={{ flex: 1, padding: '0', paddingTop: '6%' }}>
                <div style={styles.formContainer}>
                    <select style={styles.dropdown} value={topic} onChange={(e) => { 
                        setTopic(e.target.value); 
                        setSubTopic('');
                        setMaxQuestions(0); 
                    }}>
                        <option value="">Select Topic</option>
                        {Object.keys(topicMapping).map((key) => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </select>
                    <select style={styles.dropdown} value={subTopic} onChange={(e) => { 
                        setSubTopic(e.target.value); 
                        setMaxQuestions(0); 
                    }}>
                        <option value="">Select Subtopic</option>
                        {topic && topicMapping[topic].map((sub, index) => (
                            <option key={index} value={sub}>{sub}</option>
                        ))}
                    </select>
                    <button style={styles.fetchButton} onClick={fetchMaxQuestions} disabled={!topic || !subTopic}>
                        Fetch Max Questions
                    </button>
                    {maxQuestions > 0 && (
                        <>
                            <p>Max Questions Available: {maxQuestions}</p>
                            <select style={styles.dropdown} value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)}>
                                <option value="">Select Number of Questions</option>
                                {Array.from({ length: maxQuestions }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </>
                    )}
                    <select style={styles.dropdown} value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                        <option value="">Select Question Type</option>
                        <option value="mcq">MCQ's</option>
                        <option value="True_or_false">Booleans</option>
                        <option value="short_qa">Short Answers</option>
                        <option value="fill_in_the_blanks">Fill in the blanks</option>
                    </select>
                    <button
                        style={styles.submitButton}
                        onClick={handleSubmit}
                        disabled={!topic || !subTopic || !questionType || !numQuestions}
                    >
                        Generate Questions
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
                                                <li key={idx}>{String.fromCharCode(65 + idx)}. {option}</li>
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            maxWidth: '55%',
            margin: 'auto',
            marginTop: '20px',
            flexWrap: 'wrap',
        },
        dropdown: {
            marginRight: '10px',
            marginBottom: '10px',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            flex: '1 1 200px',
        },
        submitButton: {
            padding: '8px 15px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: '1 1 auto',
        },
        blackLine: {
            border: 'none',
            borderTop: '2px solid black',
            width: '80%',
            margin: '20px auto',
        },
        questionBox: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
            textAlign: 'left',
        },
        noQuestions: {
            color: '#999',
        },
    };
export default Quiz;
