"""initial chit fund schema

Revision ID: 001_initial_chit_schema
Revises: 
Create Date: 2026-11-21 13:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_chit_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Members Table
    op.create_table(
        'members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('id_proof', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_members_id'), 'members', ['id'], unique=False)
    op.create_index(op.f('ix_members_name'), 'members', ['name'], unique=False)
    op.create_index(op.f('ix_members_phone'), 'members', ['phone'], unique=True)
    op.create_index(op.f('ix_members_email'), 'members', ['email'], unique=True)

    # 2. Chit Groups Table
    op.create_table(
        'chit_groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_name', sa.String(length=100), nullable=False),
        sa.Column('total_value', sa.Float(), nullable=False),
        sa.Column('duration_months', sa.Integer(), nullable=False),
        sa.Column('monthly_installment', sa.Float(), nullable=False),
        sa.Column('max_members', sa.Integer(), nullable=False),
        sa.Column('commission_rate', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='planned'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chit_groups_id'), 'chit_groups', ['id'], unique=False)
    op.create_index(op.f('ix_chit_groups_group_name'), 'chit_groups', ['group_name'], unique=True)

    # 3. Group Members Table
    op.create_table(
        'group_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chit_group_id', sa.Integer(), nullable=False),
        sa.Column('member_id', sa.Integer(), nullable=False),
        sa.Column('ticket_number', sa.Integer(), nullable=False),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.Column('has_prized', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['chit_group_id'], ['chit_groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_group_members_id'), 'group_members', ['id'], unique=False)

    # 4. Auctions Table
    op.create_table(
        'auctions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chit_group_id', sa.Integer(), nullable=False),
        sa.Column('auction_number', sa.Integer(), nullable=False),
        sa.Column('auction_date', sa.Date(), nullable=False),
        sa.Column('bid_discount_amount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('foreperson_commission', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('dividend_total', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('dividend_per_member', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('net_payable_amount', sa.Float(), nullable=False),
        sa.Column('prize_amount', sa.Float(), nullable=False),
        sa.Column('winner_member_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='scheduled'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['chit_group_id'], ['chit_groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['winner_member_id'], ['members.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_auctions_id'), 'auctions', ['id'], unique=False)

    # 5. Payments Table
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('chit_group_id', sa.Integer(), nullable=False),
        sa.Column('member_id', sa.Integer(), nullable=False),
        sa.Column('auction_id', sa.Integer(), nullable=True),
        sa.Column('installment_number', sa.Integer(), nullable=False),
        sa.Column('amount_paid', sa.Float(), nullable=False),
        sa.Column('payment_mode', sa.String(length=50), nullable=False, server_default='upi'),
        sa.Column('transaction_ref', sa.String(length=100), nullable=True),
        sa.Column('payment_date', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='completed'),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['chit_group_id'], ['chit_groups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['member_id'], ['members.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['auction_id'], ['auctions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('payments')
    op.drop_table('auctions')
    op.drop_table('group_members')
    op.drop_table('chit_groups')
    op.drop_table('members')
