import { useState } from 'react';

export default function Login({
  onLogin,
  onGoogleLogin,
  onSignup,
  externalError,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [google, setGoogle] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setError(
        externalError ||
          err.message ||
          'Unable to sign in.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setError('');
    setGoogle(true);

    try {
      await onGoogleLogin();
    } catch (err) {
      setError(
        externalError ||
          err.message ||
          'Google sign-in failed.'
      );
    } finally {
      setGoogle(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-form">
          <a
            className="brand text-dark mb-5"
            href="/"
          >
            <i className="bi bi-bag-heart-fill me-2" />
            Grabiii
          </a>
          
          <h2>Welcome back!</h2>

          <p className="text-muted mb-4">
            Sign in to continue ordering your favorites.
          </p>

          <form onSubmit={submit}>
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
                placeholder="Enter password"
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

            {(error || externalError) && (
              <div className="alert alert-danger py-2">
                {error || externalError}
              </div>
            )}

            <button
              className="btn btn-brand btn-lg w-100"
              disabled={loading || google}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            className="btn btn-outline-dark btn-lg w-100"
            onClick={googleLogin}
            disabled={loading || google}
          >
            <i className="bi bi-google me-2" />
            {google
              ? 'Signing in...'
              : 'Continue with Google'}
          </button>

          <p className="text-center mt-4 mb-0">
            No account?{' '}
            <button
              className="link-btn"
              onClick={onSignup}
            >
              Create one
            </button>
          </p>
        </div>

        <div className="auth-visual">
          <span className="eyebrow">GRABIII</span>

          <h1>
            Your cravings,
            <br />
            <span>one click away.</span>
          </h1>

          <p>
            Browse, order, and track your favorite fast
            food in one place.
          </p>

          <div className="visual-burger">
            🍟
          </div>
        </div>
      </div>
    </div>
  );
}