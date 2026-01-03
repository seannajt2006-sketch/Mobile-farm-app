from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, Request
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.product import Product
from app.schemas.product import (
    ProductBulkDeleteRequest,
    ProductBulkStatusRequest,
    ProductRead,
    ProductStatusRequest,
    ProductUpdate,
)
from app.services.upload import upload_image

router = APIRouter()


@router.get("", response_model=List[ProductRead])
def list_products(session: Session = Depends(get_session)):
    products = session.exec(select(Product)).all()
    return products


@router.post("", response_model=ProductRead, status_code=201)
async def create_product(
    name: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    category: str = Form(...),
    seller_id: int = Form(...),
    location: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
):
    image_url: Optional[str] = None
    if image:
        file_bytes = await image.read()
        uploaded_url = upload_image(file_bytes, image.filename)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Image upload failed; check cloud storage config")
        image_url = uploaded_url

    new_product = Product(
        name=name,
        price=price,
        quantity=quantity,
        category=category,
        location=location,
        description=description,
        image_url=image_url,
        seller_id=seller_id,
        status="approved",
    )
    session.add(new_product)
    session.commit()
    session.refresh(new_product)
    return new_product


@router.patch("/{product_id}/form", response_model=ProductRead)
async def update_product_form(
    product_id: int,
    name: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    quantity: Optional[int] = Form(None),
    category: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    session: Session = Depends(get_session),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if status:
        product.status = _validate_status(status)
    if name:
        product.name = name
    if price is not None:
        product.price = price
    if quantity is not None:
        product.quantity = quantity
    if category:
        product.category = category
    if location is not None:
        product.location = location
    if description is not None:
        product.description = description
    if image:
        file_bytes = await image.read()
        uploaded_url = upload_image(file_bytes, image.filename)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Image upload failed; check cloud storage config")
        product.image_url = uploaded_url

    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def _validate_status(status: str) -> str:
    allowed = {"pending", "approved", "blocked"}
    if status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")
    return status


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    session: Session = Depends(get_session),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = payload.dict(exclude_unset=True)
    if "status" in update_data:
        update_data["status"] = _validate_status(update_data["status"])
    for key, value in update_data.items():
        setattr(product, key, value)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.post("/{product_id}/status", response_model=ProductRead)
def set_product_status(
    product_id: int,
    payload: ProductStatusRequest,
    session: Session = Depends(get_session),
):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.status = _validate_status(payload.status)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.post("/bulk/status", response_model=List[ProductRead])
async def bulk_set_status(
    request: Request,
    session: Session = Depends(get_session),
):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    ids = body.get("ids") or []
    status = body.get("status")
    if status is None:
        raise HTTPException(status_code=400, detail="status is required")
    _validate_status(str(status))
    try:
        id_list = [int(x) for x in ids]
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="ids must be a list of numbers")
    if not id_list:
        return []
    products = session.exec(select(Product).where(Product.id.in_(id_list))).all()
    for prod in products:
        prod.status = str(status)
        session.add(prod)
    session.commit()
    for prod in products:
        session.refresh(prod)
    return products


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return None


@router.post("/bulk/delete")
async def bulk_delete(
    request: Request,
    session: Session = Depends(get_session),
):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    ids = body.get("ids") or []
    try:
        id_list = [int(x) for x in ids]
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="ids must be a list of numbers")
    if not id_list:
        return {"deleted": 0}
    products = session.exec(select(Product).where(Product.id.in_(id_list))).all()
    deleted = 0
    for prod in products:
        session.delete(prod)
        deleted += 1
    session.commit()
    return {"deleted": deleted}
