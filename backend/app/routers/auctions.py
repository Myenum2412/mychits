from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.auction import Auction
from app.models.chit_group import ChitGroup, GroupMember
from app.models.member import Member
from app.schemas.auction import AuctionCreate, AuctionUpdate, AuctionResponse

router = APIRouter(prefix="/auctions", tags=["Auctions"])


@router.get("", response_model=List[AuctionResponse])
def get_auctions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    chit_group_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Auction)
    if chit_group_id:
        query = query.filter(Auction.chit_group_id == chit_group_id)
    return query.order_by(Auction.auction_date.desc(), Auction.id.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=AuctionResponse, status_code=status.HTTP_201_CREATED)
def create_auction(auction_in: AuctionCreate, db: Session = Depends(get_db)):
    group = db.query(ChitGroup).filter(ChitGroup.id == auction_in.chit_group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chit group with id {auction_in.chit_group_id} not found",
        )

    # Check if auction number already exists for this group
    existing = (
        db.query(Auction)
        .filter(
            Auction.chit_group_id == auction_in.chit_group_id,
            Auction.auction_number == auction_in.auction_number,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Auction #{auction_in.auction_number} already recorded for this group.",
        )

    # Check winner if provided
    if auction_in.winner_member_id:
        winner = db.query(Member).filter(Member.id == auction_in.winner_member_id).first()
        if not winner:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Winner member not found")

        # Check membership
        membership = (
            db.query(GroupMember)
            .filter(
                GroupMember.chit_group_id == group.id,
                GroupMember.member_id == auction_in.winner_member_id,
            )
            .first()
        )
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Winner must be an enrolled member of this chit group.",
            )

        # Mark as prized
        membership.has_prized = True

    # Financial calculations
    commission = round(group.total_value * (group.commission_rate / 100.0), 2)
    dividend_total = max(0.0, round(auction_in.bid_discount_amount - commission, 2))
    dividend_per_member = round(dividend_total / float(group.max_members), 2)
    net_payable = max(0.0, round(group.monthly_installment - dividend_per_member, 2))
    prize_amount = max(0.0, round(group.total_value - auction_in.bid_discount_amount, 2))

    auction = Auction(
        chit_group_id=auction_in.chit_group_id,
        auction_number=auction_in.auction_number,
        auction_date=auction_in.auction_date,
        bid_discount_amount=auction_in.bid_discount_amount,
        foreperson_commission=commission,
        dividend_total=dividend_total,
        dividend_per_member=dividend_per_member,
        net_payable_amount=net_payable,
        prize_amount=prize_amount,
        winner_member_id=auction_in.winner_member_id,
        status=auction_in.status,
    )

    db.add(auction)
    db.commit()
    db.refresh(auction)
    return auction


@router.get("/{auction_id}", response_model=AuctionResponse)
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Auction with id {auction_id} not found",
        )
    return auction


@router.delete("/{auction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_auction(auction_id: int, db: Session = Depends(get_db)):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Auction with id {auction_id} not found",
        )

    # If winner was recorded, reset has_prized if no other auction won
    if auction.winner_member_id:
        other_won = (
            db.query(Auction)
            .filter(
                Auction.chit_group_id == auction.chit_group_id,
                Auction.winner_member_id == auction.winner_member_id,
                Auction.id != auction.id,
            )
            .first()
        )
        if not other_won:
            membership = (
                db.query(GroupMember)
                .filter(
                    GroupMember.chit_group_id == auction.chit_group_id,
                    GroupMember.member_id == auction.winner_member_id,
                )
                .first()
            )
            if membership:
                membership.has_prized = False

    db.delete(auction)
    db.commit()
    return None
