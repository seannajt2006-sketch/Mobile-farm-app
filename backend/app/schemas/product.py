from typing import List, Optional
from sqlmodel import SQLModel


class ProductCreate(SQLModel):
    name: str
    price: float
    quantity: int
    category: str
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    seller_id: int


class ProductRead(SQLModel):
    id: int
    name: str
    price: float
    quantity: int
    category: str
    location: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    seller_id: int
    status: str


class ProductUpdate(SQLModel):
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None


class ProductStatusRequest(SQLModel):
    status: str


class ProductBulkStatusRequest(SQLModel):
    ids: List[int]
    status: str


class ProductBulkDeleteRequest(SQLModel):
    ids: List[int]
