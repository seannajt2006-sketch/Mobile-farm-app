from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.session import get_session
from app.models.order_request import OrderRequest
from app.models.product import Product
from app.schemas.order_request import OrderRequestCreate, OrderRequestRead

router = APIRouter()


@router.get("", response_model=List[OrderRequestRead])
def list_orders(session: Session = Depends(get_session)):
    return session.exec(select(OrderRequest)).all()


@router.post("", response_model=OrderRequestRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderRequestCreate, session: Session = Depends(get_session)):
    product = session.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    order = OrderRequest(
        product_id=payload.product_id,
        buyer_id=payload.buyer_id,
        status="pending",
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    return order
