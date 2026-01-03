from typing import Optional
from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    quantity: int
    category: str
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    seller_id: int = Field(foreign_key="user.id")
    status: str = Field(default="approved", description="pending|approved|blocked")
