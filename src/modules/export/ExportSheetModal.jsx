import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../../common/components/Modal.jsx';
import { fitnessApi } from '../../common/api/fitnessApi.js';
import { WorkoutSheetPreview } from './WorkoutSheetPreview.jsx';
import './export.css';

export function ExportSheetModal({ open, onClose, planId: planIdProp, dayOfWeek: dayProp }) {
  const [themes, setThemes] = useState([]);
  const [plan, setPlan] = useState(null);
  const [theme, setTheme] = useState('minimal');
  const [scope, setScope] = useState('day');
  const [dayOfWeek, setDayOfWeek] = useState(dayProp || 'monday');
  const [downloading, setDownloading] = useState(false);
  const [sheetData, setSheetData] = useState(null);

  useEffect(() => {
    if (!open) return;
    fitnessApi.getExportThemes().then((res) => setThemes(res.data || [])).catch(() => {});
    fitnessApi.getCurrentPlan().then((res) => setPlan(res.data[0])).catch(() => {});
  }, [open]);

  const planId = planIdProp || plan?._id;

  useEffect(() => {
    if (!open || !planId) return;
    fitnessApi.exportWorkoutSheet({ planId, dayOfWeek, theme, scope, format: 'json' })
      .then((res) => setSheetData(res.data[0]?.sheetData))
      .catch(() => {});
  }, [open, planId, dayOfWeek, theme, scope]);

  const handleDownloadPdf = async () => {
    if (!planId) { toast.error('Save a plan first'); return; }
    setDownloading(true);
    try {
      await fitnessApi.exportWorkoutSheet({ planId, dayOfWeek, theme, scope, format: 'pdf' });
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal open={open} onClose={onClose} title="Download Workout Sheet">
      <div className="export-modal">
        <p className="export-modal__hint">Take this to the gym — no phone needed during training</p>

        <div className="export-modal__row">
          <label>Scope</label>
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="day">Single day</option>
            <option value="week">Entire week</option>
          </select>
        </div>

        {scope === 'day' && (
          <div className="export-modal__row">
            <label>Day</label>
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
        )}

        <div className="export-modal__row">
          <label>Design theme</label>
          <div className="export-modal__themes">
            {(themes.length ? themes : [{ slug: 'minimal', name: 'Minimal', colors: { accent: '#6b7280', background: '#fafafa' } }]).map((t) => (
              <button
                key={t.slug}
                type="button"
                className={`export-modal__theme${theme === t.slug ? ' export-modal__theme--active' : ''}`}
                onClick={() => setTheme(t.slug)}
                style={{ '--theme-accent': t.colors?.accent || '#6b7280' }}
                title={t.description || t.name}
              >
                <span className="export-modal__theme-swatch" style={{ background: t.colors?.background, borderColor: t.colors?.accent }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {sheetData && (
          <div className="export-modal__preview" id="workout-sheet-print">
            <WorkoutSheetPreview data={sheetData} themeSlug={theme} themes={themes} />
          </div>
        )}

        <div className="export-modal__actions">
          <button type="button" className="btn-primary" onClick={handleDownloadPdf} disabled={downloading}>
            <Download size={14} /> {downloading ? 'Generating…' : 'Download PDF'}
          </button>
          <button type="button" className="btn-secondary" onClick={handlePrint}>Print</button>
          <button type="button" className="btn-secondary" onClick={onClose}><X size={14} /> Close</button>
        </div>
      </div>
    </Modal>
  );
}
