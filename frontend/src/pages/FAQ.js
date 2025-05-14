import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaAngleDown, FaHeadset } from 'react-icons/fa';
import '../assets/FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaqItems, setFilteredFaqItems] = useState([]);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  const faqItems = [
    {
      question: 'How do I rent a car on AutoEase?',
      answer: 'Renting a car on AutoEase is simple. Browse our selection of available cars, select the one you like, choose your rental dates, and complete the booking process. You\'ll need to create an account if you don\'t already have one.'
    },
    {
      question: 'What documents do I need to rent a car?',
      answer: 'You\'ll need a valid driver\'s license, a credit or debit card for payment, and proof of insurance. Some car owners may require additional verification documents.'
    },
    {
      question: 'How does the car pickup and return process work?',
      answer: 'Once your booking is confirmed, you\'ll arrange a meeting with the car owner at the agreed location. You\'ll inspect the car together, sign the necessary paperwork, and receive the keys. For return, you\'ll meet the owner again at the agreed time and location.'
    },
    {
      question: 'What if I need to cancel my reservation?',
      answer: 'You can cancel your reservation through your account dashboard. Our cancellation policy varies depending on how far in advance you cancel. Please check our cancellation policy for specific details.'
    },
    {
      question: 'Is insurance included in the rental price?',
      answer: 'Basic insurance is included in all rentals. However, we offer additional insurance options for more comprehensive coverage. You can select these options during the booking process.'
    },
    {
      question: 'What happens if the car breaks down during my rental period?',
      answer: 'In case of a breakdown, contact the car owner and our customer support immediately. We provide 24/7 roadside assistance for all rentals. The specific procedures will be outlined in your rental agreement.'
    },
    {
      question: 'Can I extend my rental period?',
      answer: 'Yes, you can request an extension through your account dashboard. The extension is subject to the car\'s availability and the owner\'s approval. It\'s best to request extensions as early as possible.'
    },
    {
      question: 'How do I become a car host on AutoEase?',
      answer: 'To become a car host, click on the "Become a Host" button in the navigation bar. You\'ll need to create an account, verify your identity, and list your car with photos and details. Our team will review your listing before it goes live.'
    },
    {
      question: 'How much can I earn by listing my car?',
      answer: 'Earnings vary based on your car\'s make, model, year, condition, and your location. On average, hosts earn between $500 to $1,500 per month. You can use our earnings calculator on the "Become a Host" page to get an estimate.'
    },
    {
      question: 'How does AutoEase ensure safety for both renters and hosts?',
      answer: 'We verify the identity of all users, provide secure payment processing, offer comprehensive insurance options, and have a review system for both renters and hosts. We also have a 24/7 customer support team to assist with any issues.'
    }
  ];

  useEffect(() => {
    // Initialize filtered items with all items
    setFilteredFaqItems(faqItems);

    // Filter items based on search term
    if (searchTerm.trim() !== '') {
      const filtered = faqItems.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFaqItems(filtered);
    } else {
      setFilteredFaqItems(faqItems);
    }
  }, [searchTerm]);

  return (
    <div className="faq-container">
      <div className="faq-header">
        <FaQuestionCircle className="faq-icon" />
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about using AutoEase</p>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search for questions or keywords..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {searchTerm && (
            <div className="search-results">
              <p className="results-count">
                Found {filteredFaqItems.length} {filteredFaqItems.length === 1 ? 'result' : 'results'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="faq-content">
        <div className="accordion">
          {filteredFaqItems.length > 0 ? (
            filteredFaqItems.map((item, index) => (
              <div className="accordion-item" key={index}>
                <button
                  className={`accordion-button ${activeIndex === index ? 'active' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="question-wrapper">
                    <span className="question-text">{item.question}</span>
                  </div>
                  <span className="accordion-icon">
                    <FaAngleDown />
                  </span>
                </button>
                <div className={`accordion-content ${activeIndex === index ? 'active' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <FaQuestionCircle className="no-results-icon" />
              <h3>No matching questions found</h3>
              <p>Try a different search term or browse all our FAQs below.</p>
              <button
                className="reset-search"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <div className="faq-contact">
          <FaHeadset className="contact-icon" />
          <h2>Still have questions?</h2>
          <p>If you couldn't find the answer to your question, feel free to contact our support team. We're here to help you with any inquiries you might have about our services.</p>
          <Link to="/contact" className="btn btn-primary">Contact Support</Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
