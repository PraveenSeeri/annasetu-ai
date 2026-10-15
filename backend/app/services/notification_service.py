from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "general",
    related_listing_id: Optional[int] = None,
    related_pickup_id: Optional[int] = None
) -> Notification:
    """Create and persist an in-app notification."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        related_listing_id=related_listing_id,
        related_pickup_id=related_pickup_id,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_user_notifications(db: Session, user_id: int, limit: int = 50) -> List[Notification]:
    """Retrieve notifications for a specific authenticated user."""
    return db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).limit(limit).all()


def mark_notification_read(db: Session, notification_id: int, user_id: int) -> bool:
    """Mark a notification as read if owned by the user."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
        return True
    return False


def mark_all_read(db: Session, user_id: int) -> int:
    """Mark all notifications as read for a specific user."""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return count
