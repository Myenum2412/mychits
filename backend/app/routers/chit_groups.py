from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.chit_group import ChitGroup, GroupMember
from app.models.member import Member
from app.schemas.chit_group import (
    ChitGroupCreate,
    ChitGroupUpdate,
    ChitGroupResponse,
    GroupMemberCreate,
    GroupMemberResponse,
)

router = APIRouter(prefix="/groups", tags=["Chit Groups"])


@router.get("", response_model=List[ChitGroupResponse])
def get_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(ChitGroup)
    if status_filter:
        query = query.filter(ChitGroup.status == status_filter)
    return query.order_by(ChitGroup.id.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=ChitGroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(group_in: ChitGroupCreate, db: Session = Depends(get_db)):
    existing = db.query(ChitGroup).filter(ChitGroup.group_name == group_in.group_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chit Group named '{group_in.group_name}' already exists.",
        )

    # Validate monthly installment if not explicitly matching
    expected_installment = round(group_in.total_value / group_in.duration_months, 2)
    if abs(group_in.monthly_installment - expected_installment) > 1.0:
        # We allow flexibility, but default calculation is value / duration
        pass

    group = ChitGroup(**group_in.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.get("/{group_id}", response_model=ChitGroupResponse)
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(ChitGroup).filter(ChitGroup.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chit group with id {group_id} not found",
        )
    return group


@router.put("/{group_id}", response_model=ChitGroupResponse)
def update_group(group_id: int, group_in: ChitGroupUpdate, db: Session = Depends(get_db)):
    group = db.query(ChitGroup).filter(ChitGroup.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chit group with id {group_id} not found",
        )

    update_data = group_in.model_dump(exclude_unset=True)
    if "group_name" in update_data and update_data["group_name"] != group.group_name:
        if db.query(ChitGroup).filter(ChitGroup.group_name == update_data["group_name"]).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Group with name '{update_data['group_name']}' already exists.",
            )

    for field, value in update_data.items():
        setattr(group, field, value)

    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(ChitGroup).filter(ChitGroup.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chit group with id {group_id} not found",
        )
    db.delete(group)
    db.commit()
    return None


@router.post("/{group_id}/members", response_model=GroupMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member_to_group(group_id: int, member_in: GroupMemberCreate, db: Session = Depends(get_db)):
    group = db.query(ChitGroup).filter(ChitGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chit group not found")

    member = db.query(Member).filter(Member.id == member_in.member_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    current_count = db.query(GroupMember).filter(GroupMember.chit_group_id == group_id).count()
    if current_count >= group.max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Group is full. Maximum {group.max_members} members reached.",
        )

    # Check if ticket number is already taken
    existing_ticket = (
        db.query(GroupMember)
        .filter(
            GroupMember.chit_group_id == group_id,
            GroupMember.ticket_number == member_in.ticket_number,
        )
        .first()
    )
    if existing_ticket:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ticket #{member_in.ticket_number} is already assigned in this group.",
        )

    gm = GroupMember(
        chit_group_id=group_id,
        member_id=member_in.member_id,
        ticket_number=member_in.ticket_number,
    )
    db.add(gm)
    db.commit()
    db.refresh(gm)
    return gm


@router.delete("/{group_id}/members/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member_from_group(group_id: int, membership_id: int, db: Session = Depends(get_db)):
    gm = (
        db.query(GroupMember)
        .filter(
            GroupMember.id == membership_id,
            GroupMember.chit_group_id == group_id,
        )
        .first()
    )
    if not gm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")

    db.delete(gm)
    db.commit()
    return None
