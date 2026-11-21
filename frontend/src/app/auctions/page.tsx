"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { api, Auction, ChitGroup, Member } from "@/lib/api";
import {
  Gavel,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  X,
  TrendingDown,
  Gift,
} from "lucide-react";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  // Record Auction Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [auctionNumber, setAuctionNumber] = useState<number>(1);
  const [auctionDate, setAuctionDate] = useState<string>("");
  const [bidDiscount, setBidDiscount] = useState<number>(10000);
  const [winnerMemberId, setWinnerMemberId] = useState<number | "">("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [auctionsData, groupsData, membersData] = await Promise.all([
        api.getAuctions(selectedGroupFilter ? Number(selectedGroupFilter) : undefined),
        api.getGroups(),
        api.getMembers(),
      ]);
      setAuctions(auctionsData);
      setGroups(groupsData);
      setMembers(membersData);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load auctions data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAuctionDate(new Date().toISOString().split("T")[0]);
    loadData();
  }, [selectedGroupFilter]);

  const activeGroup = groups.find((g) => g.id === Number(selectedGroupId));

  // Calculated live preview
  const commission = activeGroup
    ? Math.round(activeGroup.total_value * (activeGroup.commission_rate / 100))
    : 0;
  const dividendTotal = Math.max(0, bidDiscount - commission);
  const dividendPerMember =
    activeGroup && activeGroup.max_members > 0
      ? Math.round(dividendTotal / activeGroup.max_members)
      : 0;
  const netPayable = activeGroup
    ? Math.max(0, activeGroup.monthly_installment - dividendPerMember)
    : 0;
  const prizeAmount = activeGroup ? Math.max(0, activeGroup.total_value - bidDiscount) : 0;

  const handleRecordAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) return;

    try {
      await api.createAuction({
        chit_group_id: Number(selectedGroupId),
        auction_number: Number(auctionNumber),
        auction_date: auctionDate,
        bid_discount_amount: Number(bidDiscount),
        winner_member_id: winnerMemberId ? Number(winnerMemberId) : null,
      });
      setShowModal(false);
      setSelectedGroupId("");
      setWinnerMemberId("");
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error recording auction");
    }
  };

  const handleDeleteAuction = async (id: number) => {
    if (!confirm("Are you sure you want to delete this auction record?")) return;
    try {
      await api.deleteAuction(id);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting auction");
    }
  };

  return (
    <DashboardShell pageTitle="Monthly Auctions">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Filter Group:
            </label>
            <select
              value={selectedGroupFilter}
              onChange={(e) =>
                setSelectedGroupFilter(e.target.value ? Number(e.target.value) : "")
              }
              className="px-3 py-1.5 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="">All Chit Groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.group_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (groups.length > 0 && !selectedGroupId) {
                setSelectedGroupId(groups[0].id);
              }
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Record Monthly Auction
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auctions List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading auctions...</div>
        ) : auctions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="h-14 w-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Gavel className="h-7 w-7" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">No Auctions Recorded</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your database has zero pre-seeded auctions. When ready, click "Record Monthly Auction" to calculate dividends and prize payouts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auc) => (
              <div
                key={auc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                        Month #{auc.auction_number}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Group #{auc.chit_group_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {auc.auction_date}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteAuction(auc.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete auction record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1">
                      <Gift className="h-3.5 w-3.5" />
                      Prize Awarded
                    </span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                      ₹{auc.prize_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Award className="h-3 w-3 shrink-0" />
                    <span>Winner: {auc.winner?.name || "Not assigned"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">Bid Discount</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{auc.bid_discount_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                    <p className="text-slate-500 dark:text-slate-400">Foreman Fee</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{auc.foreperson_commission.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-lg">
                    <p className="text-indigo-600 dark:text-indigo-400">Dividend / Member</p>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                      ₹{auc.dividend_per_member.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-lg">
                    <p className="text-slate-600 dark:text-slate-400">Net Due / Member</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      ₹{auc.net_payable_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Record Monthly Auction */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Record Monthly Auction
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500">
                    No chit groups exist yet. Create a chit group first.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRecordAuction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Chit Group *
                    </label>
                    <select
                      required
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.group_name} (₹{g.total_value.toLocaleString()} | {g.duration_months} Mos)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Auction / Month #
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={auctionNumber}
                        onChange={(e) => setAuctionNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Auction Date
                      </label>
                      <input
                        type="date"
                        required
                        value={auctionDate}
                        onChange={(e) => setAuctionDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Winning Bid Discount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={500}
                      value={bidDiscount}
                      onChange={(e) => setBidDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Winning Subscriber
                    </label>
                    <select
                      value={winnerMemberId}
                      onChange={(e) =>
                        setWinnerMemberId(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Winner (Optional) --</option>
                      {activeGroup?.memberships?.map((m) => (
                        <option key={m.id} value={m.member_id}>
                          Ticket #{m.ticket_number} - {m.member?.name || `Member #${m.member_id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Calculation Summary */}
                  {activeGroup && (
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3.5 space-y-2 text-xs">
                      <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                        Calculated Auction Breakdown:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                        <div>
                          <span>Prize Amount (Winner): </span>
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            ₹{prizeAmount.toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          <span>Foreman Fee: </span>
                          <strong>₹{commission.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>Dividend / Member: </span>
                          <strong className="text-indigo-600 dark:text-indigo-400">
                            ₹{dividendPerMember.toLocaleString()}
                          </strong>
                        </div>
                        <div>
                          <span>Net Due This Month: </span>
                          <strong className="text-slate-900 dark:text-slate-100">
                            ₹{netPayable.toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-medium"
                    >
                      Confirm Auction
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
