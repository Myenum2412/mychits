from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.chit_group import ChitGroup
from app.models.member import Member
from app.models.auction import Auction
from app.models.payment import Payment

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_groups = db.query(ChitGroup).count()
    active_groups = db.query(ChitGroup).filter(ChitGroup.status == "active").count()
    total_members = db.query(Member).count()
    active_members = db.query(Member).filter(Member.status == "active").count()
    total_auctions = db.query(Auction).count()

    total_collections = db.query(func.coalesce(func.sum(Payment.amount_paid), 0.0)).scalar() or 0.0
    total_prizes = db.query(func.coalesce(func.sum(Auction.prize_amount), 0.0)).scalar() or 0.0
    total_dividends = db.query(func.coalesce(func.sum(Auction.dividend_total), 0.0)).scalar() or 0.0

    return {
        "total_groups": total_groups,
        "active_groups": active_groups,
        "total_members": total_members,
        "active_members": active_members,
        "total_auctions": total_auctions,
        "total_collections": float(total_collections),
        "total_prizes": float(total_prizes),
        "total_dividends": float(total_dividends),
    }
