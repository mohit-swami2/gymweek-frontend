import { useState } from 'react';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';
import { SocialAuth } from './SocialAuth.jsx';

export function ContactForm({ section }) {
  const content = section?.content || {};
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await websiteApi.post('/contacts', form);
      toast.success('Message sent!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="contact" className="gw-glass contact-panel">
      <h2 className="section-title" style={{ marginBottom: 8 }}>
        {section?.title || 'Get In Touch'}
      </h2>
      {section?.subtitle && (
        <p className="contact-section__subtitle">{section.subtitle}</p>
      )}
      <SocialAuth />
      <form onSubmit={handleSubmit} className="contact-form">
        <input
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          name="subject"
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={5}
        />
        <button type="submit" className="contact-form__submit" disabled={submitting}>
          {submitting ? 'Sending...' : (content.ctaLabel || 'Send Message')}
        </button>
      </form>
    </div>
  );
}
