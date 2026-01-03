from typing import Optional
from sqlmodel import Field, SQLModel


class OrderRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id")
    buyer_id: int = Field(foreign_key="user.id")
    status: str = Field(default="pending", description="pending|accepted|rejected")
