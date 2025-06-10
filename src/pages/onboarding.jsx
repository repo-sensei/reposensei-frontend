import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Onboarding({ userId, repoId }) {
  const [step, setStep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  const startOnboarding = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/onboarding/start`, { repoId });

      setStep(response.data);
    } catch (err) {
      setError('Failed to start onboarding');
    } finally {
      setLoading(false);
    }
  };
  startOnboarding();
}, [repoId]);

  // Start the onboarding process when the component mounts
  useEffect(() => {
    const startOnboarding = async () => {
      try {
        const response = await axios.post('/onboarding/start', { repoId }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStep(response.data);
      } catch (err) {
        setError('Failed to start onboarding');
      } finally {
        setLoading(false);
      }
    };
    startOnboarding();
  }, [repoId]);

  // Handle proceeding to the next step with user input
  const handleNext = async (input) => {
    setLoading(true);
    try {
      const response = await axios.post('/onboarding/next', { input, repoId }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setStep(response.data);
    } catch (err) {
      setError('Failed to proceed to the next step');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div>{error}</div>;
  }

  // Render based on the current step
  if (step.stepId === 'choose-role') {
    return (
      <div>
        <p>{step.prompt}</p>
        {step.options.map((option) => (
          <button
            key={option}
            onClick={() => handleNext(option)}
            style={{ margin: '5px', padding: '10px' }}
          >
            {option}
          </button>
        ))}
      </div>
    );
  } else if (step.stepId === 'show-overview-and-tasks') {
    return (
      <div>
        <h2>Repository Overview</h2>
        <a
          href={step.overviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          View Detailed Overview
        </a>
        <h2>Critical Tasks</h2>
        <ul>
          {step.tasks.map((task, index) => (
            <li key={index}>
              <strong>{task.title}</strong>: {task.description}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <div>Unknown step</div>;
}

export default Onboarding;