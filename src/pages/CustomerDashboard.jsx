import { useEffect, useMemo, useState } from 'react';

const API =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = [
  'All',
  'Burgers',
  'Chicken',
  'Pizza',
  'Sides',
  'Drinks',
  'Desserts',
];

export default function CustomerDashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [tab, setTab] = useState('menu');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [checkout, setCheckout] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const [p, o] = await Promise.all([
        fetch(API + '/products'),
        fetch(
          API +
            '/orders?customerEmail=' +
            encodeURIComponent(user.email)
        ),
      ]);

      setProducts(await p.json());
      setOrders(await o.json());
    } catch (e) {
      setMessage(
        'Backend is not reachable. Start the Grabiii backend on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      category === 'All'
        ? products
        : products.filter((p) => p.category === category),
    [products, category]
  );

  const total = cart.reduce(
    (s, x) => s + x.price * x.qty,
    0
  );

  function add(p) {
    setCart((c) => {
      const found = c.find((x) => x.id === p.id);

      return found
        ? c.map((x) =>
            x.id === p.id
              ? { ...x, qty: x.qty + 1 }
              : x
          )
        : [...c, { ...p, qty: 1 }];
    });

    setMessage(`${p.name} added to cart.`);

    setTimeout(() => setMessage(''), 1600);
  }

  function change(id, delta) {
    setCart((c) =>
      c
        .map((x) =>
          x.id === id
            ? { ...x, qty: x.qty + delta }
            : x
        )
        .filter((x) => x.qty > 0)
    );
  }

  async function placeOrder() {
    if (!cart.length) return;

    setCheckout(true);

    try {
      const r = await fetch(API + '/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerUid: user.uid,
          customerName: user.displayName || 'Customer',
          customerEmail: user.email,
          items: cart.map((x) => ({
            productId: x.id,
            name: x.name,
            price: x.price,
            qty: x.qty,
          })),
          total,
        }),
      });

      if (!r.ok) throw new Error();

      setCart([]);
      setTab('orders');

      await load();

      setMessage('Order placed successfully!');
    } catch (e) {
      setMessage(
        'Unable to place order. Check the backend.'
      );
    } finally {
      setCheckout(false);
    }
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center justify-content-between">
            <span className="brand">
              <i className="bi bi-bag-heart-fill me-2" />
              Grabiii
            </span>

            <div className="d-flex align-items-center gap-3">
              <span className="d-none d-md-inline text-muted">
                Hi, {user.displayName || 'Customer'}
              </span>

              <button
                className="btn btn-outline-dark rounded-pill"
                onClick={onLogout}
              >
                <i className="bi bi-box-arrow-right" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-fluid customer-content">
        <div className="row g-4">
          <aside className="col-lg-2">
            <div className="sidebar">
              <button
                className={
                  'side-btn ' +
                  (tab === 'menu' ? 'active' : '')
                }
                onClick={() => setTab('menu')}
              >
                <i className="bi bi-grid-fill" />
                Menu
              </button>

              <button
                className={
                  'side-btn ' +
                  (tab === 'orders' ? 'active' : '')
                }
                onClick={() => setTab('orders')}
              >
                <i className="bi bi-receipt" />
                My Orders
              </button>

              <button
                className="side-btn"
                onClick={() => setTab('cart')}
              >
                <i className="bi bi-cart3" />
                Cart

                <span className="badge text-bg-dark ms-auto">
                  {cart.reduce(
                    (s, x) => s + x.qty,
                    0
                  )}
                </span>
              </button>
            </div>
          </aside>

          <main className="col-lg-10">
            {message && (
              <div className="alert alert-info border-0 shadow-sm">
                {message}
              </div>
            )}

            {tab === 'menu' && (
              <>
                <div className="welcome-banner">
                  <div>
                    <span className="eyebrow">
                      GRABIII MENU
                    </span>

                    <h1>What are you craving?</h1>

                    <p>
                      Fresh picks, tasty sides, and drinks
                      ready for your next order.
                    </p>
                  </div>

                  <div className="banner-emoji">
                    🍔
                  </div>
                </div>

                <div className="category-row">
                  {categories.map((c) => (
                    <button
                      key={c}
                      className={
                        'category-pill ' +
                        (category === c ? 'active' : '')
                      }
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-brand" />
                  </div>
                ) : (
                  <div className="row g-4 mt-1">
                    {filtered.map((p) => (
                      <div
                        className="col-sm-6 col-xl-4"
                        key={p.id}
                      >
                        <div className="food-card">
                          <div className="food-image">
                            {p.emoji || '🍽️'}

                            {!p.available && (
                              <span className="sold-badge">
                                Unavailable
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <div className="d-flex justify-content-between">
                              <div>
                                <span className="small text-muted">
                                  {p.category}
                                </span>

                                <h5 className="fw-bold mb-1">
                                  {p.name}
                                </h5>
                              </div>

                              <strong className="text-brand">
                                ₱
                                {Number(p.price).toFixed(2)}
                              </strong>
                            </div>

                            <p className="text-muted small">
                              {p.description}
                            </p>

                            <button
                              className="btn btn-brand w-100 rounded-pill"
                              disabled={!p.available}
                              onClick={() => add(p)}
                            >
                              {p.available
                                ? 'Add to cart'
                                : 'Unavailable'}

                              <i className="bi bi-plus-lg ms-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {!filtered.length && (
                      <p className="text-muted">
                        No food items in this category.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {tab === 'cart' && (
              <section>
                <div className="section-title">
                  <div>
                    <span className="eyebrow">
                      YOUR ORDER
                    </span>

                    <h2>Shopping Cart</h2>
                  </div>
                </div>

                {!cart.length ? (
                  <div className="empty-state">
                    🛒

                    <h4>Your cart is empty</h4>

                    <p>
                      Add something delicious from the menu.
                    </p>

                    <button
                      className="btn btn-brand rounded-pill"
                      onClick={() => setTab('menu')}
                    >
                      Browse menu
                    </button>
                  </div>
                ) : (
                  <div className="row g-4">
                    <div className="col-lg-8">
                      {cart.map((x) => (
                        <div
                          className="cart-item"
                          key={x.id}
                        >
                          <div className="cart-emoji">
                            {x.emoji || '🍽️'}
                          </div>

                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">
                              {x.name}
                            </h6>

                            <span className="text-muted">
                              ₱{Number(x.price).toFixed(2)} each
                            </span>
                          </div>

                          <div className="qty">
                            <button
                              onClick={() =>
                                change(x.id, -1)
                              }
                            >
                              -
                            </button>

                            <span>{x.qty}</span>

                            <button
                              onClick={() =>
                                change(x.id, 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <strong>
                            ₱
                            {(x.price * x.qty).toFixed(2)}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="col-lg-4">
                      <div className="summary-card">
                        <h5>Order summary</h5>

                        <div className="d-flex justify-content-between">
                          <span>Subtotal</span>

                          <strong>
                            ₱{total.toFixed(2)}
                          </strong>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between fs-5">
                          <strong>Total</strong>

                          <strong className="text-brand">
                            ₱{total.toFixed(2)}
                          </strong>
                        </div>

                        <button
                          className="btn btn-brand btn-lg w-100 rounded-pill mt-3"
                          onClick={placeOrder}
                          disabled={checkout}
                        >
                          {checkout
                            ? 'Placing...'
                            : 'Place order'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === 'orders' && (
              <section>
                <div className="section-title">
                  <div>
                    <span className="eyebrow">
                      ORDER HISTORY
                    </span>

                    <h2>My Orders</h2>
                  </div>

                  <button
                    className="btn btn-outline-dark rounded-pill"
                    onClick={load}
                  >
                    <i className="bi bi-arrow-clockwise" />
                  </button>
                </div>

                {!orders.length ? (
                  <div className="empty-state">
                    🍟

                    <h4>No orders yet</h4>

                    <p>
                      Your placed orders will appear here.
                    </p>

                    <button
                      className="btn btn-brand rounded-pill"
                      onClick={() => setTab('menu')}
                    >
                      Order now
                    </button>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      className="order-card"
                      key={o.id}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <span className="small text-muted">
                            Order #{o.id}
                          </span>

                          <h5 className="fw-bold mb-1">
                            {o.items
                              .map(
                                (i) =>
                                  `${i.name} x${i.qty}`
                              )
                              .join(', ')}
                          </h5>

                          <span className="text-muted small">
                            {new Date(
                              o.createdAt
                            ).toLocaleString()}
                          </span>
                        </div>

                        <span
                          className={
                            'status status-' + o.status
                          }
                        >
                          {o.status}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                        <span>Total</span>

                        <strong className="text-brand">
                          ₱
                          {Number(o.total).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}