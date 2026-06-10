import { useState } from 'react';
import { toast } from 'sonner';
import { websiteApi } from '../../common/api/client.js';

export function ContactForm() {
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
    <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {['name', 'email', 'subject'].map((field) => (
        <input key={field} name={field} type={field === 'email' ? 'email' : 'text'} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={field !== 'subject'} />
      ))}
      <textarea name="message" placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} />
      <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
    </form>
  );
}
