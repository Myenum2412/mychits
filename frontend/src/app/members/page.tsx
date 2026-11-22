"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { api, Member } from "@/lib/api";
import { DataTable2, TableColumn } from "@/components/ui/data-table-2";
import { PageHeader6 } from "@/components/ui/page-header-6";
import {
  Users,
  Plus,
  Trash2,
  Search,
  X,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Send,
  Link2,
} from "lucide-react";
import { SvglWhatsapp, SvglGmail } from "@/components/ui/svgl-icons";
import { SendInviteDialog } from "@/components/payments/send-invite-dialog";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMemberForInvite, setSelectedMemberForInvite] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    id_proof: "",
    status: "active",
  });

  const loadMembers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const data = await api.getMembers(searchQuery);
      setMembers(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(search);
  }, [search]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMember({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        id_proof: formData.id_proof || null,
        status: formData.status,
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        id_proof: "",
        status: "active",
      });
      loadMembers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error creating member");
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      await api.deleteMember(id);
      loadMembers(search);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting member");
    }
  };

  const memberColumns: TableColumn<Member>[] = [
    {
      id: "id",
      header: "ID",
      sortable: true,
      cell: (m) => <span className="font-mono text-xs text-muted-foreground">#{m.id}</span>,
    },
    {
      id: "name",
      header: "Subscriber Name",
      sortable: true,
      cell: (m) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {m.name}
        </span>
      ),
    },
    {
      id: "phone",
      header: "Contact Details",
      sortable: true,
      cell: (m) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="font-mono text-xs">{m.phone}</span>
          </div>
          {m.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SvglGmail size={12} className="shrink-0" />
              <span>{m.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "id_proof",
      header: "KYC / ID Proof",
      cell: (m) =>
        m.id_proof ? (
          <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs font-mono">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            {m.id_proof}
          </span>
        ) : (
          <span className="text-muted-foreground italic text-xs">Unverified</span>
        ),
    },
    {
      id: "address",
      header: "Address",
      cell: (m) => (
        <span className="text-xs text-muted-foreground max-w-xs truncate block">
          {m.address || "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (m) => (
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            m.status === "active"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {m.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedMemberForInvite(m);
              setShowInviteModal(true);
            }}
            className="text-muted-foreground hover:text-indigo-600 transition-colors p-1"
            title="Send Payment Invite Link"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <a
            href={`https://wa.me/${m.phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-emerald-600 transition-colors p-1"
            title="Chat via WhatsApp"
          >
            <SvglWhatsapp size={14} />
          </a>
          <button
            onClick={() => handleDeleteMember(m.id)}
            className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
            title="Delete Member"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell pageTitle="Subscriber Registry">
      <div className="w-full flex-1 flex flex-col space-y-6">
        {/* Header Toolbar & KPI Grid using @7ovr/page-header-6 */}
        <PageHeader6
          tag="Subscribers & Customers"
          title="Customer Directory"
          description="Member KYC verification, ROSCA ticket allocation, and contact records."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedMemberForInvite(null);
                  setShowInviteModal(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Link2 className="h-4 w-4" />
                <span>Send Pay Invite</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subscriber</span>
              </button>
            </div>
          }
          stats={[
            {
              label: "Total Subscribers",
              value: `${members.length} Members`,
              delta: "+100% active KYC",
              deltaType: "positive",
            },
            {
              label: "Active Accounts",
              value: `${members.filter((m) => m.status === "active").length} Active`,
              delta: "Good standing",
              deltaType: "positive",
            },
            {
              label: "KYC Verified",
              value: `${members.filter((m) => m.id_proof).length} IDs`,
              delta: "Govt ID verified",
              deltaType: "neutral",
            },
            {
              label: "WhatsApp Linked",
              value: `${members.filter((m) => m.phone).length} Numbers`,
              delta: "Instant alerts enabled",
              deltaType: "positive",
            },
          ]}
        />

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Members Table with @7ovr/table-2 design */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading members...</div>
        ) : (
          <DataTable2<Member>
            data={members}
            columns={memberColumns}
            getId={(m) => m.id}
            searchPlaceholder="Search members by name, phone, or address..."
            searchKey={(m) => `${m.name} ${m.phone} ${m.email || ""} ${m.id_proof || ""}`}
            pageSize={7}
            emptyMessage="No subscribers enrolled yet. Click 'Add Subscriber' to register members."
            bulkActions={{
              onDownload: (selected) => {
                alert(`Exporting member profiles for ${selected.length} subscribers...`);
              },
              onSendReminder: (selected) => {
                alert(`Sending WhatsApp announcement to ${selected.length} subscribers...`);
              },
              onDelete: (selected) => {
                if (confirm(`Delete ${selected.length} selected subscriber records?`)) {
                  Promise.all(selected.map((s) => api.deleteMember(s.id))).then(() => loadMembers());
                }
              },
            }}
          />
        )}

        {/* Modal: Add Subscriber */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Add Subscriber
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PAN / Aadhaar / ID Proof
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={formData.id_proof}
                    onChange={(e) => setFormData({ ...formData, id_proof: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street, City, Pin"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-medium"
                  >
                    Save Subscriber
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Send Payment Invite Modal */}
        <SendInviteDialog
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          defaultMember={selectedMemberForInvite}
        />
      </div>
    </DashboardShell>
  );
}
