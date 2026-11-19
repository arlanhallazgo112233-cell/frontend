import { useState } from 'react';

export default function Signup({
  onSignup,
  onBackToLogin,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await onSignup({
        name,
        email,
        password,
      });
    } catch (err) {
      setError(
        err.message || 'Unable to create account.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-form">
          <a
            className="brand text-dark mb-4"
            href="/"
          >
            <i className="bi bi-bag-heart-fill me-2" />
            Grabiii
          </a>

          <h2>Create your account</h2>

          <p className="text-muted mb-4">
            Sign up and start ordering delicious food.
          </p>

          <form onSubmit={submit}>
            <label>Full name</label>

            <input
              className="form-control form-control-lg mb-3"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Your name"
              required
            />

            <label>Email</label>

            <input
              className="form-control form-control-lg mb-3"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
            />

            <label>Password</label>

            <div className="input-group mb-3">
              <input
                className="form-control form-control-lg"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="At least 6 characters"
                required
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShow(!show)}
              >
                <i
                  className={
                    'bi ' +
                    (show
                      ? 'bi-eye-slash'
                      : 'bi-eye')
                  }
                />
              </button>
            </div>

            <label>Confirm password</label>

            <input
              className="form-control form-control-lg mb-3"
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) =>
                setConfirm(e.target.value)
              }
              placeholder="Repeat password"
              required
            />

            {error && (
              <div className="alert alert-danger py-2">
                {error}
              </div>
            )}

            <button
              className="btn btn-brand btn-lg w-100"
              disabled={loading}
            >
              {loading
                ? 'Creating...'
                : 'Create account'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Already registered?{' '}
            <button
              className="link-btn"
              onClick={onBackToLogin}
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="auth-visual signup-visual">
          <span className="eyebrow">
            WELCOME TO GRABIII
          </span>

          <h1>
            Made for
            <br />
            <span>food lovers.</span>
          </h1>

          <p>
            Your new favorite place for quick bites and
            easy ordering.
          </p>

          <div className="visual-burger">
            🍕
          </div>
        </div>
      </div>
    </div>
  );
}