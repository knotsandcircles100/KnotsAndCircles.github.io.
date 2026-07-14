import React, { useState } from "react";
import { api, formatApiError } from "../utils/api";
import { store } from "../utils/storage";
import { sfx } from "../utils/sound";
import { X, Sparkles } from "lucide-react";
import { useModalDismiss } from "../utils/useModalDismiss";

export default function UpgradeModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in name and email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await api.registerUpgrade(name.trim(), email.trim());
      store.setUpgraded({ name: user.name, email: user.email });
      sfx.unlock();
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const dismiss = useModalDismiss(onClose);
  return (
    <div className="modal-backdrop" data-testid="upgrade-modal" {...dismiss}>
      <div className="modal">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-amber-400" />
              <span className="badge badge-popular">UPGRADE</span>
            </div>
            <h2 className="font-display font-bold text-2xl">Go Cloud</h2>
          </div>
          <button onClick={onClose} className="text-[color:var(--text-muted)] hover:text-white" data-testid="btn-close-upgrade">
            <X size={22} />
          </button>
        </div>

        <p className="text-[color:var(--text-muted)] text-sm mb-5">
          Sync scores across devices, appear on the global leaderboard, and remove ads.
        </p>

        <ul className="mb-6 space-y-2 text-sm">
          <li>✨ Global cloud leaderboard</li>
          <li>📱 Sync progress across devices</li>
          <li>🚫 Remove ads</li>
        </ul>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            data-testid="upgrade-name"
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            data-testid="upgrade-email"
          />
          {error && <div className="text-red-400 text-xs">{error}</div>}
          <button
            type="submit"
            className="btn-cta w-full"
            disabled={loading}
            data-testid="btn-submit-upgrade"
          >
            {loading ? "Upgrading..." : "Upgrade — Free for now"}
          </button>
        </form>

        <p className="text-[10px] text-[color:var(--text-dim)] text-center mt-4 tracking-wider">
          NO PAYMENT REQUIRED · WE JUST NEED YOUR NAME &amp; EMAIL
        </p>
      </div>
    </div>
  );
}
