export default function Landing({ onLogin, onSignup }) {
  return (
    <main className="landing-page">
      <nav className="navbar navbar-expand-lg container py-3">
        <a className="navbar-brand brand" href="#">
          <i className="bi bi-bag-heart-fill me-2" />
          Grabiii
        </a>

        <div className="ms-auto d-flex gap-2">
          <button
            className="btn btn-light rounded-pill px-4"
            onClick={onLogin}
          >
            Sign in
          </button>

          <button
            className="btn btn-brand rounded-pill px-4"
            onClick={onSignup}
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="container hero-section">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span className="eyebrow">
              FAST • FRESH • FAVORITE
            </span>

            <h1>
              Good food.
              <br />
              <span>Good mood.</span>
            </h1>

            <p className="lead">
              Order your favorite fast food from Grabiii
              and enjoy a simple, delicious ordering
              experience.
            </p>

            <div className="d-flex gap-3 flex-wrap">
              <button
                className="btn btn-brand btn-lg rounded-pill px-4"
                onClick={onSignup}
              >
                Order Now
                <i className="bi bi-arrow-right ms-2" />
              </button>

              <button
                className="btn btn-outline-dark btn-lg rounded-pill px-4"
                onClick={onLogin}
              >
                I already have an account
              </button>
            </div>

            <div className="hero-stats mt-5">
              <div>
                <strong>20+</strong>
                <span>Food choices</span>
              </div>

              <div>
                <strong>Fast</strong>
                <span>Order updates</span>
              </div>

              <div>
                <strong>Easy</strong>
                <span>Checkout</span>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="hero-food">
              <div className="floating-chip chip-one">
                <i className="bi bi-star-fill" />
                4.9 rating
              </div>

              <div className="floating-chip chip-two">
                <i className="bi bi-lightning-charge-fill" />
                Fresh & fast
              </div>

              <div className="food-emoji">
                🍔
              </div>

              <div className="food-ring" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}