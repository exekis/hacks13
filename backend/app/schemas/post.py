from pydantic import BaseModel
from datetime import datetime

class PostCreate(BaseModel):
    user_id: int
    post_content: str
    capacity: int
    start_time: datetime
    end_time: datetime
    location_str: str
