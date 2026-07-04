import { useState } from "react";
import { useToast } from "../context/ToastContext.jsx";

const Contact = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");

    const subject = encodeURIComponent(`Message from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:support@campushire.com?subject=${subject}&body=${body}`;

    showToast("Opening your mail client...");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl text-ink text-center">Get in touch</h1>
      <p className="text-muted text-center mt-2">
        Questions about the platform? Send us a message.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-ink2 block mb-1.5">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink2 block mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink2 block mb-1.5">Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            className="input-field"
          />
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}

        <button type="submit" className="btn btn-primary btn-lg justify-center">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
