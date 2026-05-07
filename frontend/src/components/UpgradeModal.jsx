import { Link } from 'react-router-dom';

function UpgradeModal({ isOpen, onClose, message, feature }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚀</span>
              <div>
                <h2 className="text-xl font-bold text-white">Upgrade Required</h2>
                <p className="text-amber-100 text-sm mt-0.5">Unlock this feature</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none transition">
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-900 font-medium">{message}</p>
          </div>

          {feature && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Available in Pro & Team</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                  <p className="text-lg font-bold text-indigo-900">Pro</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">€10<span className="text-sm text-indigo-400">/mo</span></p>
                  <ul className="mt-2 space-y-1 text-xs text-indigo-700">
                    <li>✓ Unlimited sprints</li>
                    <li>✓ Unlimited tasks</li>
                    <li>✓ All fields</li>
                    <li>✓ Clean PDF</li>
                  </ul>
                </div>
                <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
                  <p className="text-lg font-bold text-violet-900">Team</p>
                  <p className="text-2xl font-bold text-violet-600 mt-1">€30<span className="text-sm text-violet-400">/mo</span></p>
                  <ul className="mt-2 space-y-1 text-xs text-violet-700">
                    <li>✓ Everything in Pro</li>
                    <li>✓ Unlimited users</li>
                    <li>✓ Custom branding</li>
                    <li>✓ Unlimited history</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
              Maybe Later
            </button>
            <Link
              to="/pricing"
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:opacity-90 transition text-center">
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
