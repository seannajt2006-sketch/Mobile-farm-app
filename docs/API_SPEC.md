# API Spec — Farm Connect (v1 draft)

## Base
- Prefix: `/api/v1`
- Auth: TBD (simple role selection or token placeholder)

## Health
- `GET /health` → `{ status: "ok" }`

## Products
- `GET /products` → list products (public)
- `POST /products` → create product (seller, with image_url)
- `PATCH /products/{id}` → update product
- `DELETE /products/{id}` → delete product

## Orders
- `POST /orders` → buyer creates order request
- `GET /orders` → list requests for current user

## Admin
- `GET /admin/products` → pending products
- `PATCH /admin/products/{id}/approve` → approve
- `PATCH /admin/products/{id}/block` → block

## Upload
- `POST /upload-image` → multipart upload; returns `{ image_url }`

## TODO
- Add auth model and error responses.
- Flesh out request/response schemas.
