import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
// Pointing to the unified Login CSS to keep styling EXACTLY matching
import '../Login/Login.css';

// Import local images per reference
// Using Char_fe_.png for Signup as requested
import characterImg from "../../Images/Char_fe_.png";

export default function Cardcontainer2() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setUser(data);
      navigate('/Dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card">
        
        {/* Left Character Panel */}
        <div className="auth-left-panel">
          <img src={characterImg} alt="Character" className="auth-character-art" />
          <div className="auth-left-text">
            <h2>Your Journey Begins</h2>
            <p>Level up your life, one habit at a time.</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-right-panel">
          <h2>Create Account</h2>
          <p className="subtitle">Join HabitQuest and start your adventure</p>

          <form onSubmit={handleSignup}>
            {error && <div style={{color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

            <div className="auth-form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Username"
                required
              />
            </div>

            <div className="auth-form-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-mail address"
                required
              />
            </div>

            <div className="auth-form-group auth-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" style={{marginTop: '10px'}}>Sign Up</button>

            <p className="auth-footer" style={{marginTop: '2rem'}}>
              Already have an account? <Link to="/Login">Log In</Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}