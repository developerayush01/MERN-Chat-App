import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../services/api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId; // passed from Register/Login page

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/users/verify-otp', { userId, otp });
      login(res.data);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Verify Your Account</h2>
        <p>Enter the 6-digit OTP sent to your email</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>OTP Code</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p>Didn't receive OTP? Check your spam folder.</p>
      </div>
    </div>
  );
};

export default VerifyOtp;