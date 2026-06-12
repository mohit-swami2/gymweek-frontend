import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';
import { GlassCard } from './GlassCard.jsx';
import { MagneticButton } from './MagneticButton.jsx';

function Field({ label, type = 'text', value, onChange, multiline }) {
  return (
    <label className="gw-field">
      <span>{label}</span>
      {multiline ? (
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} maxLength={500} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export function Contact({ section }) {
  const content = section?.content || {};
  const fields = content.fields || {};
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await websiteApi.post('/contacts', form);
      toast.success(content.successToast || "Message sent! We'll get back to you soon.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="gw-contact">
      <div className="gw-container gw-contact__grid">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="gw-contact__title">{section?.title || 'Get In Touch'}</h2>
          <p className="gw-contact__desc">
            {section?.subtitle || 'Questions? Feedback? We respond in under 24 hours.'}
          </p>
          <p className="gw-contact__note">{content.note || 'SSL encrypted · GDPR compliant'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <GlassCard tilt={false}>
            <form className="gw-contact-form" onSubmit={handleSubmit}>
              <div className="gw-contact-form__terminal">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="gw-contact-form__dots">
                    <span /><span /><span />
                  </div>
                  <span className="gw-contact-form__label">{content.terminalLabel || '/ MESSAGE TERMINAL'}</span>
                </div>
                <span className="gw-contact-form__live">{content.liveLabel || '● LIVE'}</span>
              </div>

              <div className="gw-contact-form__row">
                <Field label={fields.name || 'Name'} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label={fields.email || 'Email'} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              </div>
              <Field label={fields.subject || 'Subject'} value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
              <Field label={fields.message || 'Your Message'} multiline value={form.message} onChange={(v) => setForm({ ...form, message: v })} />

              <div className="gw-contact-form__foot">
                <span className="gw-contact-form__count">{form.message.length} / 500</span>
                <MagneticButton variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : (content.ctaLabel || 'Send Message')}
                  <Send size={16} />
                </MagneticButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
