import { useState, useEffect } from 'react'

export default function Display({ onLogout }) {

  const [products, setProducts] = useState([])
  const [items, setItems] = useState('')
  const [price, setPrice] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editItems, setEditItems] = useState('')
  const [editPrice, setEditPrice] = useState('')

  const api_url = 'http://localhost:8080/api/product'

  useEffect(() => {
    fetch(api_url)
      .then((response) => response.json())
      .then((data) => {
        console.log("API RESPONSE:", data)
        setProducts(data)
      })
      .catch((err) => {
        console.log("ERROR:", err)
      })
  }, [])

  // ADD
  async function formSubmit(event) {
    event.preventDefault()

    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items,
          price: price
        })
      })

      if (!response.ok) {
        throw new Error('Unable to add item.')
      }

      const newProduct = await response.json()

      console.log("NEW PRODUCT:", newProduct)

      setProducts((currentProducts) => [
        ...currentProducts,
        newProduct
      ])

      setItems('')
      setPrice('')

    } catch (err) {
      console.log("ERROR:", err)
    }
  }

  function handleEdit(product) {
    setEditingId(product.id)
    setEditItems(product.items)
    setEditPrice(product.price)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
    setEditItems('')
    setEditPrice('')
  }

  async function updateSubmit(event) {
    event.preventDefault()

    try {
      const response = await fetch(`${api_url}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: editItems,
          price: editPrice
        })
      })

      if (!response.ok) {
        throw new Error('Unable to update item.')
      }

      const updatedProduct = await response.json()

      console.log("UPDATED PRODUCT:", updatedProduct)

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingId ? updatedProduct : product
        )
      )

      closeModal()

    } catch (err) {
      console.log("ERROR:", err)
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`${api_url}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Unable to delete item.')
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== id)
      )

    } catch (err) {
      console.log("ERROR:", err)
    }
  }

  function handleLogout() {
    onLogout?.()
  }

  return (
    <div
      className="bg-danger-subtle"
      style={{ minHeight: "100vh" }}
    >

      <div className="text-center d-flex justify-content-center flex-column bg-danger-subtle">

        <header className="fw-bold text-danger text-start bg-dark m-2 p-4 mx-1">
          Grabbi
        </header>

        <h1
          className="fw-bold text-dark"
          style={{ fontFamily: 'monospace' }}
        >
          Menu
        </h1>

        <form onSubmit={formSubmit}>

          <label
            className="fw-light"
            htmlFor="items"
          >
            Items:
          </label>

          <input
            type="text"
            className="form-control"
            style={{ width: "300px", margin: "auto" }}
            id="items"
            placeholder="Items"
            value={items}
            onChange={(event) =>
              setItems(event.target.value)
            }
          />

          <label
            className="fw-light"
            htmlFor="price"
          >
            Price:
          </label>

          <input
            type="number"
            className="form-control mb-2"
            style={{ width: "300px", margin: "auto" }}
            placeholder="Price"
            id="price"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
          />

          <input
            type="submit"
            value="Submit"
          />

        </form>

        <table
          className="table table-striped mt-3"
          style={{ border: '1px solid black' }}
        >

          <thead className="table-dark">
            <tr>
              <th>Items</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.items}</td>
                <td>{product.price}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm me-2"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

          </tbody>

        </table>

        <div className="fixed-bottom">

          <button
            type="button"
            className="btn btn-danger btn-lg my-3"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* Edit Modal */}
      {showModal && (
        <>
          <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            onClick={closeModal}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-content">

                <form onSubmit={updateSubmit}>

                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">
                      Edit Item
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={closeModal}
                    />
                  </div>

                  <div className="modal-body text-start">

                    <label
                      className="form-label fw-light"
                      htmlFor="editItems"
                    >
                      Items:
                    </label>

                    <input
                      type="text"
                      className="form-control mb-3"
                      id="editItems"
                      placeholder="Items"
                      value={editItems}
                      onChange={(event) =>
                        setEditItems(event.target.value)
                      }
                      required
                    />

                    <label
                      className="form-label fw-light"
                      htmlFor="editPrice"
                    >
                      Price:
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      id="editPrice"
                      placeholder="Price"
                      value={editPrice}
                      onChange={(event) =>
                        setEditPrice(event.target.value)
                      }
                      required
                    />

                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-danger"
                    >
                      Save Changes
                    </button>
                  </div>

                </form>

              </div>
            </div>
          </div>

          <div className="modal-backdrop show" />
        </>
      )}

    </div>
  )
}