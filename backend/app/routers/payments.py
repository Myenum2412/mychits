from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.payment import Payment
from app.models.chit_group import ChitGroup, GroupMember
from app.models.member import Member
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.get("", response_model=List[PaymentResponse])
def get_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    chit_group_id: Optional[int] = None,
    member_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Payment)
    if chit_group_id:
        query = query.filter(Payment.chit_group_id == chit_group_id)
    if member_id:
        query = query.filter(Payment.member_id == member_id)
    return query.order_by(Payment.payment_date.desc(), Payment.id.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def record_payment(payment_in: PaymentCreate, db: Session = Depends(get_db)):
    group = db.query(ChitGroup).filter(ChitGroup.id == payment_in.chit_group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chit group with id {payment_in.chit_group_id} not found",
        )

    member = db.query(Member).filter(Member.id == payment_in.member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member with id {payment_in.member_id} not found",
        )

    # Verify membership
    membership = (
        db.query(GroupMember)
        .filter(
            GroupMember.chit_group_id == payment_in.chit_group_id,
            GroupMember.member_id == payment_in.member_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Member is not enrolled in this chit group.",
        )

    payment_data = payment_in.model_dump(exclude_unset=True)
    payment = Payment(**payment_data)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with id {payment_id} not found",
        )
    return payment


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with id {payment_id} not found",
        )
    db.delete(payment)
    db.commit()
    return None
